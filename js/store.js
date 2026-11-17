/**
 * Capa de almacenamiento y persistencia de datos
 * - Conexión con servidor local (data/data.json)
 * - Modo GitHub Pages / Nube directa con Google Sheets
 * - Soporte de usuarios por DNI
 */

const Store = {
  mode: 'local',
  isSyncing: false,

  async load() {
    // 1. Intentar primero con el servidor local Node.js (si se está ejecutando localmente)
    try {
      const res = await fetch('api/data', { cache: 'no-store' });
      if (res.ok) {
        this.mode = 'server';
        const data = await res.json();
        return this.hydrate(data);
      }
    } catch (_) {}

    // 2. Modo estático / GitHub Pages: Intentar cargar data.json base
    let baseData = null;
    try {
      const res = await fetch('data/data.json', { cache: 'no-store' });
      if (res.ok) {
        baseData = await res.json();
      }
    } catch (_) {}

    // 3. Revisar si hay datos en LocalStorage (respaldo del navegador)
    let localData = null;
    try {
      localData = JSON.parse(localStorage.getItem('sanmartin_v2'));
    } catch (_) {}

    const candidate = (localData && (localData.updatedAt || '') > (baseData?.updatedAt || ''))
      ? localData
      : (baseData || { cfg: {}, months: [], users: [] });

    this.mode = 'static';
    const S = this.hydrate(candidate);

    // 4. Si estamos en GitHub Pages / estático y hay URL de Google Sheets, consultar datos frescos
    if (S.cfg.sheetsUrl && (window.location.protocol === 'https:' || window.location.protocol === 'http:')) {
      this.isSyncing = true;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s de tiempo límite de seguridad
        const sheetsRes = await fetch(S.cfg.sheetsUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (sheetsRes.ok) {
          const json = await sheetsRes.json();
          if (json.ok && json.data && json.data.months) {
            this.mode = 'sheets-online';
            return this.hydrate(json.data);
          }
        }
      } catch (err) {
        console.warn('No se pudo consultar Google Sheets en vivo (usando copia local):', err);
      } finally {
        this.isSyncing = false;
      }
    }

    return S;
  },

  hydrate(data) {
    const S = {
      version: data.version || 1,
      updatedAt: data.updatedAt || null,
      cfg: Object.assign({
        step: 0.1,
        fondo: 1100,
        nota: '',
        sheetsUrl: 'https://script.google.com/macros/s/AKfycby0VrhuTnf0Ew5Wqv_0VkBNc_yFyhQdoo2UyVElsCAgmNMmW8kKOh5KWwaojbKCGqovTQ/exec',
        autoSyncSheets: true
      }, data.cfg || {}),
      users: (data.users && Array.isArray(data.users)) ? data.users : [
        { dni: '70424972', nombre: 'Administrador Principal', apt: 'Todos', role: 'admin', status: 'Activo' }
      ],
      months: {}
    };

    // Asegurar que el admin principal 70424972 siempre esté en la lista
    if (!S.users.some(u => String(u.dni).trim() === '70424972')) {
      S.users.unshift({
        dni: '70424972',
        nombre: 'Administrador Principal',
        apt: 'Todos',
        role: 'admin',
        status: 'Activo'
      });
    }

    (data.months || []).forEach(m => {
      S.months[m.k] = m;
    });

    return S;
  },

  serialize(S) {
    return {
      version: S.version || 1,
      updatedAt: new Date().toISOString(),
      cfg: S.cfg,
      users: S.users,
      months: Object.keys(S.months).sort().map(k => S.months[k])
    };
  },

  async save(S) {
    this.isSyncing = true;
    try {
      const payload = this.serialize(S);
      const jsonText = JSON.stringify(payload, null, 2);

      if (this.mode === 'server') {
        const res = await fetch('api/data', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: jsonText
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || `Error en el servidor: ${res.status}`);
        }

        S.updatedAt = payload.updatedAt;

        let sheetsSyncStatus = null;
        if (S.cfg.sheetsUrl && S.cfg.autoSyncSheets) {
          try {
            await this.syncGoogleSheets(S);
            sheetsSyncStatus = true;
          } catch (e) {
            console.warn('Fallo sincronización en segundo plano con Google Sheets:', e);
            sheetsSyncStatus = false;
          }
        }

        return { mode: 'server', sheetsSynced: sheetsSyncStatus };
      }

      // Modo GitHub Pages / Estático: Guardar en LocalStorage y enviar a Google Sheets
      try {
        localStorage.setItem('sanmartin_v2', jsonText);
      } catch (_) {}

      let sheetsSyncStatus = null;
      if (S.cfg.sheetsUrl) {
        try {
          await this.syncGoogleSheets(S);
          sheetsSyncStatus = true;
          this.mode = 'sheets-online';
        } catch (e) {
          console.warn('Error enviando a Google Sheets:', e);
          sheetsSyncStatus = false;
        }
      }

      S.updatedAt = payload.updatedAt;
      return { mode: 'cloud', sheetsSynced: sheetsSyncStatus };
    } finally {
      this.isSyncing = false;
    }
  },

  async syncGoogleSheets(S) {
    this.isSyncing = true;
    try {
      const payload = this.serialize(S);

      if (this.mode === 'server') {
        const res = await fetch('api/sync-sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error al sincronizar con Google Sheets');
        }
        return data;
      } else {
        // Modo directo desde el navegador (GitHub Pages)
        if (!S.cfg.sheetsUrl) throw new Error('No hay URL de Google Sheets configurada');
        await fetch(S.cfg.sheetsUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload)
        });
        this.mode = 'sheets-online';
        return { ok: true, message: 'Datos transmitidos a Google Sheets' };
      }
    } finally {
      this.isSyncing = false;
    }
  },

  downloadFile(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};
