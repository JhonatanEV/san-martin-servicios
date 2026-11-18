/**
 * Controlador de Interfaz de Usuario · Edificio San Martín
 * Estructura modular basada en HTML semántico, sub-pestañas organizadas
 * y autenticación por DNI (Admin 70424972 e Inquilinos).
 */

'use strict';

let S = null;
let V = 'month';          // 'month' | 'year' | 'receipt' | 'users' | 'cfg'
let ACTIVE_SUBTAB = 'tab-lecturas'; // 'tab-lecturas' | 'tab-aportes' | 'tab-cobranza'
let Y = new Date().getFullYear();
let K = '';               // 'YYYY-MM' activo
let SELECTED_APT = '301'; // Departamento seleccionado para recibos
let EDIT = false;
let DIRTY = false;
let SNAP = null;
let CURRENT_USER = null;

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const f2 = val => (+val || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fNum = val => (+val || 0).toLocaleString('es-PE');

const isAdmin = () => CURRENT_USER && (String(CURRENT_USER.dni).trim() === '70424972' || CURRENT_USER.role === 'admin');

const ICONS = {
  building: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>`,
  calendar: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  chart: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  receipt: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
  settings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  users: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  water: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
  bolt: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  tools: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
  cash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  alert: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  save: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`,
  edit: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  print: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`,
  copy: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
  cloud: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`,
  sync: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
  plus: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  close: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  logout: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`
};

function showSyncOverlay(title = 'Sincronizando con Google Drive', message = 'Conectando con tu hoja de cálculo en la nube...') {
  const overlay = $('#sync-overlay');
  if (!overlay) return;
  const titleEl = $('#sync-overlay-title');
  const msgEl = $('#sync-overlay-msg');
  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  overlay.style.display = 'flex';
}

function hideSyncOverlay() {
  const overlay = $('#sync-overlay');
  if (!overlay) return;
  overlay.style.display = 'none';
}

function toast(msg, type = 'normal') {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'show' + (type === 'error' ? ' toast-error' : type === 'success' ? ' toast-success' : '');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    el.className = '';
  }, type === 'error' ? 6000 : 3500);
}

function showLoginOverlay(errorMsg = '') {
  const overlay = $('#login-overlay');
  if (!overlay) return;

  overlay.style.display = 'flex';
  overlay.className = 'login-overlay';
  overlay.innerHTML = `
    <div class="login-card">
      <div class="login-icon">${ICONS.building}</div>
      <h2 class="login-title">Edificio San Martín</h2>
      <div class="login-subtitle">Control de Servicios · Acceso al Portal</div>

      ${errorMsg ? `<div class="login-error">${errorMsg}</div>` : ''}

      <form id="loginForm" style="display:flex;flex-direction:column;gap:12px;text-align:left;">
        <div>
          <label style="font-size:11px;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px;">DOCUMENTO DE IDENTIDAD (DNI)</label>
          <input type="text" id="loginDni" maxlength="12" inputmode="numeric" placeholder="Ingresa tu número de DNI" required autofocus style="width:100%;font-size:16px;letter-spacing:1px;font-weight:600;text-align:center;">
        </div>
        <button type="submit" class="btn btn-primary" style="padding:12px;font-size:14px;font-weight:700;margin-top:6px;">
          Ingresar al Portal
        </button>
      </form>
      <div style="font-size:12px;color:var(--text-muted);margin-top:16px;line-height:1.5;">
        Ingresa tu número de documento registrado para consultar tus recibos y estado de cuenta.
      </div>
    </div>
  `;

  const form = $('#loginForm');
  if (form) {
    form.onsubmit = e => {
      e.preventDefault();
      const input = ($('#loginDni').value || '').trim();
      doLogin(input);
    };
  }
}

function doLogin(dni) {
  if (!S || !S.users) return;

  let user = S.users.find(u => String(u.dni).trim() === dni);
  if (!user && dni === '70424972') {
    user = { dni: '70424972', nombre: 'Administrador Principal', apt: 'Todos', role: 'admin', status: 'Activo' };
    S.users.unshift(user);
  }

  if (!user) {
    showLoginOverlay(`El DNI <b>${dni}</b> no está registrado. Comunícate con la administración.`);
    return;
  }

  if (user.status === 'Inactivo') {
    showLoginOverlay(`El DNI <b>${dni}</b> se encuentra inactivo. Comunícate con la administración.`);
    return;
  }

  CURRENT_USER = user;
  localStorage.setItem('sanmartin_session', JSON.stringify(user));
  $('#login-overlay').style.display = 'none';

  if (!isAdmin() && user.apt && user.apt !== 'Todos') {
    SELECTED_APT = user.apt;
    switchView('receipt');
  } else {
    switchView('month');
  }

  toast(`Bienvenido, ${user.nombre}`, 'success');
  render();
}

function logout() {
  CURRENT_USER = null;
  localStorage.removeItem('sanmartin_session');
  showLoginOverlay();
}

function switchView(viewName) {
  V = viewName;
  const admin = isAdmin();

  if ((V === 'cfg' || V === 'users') && !admin) {
    V = 'month';
  }

  $$('nav button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.v === V);
  });

  $$('.view-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `view-${V}`);
  });

  render();
}

function switchSubtab(tabId) {
  ACTIVE_SUBTAB = tabId;
  $$('.subtab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.subtab === tabId);
  });
  $$('.subtab-content').forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });
}

function render() {
  if (!CURRENT_USER) {
    showLoginOverlay();
    return;
  }

  const admin = isAdmin();

  // Controlar visibilidad de navegación
  const btnCfg = $('#nav-btn-cfg');
  const btnUsers = $('#nav-btn-users');
  if (btnCfg) btnCfg.style.display = admin ? 'inline-flex' : 'none';
  if (btnUsers) btnUsers.style.display = admin ? 'inline-flex' : 'none';

  renderFilterBar();
  updateHeaderBar();

  if (V === 'month') {
    renderMonthView();
  } else if (V === 'year') {
    renderYearView();
  } else if (V === 'receipt') {
    renderReceiptView();
  } else if (V === 'users' && admin) {
    renderUsersView();
  } else if (V === 'cfg' && admin) {
    renderCfgView();
  }

  applyLockState();
}

function renderFilterBar() {
  const container = $('#filter-bar-container');
  if (!container || !S || V === 'cfg' || V === 'users') {
    if (container) container.innerHTML = '';
    return;
  }

  const years = new Set(Object.keys(S.months).map(k => +k.slice(0, 4)));
  years.add(Y);
  years.add(new Date().getFullYear());
  const sortedYears = [...years].sort((a, b) => b - a);
  const admin = isAdmin();

  let actionButtons = '';
  if (admin && V === 'month') {
    if (EDIT) {
      actionButtons = `
        <div class="filter-actions-group">
          ${DIRTY ? `<span class="v-chip v-chip-warning"><span class="v-chip-dot pulse"></span> Sin guardar</span>` : ''}
          <button class="btn btn-success btn-elevated" id="btnSave" title="Guardar cambios y sincronizar con Drive">
            ${ICONS.save} <span>Guardar</span>
          </button>
          <button class="btn btn-outlined" id="btnCancel" title="Descartar cambios">
            ${ICONS.close} <span>Cancelar</span>
          </button>
        </div>
      `;
    } else {
      actionButtons = `
        <div class="filter-actions-group">
          <button class="btn btn-primary btn-elevated" id="btnEdit" title="Activar modo edición para registrar consumos o pagos">
            ${ICONS.edit} <span>Editar Datos</span>
          </button>
        </div>
      `;
    }
  }

  let html = `<div class="filter-bar noprint">
    <div class="filter-left">
      <div class="year-selector">
        <label>AÑO:</label>
        <select data-action="change-year">
          ${sortedYears.map(y => `<option value="${y}" ${y === Y ? 'selected' : ''}>${y}</option>`).join('')}
        </select>
      </div>`;

  if (V === 'month' || V === 'receipt') {
    html += `<div class="month-chips">
      ${MN.map((name, idx) => {
        const key = `${Y}-${String(idx + 1).padStart(2, '0')}`;
        const hasData = !!S.months[key];
        const isActive = key === K;
        return `<button class="month-chip ${hasData ? 'has-data' : 'no-data'} ${isActive ? 'active' : ''}"
          data-action="select-month" data-k="${key}">
          ${name.slice(0, 3)}
        </button>`;
      }).join('')}
    </div>`;
  }

  html += `</div>
    <div class="filter-right">
      ${actionButtons}
    </div>
  </div>`;

  container.innerHTML = html;
}

/**
 * Renderiza la vista de Control Mensual dividida en 3 Sub-pestañas
 */
function renderMonthView() {
  const m = S.months[K];
  const [yearStr, monthNum] = K.split('-');
  const monthName = MN[+monthNum - 1] || K;
  const admin = isAdmin();

  const wrapper = $('#month-content-wrapper');
  const emptyContainer = $('#month-empty-state');
  const kpisContainer = $('#month-kpis-container');
  const alertsContainer = $('#month-alerts-container');

  if (!m) {
    const prevMonths = Object.keys(S.months).filter(x => x < K).sort();
    const lastMonthKey = prevMonths.pop();

    if (kpisContainer) kpisContainer.innerHTML = '';
    if (alertsContainer) alertsContainer.innerHTML = '';
    if (wrapper) wrapper.style.display = 'none';

    if (emptyContainer) {
      emptyContainer.style.display = 'block';
      emptyContainer.innerHTML = `
        <div class="card" style="text-align:center;padding:48px 20px;">
          <div style="color:var(--primary);margin-bottom:12px;">${ICONS.calendar}</div>
          <h2 style="font-size:18px;font-weight:700;margin-bottom:8px;">${monthName} ${yearStr} aún no está registrado</h2>
          <p style="color:var(--text-muted);max-width:480px;margin:0 auto 20px;font-size:13px;">
            ${admin ? `Registra el mes para comenzar a ingresar consumos y gastos comunes. ${lastMonthKey ? `Se copiarán las lecturas de <b>${lastMonthKey}</b>.` : ''}` : 'Este mes aún no ha sido publicado por la administración.'}
          </p>
          ${admin ? `
            <button class="btn btn-primary" data-action="create-month">
              ${ICONS.plus} Registrar Mes de ${monthName} ${yearStr}
            </button>
          ` : ''}
        </div>`;
    }
    return;
  }

  // Cuando el mes sí existe, ocultamos el aviso de mes vacío y mostramos el contenido con sus pestañas
  if (emptyContainer) emptyContainer.style.display = 'none';
  if (wrapper) wrapper.style.display = 'block';

  const c = calc(S, K);
  const totalPagar = APTS.reduce((s, a) => s + c[a].pay, 0);
  const totalAgua = APTS.reduce((s, a) => s + c[a].w, 0);
  const totalLuz = APTS.reduce((s, a) => s + c[a].e, 0);
  const totalExtras = APTS.reduce((s, a) => s + c[a].x, 0);
  const totalCobrado = APTS.reduce((s, a) => s + c[a].paid, 0);
  const saldoPendiente = totalPagar - totalCobrado;

  // 1. KPIs
  kpisContainer.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card kpi-total">
        <div class="kpi-label">${ICONS.cash} Total a Pagar Edificio</div>
        <div class="kpi-value">S/ ${f2(totalPagar)}</div>
        <div class="kpi-subtext">Suma de todos los deptos</div>
      </div>
      <div class="kpi-card kpi-water">
        <div class="kpi-label">${ICONS.water} Recibo Sedapal</div>
        <div class="kpi-value">S/ ${f2(m.w || 0)}</div>
        <div class="kpi-subtext">Reparto por submedidor</div>
      </div>
      <div class="kpi-card kpi-light">
        <div class="kpi-label">${ICONS.bolt} Recibo Luz Común</div>
        <div class="kpi-value">S/ ${f2(m.e || 0)}</div>
        <div class="kpi-subtext">Área común y bombas</div>
      </div>
      <div class="kpi-card kpi-extra">
        <div class="kpi-label">${ICONS.tools} Cargos y Aportes</div>
        <div class="kpi-value">S/ ${f2(totalExtras)}</div>
        <div class="kpi-subtext">Tanque, reparaciones, etc.</div>
      </div>
      <div class="kpi-card kpi-paid">
        <div class="kpi-label">${ICONS.check} Total Cobrado</div>
        <div class="kpi-value">S/ ${f2(totalCobrado)}</div>
        <div class="kpi-subtext">${saldoPendiente > 0.05 ? `Falta cobrar: S/ ${f2(saldoPendiente)}` : 'Cobranza al día'}</div>
      </div>
    </div>
  `;

  // 2. Alertas
  const warningList = getMonthAlerts(K, c);
  alertsContainer.innerHTML = warningList.map(msg => `
    <div class="alert-box alert-warning">
      ${ICONS.alert}
      <div><b>Alerta:</b> ${msg}</div>
    </div>
  `).join('');

  // 3. Sub-Tab 1: Lecturas
  $('#receipts-title').textContent = `Recibos del Edificio · ${monthName} ${yearStr}`;
  $('#field-w').value = m.w ?? '';
  $('#field-e').value = m.e ?? '';
  $('#field-d0').value = m.d?.[0] || '';
  $('#field-d1').value = m.d?.[1] || '';

  const totalServicios = (+m.w || 0) + (+m.e || 0);
  const totalServiciosEl = $('#receipts-total-badge');
  if (totalServiciosEl) {
    totalServiciosEl.textContent = `Total Servicios: S/ ${f2(totalServicios)}`;
  }

  const weightOpts = [
    ['1', '1.0'],
    ['0.5', '0.5'],
    ['0.3333333333', '1/3'],
    ['0', '0']
  ];

  $('#readings-table-container').innerHTML = `
    <!-- Tabla de escritorio (7 columnas, sin scroll horizontal) -->
    <table class="compact-table desktop-only-table">
      <thead>
        <tr>
          <th>Depto</th>
          <th style="text-align:center;">Lecturas (Ant. → Act.)</th>
          <th>Consumo</th>
          <th>Agua (S/)</th>
          <th>Luz Común (S/)</th>
          <th>Extras (S/)</th>
          <th>A Pagar (S/)</th>
        </tr>
      </thead>
      <tbody>
        ${APTS.map(apt => {
          const r = m.r[apt] || { t: 'i', wt: 0.5 };
          const hasMeter = r.t === 'm';

          return `<tr>
            <td>
              <div style="display:flex;align-items:center;gap:8px;">
                <b style="font-size:15px;color:var(--primary);">${apt}</b>
                <select data-action="set-type" data-apt="${apt}" class="input-compact" style="font-size:11px;padding:2px 6px;">
                  <option value="m" ${hasMeter ? 'selected' : ''}>Medidor</option>
                  <option value="i" ${r.t === 'i' ? 'selected' : ''}>Indep.</option>
                  <option value="n" ${r.t === 'n' ? 'selected' : ''}>No usa</option>
                </select>
              </div>
            </td>
            <td style="text-align:center;">
              ${hasMeter ? `
                <div style="display:inline-flex;align-items:center;gap:4px;">
                  <input type="number" class="input-compact" style="width:85px;text-align:right;" data-action="set-reading" data-apt="${apt}" data-key="p" value="${r.p ?? ''}" placeholder="Ant">
                  <span style="color:var(--text-muted);font-weight:700;">→</span>
                  <input type="number" class="input-compact" style="width:85px;text-align:right;" data-action="set-reading" data-apt="${apt}" data-key="c" value="${r.c ?? ''}" placeholder="Act">
                </div>
              ` : `<span style="color:var(--text-muted);font-size:12px;">Independizado</span>`}
            </td>
            <td>
              ${hasMeter ? `<b>${fNum(c[apt].cons)} L</b>` : '<span style="color:var(--text-muted)">—</span>'}
            </td>
            <td style="color:var(--water-color);font-weight:600;">${f2(c[apt].w)}</td>
            <td>
              <div style="display:inline-flex;align-items:center;gap:4px;justify-content:flex-end;">
                <span style="color:var(--light-color);font-weight:600;">${f2(c[apt].e)}</span>
                <select data-action="set-weight" data-apt="${apt}" class="input-compact" style="font-size:11px;padding:2px 4px;">
                  ${weightOpts.map(([v, l]) => `<option value="${v}" ${Math.abs((r.wt ?? 1) - v) < 1e-5 ? 'selected' : ''}>${l}</option>`).join('')}
                </select>
              </div>
            </td>
            <td style="color:var(--extra-color);font-weight:600;">${f2(c[apt].x)}</td>
            <td><b style="font-size:15px;color:var(--text-main);">${f2(c[apt].pay)}</b></td>
          </tr>`;
        }).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align:left;">TOTALES</td>
          <td style="color:var(--water-color);">${f2(totalAgua)}</td>
          <td style="color:var(--light-color);">${f2(totalLuz)}</td>
          <td style="color:var(--extra-color);">${f2(totalExtras)}</td>
          <td style="font-size:15px;">S/ ${f2(totalPagar)}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Cards táctiles en celular (sin scroll) -->
    <div class="mobile-cards-list">
      ${APTS.map(apt => {
        const r = m.r[apt] || { t: 'i', wt: 0.5 };
        const hasMeter = r.t === 'm';

        return `
          <div class="apt-mobile-card">
            <div class="apt-mobile-head">
              <div>
                <span class="apt-mobile-num">Dpto ${apt}</span>
                <select data-action="set-type" data-apt="${apt}" class="input-compact" style="margin-left:8px;font-size:11px;">
                  <option value="m" ${hasMeter ? 'selected' : ''}>Con Medidor</option>
                  <option value="i" ${r.t === 'i' ? 'selected' : ''}>Independiente</option>
                  <option value="n" ${r.t === 'n' ? 'selected' : ''}>No usa</option>
                </select>
              </div>
              <div class="apt-mobile-pay">
                <div style="font-size:11px;color:var(--text-muted);font-weight:400;">A PAGAR</div>
                S/ ${f2(c[apt].pay)}
              </div>
            </div>

            ${hasMeter ? `
              <div class="apt-mobile-grid">
                <label>
                  Lectura Anterior:
                  <input type="number" inputmode="numeric" data-action="set-reading" data-apt="${apt}" data-key="p" value="${r.p ?? ''}">
                </label>
                <label>
                  Lectura Actual:
                  <input type="number" inputmode="numeric" data-action="set-reading" data-apt="${apt}" data-key="c" value="${r.c ?? ''}">
                </label>
              </div>
            ` : `
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">
                Departamento con red de agua independiente.
              </div>
            `}

            <div class="apt-mobile-chips">
              ${hasMeter ? `<span>Consumo: <b>${fNum(c[apt].cons)} L</b></span>` : ''}
              <span>Agua: <b style="color:var(--water-color);">S/ ${f2(c[apt].w)}</b></span>
              <span>Luz: <b style="color:var(--light-color);">S/ ${f2(c[apt].e)}</b></span>
              ${c[apt].x > 0 ? `<span>Extras: <b style="color:var(--extra-color);">S/ ${f2(c[apt].x)}</b></span>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // 4. Sub-Tab 2: Aportes y Mantenimiento
  $('#charges-presets-container').innerHTML = admin ? `
    <div class="presets-bar noprint">
      <span class="presets-title">Agregar rápido:</span>
      <button class="btn btn-sm" data-action="add-preset" data-name="Limpieza de cisterna y tanque" data-amt="240" data-per="split">
        ${ICONS.plus} Limpieza de Tanque (S/ 240)
      </button>
      <button class="btn btn-sm" data-action="add-preset" data-name="Mantenimiento bomba de agua" data-amt="180" data-per="split">
        ${ICONS.plus} Mantenimiento Bomba (S/ 180)
      </button>
      <button class="btn btn-sm" data-action="add-preset" data-name="Foco y repuestos luz común" data-amt="30" data-per="split">
        ${ICONS.plus} Focos / Pasadizo (S/ 30)
      </button>
      <button class="btn btn-sm" data-action="add-preset" data-name="Aporte extraordinario de mantenimiento" data-amt="50" data-per="each">
        ${ICONS.plus} Aporte Extra (S/ 50 c/u)
      </button>
      <button class="btn btn-sm btn-primary" data-action="add-custom-charge">
        ${ICONS.plus} Otro Concepto
      </button>
    </div>
  ` : '';

  $('#charges-list-container').innerHTML = (m.x && m.x.length > 0) ? m.x.map((cargo, idx) => `
    <div class="charge-row">
      <input type="text" data-action="charge-name" data-idx="${idx}" value="${cargo.n || ''}" placeholder="Concepto (ej. Limpieza de tanque)" style="flex:2;min-width:180px;">
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:12px;font-weight:600;color:var(--text-muted);">S/</span>
        <input type="number" step="0.01" data-action="charge-amt" data-idx="${idx}" value="${cargo.amt ?? 0}" style="width:110px;">
      </div>
      <select data-action="charge-per" data-idx="${idx}" style="font-size:12px;">
        <option value="split" ${cargo.per === 'split' ? 'selected' : ''}>Repartir total entre elegidos</option>
        <option value="each" ${cargo.per === 'each' ? 'selected' : ''}>Monto fijo a cada elegido</option>
      </select>
      <label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;color:var(--text-muted);" title="Marca esta opción si este gasto ya vino cobrado dentro del recibo de agua">
        <input type="checkbox" data-action="charge-ded" data-idx="${idx}" ${cargo.ded ? 'checked' : ''}>
        Deducir de recibo agua
      </label>
      <div class="charge-apts">
        ${APTS.map(apt => `
          <label class="apt-check">
            <input type="checkbox" data-action="charge-apt-toggle" data-idx="${idx}" data-apt="${apt}" ${(cargo.apts || []).includes(apt) ? 'checked' : ''}>
            ${apt}
          </label>
        `).join('')}
      </div>
      ${admin ? `
        <button class="btn btn-danger btn-sm" data-action="delete-charge" data-idx="${idx}" title="Eliminar cargo">
          ${ICONS.trash}
        </button>
      ` : ''}
    </div>
  `).join('') : `
    <p style="color:var(--text-muted);font-style:italic;padding:10px 0;font-size:13px;">
      No hay cargos adicionales en este mes. Usa los botones superiores para registrar limpieza de tanque o cuotas extraordinarias.
    </p>
  `;

  // 5. Sub-Tab 3: Cobranza y Saldos
  $('#payments-table-container').innerHTML = `
    <!-- Tabla de cobranza escritorio -->
    <table class="compact-table desktop-only-table">
      <thead>
        <tr>
          <th>Depto</th>
          <th>Deuda Anterior</th>
          <th>A Pagar Mes</th>
          <th>Monto Cobrado (S/)</th>
          <th>Saldo Resultante</th>
          <th style="text-align:center;">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${APTS.map(apt => {
          const row = c[apt];
          const paidVal = m.pg?.[apt] ?? '';
          let tagHtml = `<span class="status-tag al-dia">${ICONS.check} Al día</span>`;
          if (row.bal > 0.05) {
            tagHtml = `<span class="status-tag debe">Debe S/ ${f2(row.bal)}</span>`;
          } else if (row.bal < -0.05) {
            tagHtml = `<span class="status-tag favor">A favor S/ ${f2(-row.bal)}</span>`;
          }

          return `<tr>
            <td><b style="font-size:15px;">${apt}</b></td>
            <td>${f2(row.pd)}</td>
            <td><b>${f2(row.pay)}</b></td>
            <td>
              <input type="number" step="0.01" class="input-compact" style="width:105px;" data-action="set-paid" data-apt="${apt}" value="${paidVal}" placeholder="0.00">
            </td>
            <td>${tagHtml}</td>
            <td style="text-align:center;">
              <div style="display:inline-flex;gap:6px;">
                ${admin ? `
                  <button class="btn btn-sm" data-action="mark-full-paid" data-apt="${apt}" data-val="${row.pay + row.pd}">
                    Pagar Todo
                  </button>
                ` : ''}
                <button class="btn btn-sm" data-action="go-receipt" data-apt="${apt}">
                  ${ICONS.receipt} Recibo
                </button>
              </div>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <!-- Cards en Celular -->
    <div class="mobile-cards-list">
      ${APTS.map(apt => {
        const row = c[apt];
        const paidVal = m.pg?.[apt] ?? '';
        let tagHtml = `<span class="status-tag al-dia">${ICONS.check} Al día</span>`;
        if (row.bal > 0.05) {
          tagHtml = `<span class="status-tag debe">Debe S/ ${f2(row.bal)}</span>`;
        } else if (row.bal < -0.05) {
          tagHtml = `<span class="status-tag favor">A favor S/ ${f2(-row.bal)}</span>`;
        }

        return `
          <div class="apt-mobile-card">
            <div class="apt-mobile-head">
              <span class="apt-mobile-num">Dpto ${apt}</span>
              ${tagHtml}
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;">
              <span>A Pagar: <b>S/ ${f2(row.pay)}</b></span>
              <span>Deuda Prev: <b>S/ ${f2(row.pd)}</b></span>
            </div>
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">
              <label style="font-size:12px;font-weight:600;color:var(--text-muted);flex-shrink:0;">Monto Cobrado:</label>
              <input type="number" step="0.01" inputmode="decimal" data-action="set-paid" data-apt="${apt}" value="${paidVal}" placeholder="0.00" style="flex:1;">
            </div>
            <div style="display:flex;gap:8px;">
              ${admin ? `
                <button class="btn btn-sm" data-action="mark-full-paid" data-apt="${apt}" data-val="${row.pay + row.pd}" style="flex:1;">
                  Pagar Todo
                </button>
              ` : ''}
              <button class="btn btn-sm btn-primary" data-action="go-receipt" data-apt="${apt}" style="flex:1;">
                ${ICONS.receipt} Recibo
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  $('#payments-footer-container').innerHTML = `
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;margin-top:16px;gap:12px;" class="noprint">
      ${admin ? `
        <label style="display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;cursor:pointer;">
          <input type="checkbox" data-action="toggle-carry" ${m.tr ? 'checked' : ''}>
          Arrastrar automáticamente saldos pendientes al siguiente mes
        </label>
      ` : '<div></div>'}
      <button class="btn" onclick="window.print()">
        ${ICONS.print} Imprimir / PDF del Mes
      </button>
    </div>
    <div style="margin-top:12px;" class="noprint">
      <label style="display:block;font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:5px;">Notas del mes:</label>
      <input type="text" data-action="set-note" value="${m.n || ''}" placeholder="Ej. Depósito realizado en cuenta BCP..." style="width:100%;">
    </div>
  `;

  switchSubtab(ACTIVE_SUBTAB);
}

/**
 * Renderiza la vista de Resumen Anual
 */
function renderYearView() {
  const container = $('#view-year');
  if (!container) return;

  const rows = [];
  let totW = 0, totE = 0, totX = 0, count = 0;
  const matrix = {};
  APTS.forEach(a => { matrix[a] = Array(12).fill(null); });

  for (let i = 0; i < 12; i++) {
    const key = `${Y}-${String(i + 1).padStart(2, '0')}`;
    const c = calc(S, key);
    if (!c) {
      rows.push(null);
      continue;
    }
    let w = 0, e = 0, x = 0;
    APTS.forEach(a => {
      w += c[a].w;
      e += c[a].e;
      x += c[a].x;
      matrix[a][i] = c[a].pay;
    });
    rows.push({ w, e, x });
    totW += w;
    totE += e;
    totX += x;
    count++;
  }

  const grandTotal = totW + totE + totX;
  const maxMonth = Math.max(1, ...rows.filter(Boolean).map(r => r.w + r.e + r.x));

  let svg = `<svg viewBox="0 0 720 180" width="100%" role="img" aria-label="Gasto por mes">`;
  rows.forEach((r, idx) => {
    const xPos = idx * 60 + 10;
    svg += `<text x="${xPos + 20}" y="174" font-size="11" font-weight="600" text-anchor="middle" fill="var(--text-muted)">${MN[idx].slice(0, 3)}</text>`;
    if (!r) return;

    let yPos = 158;
    const items = [
      ['w', 'var(--water-color)', 'Agua'],
      ['e', 'var(--light-color)', 'Luz'],
      ['x', 'var(--extra-color)', 'Aportes']
    ];

    items.forEach(([prop, color, label]) => {
      const h = (r[prop] / maxMonth) * 140;
      yPos -= h;
      svg += `<rect x="${xPos}" y="${yPos}" width="40" height="${h}" rx="2" fill="${color}">
        <title>${MN[idx]} - ${label}: S/ ${f2(r[prop])}</title>
      </rect>`;
    });
  });
  svg += `</svg>`;

  container.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card kpi-total">
        <div class="kpi-label">${ICONS.chart} Total General ${Y}</div>
        <div class="kpi-value">S/ ${f2(grandTotal)}</div>
        <div class="kpi-subtext">Acumulado anual</div>
      </div>
      <div class="kpi-card kpi-water">
        <div class="kpi-label">${ICONS.water} Total Agua</div>
        <div class="kpi-value">S/ ${f2(totW)}</div>
        <div class="kpi-subtext">Acumulado anual</div>
      </div>
      <div class="kpi-card kpi-light">
        <div class="kpi-label">${ICONS.bolt} Total Luz Común</div>
        <div class="kpi-value">S/ ${f2(totE)}</div>
        <div class="kpi-subtext">Acumulado anual</div>
      </div>
      <div class="kpi-card kpi-extra">
        <div class="kpi-label">${ICONS.tools} Aportes / Tanque</div>
        <div class="kpi-value">S/ ${f2(totX)}</div>
        <div class="kpi-subtext">Acumulado anual</div>
      </div>
      <div class="kpi-card kpi-paid">
        <div class="kpi-label">${ICONS.cash} Promedio Mensual</div>
        <div class="kpi-value">S/ ${f2(count ? grandTotal / count : 0)}</div>
        <div class="kpi-subtext">${count} meses registrados</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${ICONS.chart} Evolución Mensual · Año ${Y}</h3>
      </div>
      <div class="chart-box">
        ${svg}
        <div class="chart-legend">
          <span><i style="background:var(--water-color)"></i> Agua</span>
          <span><i style="background:var(--light-color)"></i> Luz Común</span>
          <span><i style="background:var(--extra-color)"></i> Aportes / Tanque</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${ICONS.receipt} Matriz Comparativa Anual (S/)</h3>
      </div>
      <div style="overflow-x:auto;">
        <table class="compact-table" style="min-width:600px;">
          <thead>
            <tr>
              <th>Depto</th>
              ${MN.map(m => `<th>${m.slice(0, 3)}</th>`).join('')}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${APTS.map(apt => {
              const aptTotal = matrix[apt].reduce((s, v) => s + (v || 0), 0);
              return `<tr>
                <td><b style="font-size:14px;color:var(--primary);">${apt}</b></td>
                ${matrix[apt].map((val, mIdx) => {
                  const mKey = `${Y}-${String(mIdx + 1).padStart(2, '0')}`;
                  if (val == null) return `<td style="color:var(--text-muted)">—</td>`;
                  return `<td style="cursor:pointer;font-weight:600;" data-action="select-month" data-k="${mKey}" title="Ver mes ${mKey}">
                    ${f2(val)}
                  </td>`;
                }).join('')}
                <td><b style="font-size:14px;">S/ ${f2(aptTotal)}</b></td>
              </tr>`;
            }).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td>TOTAL</td>
              ${MN.map((_, i) => {
                if (!rows[i]) return `<td style="color:var(--text-muted)">—</td>`;
                const monthTotal = APTS.reduce((s, a) => s + (matrix[a][i] || 0), 0);
                return `<td>${f2(monthTotal)}</td>`;
              }).join('')}
              <td>S/ ${f2(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
}

/**
 * Renderiza la vista de Recibos para WhatsApp
 */
function renderReceiptView() {
  const container = $('#view-receipt');
  if (!container) return;

  const m = S.months[K];
  const admin = isAdmin();

  if (!m) {
    container.innerHTML = `
      <div class="card" style="text-align:center;padding:40px;">
        <h3>No hay datos en el mes seleccionado (${K})</h3>
        <p style="color:var(--text-muted)">Selecciona o registra el mes en Control Mensual.</p>
      </div>`;
    return;
  }

  if (!admin && CURRENT_USER.apt && CURRENT_USER.apt !== 'Todos') {
    SELECTED_APT = CURRENT_USER.apt;
  }

  const c = calc(S, K);
  const row = c[SELECTED_APT];
  const r = m.r[SELECTED_APT] || {};
  const [yearStr, monthNum] = K.split('-');
  const monthName = MN[+monthNum - 1] || K;

  const extrasList = (m.x || []).filter(cargo => (cargo.apts || []).includes(SELECTED_APT)).map(cargo => {
    const amt = cargo.per === 'split' ? (cargo.amt / (cargo.apts.length || 1)) : cargo.amt;
    return { name: cargo.n || 'Cargo extraordinario', amt };
  });

  const waLines = [
    `*EDIFICIO SAN MARTÍN*`,
    `*Recibo de Servicios - ${monthName} ${yearStr}*`,
    `*Departamento: ${SELECTED_APT}*`,
    `----------------------------------------`
  ];

  if (r.t === 'm') {
    waLines.push(`Agua: S/ ${f2(row.w)} (${fNum(row.cons)} Litros)`);
    if (r.p != null && r.c != null) {
      waLines.push(`_Lectura: ${fNum(r.p)} → ${fNum(r.c)}_`);
    }
  } else if (r.t === 'i') {
    waLines.push(`Agua: S/ 0.00 (Independizado)`);
  } else {
    waLines.push(`Agua: S/ 0.00 (No usa)`);
  }

  waLines.push(`Luz común: S/ ${f2(row.e)}`);

  if (extrasList.length > 0) {
    waLines.push(`Aportes / Mantenimiento:`);
    extrasList.forEach(item => {
      waLines.push(`• ${item.name}: S/ ${f2(item.amt)}`);
    });
  }

  waLines.push(`----------------------------------------`);
  waLines.push(`*Total del mes:* S/ ${f2(row.tot)}`);

  if (row.pd > 0.05) {
    waLines.push(`*Deuda anterior:* S/ ${f2(row.pd)}`);
  } else if (row.pd < -0.05) {
    waLines.push(`*Saldo a favor previo:* -S/ ${f2(-row.pd)}`);
  }

  const montoFinalPagar = row.pay + (row.pd > 0 ? row.pd : 0);
  waLines.push(`*TOTAL A PAGAR:* *S/ ${f2(montoFinalPagar)}*`);

  if (row.paid > 0) {
    waLines.push(`Monto pagado: S/ ${f2(row.paid)}`);
    if (row.bal > 0.05) {
      waLines.push(`Saldo pendiente: S/ ${f2(row.bal)}`);
    } else {
      waLines.push(`Estado: AL DÍA`);
    }
  }

  if (S.cfg.nota) {
    waLines.push(`\nNota: ${S.cfg.nota}`);
  }

  waLines.push(`\nMuchas gracias por su puntual apoyo.`);
  const waText = waLines.join('\n');

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${ICONS.receipt} Recibo de Departamento</h3>
        ${admin ? `
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${APTS.map(apt => `
              <button class="btn btn-sm ${apt === SELECTED_APT ? 'btn-primary' : ''}" data-action="select-receipt-apt" data-apt="${apt}">
                Dpto ${apt}
              </button>
            `).join('')}
          </div>
        ` : `
          <span class="user-profile-badge">Dpto ${SELECTED_APT}</span>
        `}
      </div>

      <div class="receipt-container">
        <div>
          <div style="background:var(--bg-subtle);padding:16px;border-radius:var(--radius-md);margin-bottom:14px;">
            <h4 style="margin:0 0 10px;font-size:15px;color:var(--text-main);">Departamento ${SELECTED_APT}</h4>
            <div style="font-size:13px;line-height:1.7;color:var(--text-muted);">
              <div><b>Periodo:</b> ${monthName} ${yearStr}</div>
              <div><b>Tipo:</b> ${r.t === 'm' ? 'Submedidor interno' : 'Independiente'}</div>
              ${r.t === 'm' ? `<div><b>Consumo Agua:</b> ${fNum(row.cons)} L</div>` : ''}
              <div><b>Cuota Agua:</b> S/ ${f2(row.w)}</div>
              <div><b>Cuota Luz Común:</b> S/ ${f2(row.e)}</div>
              <div><b>Aportes Extras:</b> S/ ${f2(row.x)}</div>
              <hr style="border:none;border-top:1px solid var(--border-color);margin:8px 0;">
              <div><b>Subtotal:</b> S/ ${f2(row.tot)}</div>
              <div><b>Deuda Anterior:</b> S/ ${f2(row.pd)}</div>
              <div style="font-size:16px;font-weight:800;color:var(--primary);margin-top:6px;">
                A PAGAR: S/ ${f2(montoFinalPagar)}
              </div>
            </div>
          </div>

          <button class="btn btn-primary" id="btnCopyWa" style="width:100%;padding:10px;font-size:14px;margin-bottom:8px;">
            ${ICONS.copy} Copiar Mensaje para WhatsApp
          </button>
          <a class="btn" href="https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}" target="_blank" style="width:100%;padding:10px;margin-bottom:8px;text-decoration:none;">
            Enviar directo a WhatsApp
          </a>
          <button class="btn" onclick="window.print()" style="width:100%;padding:8px;">
            ${ICONS.print} Imprimir Recibo
          </button>
        </div>

        <div>
          <label style="display:block;font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:6px;">
            Texto formateado para WhatsApp:
          </label>
          <div class="receipt-preview" id="receiptText">${waText}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Guarda y sincroniza inmediatamente los cambios de usuarios en local y en Google Sheets
 */
async function saveUsersImmediately(actionMsg = 'Usuarios actualizados correctamente') {
  const isCloud = Store.mode === 'sheets-online' || !Store.mode || Store.mode === 'static' || Store.mode === 'cloud';
  showSyncOverlay(
    'Guardando Usuarios en Google Drive',
    isCloud
      ? 'Sincronizando los accesos y usuarios directamente en tu archivo Excel...'
      : 'Guardando usuarios en el servidor y respaldando...'
  );

  try {
    const result = await Store.save(S);
    DIRTY = false;

    let syncInfo = '';
    if (result.sheetsSynced === true) {
      syncInfo = ' y sincronizado con Google Sheets en Drive.';
    } else if (result.sheetsSynced === false) {
      syncInfo = ' (Guardado localmente. Falló sincronización con Drive, revisa tu URL).';
    } else {
      syncInfo = ' guardado correctamente.';
    }

    toast(`${actionMsg}${syncInfo}`, result.sheetsSynced === false ? 'error' : 'success');
  } catch (err) {
    toast('Error al guardar usuarios: ' + err.message, 'error');
  } finally {
    hideSyncOverlay();
    renderUsersView();
    updateHeaderBar();
  }
}

/**
 * Renderiza la vista de Gestión de Usuarios
 */
function renderUsersView() {
  const container = $('#view-users');
  if (!container) return;

  const users = S.users || [];

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <h3 class="card-title">${ICONS.users} Gestión de Usuarios y Accesos por DNI</h3>
          <span class="v-chip v-chip-online" style="font-size:11px;">
            <span class="v-chip-dot pulse"></span> Guardado Directo en Drive
          </span>
        </div>
        <button class="btn btn-sm btn-outlined" data-action="sync-users-sheets" title="Sincronizar usuarios ahora con Google Sheets">
          ${ICONS.sync} Sincronizar con Drive
        </button>
      </div>
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:16px;">
        Registra a los inquilinos para que puedan ingresar al portal con su DNI y ver sus recibos en línea. <b>Todo cambio se guarda automáticamente en tu hoja Excel de Google Drive.</b>
      </p>

      <form id="addUserForm" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:12px;background:var(--bg-subtle);padding:14px;border-radius:var(--radius-md);margin-bottom:20px;align-items:end;">
        <div>
          <label style="font-size:11px;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px;">DNI (8 DÍGITOS)</label>
          <input type="text" id="newDni" maxlength="10" inputmode="numeric" placeholder="Ej. 12345678" required style="width:100%;">
        </div>
        <div>
          <label style="font-size:11px;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px;">NOMBRE COMPLETO</label>
          <input type="text" id="newName" placeholder="Ej. Juan Pérez" required style="width:100%;">
        </div>
        <div>
          <label style="font-size:11px;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px;">DEPARTAMENTO</label>
          <select id="newApt" style="width:100%;">
            ${APTS.map(a => `<option value="${a}">Dpto ${a}</option>`).join('')}
            <option value="Todos">Todos (Admin)</option>
          </select>
        </div>
        <div>
          <label style="font-size:11px;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px;">ROL</label>
          <select id="newRole" style="width:100%;">
            <option value="inquilino">Inquilino / Vecino</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div>
          <button type="submit" class="btn btn-primary" style="width:100%;height:38px;">
            ${ICONS.plus} Agregar Usuario
          </button>
        </div>
      </form>

      <div style="overflow-x:auto;">
        <table class="compact-table" style="min-width:650px;">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre Completo</th>
              <th>Departamento</th>
              <th>Rol</th>
              <th>Estado</th>
              <th style="text-align:center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${users.map((u, idx) => {
              const isMainAdmin = String(u.dni).trim() === '70424972';
              const isActive = u.status !== 'Inactivo';

              return `<tr>
                <td><b>${u.dni}</b></td>
                <td>${u.nombre || 'Sin nombre'}</td>
                <td><span class="user-profile-badge">Dpto ${u.apt || '—'}</span></td>
                <td>
                  <span class="badge ${u.role === 'admin' ? 'badge-server' : ''}">
                    ${u.role === 'admin' ? 'Administrador' : 'Inquilino'}
                  </span>
                </td>
                <td>
                  <span class="status-tag ${isActive ? 'al-dia' : 'debe'}">
                    ${isActive ? 'Activo' : 'Inactivo (Dado de baja)'}
                  </span>
                </td>
                <td style="text-align:center;">
                  ${isMainAdmin ? `
                    <span style="font-size:11px;color:var(--text-muted);">Admin Principal</span>
                  ` : `
                    <div style="display:inline-flex;gap:6px;">
                      <button class="btn btn-sm ${isActive ? 'btn-danger' : 'btn-success'}" data-action="toggle-user-status" data-idx="${idx}">
                        ${isActive ? 'Dar de Baja' : 'Activar'}
                      </button>
                      <button class="btn btn-sm btn-danger" data-action="delete-user" data-idx="${idx}" title="Eliminar">
                        ${ICONS.trash}
                      </button>
                    </div>
                  `}
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Renderiza la vista de Configuración y Google Drive
 */
function renderCfgView() {
  const container = $('#view-cfg');
  if (!container) return;

  const hasSheets = !!S.cfg.sheetsUrl;

  container.innerHTML = `
    <div class="card" style="border-left: 4px solid var(--success);">
      <div class="card-header">
        <h3 class="card-title">${ICONS.cloud} Sincronización con Google Drive (Google Sheets)</h3>
        <span class="badge ${hasSheets ? 'badge-server' : 'badge-static'}">
          ${hasSheets ? 'Conectado a Google Sheets' : 'No configurado'}
        </span>
      </div>
      <p style="color:var(--text-muted);margin-bottom:14px;font-size:13px;">
        Respalda automáticamente todos los datos y usuarios en tu Google Drive cada vez que guardes cambios.
      </p>

      <div class="form-group" style="margin-bottom:12px;">
        <label>URL del Webhook de Google Apps Script (termina en /exec):</label>
        <input type="text" data-action="cfg-sheets-url" value="${S.cfg.sheetsUrl || ''}" placeholder="https://script.google.com/macros/s/AKfycby.../exec" style="width:100%;font-family:monospace;font-size:13px;">
      </div>

      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
        <label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;cursor:pointer;">
          <input type="checkbox" data-action="cfg-auto-sync" ${S.cfg.autoSyncSheets !== false ? 'checked' : ''}>
          Sincronizar automáticamente en cada guardado
        </label>
        <button class="btn btn-primary" id="btnManualSyncSheets">
          ${ICONS.sync} Sincronizar Ahora con Google Sheets
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${ICONS.settings} Parámetros del Edificio</h3>
      </div>
      <div class="form-grid-4">
        <div class="form-group">
          <label>Redondear "A pagar" hacia arriba a (S/)</label>
          <select data-action="cfg-step">
            <option value="0" ${S.cfg.step == 0 ? 'selected' : ''}>Sin redondeo</option>
            <option value="0.05" ${S.cfg.step == 0.05 ? 'selected' : ''}>S/ 0.05</option>
            <option value="0.1" ${S.cfg.step == 0.1 ? 'selected' : ''}>S/ 0.10 (Recomendado)</option>
            <option value="0.5" ${S.cfg.step == 0.5 ? 'selected' : ''}>S/ 0.50</option>
            <option value="1" ${S.cfg.step == 1 ? 'selected' : ''}>S/ 1.00</option>
          </select>
        </div>
        <div class="form-group">
          <label>Fondo Común Acumulado (S/)</label>
          <input type="number" step="0.01" data-action="cfg-fondo" value="${S.cfg.fondo ?? 0}">
        </div>
        <div class="form-group" style="grid-column: 1 / -1;">
          <label>Nota general o cuenta bancaria (aparece en recibos de WhatsApp)</label>
          <input type="text" data-action="cfg-nota" value="${S.cfg.nota || ''}" placeholder="Ej. BCP Soles: 191-XXXXXXXX-0-XX...">
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${ICONS.save} Herramientas y Exportación</h3>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        <button class="btn" data-action="export-csv">${ICONS.chart} Exportar a Excel / CSV</button>
        <button class="btn" data-action="export-json">${ICONS.save} Descargar Respaldo JSON</button>
        <label class="btn" style="cursor:pointer;">
          ${ICONS.sync} Restaurar Respaldo
          <input type="file" accept=".json" data-action="import-json" hidden>
        </label>
        <button class="btn" data-action="toggle-theme">Tema Claro / Oscuro</button>
        <button class="btn" data-action="reload-file">${ICONS.sync} Recargar desde disco</button>
      </div>
    </div>
  `;
}

function getMonthAlerts(key, calcResult) {
  const alerts = [];
  const m = S.months[key];
  if (!m) return alerts;

  if (!+m.w) {
    alerts.push('El recibo de agua está en 0: ningún departamento tiene asignado cobro de agua este mes.');
  }

  const history = [];
  let prevK = key;
  for (let i = 0; i < 6; i++) {
    prevK = prevKey(prevK);
    if (S.months[prevK]) {
      history.push(calc(S, prevK));
    }
  }

  APTS.forEach(apt => {
    const r = m.r[apt];
    if (!r || r.t !== 'm') return;

    if (r.c < r.p) {
      alerts.push(`Depto ${apt}: la lectura actual (${r.c}) es menor que la anterior (${r.p}). Verificar si hubo cambio de medidor.`);
    }

    const avg = history.length ? history.reduce((s, h) => s + h[apt].cons, 0) / history.length : 0;
    if (avg > 200 && calcResult[apt].cons > avg * 2.2) {
      alerts.push(`Depto ${apt}: consumo (${fNum(calcResult[apt].cons)} L) superó más del doble su promedio (${fNum(Math.round(avg))} L). Posible fuga.`);
    }

    if (avg > 200 && calcResult[apt].cons === 0) {
      alerts.push(`Depto ${apt}: consumo en 0 L con medidor activo.`);
    }
  });

  return alerts;
}

function updateHeaderBar() {
  const admin = isAdmin();

  // 1. Mini Chip de estado de conexión junto al título del edificio
  const brandChip = $('#brand-status-chip');
  if (brandChip) {
    if (Store.isSyncing) {
      brandChip.className = 'mini-status-chip syncing';
      brandChip.innerHTML = `<span class="v-chip-spinner"></span> Sincronizando`;
      brandChip.title = 'Sincronización en curso con Google Drive';
    } else if (Store.mode === 'sheets-online') {
      brandChip.className = 'mini-status-chip online';
      brandChip.innerHTML = `<span class="status-dot pulse"></span> Drive Online`;
      brandChip.title = 'Conectado a Google Sheets en Google Drive';
    } else if (Store.mode === 'server') {
      brandChip.className = 'mini-status-chip server';
      brandChip.innerHTML = `<span class="status-dot"></span> Servidor`;
      brandChip.title = 'Servidor local Node.js activo';
    } else {
      brandChip.className = 'mini-status-chip local';
      brandChip.innerHTML = `<span class="status-dot"></span> Local`;
      brandChip.title = 'Modo local sin conexión directa a la nube';
    }
  }

  // 2. Perfil de Usuario en el extremo derecho del Header (Limpio y en una sola línea)
  const userBadgeContainer = $('#header-user-badge');
  if (userBadgeContainer) {
    if (CURRENT_USER) {
      const roleLabel = admin ? 'Admin' : `Dpto ${CURRENT_USER.apt || ''}`;
      userBadgeContainer.innerHTML = `
        <div class="v-user-pill ${admin ? 'admin' : ''}">
          <div class="v-user-avatar">
            ${ICONS.user}
          </div>
          <div class="v-user-meta">
            <span class="v-user-name">${CURRENT_USER.nombre}</span>
            <span class="v-user-sub">${roleLabel}</span>
          </div>
          <button class="v-btn-logout" id="btnLogout" title="Cerrar Sesión">
            ${ICONS.logout}
            <span class="logout-label">Salir</span>
          </button>
        </div>
      `;
    } else {
      userBadgeContainer.innerHTML = '';
    }
  }

  // 3. Sincronizar los botones de acción en la barra de control inferior
  renderFilterBar();
}

function applyLockState() {
  const admin = isAdmin();
  const locked = !admin || !EDIT;

  const elements = $$(
    '#app input, #app select, #app [data-action=add-preset], #app [data-action=add-custom-charge], #app [data-action=delete-charge], #app [data-action=mark-full-paid]'
  );

  elements.forEach(el => {
    if (el.dataset.action === 'cfg-sheets-url' || el.dataset.action === 'cfg-auto-sync' || el.closest('#addUserForm')) {
      return;
    }
    el.disabled = locked;
  });
}

// ==========================================
// CONTROLADORES DE EVENTOS
// ==========================================

document.addEventListener('click', async e => {
  const target = e.target.closest('[data-action], [data-v], [data-subtab], #btnEdit, #btnSave, #btnCancel, #btnCopyWa, #btnManualSyncSheets, #btnLogout');
  if (!target) return;

  if (target.id === 'btnLogout') {
    logout();
    return;
  }

  // Cambio de pestañas principales (Mes, Año, Recibos, etc.)
  if (target.dataset.v) {
    switchView(target.dataset.v);
    return;
  }

  // Cambio de sub-pestañas internas del mes
  if (target.dataset.subtab) {
    switchSubtab(target.dataset.subtab);
    return;
  }

  if (target.id === 'btnEdit') {
    SNAP = JSON.stringify(Store.serialize(S));
    EDIT = true;
    render();
    return;
  }

  if (target.id === 'btnCancel') {
    if (DIRTY && !confirm('¿Deseas descartar los cambios no guardados?')) return;
    S = Store.hydrate(JSON.parse(SNAP));
    EDIT = false;
    DIRTY = false;
    render();
    return;
  }

  if (target.id === 'btnSave' || target.closest('#btnSave')) {
    const isCloud = Store.mode === 'sheets-online' || (!Store.mode || Store.mode === 'static' || Store.mode === 'cloud');
    showSyncOverlay(
      'Guardando Cambios',
      isCloud
        ? 'Sincronizando y actualizando tu archivo Excel en Google Drive...'
        : 'Guardando información en el servidor local...'
    );
    try {
      const result = await Store.save(S);
      EDIT = false;
      DIRTY = false;

      let msg = result.mode === 'server'
        ? 'Datos guardados exitosamente en data/data.json'
        : 'Datos transmitidos a tu Google Drive.';

      if (result.sheetsSynced === true) {
        msg += ' Y sincronizado con Google Sheets en Drive.';
      } else if (result.sheetsSynced === false) {
        msg += ' (Nota: Falló la sincronización con Google Sheets, verifica tu URL).';
      }

      toast(msg, result.sheetsSynced === false ? 'error' : 'success');
    } catch (err) {
      toast('Error al guardar: ' + err.message, 'error');
    } finally {
      hideSyncOverlay();
      render();
    }
    return;
  }

  if (target.id === 'btnCopyWa') {
    const textEl = $('#receiptText');
    if (textEl) {
      navigator.clipboard.writeText(textEl.textContent).then(() => {
        toast('Mensaje copiado al portapapeles. ¡Listo para pegar en WhatsApp!', 'success');
      }).catch(() => {
        toast('No se pudo copiar automáticamente. Por favor selecciónalo y cópialo manualmente.', 'error');
      });
    }
    return;
  }

  if (target.id === 'btnManualSyncSheets' || target.closest('#btnManualSyncSheets')) {
    showSyncOverlay(
      'Sincronizando con Google Sheets',
      'Transmitiendo consumos, recibos y usuarios a tu hoja de cálculo en Drive...'
    );
    try {
      await Store.syncGoogleSheets(S);
      toast('Sincronización exitosa con tu Google Drive (Google Sheets)', 'success');
    } catch (err) {
      toast('Error al sincronizar con Google Sheets: ' + err.message, 'error');
    } finally {
      hideSyncOverlay();
      render();
    }
    return;
  }

  const action = target.dataset.action;
  const m = S.months[K];

  if (action === 'select-month') {
    K = target.dataset.k;
    Y = +K.slice(0, 4);
    render();
  }

  else if (action === 'select-receipt-apt') {
    SELECTED_APT = target.dataset.apt;
    renderReceiptView();
  }

  else if (action === 'go-receipt') {
    SELECTED_APT = target.dataset.apt;
    switchView('receipt');
  }

  else if (action === 'toggle-user-status') {
    const idx = +target.dataset.idx;
    if (S.users && S.users[idx]) {
      const u = S.users[idx];
      u.status = u.status === 'Inactivo' ? 'Activo' : 'Inactivo';
      const estadoDesc = u.status === 'Activo' ? 'activado' : 'dado de baja';
      await saveUsersImmediately(`Usuario ${u.nombre} ${estadoDesc}`);
    }
  }

  else if (action === 'delete-user') {
    const idx = +target.dataset.idx;
    if (S.users && S.users[idx]) {
      const u = S.users[idx];
      if (confirm(`¿Eliminar definitivamente al usuario ${u.nombre} (${u.dni})?`)) {
        S.users.splice(idx, 1);
        await saveUsersImmediately(`Usuario ${u.nombre} eliminado`);
      }
    }
  }

  else if (action === 'sync-users-sheets') {
    await saveUsersImmediately('Usuarios sincronizados con Google Sheets');
  }

  else if (action === 'create-month') {
    const prevMonths = Object.keys(S.months).filter(x => x < K).sort();
    const lastKey = prevMonths.pop();
    const prevData = lastKey ? JSON.parse(JSON.stringify(S.months[lastKey])) : { r: {} };

    const newMonth = {
      k: K,
      w: 0,
      e: 0,
      r: {},
      x: [],
      tr: prevData.tr ?? 1
    };

    APTS.forEach(apt => {
      const r = prevData.r[apt] || { t: 'i', wt: 0.5 };
      newMonth.r[apt] = { t: r.t, wt: r.wt };
      if (r.t === 'm') {
        newMonth.r[apt].p = r.c;
        newMonth.r[apt].c = r.c;
      }
    });

    S.months[K] = newMonth;
    DIRTY = true;
    EDIT = true;
    render();
  }

  else if (action === 'add-preset') {
    if (!m) return;
    m.x = m.x || [];
    m.x.push({
      n: target.dataset.name,
      amt: +target.dataset.amt,
      per: target.dataset.per,
      apts: ['101', '201', '301', '401', '501', '502']
    });
    DIRTY = true;
    renderMonthView();
    applyLockState();
  }

  else if (action === 'add-custom-charge') {
    if (!m) return;
    m.x = m.x || [];
    m.x.push({
      n: '',
      amt: 0,
      per: 'split',
      apts: ['101', '201', '301', '401', '501', '502']
    });
    DIRTY = true;
    renderMonthView();
    applyLockState();
  }

  else if (action === 'delete-charge') {
    if (!m) return;
    m.x.splice(+target.dataset.idx, 1);
    DIRTY = true;
    renderMonthView();
    applyLockState();
  }

  else if (action === 'mark-full-paid') {
    if (!m) return;
    m.pg = m.pg || {};
    m.pg[target.dataset.apt] = +target.dataset.val;
    DIRTY = true;
    renderMonthView();
    applyLockState();
  }

  else if (action === 'export-csv') {
    let csv = '\uFEFFMes,Departamento,Consumo_L,Agua_S,Luz_S,Extras_S,Total_S,A_Pagar_S\n';
    Object.keys(S.months).sort().forEach(k => {
      const c = calc(S, k);
      APTS.forEach(apt => {
        csv += [
          k,
          apt,
          c[apt].cons,
          R2(c[apt].w),
          R2(c[apt].e),
          R2(c[apt].x),
          R2(c[apt].tot),
          R2(c[apt].pay)
        ].join(',') + '\n';
      });
    });
    Store.downloadFile('servicios-san-martin.csv', csv, 'text/csv;charset=utf-8;');
  }

  else if (action === 'export-json') {
    Store.downloadFile('san-martin-respaldo.json', JSON.stringify(Store.serialize(S), null, 2), 'application/json');
  }

  else if (action === 'toggle-theme') {
    const root = document.documentElement;
    const isDark = getComputedStyle(root).colorScheme === 'dark' || root.dataset.theme === 'dark';
    root.dataset.theme = isDark ? 'light' : 'dark';
  }

  else if (action === 'reload-file') {
    if (!DIRTY || confirm('Hay cambios sin guardar que se perderán. ¿Recargar desde el archivo?')) {
      initApp();
    }
  }
});

document.addEventListener('submit', async e => {
  if (e.target && e.target.id === 'addUserForm') {
    e.preventDefault();
    const dniInput = $('#newDni');
    const nameInput = $('#newName');
    const aptInput = $('#newApt');
    const roleInput = $('#newRole');

    const dni = (dniInput?.value || '').trim();
    const nombre = (nameInput?.value || '').trim();
    const apt = aptInput?.value || 'Todos';
    const role = roleInput?.value || 'inquilino';

    if (!dni || !nombre) {
      toast('Ingresa DNI y Nombre del usuario', 'error');
      return;
    }

    if (S.users.some(u => String(u.dni).trim() === dni)) {
      toast(`El DNI ${dni} ya existe en la lista de usuarios.`, 'error');
      return;
    }

    S.users.push({ dni, nombre, apt, role, status: 'Activo' });
    if (dniInput) dniInput.value = '';
    if (nameInput) nameInput.value = '';

    await saveUsersImmediately(`Usuario ${nombre} (${dni}) guardado exitosamente`);
  }
});

document.addEventListener('change', e => {
  const target = e.target;
  const action = target.dataset.action;
  if (!action || !S) return;

  const m = S.months[K];
  const apt = target.dataset.apt;
  const idx = +target.dataset.idx;

  if (action === 'change-year') {
    Y = +target.value;
    K = `${Y}-${K.slice(5)}`;
    render();
    return;
  }

  if (action === 'import-json') {
    const file = target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        S = Store.hydrate(JSON.parse(reader.result));
        DIRTY = true;
        toast('Respaldo importado correctamente', 'success');
        render();
      } catch (err) {
        toast('Archivo JSON inválido', 'error');
      }
    };
    reader.readAsText(file);
    return;
  }

  if (action === 'cfg-step') S.cfg.step = +target.value;
  else if (action === 'cfg-fondo') S.cfg.fondo = +target.value;
  else if (action === 'cfg-nota') S.cfg.nota = target.value;
  else if (action === 'cfg-sheets-url') S.cfg.sheetsUrl = target.value.trim();
  else if (action === 'cfg-auto-sync') S.cfg.autoSyncSheets = target.checked;

  if (m) {
    if (action === 'field') {
      const prop = target.dataset.prop;
      if (prop === 'w' || prop === 'e') {
        m[prop] = +target.value;
      } else {
        m.d = m.d || ['', ''];
        m.d[prop === 'd0' ? 0 : 1] = target.value;
      }
    }

    else if (action === 'set-type') {
      m.r[apt].t = target.value;
      if (target.value !== 'm' && m.r[apt].wt == 1) m.r[apt].wt = 0.5;
      if (target.value === 'm' && m.r[apt].p == null) {
        m.r[apt].p = 0;
        m.r[apt].c = 0;
      }
    }

    else if (action === 'set-reading') {
      const key = target.dataset.key;
      m.r[apt][key] = +target.value;
    }

    else if (action === 'set-weight') {
      m.r[apt].wt = +target.value;
    }

    else if (action === 'charge-name') {
      m.x[idx].n = target.value;
    }

    else if (action === 'charge-amt') {
      m.x[idx].amt = +target.value;
    }

    else if (action === 'charge-per') {
      m.x[idx].per = target.value;
    }

    else if (action === 'charge-ded') {
      m.x[idx].ded = target.checked ? 1 : 0;
    }

    else if (action === 'charge-apt-toggle') {
      const currentApts = new Set(m.x[idx].apts || []);
      if (target.checked) currentApts.add(apt);
      else currentApts.delete(apt);
      m.x[idx].apts = APTS.filter(x => currentApts.has(x));
    }

    else if (action === 'set-paid') {
      m.pg = m.pg || {};
      m.pg[apt] = +target.value;
    }

    else if (action === 'toggle-carry') {
      m.tr = target.checked ? 1 : 0;
    }

    else if (action === 'set-note') {
      m.n = target.value;
    }
  }

  DIRTY = true;
  if (V === 'month') {
    renderMonthView();
    renderFilterBar();
    applyLockState();
  }
});

window.addEventListener('beforeunload', e => {
  if (DIRTY) {
    e.preventDefault();
    e.returnValue = '';
  }
});

async function initApp() {
  const isCloudHost = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  if (isCloudHost && (window.location.protocol === 'https:' || window.location.protocol === 'http:')) {
    showSyncOverlay(
      'Conectando con Google Drive',
      'Obteniendo los registros más recientes desde tu Excel en la nube...'
    );
  }

  try {
    S = await Store.load();
  } catch (err) {
    hideSyncOverlay();
    $('#app').innerHTML = `
      <div class="card" style="text-align:center;padding:48px 20px;">
        <h2 style="color:var(--danger)">No se pudo iniciar la aplicación</h2>
        <p>${err.message}</p>
        <p style="color:var(--text-muted)">Inicia el servidor en tu terminal con: <code>npm start</code></p>
      </div>`;
    return;
  } finally {
    hideSyncOverlay();
  }

  EDIT = false;
  DIRTY = false;

  const monthKeys = Object.keys(S.months).sort();
  K = K && S.months[K] ? K : monthKeys[monthKeys.length - 1];
  if (!K) {
    const today = new Date();
    K = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }
  Y = +K.slice(0, 4);

  try {
    const saved = localStorage.getItem('sanmartin_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      const validUser = S.users.find(u => String(u.dni).trim() === String(parsed.dni).trim() && u.status !== 'Inactivo');
      if (validUser) {
        CURRENT_USER = validUser;
      }
    }
  } catch (_) {}

  render();
}

initApp();
