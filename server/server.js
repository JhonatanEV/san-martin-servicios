'use strict';
/**
 * Servidor local para Edificio San Martín - Servicios
 * - Sirve la aplicación web
 * - Persistencia atómica en data/data.json con historial de copias en data/backups/
 * - Sincronización transparente con Google Sheets (Google Apps Script Webhook)
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data', 'data.json');
const BACKUPS = path.join(ROOT, 'data', 'backups');
const PORT = process.env.PORT || 3000;
const KEEP = 30;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const send = (res, code, body, type = 'application/json') => {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};

function validate(d) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.months) || typeof d.cfg !== 'object') {
    return 'Estructura inválida de datos';
  }
  for (const m of d.months) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(m.k) || typeof m.r !== 'object') {
      return 'Mes inválido: ' + m.k;
    }
  }
  return null;
}

function saveData(d) {
  fs.mkdirSync(BACKUPS, { recursive: true });
  if (fs.existsSync(DATA)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync(DATA, path.join(BACKUPS, `data-${stamp}.json`));
    const oldBackups = fs.readdirSync(BACKUPS).sort();
    if (oldBackups.length > KEEP) {
      oldBackups.slice(0, oldBackups.length - KEEP).forEach(f => {
        try { fs.unlinkSync(path.join(BACKUPS, f)); } catch (_) {}
      });
    }
  }
  const tmp = DATA + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(d, null, 2), 'utf8');
  fs.renameSync(tmp, DATA); // Escritura atómica
}

/**
 * Envío HTTP/HTTPS con soporte automático de redirecciones (302 de Google Apps Script)
 * Al redirigir, Google envía la respuesta procesada a un endpoint GET (echo service)
 */
function forwardToGoogleSheets(targetUrl, payload, maxRedirects = 5, method = 'POST') {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Demasiados redireccionamientos de Google'));
    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch (e) {
      return reject(new Error('URL de Google Sheets no válida: ' + targetUrl));
    }
    const client = parsed.protocol === 'http:' ? http : https;
    const bodyStr = payload && method === 'POST' ? (typeof payload === 'string' ? payload : JSON.stringify(payload)) : '';

    const headers = {};
    if (method === 'POST') {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = client.request(parsed, {
      method: method,
      headers: headers
    }, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        // En Google Apps Script el 302 redirige al echo service que se consulta vía GET
        return resolve(forwardToGoogleSheets(res.headers.location, null, maxRedirects - 1, 'GET'));
      }
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body: raw });
        } else {
          reject(new Error(`Google respondió con código ${res.statusCode}: ${raw.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(35000, () => {
      req.destroy();
      reject(new Error('Tiempo de espera agotado conectando con Google Sheets (35s)'));
    });
    if (method === 'POST' && bodyStr) {
      req.write(bodyStr);
    }
    req.end();
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // API: Carga y Guardado de Datos
  if (url.pathname === '/api/data') {
    if (req.method === 'GET') {
      return fs.existsSync(DATA)
        ? send(res, 200, fs.readFileSync(DATA))
        : send(res, 404, { error: 'No existe data/data.json' });
    }

    if (req.method === 'PUT') {
      let body = '';
      req.on('data', c => {
        body += c;
        if (body.length > 10e6) req.destroy();
      });
      req.on('end', async () => {
        try {
          const d = JSON.parse(body);
          const err = validate(d);
          if (err) return send(res, 400, { error: err });
          saveData(d);
          send(res, 200, { ok: true, updatedAt: d.updatedAt });
        } catch (e) {
          send(res, 400, { error: 'JSON inválido en el cuerpo de la petición' });
        }
      });
      return;
    }
    return send(res, 405, { error: 'Método no permitido' });
  }

  // API: Sincronización con Google Sheets
  if (url.pathname === '/api/sync-sheets') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => {
        body += c;
        if (body.length > 10e6) req.destroy();
      });
      req.on('end', async () => {
        try {
          let payload;
          if (body) {
            payload = JSON.parse(body);
          } else if (fs.existsSync(DATA)) {
            payload = JSON.parse(fs.readFileSync(DATA, 'utf8'));
          } else {
            return send(res, 400, { error: 'No hay datos para sincronizar' });
          }

          const sheetsUrl = payload.cfg && payload.cfg.sheetsUrl;
          if (!sheetsUrl || !sheetsUrl.startsWith('http')) {
            return send(res, 400, { error: 'No se ha configurado la URL de Google Sheets en la configuración' });
          }

          const result = await forwardToGoogleSheets(sheetsUrl, payload);
          send(res, 200, { ok: true, message: 'Sincronizado exitosamente con Google Sheets', detail: result.body });
        } catch (err) {
          send(res, 502, { error: 'Error al comunicar con Google Sheets: ' + err.message });
        }
      });
      return;
    }
    return send(res, 405, { error: 'Método no permitido' });
  }

  // Servir archivos estáticos
  const rel = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const file = path.join(ROOT, rel);
  const allowed = ['index.html', 'css', 'js', 'data', 'google-apps-script'].includes(rel.split('/')[1]);

  if (
    !file.startsWith(ROOT + path.sep) ||
    !allowed ||
    rel.includes('/backups/') ||
    !fs.existsSync(file) ||
    fs.statSync(file).isDirectory()
  ) {
    return send(res, 404, { error: 'Recurso no encontrado' });
  }

  send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
});

function getLocalIp() {
  try {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if ((net.family === 'IPv4' || net.family === 4) && !net.internal) {
          return net.address;
        }
      }
    }
  } catch (_) {}
  return 'localhost';
}

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`\n=================================================`);
  console.log(`Edificio San Martín · Servicios`);
  console.log(`En tu PC:      http://localhost:${PORT}`);
  if (localIp !== 'localhost') {
    console.log(`En tu Celular: http://${localIp}:${PORT} (misma red Wi-Fi)`);
  }
  console.log(`Datos:         ${DATA}`);
  console.log(`=================================================\n`);
});

module.exports = server;
