import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Integración con Google Gemini (gemini-1.5-flash).
 * Si no hay GEMINI_API_KEY, las funciones devuelven null y el llamador
 * debe usar el fallback de plantillas locales (lib/plantillas.ts).
 */

const apiKey = process.env.GEMINI_API_KEY;
// gemini-1.5-flash fue deprecado por Google; usamos el flash vigente (rápido y económico).
// Configurable con GEMINI_MODEL por si cambia el catálogo.
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export function geminiDisponible(): boolean {
  return Boolean(apiKey && apiKey.trim().length > 0);
}

function getModel() {
  if (!geminiDisponible()) return null;
  const genAI = new GoogleGenerativeAI(apiKey as string);
  return genAI.getGenerativeModel({ model: MODEL });
}

// ──────────────────────────────────────────────
//  Tipos del perfil para los prompts
// ──────────────────────────────────────────────

export interface PerfilParaIA {
  name?: string | null;
  personalidad?: unknown;
  hardSkills?: unknown;
  hobbies: string[];
  rubroIT?: string | null;
  subRubro?: string | null;
  modalidad: string;
  horasSemanales?: number | null;
  diasEstudio: string[];
  preferenciaCosto: string;
}

export interface RoadmapIA {
  etapas: {
    titulo: string;
    descripcion: string;
    orden: number;
    recursos: {
      titulo: string;
      url: string;
      tipo: "video" | "articulo" | "repositorio" | "curso";
      costo: "gratis" | "pago";
    }[];
  }[];
}

// ──────────────────────────────────────────────
//  Generación de roadmap (Épica 2 / 5)
// ──────────────────────────────────────────────

export function buildRoadmapPrompt(perfil: PerfilParaIA): string {
  return `
Eres MentorIT, un sistema experto en orientación vocacional IT para LATAM.

Dado el siguiente perfil de usuario, genera un roadmap de aprendizaje estructurado en JSON.

PERFIL:
- Personalidad (RIASEC): ${JSON.stringify(perfil.personalidad)}
- Habilidades previas: ${JSON.stringify(perfil.hardSkills)}
- Hobbies: ${perfil.hobbies.join(", ")}
- Rubro IT elegido: ${perfil.rubroIT} / ${perfil.subRubro}
- Modalidad de aprendizaje: ${perfil.modalidad}
- Horas semanales disponibles: ${perfil.horasSemanales}
- Días de estudio: ${perfil.diasEstudio.join(", ")}
- Preferencia de costo: ${perfil.preferenciaCosto}

INSTRUCCIONES:
1. Genera entre 5 y 8 etapas ordenadas desde nivel cero hasta empleabilidad.
2. Cada etapa debe tener título, descripción breve y entre 2 y 4 recursos reales.
3. Los recursos deben ser gratuitos si preferenciaCosto es "gratis".
4. Usa español de Argentina. Sé concreto y directo.

CALIDAD Y VERACIDAD DE LOS RECURSOS (MUY IMPORTANTE):
- Usá SOLO URLs reales y funcionales de fuentes reconocidas y estables: documentación
  oficial (MDN, react.dev, nodejs.org, python.org, kubernetes.io, etc.), freeCodeCamp,
  roadmap.sh, The Odin Project, Khan Academy, Coursera, edX, SQLBolt, W3Schools.
- NO inventes URLs ni rutas. Si no estás 100% seguro de un enlace exacto, enlazá la
  página principal oficial del recurso (ej. la home del curso o de la documentación).
- EVITÁ enlazar videos o playlists específicos de YouTube: suelen borrarse o cambiar de
  ID y quedan rotos. Si querés un video, preferí la página oficial del curso/canal.
- Verificá mentalmente que cada dominio existe y que la ruta es plausible y vigente.
- Preferí recursos en español cuando existan y sean de calidad.

5. Responde ÚNICAMENTE con un JSON válido con esta estructura:

{
  "etapas": [
    {
      "titulo": "string",
      "descripcion": "string",
      "orden": number,
      "recursos": [
        {
          "titulo": "string",
          "url": "string",
          "tipo": "video|articulo|repositorio|curso",
          "costo": "gratis|pago"
        }
      ]
    }
  ]
}
`.trim();
}

function extraerJSON(texto: string): string {
  // Quita fences de markdown si Gemini los agrega.
  const sinFences = texto.replace(/```json/gi, "").replace(/```/g, "").trim();
  const inicio = sinFences.indexOf("{");
  const fin = sinFences.lastIndexOf("}");
  if (inicio === -1 || fin === -1) return sinFences;
  return sinFences.slice(inicio, fin + 1);
}

/**
 * Devuelve un roadmap generado por IA, o null si no hay API/falló el parseo.
 * Intenta primero con grounding de Google Search (URLs reales y vigentes) y,
 * si falla, reintenta sin grounding.
 */
export async function generarRoadmapIA(perfil: PerfilParaIA): Promise<RoadmapIA | null> {
  if (!geminiDisponible()) return null;
  const genAI = new GoogleGenerativeAI(apiKey as string);
  const prompt = buildRoadmapPrompt(perfil);

  // 1) Con búsqueda web (grounding) → enlaces reales y actuales.
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      tools: [{ googleSearch: {} }] as unknown as never,
    });
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(extraerJSON(result.response.text())) as RoadmapIA;
    if (parsed?.etapas?.length) return parsed;
  } catch (err) {
    console.error("[gemini] generarRoadmapIA (con búsqueda web) falló:", err);
  }

  // 2) Fallback sin grounding.
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(extraerJSON(result.response.text())) as RoadmapIA;
    if (parsed?.etapas?.length) return parsed;
  } catch (err) {
    console.error("[gemini] generarRoadmapIA (fallback) falló:", err);
  }

  return null;
}

// ──────────────────────────────────────────────
//  Búsqueda de carreras/tecnicaturas por geolocalización
// ──────────────────────────────────────────────

export interface CarreraIA {
  institucion: string;
  programa: string;
  tipo: "universidad" | "tecnicatura" | "terciario" | "curso";
  modalidad: string; // "presencial" | "online" | "híbrida"
  duracion: string; // ej. "3 años"
  ciudad: string;
  gestion?: string; // "pública" | "privada"
  url?: string;
}

export interface ResultadoCarreras {
  carreras: CarreraIA[];
  conBusquedaWeb: boolean; // true si se usó grounding con Google Search
}

export interface ParamsCarreras {
  ciudad: string;
  pais: string;
  rubro?: string | null;
  subRubro?: string | null;
}

function buildCarrerasPrompt(p: ParamsCarreras): string {
  return `
Sos un orientador vocacional. Buscá carreras universitarias, tecnicaturas y carreras
terciarias REALES y vigentes para estudiar tecnología/IT cerca de la siguiente ubicación.

Ubicación del estudiante: ${p.ciudad}, ${p.pais}
Área de interés: ${p.rubro ?? "tecnología"}${p.subRubro ? " / " + p.subRubro : ""}

Instrucciones:
- Priorizá instituciones en ${p.ciudad} o su zona; si hay pocas, incluí opciones online del país.
- Incluí universidades (públicas y privadas), tecnicaturas y terciarios afines al área.
- Usá nombres de instituciones y programas reales. No inventes. Si no estás seguro de una URL, omitila.
- Devolvé entre 5 y 10 opciones.
- Respondé ÚNICAMENTE con un JSON válido con esta forma exacta:

{
  "carreras": [
    {
      "institucion": "string",
      "programa": "string",
      "tipo": "universidad|tecnicatura|terciario|curso",
      "modalidad": "presencial|online|híbrida",
      "duracion": "string",
      "ciudad": "string",
      "gestion": "pública|privada",
      "url": "string (opcional)"
    }
  ]
}
`.trim();
}

/**
 * Investiga carreras/tecnicaturas reales según la ciudad del usuario.
 * Intenta usar grounding con Google Search (datos actualizados de internet);
 * si no está disponible, cae al conocimiento del modelo. Devuelve null sin API key.
 */
export async function buscarCarreras(p: ParamsCarreras): Promise<ResultadoCarreras | null> {
  if (!geminiDisponible()) return null;
  const genAI = new GoogleGenerativeAI(apiKey as string);
  const prompt = buildCarrerasPrompt(p);

  // 1) Intento con búsqueda web (grounding).
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      // El nombre del tool varía según versión del modelo; lo pasamos sin tipar.
      tools: [{ googleSearch: {} }] as unknown as never,
    });
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(extraerJSON(result.response.text())) as { carreras?: CarreraIA[] };
    if (parsed?.carreras?.length) {
      return { carreras: parsed.carreras.slice(0, 12), conBusquedaWeb: true };
    }
  } catch (err) {
    console.error("[gemini] buscarCarreras (con búsqueda web) falló:", err);
  }

  // 2) Fallback sin grounding (conocimiento del modelo).
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(extraerJSON(result.response.text())) as { carreras?: CarreraIA[] };
    if (parsed?.carreras?.length) {
      return { carreras: parsed.carreras.slice(0, 12), conBusquedaWeb: false };
    }
  } catch (err) {
    console.error("[gemini] buscarCarreras (fallback) falló:", err);
  }

  return null;
}

// ──────────────────────────────────────────────
//  Chatbot mentor (Épica 5)
// ──────────────────────────────────────────────

export interface ContextoChat {
  name?: string | null;
  rubroIT?: string | null;
  subRubro?: string | null;
  etapaActual?: string | null;
  progreso: number;
}

export function buildChatSystemPrompt(ctx: ContextoChat): string {
  return `
Eres el mentor de IA de MentorIT. Ayudás a estudiantes de LATAM a aprender tecnología.

Contexto del usuario:
- Nombre: ${ctx.name ?? "estudiante"}
- Rubro IT: ${ctx.rubroIT ?? "sin definir"} / ${ctx.subRubro ?? "sin definir"}
- Etapa actual: ${ctx.etapaActual ?? "todavía no empezó"}
- Progreso general: ${ctx.progreso}%

Respondé siempre en español argentino. Sé claro, motivador y concreto.
Si el usuario pregunta sobre cambiar de rama, recomendá usar el simulador de pivotaje para comparar.
No inventes URLs; si no estás seguro, sugerí buscar el recurso por nombre.
`.trim();
}

export interface MensajeChat {
  role: "user" | "model";
  content: string;
}

// ──────────────────────────────────────────────
//  Resumen profesional para el CV (Mi CV)
// ──────────────────────────────────────────────

export interface DatosResumenCv {
  nombre?: string | null;
  titular: string;
  rubro?: string | null;
  skills: string[];
}

/**
 * Genera un resumen profesional ATS-friendly (2-3 frases) para el CV.
 * Devuelve null si no hay API key (el llamador usa el resumen base).
 */
export async function generarResumenCv(datos: DatosResumenCv): Promise<string | null> {
  const model = getModel();
  if (!model) return null;
  const prompt = `
Escribí un resumen profesional para la cabecera de un CV ATS-friendly de un perfil IT junior de LATAM.

Datos:
- Nombre: ${datos.nombre ?? "—"}
- Puesto objetivo: ${datos.titular}
- Área: ${datos.rubro ?? "tecnología"}
- Habilidades: ${datos.skills.join(", ") || "fundamentos de programación"}

Reglas:
- 2 a 3 frases, en primera persona, español neutro-argentino.
- Tono profesional, concreto, sin exagerar.
- Incluí palabras clave técnicas relevantes para que pase filtros ATS.
- NO uses comillas, viñetas ni emojis. Devolvé solo el texto del resumen.
`.trim();
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/^["']|["']$/g, "");
  } catch (err) {
    console.error("[gemini] generarResumenCv falló:", err);
    return null;
  }
}

/** Respuesta del chatbot. Si no hay API key, devuelve un mensaje de fallback. */
export async function chatMentor(
  ctx: ContextoChat,
  historial: MensajeChat[],
  mensaje: string
): Promise<string> {
  const model = getModel();
  if (!model) {
    return (
      "El mentor de IA todavía no está configurado (falta GEMINI_API_KEY). " +
      "Mientras tanto, te recomiendo avanzar por las etapas de tu roadmap y revisar los recursos sugeridos. " +
      "Cuando se configure la clave de Gemini, voy a poder responderte cualquier duda técnica."
    );
  }
  try {
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: buildChatSystemPrompt(ctx) }] },
        { role: "model", parts: [{ text: "¡Listo! Soy tu mentor. ¿En qué te ayudo?" }] },
        ...historial.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
      ],
    });
    const result = await chat.sendMessage(mensaje);
    return result.response.text();
  } catch (err) {
    console.error("[gemini] chatMentor falló:", err);
    return "Uy, tuve un problema para responderte. Probá de nuevo en un momento.";
  }
}
