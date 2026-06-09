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

/** Devuelve un roadmap generado por IA, o null si no hay API/falló el parseo. */
export async function generarRoadmapIA(perfil: PerfilParaIA): Promise<RoadmapIA | null> {
  const model = getModel();
  if (!model) return null;
  try {
    const result = await model.generateContent(buildRoadmapPrompt(perfil));
    const texto = result.response.text();
    const parsed = JSON.parse(extraerJSON(texto)) as RoadmapIA;
    if (!parsed?.etapas?.length) return null;
    return parsed;
  } catch (err) {
    console.error("[gemini] generarRoadmapIA falló:", err);
    return null;
  }
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
