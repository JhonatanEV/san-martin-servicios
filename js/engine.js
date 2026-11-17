/**
 * Motor de cálculo de servicios comunes - Edificio San Martín
 * Lógica pura sin dependencias de DOM, compatible con Node.js y navegadores.
 */

'use strict';

const APTS = ['101', '201', '301', '401', '501', '502'];

const MN = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Redondeo hacia arriba al múltiplo del escalón especificado (ej. 0.10)
 */
const ceilTo = (val, step) => {
  if (step > 0) {
    return Math.ceil(Math.round(val / step * 1e6) / 1e6 - 1e-9) * step;
  }
  return val;
};

/**
 * Redondeo simple a 2 decimales
 */
const R2 = val => Math.round(val * 100) / 100;

/**
 * Calcula el desglose del mes k en el estado S
 * @param {Object} S Estado con { cfg, months }
 * @param {string} k Clave del mes ('YYYY-MM')
 * @param {boolean} deep Bandera para evitar recursión al arrastrar saldos
 */
function calc(S, k, deep) {
  const m = S.months[k];
  if (!m) return null;

  // Deducciones que salen del recibo de agua
  const ded = (m.x || [])
    .filter(x => x.ded)
    .reduce((s, x) => s + (+x.amt || 0), 0);
  const pool = (+m.w || 0) - ded;

  let totalConsumo = 0;
  let totalPesosLuz = 0;

  // Primer paso: calcular consumos y suma de pesos
  APTS.forEach(apt => {
    const r = m.r[apt] || {};
    // Consumo = (Actual - Anterior + Ajuste) si tiene medidor ('m')
    r._c = r.t === 'm' ? Math.max(0, (+r.c || 0) - (+r.p || 0) + (+r.aj || 0)) : 0;
    totalConsumo += r._c;
    totalPesosLuz += r.wt == null ? 1 : +r.wt;
  });

  const out = {};

  // Segundo paso: calcular cuotas por departamento
  APTS.forEach(apt => {
    const r = m.r[apt] || {};

    // Agua: proporcional al consumo sobre el total medido
    const w = totalConsumo > 0 ? (r._c / totalConsumo) * pool : 0;

    // Luz: proporcional al peso asignado
    const wt = r.wt == null ? 1 : +r.wt;
    const e = totalPesosLuz > 0 ? ((+m.e || 0) * wt) / totalPesosLuz : 0;

    // Cargos especiales (limpieza de tanque, mantenimiento, etc.)
    let x = 0;
    (m.x || []).forEach(cargo => {
      const aptsList = cargo.apts || [];
      if (aptsList.includes(apt)) {
        if (cargo.per === 'split') {
          x += (+cargo.amt || 0) / (aptsList.length || 1);
        } else {
          x += +cargo.amt || 0;
        }
      }
    });

    const tot = w + e + x;
    const pay = ceilTo(tot, S.cfg.step);
    const paid = +((m.pg || {})[apt]) || 0;

    out[apt] = {
      cons: r._c,
      w,
      e,
      x,
      tot,
      pay,
      pd: 0,
      paid,
      bal: 0
    };
  });

  // Tercer paso: calcular deudas anteriores y saldo resultante
  const pk = prevKey(k);
  const pm = S.months[pk];

  APTS.forEach(apt => {
    let deudaAnterior = +((m.pd || {})[apt]) || 0;
    if (!deudaAnterior && pm && pm.tr && !deep) {
      const prevCalc = calc(S, pk, true)[apt];
      deudaAnterior = prevCalc.pd + prevCalc.pay - prevCalc.paid;
    }
    out[apt].pd = deudaAnterior;
    out[apt].bal = deudaAnterior + out[apt].pay - out[apt].paid;
  });

  return out;
}

/**
 * Obtiene la clave del mes anterior ('YYYY-MM')
 */
function prevKey(k) {
  let [y, mo] = k.split('-').map(Number);
  mo--;
  if (!mo) {
    mo = 12;
    y--;
  }
  return `${y}-${String(mo).padStart(2, '0')}`;
}

/**
 * Obtiene la clave del mes siguiente ('YYYY-MM')
 */
function nextKey(k) {
  let [y, mo] = k.split('-').map(Number);
  mo++;
  if (mo > 12) {
    mo = 1;
    y++;
  }
  return `${y}-${String(mo).padStart(2, '0')}`;
}

if (typeof module !== 'undefined') {
  module.exports = { APTS, MN, ceilTo, R2, calc, prevKey, nextKey };
}
