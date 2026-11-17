# Edificio San Martín · Control de Servicios

Aplicación web para la gestión mensual de agua (submedidores), luz del área común, y aportes de mantenimiento (tanque de agua, bombas, etc.), respaldada en **Google Sheets** y lista para publicar en **GitHub Pages**.

---

## 🔐 Acceso por DNI y Roles

El portal cuenta con control de acceso por número de DNI:

* **Administrador Principal:** DNI `70424972`
  * Acceso total: registrar lecturas, editar recibos, crear nuevos meses, registrar cobranzas y administrar usuarios.
* **Inquilinos / Vecinos:** DNI asignado por la administración
  * Acceso seguro de solo lectura: ven directamente el recibo de su departamento, desglose de agua, luz y aportes, y resumen del mes.

---

## 🌐 Cómo publicar en GitHub Pages (Enlace público gratuito)

Para que todos los vecinos puedan ingresar desde su celular con su DNI sin necesidad de que tengas tu PC encendida:

### Paso 1: Subir el proyecto a GitHub
1. Ve a [github.com/new](https://github.com/new) y crea un nuevo repositorio llamado: `san-martin-servicios` (marca la opción **Público**).
2. En la terminal de esta carpeta, ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Version inicial San Martin Servicios"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/san-martin-servicios.git
   git push -u origin main
   ```
   *(Reemplaza `TU_USUARIO` por tu nombre de usuario en GitHub).*

### Paso 2: Activar GitHub Pages
1. En tu repositorio de GitHub, entra a **Settings** (pestaña superior con engranaje).
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección **Build and deployment > Branch**, selecciona:
   * Rama: `main`
   * Carpeta: `/ (root)`
4. Haz clic en **Save**.
5. Espera 1 minuto y GitHub te mostrará el enlace público:
   `https://TU_USUARIO.github.io/san-martin-servicios/`

---

## 📊 Gestión de Usuarios desde Google Sheets

En tu Google Sheet de Google Drive se gestiona la pestaña **"Usuarios"**:

| DNI | Nombre Completo | Departamento | Rol | Estado |
| :--- | :--- | :--- | :--- | :--- |
| `70424972` | Administrador Principal | Todos | admin | Activo |
| `12345678` | Juan Pérez | 301 | inquilino | Activo |
| `87654321` | María Gómez | 401 | inquilino | Inactivo |

* Puedes dar de alta, activar o dar de baja a cualquier inquilino desde la pestaña **Usuarios** dentro de la aplicación, o editando directamente la fila en tu Google Sheet.
