# Despliegue: Vercel (front) + Render (API) + MongoDB Atlas

Stack recomendado para el MVP:

| Pie | Servicio | Nota |
|-----|----------|------|
| **Frontend** | [Vercel](https://vercel.com) | Next.js nativo |
| **API** | [Render](https://render.com) | Web Service con Node |
| **Base de datos** | [MongoDB Atlas](https://www.mongodb.com/atlas) | M0 gratis; **Mongoose ya lo usa la API** (no hace falta cambiar código) |
| **Redis** | Opcional | El proyecto no arranca Redis en `AppModule`; no es obligatorio para desplegar |

---

## 1. MongoDB Atlas

1. Crear cuenta y cluster (p. ej. **M0** / región cercana a tus usuarios).
2. **Database Access**: usuario y contraseña (guardalas).
3. **Network Access**: agregar IP `0.0.0.0/0` (Render usa IPs dinámicas; en producción estricta podés restringir después).
4. **Database** → Connect → Drivers → copiar URI `mongodb+srv://...`
5. Sustituir `<password>` y fijar nombre de DB, p. ej.  
   `mongodb+srv://USER:PASS@cluster.xxxxx.mongodb.net/job_tracker?retryWrites=true&w=majority`

Variable para Render: `MONGODB_URI=<esa URI>`.

---

## 2. API en Render

1. **New** → **Web Service** → conectar el repo `job-tracker-api`.
2. Configuración típica:
   - **Runtime**: Node
   - **Build command** (importante si ves `nest: not found`):  
     `npm ci --include=dev && npm run build`  
     El flag `--include=dev` fuerza instalar devDependencies aunque `NODE_ENV=production` (herramientas de compilación). El repo incluye `render.yaml` con este comando; si no usás Blueprint, copiá el mismo comando en **Settings → Build Command**.
   - **Start command**: `npm run start:prod`
   - Asegurate de haber hecho **push** de `package.json` y `package-lock.json` tras mover `@nestjs/cli` a `dependencies`.
   - **Plan**: Free (el servicio “duerme” tras inactividad; primer request puede tardar ~1 min).
3. **Environment** (ver también `.env.example` en la API):

| Variable | Ejemplo / notas |
|----------|-----------------|
| `NODE_ENV` | `production` |
| `PORT` | Render inyecta `PORT`; la app ya lo usa. Podés no definirlo y dejar el default o confiar en Render. |
| `MONGODB_URI` | URI de Atlas (arriba) |
| `JWT_ACCESS_SECRET` | String largo aleatorio (generar localmente) |
| `JWT_REFRESH_SECRET` | Otro distinto, también largo |
| `JWT_ACCESS_EXPIRATION` | `15m` |
| `JWT_REFRESH_EXPIRATION` | `7d` |
| `GOOGLE_CLIENT_ID` | Desde Google Cloud (sección 4) |
| `GOOGLE_CLIENT_SECRET` | Idem |
| `GOOGLE_CALLBACK_URL` | `https://TU-SERVICIO.onrender.com/api/auth/google/callback` |
| `FRONTEND_URL` | `https://TU-PROYECTO.vercel.app` (sin barra final) |
| `GOOGLE_CALENDAR_REDIRECT_URL` | `https://TU-SERVICIO.onrender.com/api/calendar/connect/google/callback` (si usás Calendar) |
| `CLOUDINARY_*` | Si querés CV/cover PDF en producción |
| `MAIL_*` | Opcional (emails) |

4. Tras el deploy, probá: `https://TU-SERVICIO.onrender.com/api/health`

**URL base para el front:** la API usa prefijo global `api`, así que la base que consume el cliente es:

`https://TU-SERVICIO.onrender.com/api`

### Mantener la API despierta (plan Free)

En el plan gratuito, Render **suspende** el servicio tras unos minutos sin requests; el primer acceso después muestra “despertando” y puede **romper OAuth** (timeouts) o parecer error a los usuarios.

**Opciones (elegí una):**

1. **Servicio externo (más simple):** [cron-job.org](https://cron-job.org), [UptimeRobot](https://uptimerobot.com) u otro monitor HTTP gratuito. URL a pinguear:  
   `GET https://TU-SERVICIO.onrender.com/api/health`  
   Intervalo: **cada 10–14 minutos** (antes de que duerma del todo).

2. **GitHub Actions** (repo `job-tracker-api`): existe `.github/workflows/render-keepalive.yml`. En el repo → **Settings → Secrets and variables → Actions** → creá el secret **`RENDER_HEALTH_URL`** con el valor  
   `https://TU-SERVICIO.onrender.com/api/health`  
   El workflow corre cada 10 minutos (UTC).

3. **Solución “de verdad”:** subir de plan en Render (servicio siempre activo).

---

## 3. Frontend en Vercel

1. **Import** el repo `job-tracker`.
2. Framework: **Next.js** (detección automática).
3. **Environment Variables**:

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://TU-SERVICIO.onrender.com/api` (si ponés solo el host sin `/api`, el front lo corrige; lo recomendable es incluir `/api` explícito) |

4. Deploy. La URL será algo como `https://devjob-tracker-xxx.vercel.app` (o tu dominio).

5. **Importante:** cuando tengas la URL final de Vercel, volvé a Render y asegurate de que **`FRONTEND_URL`** sea exactamente esa URL (CORS). Si cambiás dominio en Vercel, actualizá `FRONTEND_URL` en Render y redeploy de la API.

---

## 4. Google Cloud (OAuth + Calendar)

### Consentimiento y APIs

1. [Google Cloud Console](https://console.cloud.google.com) → proyecto (o crear uno).
2. **APIs y servicios** → **Biblioteca**: habilitar al menos:
   - lo que use Passport/Google OAuth (suele bastar con pantalla de consentimiento + credenciales);
   - **Google Calendar API** si usás conexión de calendario en la app.
3. **Pantalla de consentimiento de OAuth** (Externo para pruebas; usuarios de prueba si está en “Testing”).

### Credenciales OAuth 2.0

1. **Credenciales** → **Crear credenciales** → **ID de cliente de OAuth** → tipo **Aplicación web**.
2. **Orígenes JavaScript autorizados** (origen del front):
   - `https://TU-PROYECTO.vercel.app`
   - (Opcional) `http://localhost:3000` para desarrollo local.
3. **URIs de redirección autorizadas** (backends; deben coincidir **carácter por carácter** con las env vars):
   - `https://TU-SERVICIO.onrender.com/api/auth/google/callback`
   - `https://TU-SERVICIO.onrender.com/api/calendar/connect/google/callback`

4. Copiar **ID de cliente** y **Secreto** → Render: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

### Flujo

- El usuario entra al front → “Login con Google” → redirige a la API → Google → callback en la API → la API redirige al front con tokens (`/auth/callback?...`).  
- Por eso el **redirect URI de login es la API**, no Vercel.

---

## 5. Orden recomendado (primera vez)

1. Atlas + URI `MONGODB_URI`.
2. Google: crear credenciales con URIs **provisoria** o ya con la URL de Render (necesitás la URL del servicio Render antes de cerrar Google).
3. Deploy API en Render con todas las env (incl. `FRONTEND_URL` provisional o la definitiva de Vercel).
4. Deploy Vercel con `NEXT_PUBLIC_API_URL`.
5. Ajustar `FRONTEND_URL` en Render si la URL de Vercel cambió; redeploy API.
6. Probar login y una request autenticada.

---

## 6. Problemas frecuentes

| Síntoma | Qué revisar |
|---------|-------------|
| CORS | `FRONTEND_URL` en Render = URL exacta del front (protocolo + host, sin path). |
| Google `redirect_uri_mismatch` | URI en Google Console = misma que `GOOGLE_CALLBACK_URL` / Calendar. |
| 401 / sesión | `NEXT_PUBLIC_API_URL` debe terminar en `/api` como en local. |
| Mongo timeout | Network Access en Atlas; usuario/clave en URI. |
| Servicio Render frío / pantalla “Waking up” | Free tier: usar ping a `/api/health` cada ~10 min (cron externo o GitHub Actions) o plan de pago. |
| `E11000 duplicate key ... publicSlug: null` al registrar usuarios | Índice viejo en MongoDB. En Atlas → **Collections** → `users` → índices: eliminar **`publicSlug_1`** si existe y redeploy (Mongoose recrea el índice parcial correcto). Opcional: `updateMany` con `$unset` de `publicSlug` donde sea `null` para alinear datos. |

---

*Última actualización: abril 2026*
