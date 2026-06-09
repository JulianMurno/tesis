/**
 * Catálogo de dominio de MentorIT.
 * Define los rubros IT, las preguntas del diagnóstico (RIASEC + hard skills),
 * los hobbies y la lógica de derivación a un rubro.
 *
 * Estos datos son la base de la "Fase 1 — Investigación" de la tesis:
 * validación de modelos psicométricos y definición de rubros IT.
 */

// ──────────────────────────────────────────────
//  Rubros IT (Épica 2 — Mapeo a rubros)
// ──────────────────────────────────────────────

export type RubroId = "desarrollo" | "infraestructura" | "datos" | "gestion";

export interface SubRubro {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface Rubro {
  id: RubroId;
  nombre: string;
  descripcion: string;
  icono: string;
  subRubros: SubRubro[];
}

export const RUBROS: Rubro[] = [
  {
    id: "desarrollo",
    nombre: "Desarrollo",
    descripcion: "Construís software: webs, apps y videojuegos.",
    icono: "💻",
    subRubros: [
      { id: "web", nombre: "Desarrollo Web", descripcion: "Frontend y backend de aplicaciones web." },
      { id: "mobile", nombre: "Desarrollo Mobile", descripcion: "Apps para Android e iOS." },
      { id: "gamedev", nombre: "GameDev", descripcion: "Videojuegos con Unity o Godot." },
    ],
  },
  {
    id: "infraestructura",
    nombre: "Infraestructura",
    descripcion: "Mantenés sistemas, redes y la nube funcionando.",
    icono: "🛠️",
    subRubros: [
      { id: "soporte", nombre: "Soporte IT", descripcion: "Mesa de ayuda y administración de sistemas." },
      { id: "devops", nombre: "DevOps", descripcion: "Automatización, CI/CD y contenedores." },
      { id: "cloud", nombre: "Cloud", descripcion: "AWS, Azure y arquitectura en la nube." },
    ],
  },
  {
    id: "datos",
    nombre: "Datos",
    descripcion: "Analizás información para tomar decisiones.",
    icono: "📊",
    subRubros: [
      { id: "analista", nombre: "Analista de Datos", descripcion: "SQL, dashboards y visualización." },
      { id: "cientifico", nombre: "Científico de Datos", descripcion: "Estadística, Python y modelos." },
      { id: "ia", nombre: "Inteligencia Artificial", descripcion: "Machine Learning y deep learning." },
    ],
  },
  {
    id: "gestion",
    nombre: "Gestión y Educación",
    descripcion: "Coordinás proyectos o enseñás tecnología.",
    icono: "🎯",
    subRubros: [
      { id: "pm", nombre: "Product Manager", descripcion: "Gestión de producto y metodologías ágiles." },
      { id: "profesor", nombre: "Profesor IT", descripcion: "Enseñanza y creación de contenido técnico." },
    ],
  },
];

export function getRubro(id?: string | null): Rubro | undefined {
  return RUBROS.find((r) => r.id === id);
}

export function getSubRubro(rubroId?: string | null, subId?: string | null): SubRubro | undefined {
  return getRubro(rubroId)?.subRubros.find((s) => s.id === subId);
}

// ──────────────────────────────────────────────
//  Test de personalidad (modelo RIASEC adaptado a IT)
// ──────────────────────────────────────────────

export type RiasecTipo = "R" | "I" | "A" | "S" | "E" | "C";

export const RIASEC_LABELS: Record<RiasecTipo, string> = {
  R: "Realista",
  I: "Investigador",
  A: "Artístico",
  S: "Social",
  E: "Emprendedor",
  C: "Convencional",
};

export interface PreguntaRiasec {
  id: string;
  texto: string;
  tipo: RiasecTipo;
}

/** Preguntas tipo Likert (1 a 5). Cada una suma a un tipo RIASEC. */
export const PREGUNTAS_RIASEC: PreguntaRiasec[] = [
  { id: "r1", texto: "Me gusta armar, reparar o configurar equipos y dispositivos.", tipo: "R" },
  { id: "r2", texto: "Prefiero tareas concretas con resultados tangibles antes que teóricas.", tipo: "R" },
  { id: "i1", texto: "Disfruto investigar por qué algo falla hasta entender la causa raíz.", tipo: "I" },
  { id: "i2", texto: "Me entusiasma aprender conceptos nuevos y resolver problemas lógicos.", tipo: "I" },
  { id: "a1", texto: "Me importa que lo que construyo se vea lindo y sea agradable de usar.", tipo: "A" },
  { id: "a2", texto: "Suelo proponer ideas creativas o soluciones originales.", tipo: "A" },
  { id: "s1", texto: "Me gusta explicar cosas y ayudar a que otros aprendan.", tipo: "S" },
  { id: "s2", texto: "Trabajar en equipo y colaborar me motiva más que trabajar solo.", tipo: "S" },
  { id: "e1", texto: "Me veo liderando proyectos o tomando decisiones de negocio.", tipo: "E" },
  { id: "e2", texto: "Me animo a convencer y coordinar gente para lograr objetivos.", tipo: "E" },
  { id: "c1", texto: "Soy ordenado/a y me siento cómodo/a siguiendo procesos y reglas claras.", tipo: "C" },
  { id: "c2", texto: "Disfruto organizar datos, planillas y mantener todo prolijo.", tipo: "C" },
];

/** Afinidad de cada tipo RIASEC con cada rubro IT (peso 0–3). */
const AFINIDAD_RIASEC: Record<RubroId, Record<RiasecTipo, number>> = {
  desarrollo: { R: 2, I: 3, A: 2, S: 0, E: 1, C: 1 },
  infraestructura: { R: 3, I: 2, A: 0, S: 1, E: 0, C: 3 },
  datos: { R: 1, I: 3, A: 1, S: 0, E: 1, C: 3 },
  gestion: { R: 0, I: 1, A: 1, S: 3, E: 3, C: 1 },
};

export interface ResultadoRiasec {
  puntajes: Record<RiasecTipo, number>;
  dominante: RiasecTipo;
  codigo: string; // top 3, ej "IRA"
}

/** Calcula el perfil RIASEC a partir de las respuestas Likert (1–5). */
export function calcularRiasec(respuestas: Record<string, number>): ResultadoRiasec {
  const puntajes: Record<RiasecTipo, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  for (const pregunta of PREGUNTAS_RIASEC) {
    puntajes[pregunta.tipo] += respuestas[pregunta.id] ?? 0;
  }
  const ordenados = (Object.keys(puntajes) as RiasecTipo[]).sort(
    (a, b) => puntajes[b] - puntajes[a]
  );
  return {
    puntajes,
    dominante: ordenados[0],
    codigo: ordenados.slice(0, 3).join(""),
  };
}

// ──────────────────────────────────────────────
//  Check de hard skills (Épica 1)
// ──────────────────────────────────────────────

export interface PreguntaSkill {
  id: string;
  texto: string;
  opciones: string[];
  correcta: number; // índice
  area: "programacion" | "datos" | "redes" | "logica";
}

export const PREGUNTAS_SKILLS: PreguntaSkill[] = [
  {
    id: "s_var",
    texto: "¿Qué es una variable en programación?",
    opciones: [
      "Un espacio con nombre que guarda un valor que puede cambiar",
      "Un error que aparece al compilar",
      "Un tipo de monitor",
      "Una función matemática fija",
    ],
    correcta: 0,
    area: "programacion",
  },
  {
    id: "s_select",
    texto: "¿Qué hace la sentencia SQL `SELECT`?",
    opciones: [
      "Elimina una tabla",
      "Consulta y recupera datos de una base",
      "Crea un usuario nuevo",
      "Reinicia el servidor",
    ],
    correcta: 1,
    area: "datos",
  },
  {
    id: "s_loop",
    texto: "¿Para qué sirve un bucle (loop)?",
    opciones: [
      "Para repetir un bloque de código varias veces",
      "Para conectar dos computadoras",
      "Para guardar contraseñas",
      "Para apagar el programa",
    ],
    correcta: 0,
    area: "logica",
  },
  {
    id: "s_ip",
    texto: "¿Qué es una dirección IP?",
    opciones: [
      "El nombre de un programa",
      "Un identificador numérico de un dispositivo en una red",
      "Una contraseña de WiFi",
      "Un tipo de archivo",
    ],
    correcta: 1,
    area: "redes",
  },
  {
    id: "s_func",
    texto: "¿Qué es una función?",
    opciones: [
      "Un bloque de código reutilizable que realiza una tarea",
      "Un virus informático",
      "Una carpeta del sistema",
      "Un cable de red",
    ],
    correcta: 0,
    area: "programacion",
  },
  {
    id: "s_html",
    texto: "¿Qué representa HTML?",
    opciones: [
      "Un lenguaje de programación de bajo nivel",
      "El lenguaje de marcado para estructurar páginas web",
      "Una base de datos",
      "Un sistema operativo",
    ],
    correcta: 1,
    area: "programacion",
  },
];

export type NivelSkill = "principiante" | "intermedio" | "avanzado";

export interface ResultadoSkills {
  aciertos: number;
  total: number;
  porcentaje: number;
  nivel: NivelSkill;
}

export function calcularSkills(respuestas: Record<string, number>): ResultadoSkills {
  let aciertos = 0;
  for (const pregunta of PREGUNTAS_SKILLS) {
    if (respuestas[pregunta.id] === pregunta.correcta) aciertos++;
  }
  const total = PREGUNTAS_SKILLS.length;
  const porcentaje = Math.round((aciertos / total) * 100);
  const nivel: NivelSkill =
    porcentaje >= 75 ? "avanzado" : porcentaje >= 40 ? "intermedio" : "principiante";
  return { aciertos, total, porcentaje, nivel };
}

// ──────────────────────────────────────────────
//  Hobbies / intereses (Épica 1)
// ──────────────────────────────────────────────

export interface Hobby {
  id: string;
  nombre: string;
  icono: string;
  rubrosAfines: RubroId[];
}

export const HOBBIES: Hobby[] = [
  { id: "gaming", nombre: "Videojuegos", icono: "🎮", rubrosAfines: ["desarrollo"] },
  { id: "diseno", nombre: "Diseño y arte", icono: "🎨", rubrosAfines: ["desarrollo"] },
  { id: "logica", nombre: "Lógica y puzzles", icono: "🧩", rubrosAfines: ["desarrollo", "datos"] },
  { id: "orden", nombre: "Orden y organización", icono: "🗂️", rubrosAfines: ["infraestructura", "datos"] },
  { id: "numeros", nombre: "Números y estadística", icono: "📈", rubrosAfines: ["datos"] },
  { id: "hardware", nombre: "Armar PCs / hardware", icono: "🔧", rubrosAfines: ["infraestructura"] },
  { id: "enseñar", nombre: "Explicar y enseñar", icono: "📚", rubrosAfines: ["gestion"] },
  { id: "liderar", nombre: "Liderar equipos", icono: "🚀", rubrosAfines: ["gestion"] },
  { id: "escribir", nombre: "Escribir y comunicar", icono: "✍️", rubrosAfines: ["gestion", "desarrollo"] },
  { id: "redes", nombre: "Redes e internet", icono: "🌐", rubrosAfines: ["infraestructura"] },
];

// ──────────────────────────────────────────────
//  Derivación a rubro (Épica 2 — sugerencia automática)
// ──────────────────────────────────────────────

export interface SugerenciaRubro {
  rubroId: RubroId;
  nombre: string;
  score: number;
  porcentaje: number;
}

/**
 * Combina RIASEC + hobbies para sugerir el rubro IT más afín.
 * Devuelve el ranking completo ordenado de mayor a menor.
 */
export function sugerirRubros(
  riasec: ResultadoRiasec,
  hobbies: string[]
): SugerenciaRubro[] {
  const scores: Record<RubroId, number> = {
    desarrollo: 0,
    infraestructura: 0,
    datos: 0,
    gestion: 0,
  };

  // Aporte RIASEC (normalizado por afinidad)
  for (const rubro of RUBROS) {
    let s = 0;
    for (const tipo of Object.keys(riasec.puntajes) as RiasecTipo[]) {
      s += riasec.puntajes[tipo] * AFINIDAD_RIASEC[rubro.id][tipo];
    }
    scores[rubro.id] += s;
  }

  // Aporte hobbies
  for (const hobbyId of hobbies) {
    const hobby = HOBBIES.find((h) => h.id === hobbyId);
    if (!hobby) continue;
    for (const r of hobby.rubrosAfines) scores[r] += 15;
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  return (Object.keys(scores) as RubroId[])
    .map((id) => ({
      rubroId: id,
      nombre: getRubro(id)!.nombre,
      score: scores[id],
      porcentaje: Math.round((scores[id] / total) * 100),
    }))
    .sort((a, b) => b.score - a.score);
}
