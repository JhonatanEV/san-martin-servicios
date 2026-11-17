/**
 * GOOGLE APPS SCRIPT PARA SINCRONIZAR CON GOOGLE SHEETS
 * Edificio San Martín · Gestión de Servicios Comunes y Usuarios por DNI
 *
 * Pestañas administradas:
 * 1. Resumen General (Facturación y cobros por mes)
 * 2. Detalle por Departamento (Lecturas y consumos)
 * 3. Cargos y Aportes Extra (Limpiezas de tanque, etc.)
 * 4. Usuarios (Base de datos de acceso por DNI: admin e inquilinos)
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var users = obtenerUsuarios(ss);
    
    // Obtener los datos almacenados en propiedades del script
    var props = PropertiesService.getScriptProperties();
    var rawData = props.getProperty("SAN_MARTIN_DATA");
    var data = rawData ? JSON.parse(rawData) : null;

    if (!data) {
      data = {
        version: 1,
        updatedAt: new Date().toISOString(),
        cfg: { step: 0.1, fondo: 1100, nota: "" },
        months: []
      };
    }

    data.users = users;

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      data: data
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No se recibieron datos en la petición POST");
    }

    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Guardar copia rápida en Propiedades del Script para lecturas instantáneas desde GitHub Pages
    PropertiesService.getScriptProperties().setProperty("SAN_MARTIN_DATA", JSON.stringify(payload));

    // 2. Actualizar las tablas visuales de la Hoja de Cálculo
    actualizarResumenGeneral(ss, payload);
    actualizarDetalleDeptos(ss, payload);
    actualizarCargosEspeciales(ss, payload);

    if (payload.users && Array.isArray(payload.users)) {
      guardarUsuarios(ss, payload.users);
    }

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      mensaje: "Datos y usuarios actualizados correctamente en Google Sheets",
      updatedAt: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Pestaña 4: Gestión de Usuarios por DNI
 */
function obtenerUsuarios(ss) {
  var sheet = ss.getSheetByName("Usuarios");
  if (!sheet) {
    sheet = ss.insertSheet("Usuarios");
    var headers = ["DNI", "Nombre Completo", "Departamento", "Rol (admin/inquilino)", "Estado (Activo/Inactivo)"];
    sheet.appendRow(headers);
    // Usuario administrador por defecto
    sheet.appendRow(["70424972", "Administrador Principal", "Todos", "admin", "Activo"]);
    estilarEncabezados(sheet, headers.length, "#1B365D");
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 220);
    sheet.setColumnWidth(3, 130);
    sheet.setColumnWidth(4, 150);
    sheet.setColumnWidth(5, 120);
  }

  var data = sheet.getDataRange().getValues();
  var users = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var dni = String(row[0] || "").trim();
    if (dni) {
      users.push({
        dni: dni,
        nombre: String(row[1] || "").trim(),
        apt: String(row[2] || "").trim(),
        role: String(row[3] || "inquilino").toLowerCase().trim(),
        status: String(row[4] || "Activo").trim()
      });
    }
  }

  // Garantizar que siempre exista el admin 70424972
  var hasAdmin = users.some(function(u) { return u.dni === "70424972"; });
  if (!hasAdmin) {
    users.unshift({
      dni: "70424972",
      nombre: "Administrador Principal",
      apt: "Todos",
      role: "admin",
      status: "Activo"
    });
  }

  return users;
}

function guardarUsuarios(ss, users) {
  var sheet = ss.getSheetByName("Usuarios");
  if (!sheet) {
    sheet = ss.insertSheet("Usuarios");
  }
  sheet.clear();

  var headers = ["DNI", "Nombre Completo", "Departamento", "Rol (admin/inquilino)", "Estado (Activo/Inactivo)"];
  var rows = [headers];

  users.forEach(function(u) {
    rows.push([
      String(u.dni || "").trim(),
      u.nombre || "Usuario",
      u.apt || "General",
      u.role || "inquilino",
      u.status || "Activo"
    ]);
  });

  if (rows.length > 0) {
    sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
    estilarEncabezados(sheet, headers.length, "#1B365D");
    sheet.autoResizeColumns(1, headers.length);
  }
}

/**
 * Pestaña 1: Resumen General
 */
function actualizarResumenGeneral(ss, data) {
  var sheetName = "Resumen General";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName, 0);
  sheet.clear();

  var headers = [
    "Mes", "Año", "Recibo Agua (S/)", "Recibo Luz (S/)",
    "Cargos Especiales (S/)", "Total Facturado (S/)", "Total Cobrado (S/)", "Saldo Pendiente (S/)", "Notas"
  ];

  var rows = [headers];
  var months = data.months || [];

  months.forEach(function(m) {
    var k = m.k || "";
    var year = k.slice(0, 4);
    var w = Number(m.w || 0);
    var e = Number(m.e || 0);

    var extras = 0;
    (m.x || []).forEach(function(x) { extras += Number(x.amt || 0); });

    var totalCobrado = 0;
    if (m.pg) {
      Object.keys(m.pg).forEach(function(apt) {
        totalCobrado += Number(m.pg[apt] || 0);
      });
    }

    var totalFacturado = w + e + extras;
    var saldo = totalFacturado - totalCobrado;

    rows.push([k, year, w, e, extras, totalFacturado, totalCobrado, saldo, m.n || ""]);
  });

  if (rows.length > 0) {
    sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
    estilarEncabezados(sheet, headers.length, "#1B365D");
    if (rows.length > 1) {
      sheet.getRange(2, 3, rows.length - 1, 6).setNumberFormat('"S/ " #,##0.00');
    }
    sheet.autoResizeColumns(1, headers.length);
  }
}

/**
 * Pestaña 2: Detalle por Departamento
 */
function actualizarDetalleDeptos(ss, data) {
  var sheetName = "Detalle por Departamento";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName, 1);
  sheet.clear();

  var headers = [
    "Mes", "Departamento", "Tipo", "Lect. Anterior", "Lect. Actual",
    "Consumo (L)", "Agua (S/)", "Luz (S/)", "Extras/Tanque (S/)",
    "Total (S/)", "A Pagar (S/)", "Pagado (S/)", "Saldo (S/)"
  ];

  var rows = [headers];
  var apts = ["101", "201", "301", "401", "501", "502"];
  var months = data.months || [];

  months.forEach(function(m) {
    var k = m.k || "";
    var ded = (m.x || []).filter(function(x) { return x.ded; }).reduce(function(s, x) { return s + Number(x.amt || 0); }, 0);
    var poolAgua = Math.max(0, Number(m.w || 0) - ded);

    var totalConsumo = 0;
    var totalPesosLuz = 0;

    apts.forEach(function(a) {
      var r = (m.r && m.r[a]) || {};
      var cons = r.t === 'm' ? Math.max(0, Number(r.c || 0) - Number(r.p || 0) + Number(r.aj || 0)) : 0;
      totalConsumo += cons;
      totalPesosLuz += r.wt == null ? 1 : Number(r.wt);
    });

    apts.forEach(function(a) {
      var r = (m.r && m.r[a]) || {};
      var cons = r.t === 'm' ? Math.max(0, Number(r.c || 0) - Number(r.p || 0) + Number(r.aj || 0)) : 0;
      var w = totalConsumo > 0 ? (cons / totalConsumo) * poolAgua : 0;
      var wt = r.wt == null ? 1 : Number(r.wt);
      var e = totalPesosLuz > 0 ? (Number(m.e || 0) * wt) / totalPesosLuz : 0;

      var x = 0;
      (m.x || []).forEach(function(cargo) {
        var aptsList = cargo.apts || [];
        if (aptsList.indexOf(a) !== -1) {
          if (cargo.per === 'split') {
            x += Number(cargo.amt || 0) / (aptsList.length || 1);
          } else {
            x += Number(cargo.amt || 0);
          }
        }
      });

      var tot = w + e + x;
      var pay = Math.ceil(tot * 10) / 10;
      var paid = Number((m.pg && m.pg[a]) || 0);
      var bal = pay - paid;

      var tipoTexto = r.t === 'm' ? 'Con medidor' : (r.t === 'i' ? 'Independiente' : 'No usa');

      rows.push([
        k, a, tipoTexto,
        r.p != null ? Number(r.p) : "",
        r.c != null ? Number(r.c) : "",
        cons, w, e, x, tot, pay, paid, bal
      ]);
    });
  });

  if (rows.length > 0) {
    sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
    estilarEncabezados(sheet, headers.length, "#0F52BA");
    if (rows.length > 1) {
      sheet.getRange(2, 6, rows.length - 1, 1).setNumberFormat('#,##0');
      sheet.getRange(2, 7, rows.length - 1, 7).setNumberFormat('"S/ " #,##0.00');
    }
    sheet.autoResizeColumns(1, headers.length);
  }
}

/**
 * Pestaña 3: Cargos y Aportes Extra
 */
function actualizarCargosEspeciales(ss, data) {
  var sheetName = "Cargos y Aportes Extra";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName, 2);
  sheet.clear();

  var headers = [
    "Mes", "Concepto (Gasto / Aporte)", "Monto Total (S/)",
    "Distribución", "Deducido de Recibo Agua", "Departamentos Afectados"
  ];

  var rows = [headers];
  var months = data.months || [];

  months.forEach(function(m) {
    var k = m.k || "";
    (m.x || []).forEach(function(cargo) {
      rows.push([
        k,
        cargo.n || "Sin concepto",
        Number(cargo.amt || 0),
        cargo.per === 'split' ? "Total repartido" : "Monto por cada depto",
        cargo.ded ? "SÍ" : "NO",
        (cargo.apts || []).join(", ")
      ]);
    });
  });

  if (rows.length > 0) {
    sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
    estilarEncabezados(sheet, headers.length, "#4A235A");
    if (rows.length > 1) {
      sheet.getRange(2, 3, rows.length - 1, 1).setNumberFormat('"S/ " #,##0.00');
    }
    sheet.autoResizeColumns(1, headers.length);
  }
}

function estilarEncabezados(sheet, colCount, colorFondo) {
  var headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange.setBackground(colorFondo);
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}
