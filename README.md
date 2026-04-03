# DevJobTracker

App web para desarrolladores de LATAM que buscan trabajo remoto en USA/Europa. Centraliza plataformas, aplicaciones, preparación de entrevistas, CV, y progreso semanal en un solo lugar.

## Demo

Correr localmente:

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Stack técnico

| Tecnología | Versión | Uso |
|---|---|---|
| **Next.js** | 16.2 | Framework React con App Router (SSR/SSG) |
| **React** | 19.2 | UI library |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 4.x | Utility-first CSS |
| **Lucide React** | 1.7 | Iconos SVG como componentes React |
| **uuid** | 13.x | Generación de IDs únicos (v4) |

## Patrones de diseño y arquitectura

### 1. App Router con Route Groups

Usamos el **App Router** de Next.js con **route groups** `(app)` para separar la landing page del layout principal de la aplicación:

```
src/app/
├── page.tsx              # Landing page (sin sidebar)
├── layout.tsx            # Root layout (metadata, fonts)
├── globals.css
└── (app)/                # Route group → layout con sidebar
    ├── layout.tsx        # App layout (sidebar + header mobile)
    ├── dashboard/
    ├── applications/
    │   ├── page.tsx      # Kanban board
    │   └── [id]/page.tsx # Detalle dinámico por aplicación
    ├── platforms/
    ├── checklist/
    ├── progress/
    ├── cv/
    ├── resources/
    ├── questions/
    ├── learning/
    ├── pitch/
    └── templates/
```

El route group `(app)` no afecta la URL pero comparte un layout con sidebar. Esto es un **Layout Pattern** nativo de Next.js que evita re-renders innecesarios del shell al navegar entre páginas.

### 2. Repository Pattern (simplificado) — Store

Toda la persistencia se abstrae detrás de un **store centralizado** (`src/lib/store.ts`) que expone una API tipo CRUD:

```typescript
store.getApplications()
store.addApplication(data)
store.updateApplication(id, updates)
store.deleteApplication(id)
```

El store encapsula `localStorage` como mecanismo de persistencia. Cuando en Fase 2 migremos a un backend con MongoDB, solo hay que cambiar la implementación interna del store (o reemplazarlo por llamadas HTTP) sin tocar los componentes.

Esto es una aplicación del **Repository Pattern**: los componentes no saben ni les importa dónde se guardan los datos.

### 3. Separation of Concerns — Capas bien definidas

```
src/
├── lib/
│   ├── types.ts        # Capa de dominio: interfaces y tipos
│   ├── store.ts        # Capa de persistencia: CRUD + localStorage
│   ├── data.ts         # Capa de datos: defaults y seeds
│   └── resources.ts    # Capa de datos: recursos curados
├── components/
│   └── Sidebar.tsx     # Componentes reutilizables
└── app/
    └── (app)/          # Capa de presentación: páginas
```

- **types.ts** — Define el dominio (Application, Platform, Template, etc.) sin lógica
- **store.ts** — Implementa la persistencia, no sabe de UI
- **data.ts** — Datos semilla y constantes, separados de la lógica
- **pages** — Solo presentación e interacción del usuario

### 4. Composition Pattern

Cada página es auto-contenida y compone su propia UI. No hay un mega-componente. Por ejemplo, la página de detalle de aplicación (`applications/[id]/page.tsx`) compone:

- Un header con datos
- Un selector de estado
- Un checklist de preparación
- Un timeline de entrevistas
- Un área de notas

Cada sección maneja su propio estado local pero comparte el mismo `refresh()` para re-leer del store.

### 5. Controlled Components con Forms nativos

Los formularios usan una combinación de:
- **Controlled components** (React state) para edición inline (checklist, notas)
- **FormData API** (`new FormData(e.currentTarget)`) para modales de creación, evitando state innecesario

### 6. Strategy Pattern — Contenido multilenguaje

Los templates soportan dos idiomas (EN/ES) mediante el **Strategy Pattern** aplicado al contenido:

```typescript
const getContent = (t: Template) => {
  if (lang === "es" && t.contentEs) return t.contentEs;
  return t.content;
};
```

El idioma activo selecciona qué contenido mostrar sin duplicar lógica.

### 7. Feature-based File Organization

Las páginas se organizan por feature/dominio (applications, platforms, checklist, etc.), no por tipo de archivo. Esto facilita la navegación y el ownership del código.

### 8. Mobile-first Responsive Design

Todo el CSS está diseñado mobile-first con breakpoints `sm:`, `md:`, `lg:` de Tailwind. El sidebar se convierte en un drawer en mobile con overlay.

### 9. Optimistic UI

Las operaciones del store son síncronas (localStorage), así que toda interacción se refleja inmediatamente. No hay loading states en Fase 1, pero la arquitectura del store permite agregar estados de carga cuando migremos a API async.

## Features (Fase 1 - MVP)

| Feature | Descripción |
|---|---|
| **Dashboard** | Vista general con stats, próximas entrevistas, checklist, plataformas |
| **Kanban de aplicaciones** | Drag & drop entre columnas (Wishlist → Applied → Interview → Offer → Rejected) |
| **Detalle de aplicación** | Notas, checklist de preparación, timeline de entrevistas con countdown |
| **Plataformas** | 10 plataformas pre-cargadas con estado, perfil y alertas |
| **Checklist diaria** | Se resetea cada día, editable (agregar, editar, borrar items) |
| **Progreso semanal** | Metas semanales con barras de progreso + historial |
| **Mi CV** | Upload PDF, descarga, guía completa de ATS y tips |
| **Recursos** | 21 recursos curados (algoritmos, system design, inglés, behavioral) |
| **Pitch Builder** | Wizard de 5 pasos que genera 5 speeches de venta |
| **Templates** | Respuestas pre-armadas EN/ES, editables, con variables |
| **Banco de preguntas** | Flashcards de entrevista con preguntas, respuestas y tags por tecnología |
| **Learning Path** | Roadmaps de estudio por tecnología con temas, links a recursos y progreso |

## Roadmap

### Fase 2 — Backend + Auth
- API REST con NestJS + TypeScript
- MongoDB para persistencia
- Auth con Google OAuth + JWT
- Migrar localStorage a API
- Notificaciones por email (entrevistas próximas)
- Integración Google Calendar

### Fase 3 — Comunidad
- **Learning Paths compartidos**: marcar paths como "públicos", otros usuarios los clonan. Likes/saves para rankear los mejores
- **Banco de preguntas comunitario**: preguntas privadas por defecto, opción de compartir. Otros guardan, dan like, agregan respuestas alternativas
- **Bolsa de trabajo / Feed**: posts donde usuarios comparten ofertas, experiencias de entrevistas en empresas específicas, tips
- **Perfiles públicos**: al llegar a "Hired!", perfil con stats (learning paths completados, entrevistas, etc.) como social proof
- **Foto de perfil**: avatar de Google OAuth en testimonios, sidebar y comunidad

### Fase 4 — Monetización + Backoffice

#### Modelo de negocio: Freemium con suscripción mensual

**Precios**:
- Argentina: **$30.000 ARS/mes** (Mercado Pago: tarjeta, transferencia, QR)
- Internacional: **$10 USD/mes** (Stripe: tarjeta de crédito)
- Futuro: plan anual con descuento de 2 meses gratis

**Trial**: 7 días con todas las features Pro. Notificación al día 5. Downgrade automático a Free. Si paga durante el trial, el mes arranca después.

**Plan Free (post-trial)**:

| Feature | Límite |
|---|---|
| Kanban | Máx 5 aplicaciones |
| Checklist diaria | ✅ |
| Plataformas | ✅ |
| Progreso semanal | Solo actual (sin histórico) |
| Templates | Solo defaults (no editables) |
| Recursos curados | ✅ |
| Banco de preguntas | Máx 10 |
| Learning Path | Máx 2 paths |
| Analytics | ❌ |
| Pitch Builder | ❌ |
| Mi CV + Cover Letter | ❌ |
| Comunidad | Solo leer |
| AI respuestas | ❌ |
| Notificaciones | ❌ |
| Google Calendar | ❌ |

**Plan Pro** — Todo ilimitado + todas las features.

**Feature flags**: la división Free/Pro se controla desde el backoffice sin deploy. Cada feature tiene un flag configurable con límites por plan. Fácil de ajustar, mover features entre planes o crear planes intermedios en el futuro.

#### Pasarela de pago
- **Mercado Pago** para Argentina (tarjeta, transferencia, QR, cuotas)
- **Stripe** para pagos internacionales (tarjeta USD)
- Webhooks para activar/desactivar features según estado del pago
- Reintentos de cobro automáticos + período de gracia de 3 días

#### Backoffice (panel de administración)
- **Dashboard admin**: usuarios totales, activos, MRR, churn rate, conversión free→pro, trial→pro
- **Gestión de usuarios**: perfil, plan, estado de pago, actividad, suspender/activar cuenta
- **Gestión de pagos**: historial de transacciones, cobros fallidos, reembolsos manuales
- **Gestión de contenido**: moderar posts, preguntas y learning paths compartidos
- **Métricas**: funnel de onboarding, retención por cohorte, features más usadas, NPS
- **Configuración**: precios por región, duración del trial, límites del plan free, feature flags

### Fase 5 — Features avanzados
- AI para generar respuestas personalizadas (OpenAI/Claude)
- Integración con APIs de job boards (LinkedIn, Indeed)
- Push notifications (web + mobile)
- Spaced repetition para algoritmos y preguntas
- App mobile (React Native o PWA)
- Multi-idioma (i18n: español, inglés, portugués)

## Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build de producción
npm run build

# Lint
npm run lint
```

## Estructura de datos (localStorage keys)

| Key | Tipo | Descripción |
|---|---|---|
| `djt_applications` | `Application[]` | Todas las aplicaciones del kanban |
| `djt_platforms` | `Platform[]` | Estado de las plataformas |
| `djt_checklist` | `ChecklistItem[]` | Todos los items de checklist (multi-día) |
| `djt_progress` | `WeeklyProgress[]` | Registros de progreso semanal |
| `djt_templates` | `Template[]` | Templates custom/editados |
| `djt_templates_lang` | `"en" \| "es"` | Idioma seleccionado en templates |
| `djt_pitch_data` | `PitchData` | Datos del Pitch Builder |
| `djt_cv_file` | `StoredCV` | CV en base64 + metadata |
| `djt_questions` | `Question[]` | Preguntas de entrevista con tags |
| `djt_learning_paths` | `LearningPath[]` | Paths de estudio con temas y progreso |

## Licencia

MIT
