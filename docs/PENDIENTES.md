# DevJobTracker — Backlog y fases (fuente única)

Este archivo es el **seguimiento vivo** de qué está hecho y qué falta. La regla de Cursor [`.cursor/rules/devjob-tracker-app.mdc`](../.cursor/rules/devjob-tracker-app.mdc) resume **visión, stack y principios**; el detalle de pendientes vive **aquí**.

---

## Resumen rápido

| Fase | Tema | Estado global |
|------|------|----------------|
| **1** | MVP frontend (mock/local) | Completa (histórico) |
| **2** | Backend, auth, datos en API | **Producción desplegada** (Vercel + Render + Atlas). Pendiente “producto”: **email** ampliado |
| **3** | Comunidad, feed, perfiles | Casi cerrada → opcional: **explore sin login** |
| **4** | Monetización + backoffice | **En curso:** app `job-tracker-backoffice` (UI mock) |
| **5** | IA, job boards, PWA, i18n, etc. | No iniciada |

**Qué sigue ahora (prioridad sugerida):** (1) emails transaccionales / notificaciones, (2) opcional explore público, (3) Fase 4 cuando haya foco en ingresos. Ver tablas abajo.

---

## Fase 1 — MVP (histórico)

Frontend con datos locales; cubiertas landing, dashboard, Kanban, analytics, CV/CL (luego migrados), preguntas, learning, recursos, pitch, templates, seed, etc.

---

## Fase 2 — Backend + Auth + datos

**Objetivo:** API NestJS, MongoDB, Google OAuth + JWT, persistencia en servidor, email, Calendar.

| Item | Estado | Notas |
|------|--------|--------|
| API NestJS + MongoDB + JWT + Google OAuth | Hecho | |
| **Deploy** frontend (Vercel) + API (Render) + MongoDB Atlas | Hecho | Guía: [`DEPLOY.md`](./DEPLOY.md). Keep-alive del free tier: ping a `/api/health` (cron externo u otro servicio) |
| Redis (cache / rate limit) | Opcional | No bloquea |
| Migración localStorage → API (módulos principales) | Hecho | |
| CV / cover letter en backend (p. ej. Cloudinary) | Hecho | |
| Seed demo Preguntas / Learning vía API (`/seed`) | Hecho | |
| Email bienvenida (registro Google) | Hecho | SMTP opcional en API |
| Notificaciones por email (recordatorios, digest, alertas) | **Pendiente** | Ampliar producto |
| Google Calendar + eventos desde entrevistas Kanban | Hecho | |

---

## Fase 3 — Comunidad

**Objetivo:** contenido compartido, interacción, feed, perfiles públicos.

| Item | Estado | Notas |
|------|--------|--------|
| Learning paths públicos + explorar + clonar | Hecho | |
| Preguntas públicas + explorar + clonar | Hecho | |
| Autor visible en explore | Hecho | |
| Estrellas (paths) + likes y comentarios (preguntas) | Hecho | |
| Feed / bolsa (`story` / `opportunity`), likes y comentarios | Hecho | |
| Perfiles públicos `/u/:slug` + métricas Kanban (sin datos sensibles) | Hecho | |
| Avatar Google en testimonios + sidebar / perfil | Hecho | |
| **Explore sin login** (contenido público sin cuenta) | **Opcional / pendiente** | Mejor descubrimiento desde marketing |

---

## Fase 4 — Monetización + Backoffice

**Estado:** no iniciada (referencia de diseño).

| Tema | Detalle |
|------|---------|
| **Modelo** | Freemium. Trial 7 días con todo Pro; downgrade automático al terminar |
| **Precios** | AR: ~$30.000 ARS/mes (Mercado Pago) · Internacional: ~$10 USD/mes (Stripe). Futuro: plan anual (~2 meses gratis) |
| **Plan Free** (post-trial) | Kanban máx 5, checklist, plataformas, progreso sin histórico, templates default, recursos, preguntas máx 10, learning máx 2, comunidad solo lectura |
| **Plan Pro** | Todo ilimitado + analytics + pitch + CV/CL + comunidad completa + AI + notificaciones + calendar |
| **Feature flags** | Cortes Free/Pro configurables desde backoffice sin deploy |
| **Pagos** | Mercado Pago + Stripe + webhooks + reintentos + gracia ~3 días |
| **Backoffice** | MRR, churn, trial→pro, usuarios, pagos, reembolsos, moderación, métricas (retención, NPS), flags |

---

## Fase 5 — Features avanzados

**Estado:** no iniciada.

- IA (OpenAI/Claude) para respuestas y asistencia
- APIs de job boards
- Push notifications
- Spaced repetition (preguntas)
- App mobile / PWA (ampliar)
- Multi-idioma (i18n) en producto

---

## Mejoras transversales (sin número de fase)

| Item | Estado | Notas |
|------|--------|--------|
| Página **Recursos** | Revisar | Datos estáticos (`@/lib/resources`); API solo si querés gestión/admin |
| **README** raíz del front | Revisar | Alinear con API + deploy (evitar referencias al `store.ts` viejo) |

---

## Cómo usar este doc

- **Antes de planificar:** leer tabla de fase correspondiente.
- **Al cerrar un ítem:** actualizar tabla y la fecha al pie.
- **No duplicar** listas largas en `.mdc`: solo enlazar aquí.

---

*Última actualización: abril 2026 — backoffice mock en `job-tracker-backoffice`; pendientes inmediatos: email ampliado, explore sin login opcional; Fase 4: conectar pagos + API admin.*
