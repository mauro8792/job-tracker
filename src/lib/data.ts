import { Platform, Template, ChecklistItem, Question, LearningPath } from "./types";

export const DEFAULT_PLATFORMS: Platform[] = [
  { id: "linkedin", name: "LinkedIn", url: "https://linkedin.com/jobs", status: "not_started", hasProfile: false, hasAlerts: false },
  { id: "turing", name: "Turing", url: "https://turing.com", status: "not_started", hasProfile: false, hasAlerts: false },
  { id: "getonboard", name: "GetonBoard", url: "https://getonbrd.com", status: "not_started", hasProfile: false, hasAlerts: false },
  { id: "wellfound", name: "Wellfound", url: "https://wellfound.com", status: "not_started", hasProfile: false, hasAlerts: false },
  { id: "arc", name: "Arc.dev", url: "https://arc.dev", status: "not_started", hasProfile: false, hasAlerts: false },
  { id: "silver", name: "Silver.dev", url: "https://silver.dev", status: "not_started", hasProfile: false, hasAlerts: false },
  { id: "talently", name: "Talently", url: "https://talently.tech", status: "not_started", hasProfile: false, hasAlerts: false },
  { id: "hireline", name: "Hireline", url: "https://hireline.io", status: "not_started", hasProfile: false, hasAlerts: false },
  { id: "remotok", name: "RemoteOK", url: "https://remoteok.com", status: "not_started", hasProfile: false, hasAlerts: false },
  { id: "wwr", name: "We Work Remotely", url: "https://weworkremotely.com", status: "not_started", hasProfile: false, hasAlerts: false },
];

export const DEFAULT_DAILY_CHECKLIST: Omit<ChecklistItem, "id" | "completed" | "date">[] = [
  { label: "Resolver 1 problema en NeetCode", category: "algorithms" },
  { label: "Revisar alertas de empleo y aplicar", category: "applications" },
  { label: "30 min de inglés (Cambly/YouTube/Pramp)", category: "english" },
  { label: "Revisar mensajes en plataformas", category: "applications" },
  { label: "Practicar 1 pregunta behavioral (STAR)", category: "other" },
];

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "tell-me-about-yourself",
    title: "Tell me about yourself",
    category: "behavioral",
    content: `I'm a Backend Engineer with {years}+ years of experience building scalable APIs, microservices, and real-time systems. I currently work at {company} where I've delivered production-grade applications across multiple industries using {technologies}. I'm passionate about clean architecture, performance optimization, and distributed systems. I'm looking for a remote position where I can tackle challenging technical problems and continue growing as an engineer.`,
    contentEs: `Soy Ingeniero Backend con {years}+ años de experiencia construyendo APIs escalables, microservicios y sistemas en tiempo real. Actualmente trabajo en {company} donde he entregado aplicaciones en producción para múltiples industrias usando {technologies}. Me apasiona la arquitectura limpia, la optimización de rendimiento y los sistemas distribuidos. Busco una posición remota donde pueda enfrentar desafíos técnicos complejos y seguir creciendo como ingeniero.`,
    variables: ["years", "company", "technologies"],
  },
  {
    id: "why-interested",
    title: "Why are you interested in this position?",
    category: "motivation",
    content: `I'm interested in {company} because it aligns with my goal of working on {product_type} at scale. With my {years}+ years of experience in {technologies}, I'm confident I can contribute from day one. I'm particularly drawn to the opportunity to {specific_reason}, and I believe my background in {relevant_experience} makes me a strong fit for this role.`,
    contentEs: `Me interesa {company} porque se alinea con mi objetivo de trabajar en {product_type} a escala. Con mis {years}+ años de experiencia en {technologies}, estoy seguro de poder contribuir desde el primer día. Me atrae particularmente la oportunidad de {specific_reason}, y creo que mi experiencia en {relevant_experience} me hace un buen candidato para este rol.`,
    variables: ["company", "product_type", "years", "technologies", "specific_reason", "relevant_experience"],
  },
  {
    id: "challenging-project",
    title: "Tell me about a challenging project",
    category: "behavioral",
    content: `Situation: At {company}, I was tasked with {situation}.

Task: I needed to {task}.

Action: I {action}. Specifically, I {specific_actions}.

Result: The result was {result}. This improved {metrics}.`,
    contentEs: `Situación: En {company}, me asignaron {situation}.

Tarea: Necesitaba {task}.

Acción: Yo {action}. Específicamente, {specific_actions}.

Resultado: El resultado fue {result}. Esto mejoró {metrics}.`,
    variables: ["company", "situation", "task", "action", "specific_actions", "result", "metrics"],
  },
  {
    id: "why-leaving",
    title: "Why are you looking for a new job?",
    category: "behavioral",
    content: `I've had a great experience at {current_company} over the past {years} years, where I've grown from {previous_role} to {current_role}. I'm now looking for new challenges that will allow me to work with {desired_tech_or_domain} and continue growing technically. I'm particularly interested in remote opportunities with international teams where I can have a bigger impact on the product.`,
    contentEs: `Tuve una gran experiencia en {current_company} durante los últimos {years} años, donde crecí de {previous_role} a {current_role}. Ahora busco nuevos desafíos que me permitan trabajar con {desired_tech_or_domain} y seguir creciendo técnicamente. Me interesan particularmente las oportunidades remotas con equipos internacionales donde pueda tener un mayor impacto en el producto.`,
    variables: ["current_company", "years", "previous_role", "current_role", "desired_tech_or_domain"],
  },
  {
    id: "event-driven",
    title: "Have you worked with event-driven architectures?",
    category: "technical",
    content: `Yes, I've worked with event-driven architectures. At {company}, I built {system_description} using {technologies} for {purpose}. This approach allowed us to {benefit}, improving {metrics}.`,
    contentEs: `Sí, trabajé con arquitecturas event-driven. En {company}, construí {system_description} usando {technologies} para {purpose}. Este enfoque nos permitió {benefit}, mejorando {metrics}.`,
    variables: ["company", "system_description", "technologies", "purpose", "benefit", "metrics"],
  },
  {
    id: "why-hire-you",
    title: "Why should we hire you?",
    category: "motivation",
    content: `I bring {years}+ years of hands-on experience building production-grade {type_of_systems} with {technologies}. What sets me apart is my ability to {differentiator}. I've consistently delivered results in fast-paced environments, and I'm the kind of engineer who takes ownership of problems end-to-end. I'm also a strong communicator who thrives in collaborative, remote teams.`,
    contentEs: `Traigo {years}+ años de experiencia práctica construyendo {type_of_systems} en producción con {technologies}. Lo que me diferencia es mi capacidad de {differentiator}. He entregado resultados consistentemente en entornos de ritmo rápido, y soy el tipo de ingeniero que toma ownership de los problemas de punta a punta. También soy un buen comunicador que trabaja bien en equipos colaborativos y remotos.`,
    variables: ["years", "type_of_systems", "technologies", "differentiator"],
  },
];

export const MOCK_QUESTIONS: Omit<Question, "id" | "createdAt">[] = [
  { question: "¿Qué es el Event Loop en Node.js?", answer: "El Event Loop es el mecanismo que permite a Node.js realizar operaciones no bloqueantes. Funciona en fases: timers, pending callbacks, idle/prepare, poll, check y close callbacks. El poll phase es donde se procesan los I/O callbacks. Cuando la cola está vacía, espera nuevos eventos. setImmediate() se ejecuta en la check phase, setTimeout() en timers.", tags: ["Node.js", "JavaScript"] },
  { question: "¿Diferencia entre var, let y const?", answer: "var tiene scope de función y permite hoisting (se declara al inicio del scope). let y const tienen block scope. let permite reasignación, const no (pero sí mutación en objetos/arrays). En la práctica: usar const por defecto, let cuando necesitás reasignar, evitar var.", tags: ["JavaScript"] },
  { question: "¿Qué es un closure?", answer: "Un closure es una función que recuerda el scope léxico en el que fue creada, incluso después de que esa función haya terminado de ejecutarse. Permite crear funciones con estado privado. Ejemplo: una función counter() que retorna otra función que incrementa y retorna un valor interno.", tags: ["JavaScript"] },
  { question: "¿Qué son los Streams en Node.js?", answer: "Los Streams son colecciones de datos que pueden no estar disponibles de una sola vez. Hay 4 tipos: Readable (fs.createReadStream), Writable (fs.createWriteStream), Duplex (TCP socket) y Transform (zlib). Permiten procesar datos chunk por chunk sin cargar todo en memoria. Se conectan con pipe().", tags: ["Node.js"] },
  { question: "¿Qué es un índice en SQL y cuándo usarlo?", answer: "Un índice es una estructura de datos (generalmente B-tree) que acelera las consultas SELECT pero ralentiza INSERT/UPDATE/DELETE. Usarlos en: columnas de WHERE frecuentes, JOINs, ORDER BY. No usarlos en: tablas pequeñas, columnas con poca cardinalidad, columnas que se actualizan mucho.", tags: ["SQL"] },
  { question: "¿Diferencia entre SQL JOIN types?", answer: "INNER JOIN: solo filas con match en ambas tablas. LEFT JOIN: todas las filas de la izquierda + matches de la derecha (NULL si no hay match). RIGHT JOIN: opuesto a LEFT. FULL OUTER JOIN: todas las filas de ambas tablas. CROSS JOIN: producto cartesiano.", tags: ["SQL"] },
  { question: "¿Qué es un middleware en Express/NestJS?", answer: "Un middleware es una función que tiene acceso al request (req), response (res) y la función next(). Se ejecuta entre la recepción del request y el envío del response. Sirve para: logging, autenticación, validación, manejo de errores, parsing del body, CORS. En NestJS se implementan como clases con NestMiddleware.", tags: ["Node.js", "NestJS", "Express"] },
  { question: "¿Qué es el patrón Repository?", answer: "El Repository Pattern abstrae la capa de acceso a datos detrás de una interfaz. Los componentes/servicios no saben si los datos vienen de una DB, API o localStorage. Beneficios: desacoplamiento, testabilidad (mockear el repo), facilidad para cambiar la fuente de datos sin afectar la lógica de negocio.", tags: ["Patrones de diseño"] },
  { question: "¿Qué es Docker y para qué sirve?", answer: "Docker permite empaquetar aplicaciones con todas sus dependencias en contenedores. Un contenedor es una instancia de una imagen. Dockerfile define cómo construir la imagen. docker-compose orquesta múltiples contenedores. Ventajas: consistencia entre entornos (dev/staging/prod), aislamiento, escalabilidad, CI/CD más simple.", tags: ["Docker"] },
  { question: "¿Diferencia entre MongoDB y SQL?", answer: "MongoDB es NoSQL (documentos JSON/BSON), schema flexible, escala horizontal con sharding. SQL es relacional (tablas/filas), schema fijo, escala vertical. MongoDB es mejor para datos no estructurados, prototipado rápido. SQL es mejor para datos relacionales, transacciones ACID, queries complejas con JOINs.", tags: ["MongoDB", "SQL"] },
  { question: "¿Qué es TypeScript y por qué usarlo?", answer: "TypeScript es un superset de JavaScript que agrega tipado estático. Beneficios: detectar errores en compile time, mejor autocomplete/IntelliSense, documentación implícita del código, refactoring más seguro. Interfaces y types definen la forma de los datos. Generics permiten código reutilizable con tipos dinámicos.", tags: ["TypeScript"] },
  { question: "¿Cómo manejar errores en Node.js?", answer: "Código síncrono: try/catch. Promesas: .catch() o try/catch con async/await. EventEmitter: evento 'error'. Express: middleware de error (4 params: err, req, res, next). NestJS: Exception Filters. Siempre loguear errores (Winston/Pino). Diferenciar errores operacionales (esperados) de programáticos (bugs).", tags: ["Node.js", "NestJS", "Express"] },
  { question: "Tell me about yourself (en 2 minutos)", answer: "Estructura: 1) Presente (rol actual y tecnologías), 2) Pasado (trayectoria resumida, logros clave), 3) Futuro (qué buscás y por qué esta empresa). Ejemplo: 'I'm a Backend Engineer with 5+ years of experience building scalable APIs and microservices at GlobalLogic. I've worked with Node.js, NestJS, SQL Server and MongoDB. I'm looking for a remote position where I can tackle challenging distributed systems problems.'", tags: ["Behavioral", "Cross / General"] },
  { question: "¿Por qué querés dejar tu trabajo actual?", answer: "Nunca hablar mal de la empresa actual. Enfocarse en crecimiento: 'I've grown a lot at my current role, but I'm looking for new challenges. I want to work on [tipo de proyecto/tecnología] and have more impact on the product.' Mencionar interés en la empresa target: 'Your company's focus on [algo específico] aligns perfectly with where I want to grow.'", tags: ["Behavioral"] },
  { question: "¿Qué es REST y cuáles son sus principios?", answer: "REST (Representational State Transfer) es un estilo arquitectónico para APIs. Principios: Client-Server, Stateless (cada request tiene toda la info), Cacheable, Layered System, Uniform Interface (recursos identificados por URI, manipulación vía representaciones, mensajes autodescriptivos, HATEOAS). Métodos HTTP: GET (leer), POST (crear), PUT (reemplazar), PATCH (actualizar parcial), DELETE (borrar).", tags: ["REST API", "System Design"] },
  { question: "¿Qué es Redis y para qué se usa?", answer: "Redis es una base de datos in-memory key-value. Casos de uso: caching (reducir queries a DB), session storage, rate limiting, pub/sub para real-time, colas de trabajo (Bull/BullMQ), leaderboards (sorted sets), locks distribuidos. Estructuras: strings, hashes, lists, sets, sorted sets. TTL para expiración automática.", tags: ["Redis"] },
  { question: "¿Cómo diseñarías un sistema de notificaciones?", answer: "Componentes: 1) API que recibe eventos (nueva aplicación, entrevista programada), 2) Cola de mensajes (RabbitMQ/SQS) para desacoplar, 3) Workers que procesan la cola y envían por canal (email/push/SMS), 4) Template engine para personalizar mensajes, 5) Preferencias del usuario (qué notificaciones quiere), 6) Rate limiting para no spamear. Patrón: Event-driven con pub/sub.", tags: ["System Design"] },
  { question: "¿Qué es JWT y cómo funciona?", answer: "JWT (JSON Web Token) tiene 3 partes: Header (algoritmo), Payload (claims: sub, exp, iat, datos custom), Signature (verificación). Flujo: 1) Login → server genera JWT, 2) Client lo guarda (localStorage/cookie), 3) Cada request envía el JWT en header Authorization: Bearer <token>, 4) Server verifica la firma. Access token (corto, ~15min) + Refresh token (largo, ~7d).", tags: ["Node.js", "Seguridad"] },
];

export const MOCK_LEARNING_PATHS: Omit<LearningPath, "id">[] = [
  {
    name: "Node.js Fundamentals",
    icon: "🟢",
    tags: ["Node.js", "JavaScript"],
    topics: [
      { id: "n1", title: "Event Loop & Async Programming", url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick", completed: true },
      { id: "n2", title: "Streams & Buffers", url: "https://nodejs.org/en/learn/modules/backpressuring-in-streams", completed: true },
      { id: "n3", title: "Modules (CommonJS vs ESM)", url: "https://nodejs.org/api/esm.html", completed: true },
      { id: "n4", title: "Cluster & Worker Threads", url: "https://nodejs.org/api/cluster.html", completed: false },
      { id: "n5", title: "Error Handling Patterns", completed: true },
      { id: "n6", title: "Performance & Profiling", url: "https://nodejs.org/en/learn/getting-started/profiling", completed: false },
      { id: "n7", title: "Security Best Practices", url: "https://nodejs.org/en/learn/getting-started/security-best-practices", completed: false },
    ],
  },
  {
    name: "TypeScript Avanzado",
    icon: "🔷",
    tags: ["TypeScript"],
    topics: [
      { id: "t1", title: "Generics avanzados", url: "https://www.typescriptlang.org/docs/handbook/2/generics.html", completed: true },
      { id: "t2", title: "Utility Types (Partial, Pick, Omit, Record)", completed: true },
      { id: "t3", title: "Conditional Types & infer", completed: false },
      { id: "t4", title: "Mapped Types", completed: false },
      { id: "t5", title: "Template Literal Types", completed: false },
      { id: "t6", title: "Decorators (NestJS)", url: "https://docs.nestjs.com/custom-decorators", completed: true },
    ],
  },
  {
    name: "System Design",
    icon: "🏗️",
    tags: ["System Design"],
    topics: [
      { id: "s1", title: "Scalability basics (horizontal vs vertical)", url: "https://www.youtube.com/watch?v=Y-Gl4HEyeUQ", completed: true },
      { id: "s2", title: "Load Balancers", completed: true },
      { id: "s3", title: "Caching strategies (Redis, CDN)", completed: true },
      { id: "s4", title: "Database sharding & replication", completed: false },
      { id: "s5", title: "Message Queues (RabbitMQ, SQS)", completed: false },
      { id: "s6", title: "Microservices vs Monolith", completed: true },
      { id: "s7", title: "API Gateway pattern", completed: false },
      { id: "s8", title: "CQRS & Event Sourcing", completed: false },
      { id: "s9", title: "Design a URL Shortener", url: "https://www.youtube.com/watch?v=fMZMm_0ZhK4", completed: false },
      { id: "s10", title: "Design a Chat System", url: "https://www.youtube.com/watch?v=vvhC64hQZMk", completed: false },
    ],
  },
  {
    name: "SQL & Databases",
    icon: "🗄️",
    tags: ["SQL", "MongoDB"],
    topics: [
      { id: "d1", title: "JOINs (INNER, LEFT, RIGHT, FULL)", completed: true },
      { id: "d2", title: "Indexes & Query Optimization", completed: true },
      { id: "d3", title: "Transactions & ACID", completed: true },
      { id: "d4", title: "Stored Procedures & Views", completed: false },
      { id: "d5", title: "MongoDB Aggregation Pipeline", url: "https://www.mongodb.com/docs/manual/aggregation/", completed: false },
      { id: "d6", title: "Database Normalization (1NF-3NF)", completed: true },
    ],
  },
  {
    name: "Algoritmos & Estructuras",
    icon: "🧮",
    tags: ["Algoritmos"],
    topics: [
      { id: "a1", title: "Big O Notation", url: "https://neetcode.io/courses/lessons/big-o-notation", completed: true },
      { id: "a2", title: "Arrays & Hashing", url: "https://neetcode.io/roadmap", completed: true },
      { id: "a3", title: "Two Pointers", completed: true },
      { id: "a4", title: "Sliding Window", completed: false },
      { id: "a5", title: "Stack", completed: true },
      { id: "a6", title: "Binary Search", completed: false },
      { id: "a7", title: "Linked Lists", completed: false },
      { id: "a8", title: "Trees & BFS/DFS", completed: false },
      { id: "a9", title: "Graphs", completed: false },
      { id: "a10", title: "Dynamic Programming", url: "https://neetcode.io/courses/dsa-for-beginners/32", completed: false },
    ],
  },
  {
    name: "English for Interviews",
    icon: "🇬🇧",
    tags: ["English", "Behavioral"],
    topics: [
      { id: "e1", title: "STAR Method para respuestas", url: "https://www.youtube.com/watch?v=0nN7Q7DrI6Q", completed: true },
      { id: "e2", title: "Common interview phrases & vocabulary", completed: true },
      { id: "e3", title: "Practice: Tell me about yourself (2 min)", completed: true },
      { id: "e4", title: "Practice: Why this company?", completed: false },
      { id: "e5", title: "Practice: Describe a conflict situation", completed: false },
      { id: "e6", title: "Technical vocabulary (architecture, patterns)", completed: false },
      { id: "e7", title: "Small talk & follow-up questions", completed: false },
    ],
  },
];
