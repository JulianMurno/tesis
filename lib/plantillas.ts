/**
 * Plantillas de roadmap por subrubro.
 * Base (Fase 3 — MVP) y fallback cuando no hay GEMINI_API_KEY.
 *
 * IMPORTANTE: todas las URLs son canónicas y estables (páginas principales de
 * plataformas reconocidas), elegidas para evitar enlaces rotos o "soft 404".
 * Se verifican con scripts/auditar (urlViva) cuando se modifican.
 */

export interface RecursoPlantilla {
  titulo: string;
  url: string;
  tipo: "video" | "articulo" | "repositorio" | "curso";
  costo: "gratis" | "pago";
  modalidad?: "academico" | "autodidacta" | "hibrido";
}

export interface EtapaPlantilla {
  titulo: string;
  descripcion: string;
  recursos: RecursoPlantilla[];
}

export interface RoadmapPlantilla {
  etapas: EtapaPlantilla[];
}

// Recursos reutilizables (URLs canónicas, todas existen y son estables).
const R = {
  cs50: { titulo: "CS50x — Harvard (intro a la programación)", url: "https://cs50.harvard.edu/x/", tipo: "curso", costo: "gratis" } as RecursoPlantilla,
  fcc: { titulo: "freeCodeCamp — Cursos interactivos", url: "https://www.freecodecamp.org/learn", tipo: "curso", costo: "gratis" } as RecursoPlantilla,
  fccEs: { titulo: "freeCodeCamp en Español", url: "https://www.freecodecamp.org/espanol/learn/", tipo: "curso", costo: "gratis" } as RecursoPlantilla,
  odin: { titulo: "The Odin Project", url: "https://www.theodinproject.com/", tipo: "curso", costo: "gratis" } as RecursoPlantilla,
  mdn: { titulo: "MDN Web Docs (Mozilla)", url: "https://developer.mozilla.org/es/", tipo: "articulo", costo: "gratis" } as RecursoPlantilla,
  jsInfo: { titulo: "JavaScript.info (en español)", url: "https://es.javascript.info/", tipo: "articulo", costo: "gratis" } as RecursoPlantilla,
  react: { titulo: "React — Documentación oficial", url: "https://es.react.dev/", tipo: "articulo", costo: "gratis" } as RecursoPlantilla,
  node: { titulo: "Node.js — Sitio oficial", url: "https://nodejs.org/es", tipo: "articulo", costo: "gratis" } as RecursoPlantilla,
  sqlbolt: { titulo: "SQLBolt — SQL interactivo", url: "https://sqlbolt.com/", tipo: "articulo", costo: "gratis" } as RecursoPlantilla,
  w3sql: { titulo: "W3Schools SQL", url: "https://www.w3schools.com/sql/", tipo: "articulo", costo: "gratis" } as RecursoPlantilla,
  git: { titulo: "Pro Git (libro oficial, en español)", url: "https://git-scm.com/book/es/v2", tipo: "articulo", costo: "gratis" } as RecursoPlantilla,
  linux: { titulo: "Linux Journey", url: "https://linuxjourney.com/", tipo: "articulo", costo: "gratis" } as RecursoPlantilla,
  docker: { titulo: "Docker — Get Started", url: "https://docs.docker.com/get-started/", tipo: "articulo", costo: "gratis" } as RecursoPlantilla,
  k8s: { titulo: "Kubernetes — Documentación", url: "https://kubernetes.io/es/docs/home/", tipo: "articulo", costo: "gratis" } as RecursoPlantilla,
  aws: { titulo: "AWS Skill Builder (cursos gratuitos)", url: "https://aws.amazon.com/es/training/", tipo: "curso", costo: "gratis" } as RecursoPlantilla,
  python: { titulo: "Tutorial oficial de Python (en español)", url: "https://docs.python.org/es/3/tutorial/", tipo: "articulo", costo: "gratis" } as RecursoPlantilla,
  pandas: { titulo: "Pandas — Documentación oficial", url: "https://pandas.pydata.org/docs/", tipo: "articulo", costo: "gratis" } as RecursoPlantilla,
  khanStats: { titulo: "Khan Academy — Estadística y probabilidad", url: "https://es.khanacademy.org/math/statistics-probability", tipo: "curso", costo: "gratis" } as RecursoPlantilla,
  khanAlg: { titulo: "Khan Academy — Álgebra lineal", url: "https://es.khanacademy.org/math/linear-algebra", tipo: "curso", costo: "gratis" } as RecursoPlantilla,
  mlcc: { titulo: "Machine Learning Crash Course — Google", url: "https://developers.google.com/machine-learning/crash-course", tipo: "curso", costo: "gratis" } as RecursoPlantilla,
  hf: { titulo: "Hugging Face — Cursos", url: "https://huggingface.co/learn", tipo: "curso", costo: "gratis" } as RecursoPlantilla,
  kaggle: { titulo: "Kaggle — Datasets y notebooks", url: "https://www.kaggle.com/", tipo: "repositorio", costo: "gratis" } as RecursoPlantilla,
  github: { titulo: "GitHub", url: "https://github.com/", tipo: "repositorio", costo: "gratis" } as RecursoPlantilla,
  tryhackme: { titulo: "TryHackMe", url: "https://tryhackme.com/", tipo: "curso", costo: "gratis" } as RecursoPlantilla,
  htb: { titulo: "Hack The Box", url: "https://www.hackthebox.com/", tipo: "repositorio", costo: "gratis" } as RecursoPlantilla,
  figma: { titulo: "Figma — Learn Design", url: "https://www.figma.com/resources/learn-design/", tipo: "curso", costo: "gratis" } as RecursoPlantilla,
  scrum: { titulo: "The Scrum Guide (oficial)", url: "https://scrumguides.org/", tipo: "articulo", costo: "gratis" } as RecursoPlantilla,
  unity: { titulo: "Unity Learn", url: "https://learn.unity.com/", tipo: "curso", costo: "gratis" } as RecursoPlantilla,
  itch: { titulo: "itch.io (publicar juegos)", url: "https://itch.io/", tipo: "repositorio", costo: "gratis" } as RecursoPlantilla,
  postman: { titulo: "Postman Learning Center", url: "https://learning.postman.com/", tipo: "curso", costo: "gratis" } as RecursoPlantilla,
  cypress: { titulo: "Cypress — Documentación", url: "https://docs.cypress.io/", tipo: "articulo", costo: "gratis" } as RecursoPlantilla,
  msLearn: (slug: string, titulo: string): RecursoPlantilla => ({ titulo, url: `https://learn.microsoft.com/es-es/${slug}`, tipo: "articulo", costo: "gratis" }),
  roadmap: (slug: string): RecursoPlantilla => ({ titulo: `roadmap.sh — ruta de ${slug}`, url: `https://roadmap.sh/${slug}`, tipo: "articulo", costo: "gratis" }),
} as const;

const FUNDAMENTOS: EtapaPlantilla = {
  titulo: "Fundamentos de la computación",
  descripcion: "Cómo funciona una computadora, lógica de programación y la terminal.",
  recursos: [R.cs50, R.fccEs],
};

const PORTFOLIO = (slug: string): EtapaPlantilla => ({
  titulo: "Portfolio y empleabilidad",
  descripcion: "Armá tu portfolio, tu GitHub y preparate para entrevistas.",
  recursos: [R.github, R.roadmap(slug)],
});

export const PLANTILLAS: Record<string, RoadmapPlantilla> = {
  // ── Desarrollo ──────────────────────────────
  frontend: {
    etapas: [
      FUNDAMENTOS,
      { titulo: "HTML y CSS", descripcion: "Estructura y estilos, diseño responsive.", recursos: [R.mdn, R.odin] },
      { titulo: "JavaScript", descripcion: "Lenguaje de la web: DOM, eventos y async.", recursos: [R.jsInfo, R.fcc] },
      { titulo: "React + Tailwind", descripcion: "Interfaces con componentes reutilizables.", recursos: [R.react, R.roadmap("react")] },
      { titulo: "Buenas prácticas", descripcion: "Accesibilidad, performance y testing.", recursos: [R.roadmap("frontend")] },
      PORTFOLIO("frontend"),
    ],
  },
  backend: {
    etapas: [
      FUNDAMENTOS,
      { titulo: "Un lenguaje de servidor", descripcion: "Node.js, Python o Java.", recursos: [R.node, R.python] },
      { titulo: "Bases de datos y SQL", descripcion: "Modelado relacional y consultas.", recursos: [R.sqlbolt, R.w3sql] },
      { titulo: "APIs REST", descripcion: "Endpoints, autenticación y buenas prácticas.", recursos: [R.roadmap("api-design"), R.postman] },
      { titulo: "Testing y despliegue", descripcion: "Pruebas, contenedores y deploy.", recursos: [R.docker] },
      PORTFOLIO("backend"),
    ],
  },
  fullstack: {
    etapas: [
      FUNDAMENTOS,
      { titulo: "Frontend (HTML, CSS, JS)", descripcion: "La cara visible de la app.", recursos: [R.odin, R.jsInfo] },
      { titulo: "React", descripcion: "Construir interfaces dinámicas.", recursos: [R.react] },
      { titulo: "Backend y bases de datos", descripcion: "Node.js + SQL.", recursos: [R.node, R.sqlbolt] },
      { titulo: "Integración full stack", descripcion: "Unir todo y desplegar.", recursos: [R.roadmap("full-stack")] },
      PORTFOLIO("full-stack"),
    ],
  },
  web: {
    etapas: [
      FUNDAMENTOS,
      { titulo: "HTML y CSS", descripcion: "Estructurar y dar estilo a páginas.", recursos: [R.mdn, R.fcc] },
      { titulo: "JavaScript", descripcion: "Interactividad en el navegador.", recursos: [R.jsInfo] },
      { titulo: "React", descripcion: "Aplicaciones web modernas.", recursos: [R.react] },
      { titulo: "Backend con Node.js", descripcion: "APIs, bases de datos y auth.", recursos: [R.node, R.sqlbolt] },
      PORTFOLIO("full-stack"),
    ],
  },
  mobile: {
    etapas: [
      FUNDAMENTOS,
      { titulo: "JavaScript", descripcion: "Base para React Native.", recursos: [R.jsInfo] },
      { titulo: "React", descripcion: "Componentes y estado, transferibles a mobile.", recursos: [R.react] },
      { titulo: "React Native (Expo)", descripcion: "Apps nativas para Android e iOS.", recursos: [{ titulo: "React Native — Docs oficiales", url: "https://reactnative.dev/", tipo: "articulo", costo: "gratis" }, { titulo: "Expo — Documentación", url: "https://docs.expo.dev/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Publicación", descripcion: "Build y publicación en las tiendas.", recursos: [R.roadmap("react-native")] },
      PORTFOLIO("react-native"),
    ],
  },
  gamedev: {
    etapas: [
      FUNDAMENTOS,
      { titulo: "Programación con C#", descripcion: "Lenguaje base de Unity.", recursos: [R.msLearn("dotnet/csharp/", "C# — Microsoft Learn")] },
      { titulo: "Motor Unity", descripcion: "Escenas, físicas y scripting.", recursos: [R.unity] },
      { titulo: "Diseño de juegos", descripcion: "Mecánicas, niveles y game feel.", recursos: [R.unity] },
      { titulo: "Primer juego publicado", descripcion: "Subí un juego a itch.io.", recursos: [R.itch] },
    ],
  },
  qa: {
    etapas: [
      { titulo: "Fundamentos de testing", descripcion: "Tipos de pruebas y ciclo de vida.", recursos: [R.roadmap("qa")] },
      { titulo: "Pruebas manuales", descripcion: "Casos de prueba y reporte de bugs.", recursos: [R.roadmap("qa")] },
      { titulo: "Automatización", descripcion: "Cypress / Selenium con JavaScript.", recursos: [R.cypress, R.jsInfo] },
      { titulo: "Testing de APIs", descripcion: "Postman y pruebas de integración.", recursos: [R.postman] },
    ],
  },
  embebidos: {
    etapas: [
      FUNDAMENTOS,
      { titulo: "Lenguaje C", descripcion: "Programación de bajo nivel.", recursos: [{ titulo: "Learn-C.org", url: "https://www.learn-c.org/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Electrónica y Arduino", descripcion: "Microcontroladores y sensores.", recursos: [{ titulo: "Arduino — Documentación", url: "https://docs.arduino.cc/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Proyectos IoT", descripcion: "Conectar dispositivos a la red.", recursos: [R.github] },
    ],
  },

  // ── Infraestructura ─────────────────────────
  soporte: {
    etapas: [
      { titulo: "Hardware y sistemas operativos", descripcion: "Cómo funciona una PC, Windows y Linux.", recursos: [R.linux] },
      { titulo: "Redes básicas", descripcion: "IP, DNS y troubleshooting.", recursos: [{ titulo: "Cisco Networking Academy", url: "https://www.netacad.com/", tipo: "curso", costo: "gratis" }] },
      { titulo: "Línea de comandos", descripcion: "Terminal de Linux y scripting.", recursos: [{ titulo: "The Linux Command Line", url: "https://linuxcommand.org/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Mesa de ayuda y certificaciones", descripcion: "ITIL y CompTIA A+.", recursos: [{ titulo: "CompTIA A+", url: "https://www.comptia.org/", tipo: "curso", costo: "pago" }] },
    ],
  },
  redes: {
    etapas: [
      { titulo: "Fundamentos de redes", descripcion: "Modelo OSI, TCP/IP y direccionamiento.", recursos: [{ titulo: "Cisco Networking Academy", url: "https://www.netacad.com/", tipo: "curso", costo: "gratis" }] },
      { titulo: "Routing y switching", descripcion: "Configuración de equipos de red.", recursos: [{ titulo: "Cisco Networking Academy", url: "https://www.netacad.com/", tipo: "curso", costo: "gratis" }] },
      { titulo: "Linux y línea de comandos", descripcion: "Administración desde la terminal.", recursos: [R.linux] },
      { titulo: "Certificación CCNA", descripcion: "Preparar la certificación de redes.", recursos: [{ titulo: "Cisco — Certificaciones", url: "https://www.cisco.com/site/us/en/learn/training-certifications/", tipo: "curso", costo: "pago" }] },
    ],
  },
  sysadmin: {
    etapas: [
      { titulo: "Linux", descripcion: "Sistema operativo de los servidores.", recursos: [R.linux] },
      { titulo: "Línea de comandos y Bash", descripcion: "Automatizar tareas con scripts.", recursos: [{ titulo: "The Linux Command Line", url: "https://linuxcommand.org/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Redes y servicios", descripcion: "DNS, web, correo y monitoreo.", recursos: [R.roadmap("devops")] },
      { titulo: "Git y automatización", descripcion: "Control de versiones e IaC.", recursos: [R.git] },
    ],
  },
  devops: {
    etapas: [
      { titulo: "Linux y línea de comandos", descripcion: "Base de la infraestructura moderna.", recursos: [R.linux] },
      { titulo: "Git y control de versiones", descripcion: "Flujos de trabajo en equipo.", recursos: [R.git] },
      { titulo: "Docker y contenedores", descripcion: "Empaquetar apps de forma portable.", recursos: [R.docker] },
      { titulo: "CI/CD", descripcion: "Automatizar pruebas y despliegues.", recursos: [R.msLearn("devops/", "DevOps — Microsoft Learn"), R.roadmap("devops")] },
      { titulo: "Kubernetes y cloud", descripcion: "Orquestación y nube.", recursos: [R.k8s] },
    ],
  },
  sre: {
    etapas: [
      { titulo: "Linux y redes", descripcion: "Base técnica sólida.", recursos: [R.linux] },
      { titulo: "Contenedores y Kubernetes", descripcion: "Orquestación de servicios.", recursos: [R.docker, R.k8s] },
      { titulo: "Observabilidad", descripcion: "Métricas, logs y alertas.", recursos: [R.roadmap("devops")] },
      { titulo: "Confiabilidad (SRE)", descripcion: "SLOs, SLAs y postmortems.", recursos: [{ titulo: "Google SRE Book (gratuito)", url: "https://sre.google/books/", tipo: "articulo", costo: "gratis" }] },
    ],
  },
  cloud: {
    etapas: [
      { titulo: "Fundamentos de Linux y redes", descripcion: "Lo mínimo para entender la nube.", recursos: [R.linux] },
      { titulo: "Conceptos de cloud", descripcion: "IaaS, PaaS, SaaS y modelos de servicio.", recursos: [R.aws] },
      { titulo: "Un proveedor (AWS)", descripcion: "EC2, S3, IAM y redes.", recursos: [R.aws, R.roadmap("aws")] },
      { titulo: "Certificación", descripcion: "AWS Cloud Practitioner.", recursos: [{ titulo: "AWS — Certificaciones", url: "https://aws.amazon.com/es/certification/", tipo: "curso", costo: "pago" }] },
    ],
  },
  ciberseguridad: {
    etapas: [
      { titulo: "Redes y sistemas", descripcion: "TCP/IP, Linux y fundamentos.", recursos: [R.linux] },
      { titulo: "Fundamentos de seguridad", descripcion: "Amenazas y buenas prácticas.", recursos: [R.roadmap("cyber-security")] },
      { titulo: "Hacking ético (práctica)", descripcion: "Pentesting en laboratorios.", recursos: [R.tryhackme] },
      { titulo: "Retos y CTFs", descripcion: "Práctica real y certificaciones.", recursos: [R.htb] },
    ],
  },

  // ── Datos ───────────────────────────────────
  analista: {
    etapas: [
      { titulo: "Excel y pensamiento analítico", descripcion: "Limpiar y resumir datos.", recursos: [R.msLearn("training/", "Microsoft Learn — Análisis de datos")] },
      { titulo: "SQL", descripcion: "Consultar bases de datos.", recursos: [R.sqlbolt, R.w3sql] },
      { titulo: "Visualización (Power BI)", descripcion: "Dashboards y reportes.", recursos: [R.msLearn("power-bi/", "Power BI — Microsoft Learn")] },
      { titulo: "Python para datos", descripcion: "Pandas y limpieza de datos.", recursos: [R.python, R.pandas] },
      { titulo: "Portfolio de análisis", descripcion: "Proyectos con datasets reales.", recursos: [R.kaggle] },
    ],
  },
  bi: {
    etapas: [
      { titulo: "SQL", descripcion: "Extraer datos de las bases.", recursos: [R.sqlbolt] },
      { titulo: "Modelado de datos", descripcion: "Estrella, copo de nieve y KPIs.", recursos: [R.roadmap("data-analyst")] },
      { titulo: "Power BI", descripcion: "Dashboards interactivos.", recursos: [R.msLearn("power-bi/", "Power BI — Microsoft Learn")] },
      { titulo: "Storytelling con datos", descripcion: "Comunicar hallazgos.", recursos: [R.kaggle] },
    ],
  },
  ingenieria: {
    etapas: [
      { titulo: "Python y SQL", descripcion: "Herramientas base del data engineer.", recursos: [R.python, R.sqlbolt] },
      { titulo: "Pipelines y ETL", descripcion: "Mover y transformar datos.", recursos: [R.roadmap("data-engineer")] },
      { titulo: "Data warehouses", descripcion: "Almacenamiento analítico.", recursos: [R.roadmap("data-engineer")] },
      { titulo: "Cloud para datos", descripcion: "Procesamiento a escala.", recursos: [R.aws] },
    ],
  },
  cientifico: {
    etapas: [
      { titulo: "Python", descripcion: "Lenguaje base de la ciencia de datos.", recursos: [R.python] },
      { titulo: "Estadística", descripcion: "Probabilidad e inferencia.", recursos: [R.khanStats] },
      { titulo: "Pandas y análisis", descripcion: "Manipulación de datos.", recursos: [R.pandas] },
      { titulo: "Machine Learning", descripcion: "Modelos con scikit-learn.", recursos: [R.mlcc] },
      { titulo: "Proyectos y Kaggle", descripcion: "Competencias y portfolio.", recursos: [R.kaggle] },
    ],
  },
  ia: {
    etapas: [
      { titulo: "Python y matemática", descripcion: "Álgebra lineal y cálculo básico.", recursos: [R.python, R.khanAlg] },
      { titulo: "Machine Learning", descripcion: "Fundamentos del aprendizaje automático.", recursos: [R.mlcc] },
      { titulo: "Deep Learning", descripcion: "Redes neuronales.", recursos: [{ titulo: "fast.ai — Practical Deep Learning", url: "https://course.fast.ai/", tipo: "curso", costo: "gratis" }] },
      { titulo: "LLMs y despliegue", descripcion: "Usar y servir modelos.", recursos: [R.hf] },
    ],
  },
  mlops: {
    etapas: [
      { titulo: "Python y ML", descripcion: "Base de modelos.", recursos: [R.python, R.mlcc] },
      { titulo: "Contenedores", descripcion: "Empaquetar modelos con Docker.", recursos: [R.docker] },
      { titulo: "Despliegue de modelos", descripcion: "Servir modelos en producción.", recursos: [R.roadmap("mlops")] },
      { titulo: "Monitoreo", descripcion: "Versionado y observabilidad de ML.", recursos: [R.roadmap("mlops")] },
    ],
  },

  // ── Gestión, Diseño y Educación ─────────────
  pm: {
    etapas: [
      { titulo: "Fundamentos de producto", descripcion: "Qué hace un Product Manager.", recursos: [R.roadmap("product-manager")] },
      { titulo: "Metodologías ágiles", descripcion: "Scrum y Kanban.", recursos: [R.scrum] },
      { titulo: "Descubrimiento y métricas", descripcion: "Entrevistas, KPIs y priorización.", recursos: [R.roadmap("product-manager")] },
      { titulo: "Herramientas y portfolio", descripcion: "Casos de estudio.", recursos: [R.figma] },
    ],
  },
  scrum: {
    etapas: [
      { titulo: "Agilidad", descripcion: "Valores y principios ágiles.", recursos: [{ titulo: "Manifiesto Ágil", url: "https://agilemanifesto.org/iso/es/manifesto.html", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Scrum", descripcion: "Roles, eventos y artefactos.", recursos: [R.scrum] },
      { titulo: "Facilitación", descripcion: "Dinámicas y gestión de equipos.", recursos: [R.roadmap("product-manager")] },
      { titulo: "Kanban y certificación", descripcion: "Flujo de trabajo y PSM.", recursos: [R.scrum] },
    ],
  },
  ux: {
    etapas: [
      { titulo: "Fundamentos de UX", descripcion: "Investigación y experiencia de usuario.", recursos: [R.roadmap("ux-design")] },
      { titulo: "UI y teoría visual", descripcion: "Color, tipografía y jerarquía.", recursos: [R.figma] },
      { titulo: "Figma", descripcion: "Wireframes y prototipos.", recursos: [R.figma] },
      { titulo: "Portfolio UX/UI", descripcion: "Casos de estudio.", recursos: [{ titulo: "Behance", url: "https://www.behance.net/", tipo: "repositorio", costo: "gratis" }] },
    ],
  },
  marketing: {
    etapas: [
      { titulo: "Fundamentos de marketing digital", descripcion: "Canales y embudo.", recursos: [{ titulo: "Google — Skillshop", url: "https://skillshop.withgoogle.com/", tipo: "curso", costo: "gratis" }] },
      { titulo: "SEO y contenidos", descripcion: "Posicionamiento en buscadores.", recursos: [{ titulo: "Google Search Central", url: "https://developers.google.com/search/docs", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Analítica", descripcion: "Medir con Google Analytics.", recursos: [{ titulo: "Google — Skillshop", url: "https://skillshop.withgoogle.com/", tipo: "curso", costo: "gratis" }] },
      { titulo: "Growth", descripcion: "Experimentos y campañas.", recursos: [R.github] },
    ],
  },
  profesor: {
    etapas: [
      { titulo: "Dominio técnico de un área", descripcion: "Elegí una especialidad y profundizá.", recursos: [R.fcc] },
      { titulo: "Didáctica y comunicación", descripcion: "Cómo explicar conceptos difíciles.", recursos: [{ titulo: "Learning How to Learn (Coursera)", url: "https://www.coursera.org/learn/learning-how-to-learn", tipo: "curso", costo: "gratis" }] },
      { titulo: "Creación de contenido", descripcion: "Cursos, videos y material práctico.", recursos: [R.github] },
      { titulo: "Plataforma y comunidad", descripcion: "Publicar y construir audiencia.", recursos: [R.fcc] },
    ],
  },
};

/** Roadmap genérico cuando no hay plantilla específica para el subrubro. */
export const PLANTILLA_GENERICA: RoadmapPlantilla = {
  etapas: [
    FUNDAMENTOS,
    { titulo: "Especialización inicial", descripcion: "Elegí una herramienta principal y aprendé lo básico.", recursos: [R.fcc] },
    { titulo: "Práctica con proyectos", descripcion: "Construí 2 o 3 proyectos pequeños.", recursos: [R.github] },
    { titulo: "Profundización", descripcion: "Temas avanzados y buenas prácticas.", recursos: [{ titulo: "roadmap.sh — Rutas de aprendizaje", url: "https://roadmap.sh/", tipo: "articulo", costo: "gratis" }] },
    PORTFOLIO("full-stack"),
  ],
};

export function getPlantilla(subRubro?: string | null): RoadmapPlantilla {
  if (subRubro && PLANTILLAS[subRubro]) return PLANTILLAS[subRubro];
  return PLANTILLA_GENERICA;
}
