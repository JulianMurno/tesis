/**
 * Plantillas de roadmap estáticas por subrubro.
 * Sirven como base (Fase 3 — MVP) y como fallback cuando no hay
 * GEMINI_API_KEY configurada. La IA luego enriquece/reemplaza estos textos.
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

const FUNDAMENTOS: EtapaPlantilla = {
  titulo: "Fundamentos de la computación",
  descripcion: "Cómo funciona una computadora, lógica básica y manejo de la terminal.",
  recursos: [
    { titulo: "CS50x — Introducción a las Ciencias de la Computación", url: "https://cs50.harvard.edu/x/", tipo: "curso", costo: "gratis", modalidad: "academico" },
    { titulo: "Curso de lógica de programación", url: "https://www.youtube.com/results?search_query=logica+de+programacion", tipo: "video", costo: "gratis", modalidad: "autodidacta" },
  ],
};

export const PLANTILLAS: Record<string, RoadmapPlantilla> = {
  // ── Desarrollo Web ──────────────────────────
  web: {
    etapas: [
      FUNDAMENTOS,
      {
        titulo: "HTML y CSS",
        descripcion: "Estructurar y dar estilo a páginas web.",
        recursos: [
          { titulo: "HTML & CSS — MDN Web Docs", url: "https://developer.mozilla.org/es/docs/Learn/HTML", tipo: "articulo", costo: "gratis" },
          { titulo: "Responsive Web Design — freeCodeCamp", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/", tipo: "curso", costo: "gratis" },
        ],
      },
      {
        titulo: "JavaScript",
        descripcion: "El lenguaje de la web: variables, funciones, DOM y eventos.",
        recursos: [
          { titulo: "JavaScript.info", url: "https://es.javascript.info/", tipo: "articulo", costo: "gratis" },
          { titulo: "JavaScript Algorithms — freeCodeCamp", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/", tipo: "curso", costo: "gratis" },
        ],
      },
      {
        titulo: "React",
        descripcion: "Construir interfaces con componentes reutilizables.",
        recursos: [
          { titulo: "React — Documentación oficial", url: "https://es.react.dev/learn", tipo: "articulo", costo: "gratis" },
          { titulo: "Proyecto: clon de una app real", url: "https://github.com/topics/react-projects", tipo: "repositorio", costo: "gratis" },
        ],
      },
      {
        titulo: "Backend con Node.js",
        descripcion: "APIs REST, bases de datos y autenticación.",
        recursos: [
          { titulo: "Node.js + Express", url: "https://nodejs.org/es/learn", tipo: "articulo", costo: "gratis" },
          { titulo: "SQL para principiantes", url: "https://www.youtube.com/results?search_query=sql+desde+cero", tipo: "video", costo: "gratis" },
        ],
      },
      {
        titulo: "Portfolio y empleabilidad",
        descripcion: "Armar tu portfolio, perfil de LinkedIn y preparar entrevistas.",
        recursos: [
          { titulo: "Cómo armar un portfolio dev", url: "https://www.freecodecamp.org/news/tag/portfolio/", tipo: "articulo", costo: "gratis" },
        ],
      },
    ],
  },
  // ── Mobile ──────────────────────────────────
  mobile: {
    etapas: [
      FUNDAMENTOS,
      { titulo: "JavaScript y TypeScript", descripcion: "Base para React Native.", recursos: [{ titulo: "JavaScript.info", url: "https://es.javascript.info/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "React", descripcion: "Componentes y estado, transferibles a mobile.", recursos: [{ titulo: "React oficial", url: "https://es.react.dev/learn", tipo: "articulo", costo: "gratis" }] },
      { titulo: "React Native", descripcion: "Apps nativas para Android e iOS.", recursos: [{ titulo: "React Native docs", url: "https://reactnative.dev/docs/getting-started", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Publicación en stores", descripcion: "Build, firma y publicación en Play Store.", recursos: [{ titulo: "Expo EAS", url: "https://docs.expo.dev/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Portfolio mobile", descripcion: "Publicar apps y armar tu perfil.", recursos: [{ titulo: "GitHub mobile projects", url: "https://github.com/topics/react-native", tipo: "repositorio", costo: "gratis" }] },
    ],
  },
  // ── GameDev ─────────────────────────────────
  gamedev: {
    etapas: [
      FUNDAMENTOS,
      { titulo: "Programación con C#", descripcion: "Lenguaje base de Unity.", recursos: [{ titulo: "C# para principiantes", url: "https://learn.microsoft.com/es-es/dotnet/csharp/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Motor Unity", descripcion: "Escenas, físicas y scripting.", recursos: [{ titulo: "Unity Learn", url: "https://learn.unity.com/", tipo: "curso", costo: "gratis" }] },
      { titulo: "Diseño de juegos", descripcion: "Mecánicas, niveles y game feel.", recursos: [{ titulo: "Game Design Basics", url: "https://www.youtube.com/results?search_query=game+design+basics", tipo: "video", costo: "gratis" }] },
      { titulo: "Primer juego completo", descripcion: "Publicar un juego en itch.io.", recursos: [{ titulo: "itch.io", url: "https://itch.io/", tipo: "repositorio", costo: "gratis" }] },
    ],
  },
  // ── Soporte / Infra ─────────────────────────
  soporte: {
    etapas: [
      { titulo: "Hardware y sistemas operativos", descripcion: "Cómo funciona una PC, Windows y Linux.", recursos: [{ titulo: "Linux Journey", url: "https://linuxjourney.com/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Redes básicas", descripcion: "IP, DNS, modelo OSI y troubleshooting.", recursos: [{ titulo: "Redes — Cisco NetAcad", url: "https://www.netacad.com/", tipo: "curso", costo: "gratis" }] },
      { titulo: "Línea de comandos", descripcion: "Terminal de Linux y scripting básico.", recursos: [{ titulo: "Bash scripting", url: "https://www.youtube.com/results?search_query=bash+desde+cero", tipo: "video", costo: "gratis" }] },
      { titulo: "Mesa de ayuda y certificaciones", descripcion: "ITIL, ticketing y CompTIA A+.", recursos: [{ titulo: "CompTIA A+", url: "https://www.comptia.org/certifications/a", tipo: "curso", costo: "pago" }] },
    ],
  },
  devops: {
    etapas: [
      { titulo: "Linux y línea de comandos", descripcion: "Base de toda la infraestructura moderna.", recursos: [{ titulo: "Linux Journey", url: "https://linuxjourney.com/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Git y control de versiones", descripcion: "Flujos de trabajo en equipo.", recursos: [{ titulo: "Pro Git (libro)", url: "https://git-scm.com/book/es/v2", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Docker y contenedores", descripcion: "Empaquetar aplicaciones de forma portable.", recursos: [{ titulo: "Docker docs", url: "https://docs.docker.com/get-started/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "CI/CD", descripcion: "Automatizar pruebas y despliegues.", recursos: [{ titulo: "GitHub Actions", url: "https://docs.github.com/es/actions", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Kubernetes y cloud", descripcion: "Orquestación y nube.", recursos: [{ titulo: "Kubernetes basics", url: "https://kubernetes.io/es/docs/tutorials/", tipo: "articulo", costo: "gratis" }] },
    ],
  },
  cloud: {
    etapas: [
      { titulo: "Fundamentos de redes y Linux", descripcion: "Lo mínimo para entender la nube.", recursos: [{ titulo: "Linux Journey", url: "https://linuxjourney.com/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Conceptos de cloud", descripcion: "IaaS, PaaS, SaaS y modelos de servicio.", recursos: [{ titulo: "AWS Cloud Practitioner Essentials", url: "https://aws.amazon.com/es/training/", tipo: "curso", costo: "gratis" }] },
      { titulo: "Un proveedor (AWS)", descripcion: "EC2, S3, IAM y redes virtuales.", recursos: [{ titulo: "AWS Free Tier", url: "https://aws.amazon.com/es/free/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Certificación", descripcion: "Preparar AWS Cloud Practitioner.", recursos: [{ titulo: "Certificación AWS", url: "https://aws.amazon.com/es/certification/", tipo: "curso", costo: "pago" }] },
    ],
  },
  // ── Datos ───────────────────────────────────
  analista: {
    etapas: [
      { titulo: "Excel y pensamiento analítico", descripcion: "Limpiar y resumir datos.", recursos: [{ titulo: "Excel para análisis", url: "https://www.youtube.com/results?search_query=excel+analisis+de+datos", tipo: "video", costo: "gratis" }] },
      { titulo: "SQL", descripcion: "Consultar bases de datos relacionales.", recursos: [{ titulo: "SQLBolt", url: "https://sqlbolt.com/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Visualización", descripcion: "Power BI o Looker Studio.", recursos: [{ titulo: "Power BI", url: "https://learn.microsoft.com/es-es/power-bi/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Python para datos", descripcion: "Pandas y limpieza de datos.", recursos: [{ titulo: "Pandas", url: "https://pandas.pydata.org/docs/getting_started/index.html", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Portfolio de análisis", descripcion: "Proyectos con datasets reales.", recursos: [{ titulo: "Kaggle Datasets", url: "https://www.kaggle.com/datasets", tipo: "repositorio", costo: "gratis" }] },
    ],
  },
  cientifico: {
    etapas: [
      { titulo: "Python", descripcion: "Lenguaje base de la ciencia de datos.", recursos: [{ titulo: "Python oficial", url: "https://docs.python.org/es/3/tutorial/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Estadística", descripcion: "Probabilidad e inferencia.", recursos: [{ titulo: "Khan Academy Estadística", url: "https://es.khanacademy.org/math/statistics-probability", tipo: "curso", costo: "gratis" }] },
      { titulo: "Pandas y NumPy", descripcion: "Manipulación de datos.", recursos: [{ titulo: "Pandas", url: "https://pandas.pydata.org/docs/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Machine Learning", descripcion: "scikit-learn y modelos básicos.", recursos: [{ titulo: "ML Crash Course — Google", url: "https://developers.google.com/machine-learning/crash-course?hl=es", tipo: "curso", costo: "gratis" }] },
      { titulo: "Proyectos y Kaggle", descripcion: "Competencias y portfolio.", recursos: [{ titulo: "Kaggle", url: "https://www.kaggle.com/", tipo: "repositorio", costo: "gratis" }] },
    ],
  },
  ia: {
    etapas: [
      { titulo: "Python y matemática", descripcion: "Álgebra lineal y cálculo básico.", recursos: [{ titulo: "Khan Academy", url: "https://es.khanacademy.org/math/linear-algebra", tipo: "curso", costo: "gratis" }] },
      { titulo: "Machine Learning", descripcion: "Fundamentos de aprendizaje automático.", recursos: [{ titulo: "ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course?hl=es", tipo: "curso", costo: "gratis" }] },
      { titulo: "Deep Learning", descripcion: "Redes neuronales con PyTorch/TensorFlow.", recursos: [{ titulo: "fast.ai", url: "https://course.fast.ai/", tipo: "curso", costo: "gratis" }] },
      { titulo: "LLMs y despliegue", descripcion: "Usar y servir modelos de lenguaje.", recursos: [{ titulo: "Hugging Face", url: "https://huggingface.co/learn", tipo: "curso", costo: "gratis" }] },
    ],
  },
  // ── Gestión ─────────────────────────────────
  pm: {
    etapas: [
      { titulo: "Fundamentos de producto", descripcion: "Qué hace un Product Manager.", recursos: [{ titulo: "Product School (blog)", url: "https://productschool.com/blog", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Metodologías ágiles", descripcion: "Scrum y Kanban.", recursos: [{ titulo: "Scrum Guide", url: "https://scrumguides.org/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Descubrimiento y métricas", descripcion: "Entrevistas, KPIs y priorización.", recursos: [{ titulo: "Lenny's Newsletter", url: "https://www.lennysnewsletter.com/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Herramientas y portfolio", descripcion: "Jira, Figma y casos de estudio.", recursos: [{ titulo: "Atlassian Jira", url: "https://www.atlassian.com/es/software/jira", tipo: "articulo", costo: "gratis" }] },
    ],
  },
  profesor: {
    etapas: [
      { titulo: "Dominio técnico de un área", descripcion: "Elegí una especialidad y profundizá.", recursos: [{ titulo: "freeCodeCamp", url: "https://www.freecodecamp.org/", tipo: "curso", costo: "gratis" }] },
      { titulo: "Didáctica y comunicación", descripcion: "Cómo explicar conceptos difíciles.", recursos: [{ titulo: "Learning How to Learn", url: "https://www.coursera.org/learn/learning-how-to-learn", tipo: "curso", costo: "gratis" }] },
      { titulo: "Creación de contenido", descripcion: "Cursos, videos y material práctico.", recursos: [{ titulo: "Notion para docentes", url: "https://www.notion.so/", tipo: "articulo", costo: "gratis" }] },
      { titulo: "Plataforma y comunidad", descripcion: "Publicar y construir audiencia.", recursos: [{ titulo: "YouTube Creator Academy", url: "https://www.youtube.com/creators/", tipo: "articulo", costo: "gratis" }] },
    ],
  },
};

/** Roadmap genérico cuando no hay plantilla específica para el subrubro. */
export const PLANTILLA_GENERICA: RoadmapPlantilla = {
  etapas: [
    FUNDAMENTOS,
    { titulo: "Especialización inicial", descripcion: "Elegí una herramienta principal y aprendé lo básico.", recursos: [{ titulo: "freeCodeCamp", url: "https://www.freecodecamp.org/", tipo: "curso", costo: "gratis" }] },
    { titulo: "Práctica con proyectos", descripcion: "Construí 2 o 3 proyectos pequeños.", recursos: [{ titulo: "GitHub", url: "https://github.com/", tipo: "repositorio", costo: "gratis" }] },
    { titulo: "Profundización", descripcion: "Temas avanzados y buenas prácticas.", recursos: [{ titulo: "roadmap.sh", url: "https://roadmap.sh/", tipo: "articulo", costo: "gratis" }] },
    { titulo: "Empleabilidad", descripcion: "Portfolio, CV y preparación de entrevistas.", recursos: [{ titulo: "roadmap.sh", url: "https://roadmap.sh/", tipo: "articulo", costo: "gratis" }] },
  ],
};

export function getPlantilla(subRubro?: string | null): RoadmapPlantilla {
  if (subRubro && PLANTILLAS[subRubro]) return PLANTILLAS[subRubro];
  return PLANTILLA_GENERICA;
}
