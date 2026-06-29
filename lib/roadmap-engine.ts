/**
 * Motor de roadmaps (Épica 2).
 * Lógica pura y testeable, independiente del frontend y de Prisma.
 *
 *  - generarRoadmap: arma las etapas a partir del perfil (IA o plantilla).
 *  - aplicarTimeBlocking: divide las etapas en micro-metas con fechas límite.
 *  - simularPivotaje: compara dos rutas y detecta etapas transferibles.
 */

import {
  generarRoadmapIA,
  geminiDisponible,
  type PerfilParaIA,
  type RoadmapIA,
} from "./gemini";
import { getPlantilla } from "./plantillas";
import { filtrarRecursosVivos } from "./verificar";
import { buscarVideos, youtubeDisponible } from "./youtube";

export interface RecursoGenerado {
  titulo: string;
  url: string;
  tipo: "video" | "articulo" | "repositorio" | "curso";
  costo: "gratis" | "pago";
  modalidad: string;
}

export interface MicrometaGenerada {
  titulo: string;
  fechaLimite: Date | null;
}

export interface EtapaGenerada {
  titulo: string;
  descripcion: string;
  orden: number;
  recursos: RecursoGenerado[];
  micrometas: MicrometaGenerada[];
}

export interface RoadmapGenerado {
  etapas: EtapaGenerada[];
  fuente: "ia" | "plantilla";
}

// ──────────────────────────────────────────────
//  Filtro de costo (Épica 4)
// ──────────────────────────────────────────────

function pasaFiltroCosto(costo: string, preferencia: string): boolean {
  if (preferencia === "gratis") return costo === "gratis";
  if (preferencia === "pago") return true; // "pago" = incluir pagos, no excluir gratis
  return true; // "mixto" / "sin preferencia"
}

// ──────────────────────────────────────────────
//  Generación de etapas
// ──────────────────────────────────────────────

function desdeIA(roadmap: RoadmapIA, perfil: PerfilParaIA): EtapaGenerada[] {
  return roadmap.etapas
    .sort((a, b) => a.orden - b.orden)
    .map((e, i) => ({
      titulo: e.titulo,
      descripcion: e.descripcion,
      orden: i + 1,
      micrometas: [],
      recursos: (e.recursos ?? [])
        .filter((r) => pasaFiltroCosto(r.costo, perfil.preferenciaCosto))
        .map((r) => ({ ...r, modalidad: perfil.modalidad })),
    }));
}

function desdePlantilla(perfil: PerfilParaIA): EtapaGenerada[] {
  const plantilla = getPlantilla(perfil.subRubro);
  return plantilla.etapas.map((e, i) => ({
    titulo: e.titulo,
    descripcion: e.descripcion,
    orden: i + 1,
    micrometas: [],
    recursos: e.recursos
      .filter((r) => pasaFiltroCosto(r.costo, perfil.preferenciaCosto))
      .map((r) => ({
        titulo: r.titulo,
        url: r.url,
        tipo: r.tipo,
        costo: r.costo,
        modalidad: r.modalidad ?? perfil.modalidad,
      })),
  }));
}

/**
 * Genera el roadmap completo. Intenta usar Gemini; si no está disponible
 * o falla, usa las plantillas locales. Luego aplica time-blocking.
 */
export async function generarRoadmap(perfil: PerfilParaIA): Promise<RoadmapGenerado> {
  let etapas: EtapaGenerada[];
  let fuente: "ia" | "plantilla" = "plantilla";

  if (geminiDisponible()) {
    const ia = await generarRoadmapIA(perfil);
    if (ia) {
      etapas = desdeIA(ia, perfil);
      fuente = "ia";
    } else {
      etapas = desdePlantilla(perfil);
    }
  } else {
    etapas = desdePlantilla(perfil);
  }

  // Las URLs generadas por IA pueden estar rotas/inventadas: las verificamos y
  // descartamos las muertas. Si una etapa queda sin recursos, la rellenamos con
  // recursos curados de la plantilla del subrubro (URLs estables).
  if (fuente === "ia") {
    etapas = await depurarRecursos(etapas, perfil);
  }

  // Agrega videos REALES de YouTube a cada etapa (si hay YOUTUBE_API_KEY).
  etapas = await enriquecerConVideos(etapas, perfil);

  // Si el filtro de costo dejó alguna etapa sin recursos, no la rompemos:
  // queda visible aunque sin recursos (el usuario puede explorar la biblioteca).
  etapas = aplicarTimeBlocking(etapas, perfil.horasSemanales, perfil.diasEstudio);

  return { etapas, fuente };
}

/**
 * Suma a cada etapa 1-2 videos reales de YouTube relacionados con su título.
 * Los videos vienen de la YouTube Data API, así que sus URLs siempre existen.
 */
async function enriquecerConVideos(
  etapas: EtapaGenerada[],
  perfil: PerfilParaIA
): Promise<EtapaGenerada[]> {
  if (!youtubeDisponible()) return etapas;

  const contexto = perfil.subRubro || perfil.rubroIT || "programación";
  const resultados = await Promise.all(
    etapas.map((e) => buscarVideos(`${e.titulo} ${contexto} tutorial español`, 2))
  );

  return etapas.map((etapa, i) => {
    const existentes = new Set(etapa.recursos.map((r) => r.url));
    const videos: RecursoGenerado[] = resultados[i]
      .filter((v) => !existentes.has(v.url))
      .map((v) => ({
        titulo: v.canal ? `${v.titulo} — ${v.canal}` : v.titulo,
        url: v.url,
        tipo: "video" as const,
        costo: "gratis" as const,
        modalidad: perfil.modalidad,
      }));
    return { ...etapa, recursos: [...etapa.recursos, ...videos] };
  });
}

/**
 * Verifica las URLs de cada etapa (descarta enlaces rotos) y, si una etapa se
 * queda sin recursos, agrega recursos curados de la plantilla del subrubro.
 */
async function depurarRecursos(
  etapas: EtapaGenerada[],
  perfil: PerfilParaIA
): Promise<EtapaGenerada[]> {
  // Pool de recursos curados (estables) para backfill.
  const pool: RecursoGenerado[] = getPlantilla(perfil.subRubro)
    .etapas.flatMap((e) => e.recursos)
    .filter((r) => pasaFiltroCosto(r.costo, perfil.preferenciaCosto))
    .map((r) => ({
      titulo: r.titulo,
      url: r.url,
      tipo: r.tipo,
      costo: r.costo,
      modalidad: r.modalidad ?? perfil.modalidad,
    }));

  const usadas = new Set<string>();
  const out: EtapaGenerada[] = [];

  for (const etapa of etapas) {
    let recursos = await filtrarRecursosVivos(etapa.recursos);

    // Backfill si quedó vacía.
    if (recursos.length === 0) {
      const reemplazo = pool.find((r) => !usadas.has(r.url));
      if (reemplazo) recursos = [reemplazo];
    }
    recursos.forEach((r) => usadas.add(r.url));
    out.push({ ...etapa, recursos });
  }

  return out;
}

// ──────────────────────────────────────────────
//  Time-blocking (Épica 2 — disponibilidad horaria)
// ──────────────────────────────────────────────

const DIAS_ORDEN = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const DIA_INDICE: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6,
};

/** Horas estimadas de esfuerzo por etapa (carga creciente). */
function horasPorEtapa(indice: number): number {
  return 10 + indice * 2; // etapa 1 ~10h, va creciendo
}

/**
 * Asigna a cada etapa una micro-meta con fecha límite, repartiendo la carga
 * según las horas semanales disponibles y los días de estudio del usuario.
 */
export function aplicarTimeBlocking(
  etapas: EtapaGenerada[],
  horasSemanales?: number | null,
  diasEstudio?: string[]
): EtapaGenerada[] {
  const horasSemana = horasSemanales && horasSemanales > 0 ? horasSemanales : 6;
  const dias =
    diasEstudio && diasEstudio.length > 0
      ? [...diasEstudio].sort((a, b) => DIAS_ORDEN.indexOf(a) - DIAS_ORDEN.indexOf(b))
      : ["lunes", "miercoles", "viernes"];

  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  return etapas.map((etapa, i) => {
    const horas = horasPorEtapa(i);
    const semanas = Math.max(1, Math.ceil(horas / horasSemana));
    // Avanza el cursor 'semanas' semanas y lo deja en el último día de estudio.
    const fechaLimite = avanzarSemanas(cursor, semanas, dias);
    cursor = new Date(fechaLimite);

    return {
      ...etapa,
      micrometas: [
        {
          titulo: `Completar "${etapa.titulo}" (~${horas}h, ${semanas} sem.)`,
          fechaLimite,
        },
      ],
    };
  });
}

function avanzarSemanas(desde: Date, semanas: number, dias: string[]): Date {
  const objetivo = new Date(desde);
  objetivo.setDate(objetivo.getDate() + semanas * 7);
  // Ajusta al próximo día de estudio configurado.
  const indicesDias = dias.map((d) => DIA_INDICE[d]).filter((n) => n !== undefined);
  if (indicesDias.length === 0) return objetivo;
  for (let i = 0; i < 7; i++) {
    if (indicesDias.includes(objetivo.getDay())) return objetivo;
    objetivo.setDate(objetivo.getDate() + 1);
  }
  return objetivo;
}

// ──────────────────────────────────────────────
//  Simulador de pivotaje (Épica 2)
// ──────────────────────────────────────────────

export interface EtapaSimple {
  titulo: string;
  completada: boolean;
}

export interface ResultadoPivotaje {
  transferibles: string[]; // títulos de etapas reutilizables ya completadas
  pendientesTransferibles: string[]; // coinciden pero aún no completadas
  nuevas: string[]; // etapas de la rama destino que no existen en la actual
  porcentajeReutilizable: number;
}

/** Normaliza un título para comparar etapas entre rutas. */
function clave(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

// Conceptos que se consideran equivalentes aunque cambie el título.
const SINONIMOS: string[][] = [
  ["javascript", "js"],
  ["html y css", "html css", "html"],
  ["react", "react native"],
  ["fundamentos de la computacion", "fundamentos", "logica de programacion"],
  ["python", "python para datos"],
  ["linux y linea de comandos", "linux", "linea de comandos"],
];

function mismaBase(a: string, b: string): boolean {
  const ka = clave(a);
  const kb = clave(b);
  if (ka === kb) return true;
  if (ka.includes(kb) || kb.includes(ka)) return true;
  return SINONIMOS.some((grupo) => grupo.some((g) => ka.includes(g)) && grupo.some((g) => kb.includes(g)));
}

/**
 * Compara la ruta actual con una ruta destino y determina qué etapas
 * ya completadas son transferibles. Ej: Frontend → Mobile reutiliza
 * JavaScript y lógica de componentes.
 */
export function simularPivotaje(
  actual: EtapaSimple[],
  destino: EtapaSimple[]
): ResultadoPivotaje {
  const transferibles: string[] = [];
  const pendientesTransferibles: string[] = [];
  const nuevas: string[] = [];

  for (const etapaDestino of destino) {
    const match = actual.find((e) => mismaBase(e.titulo, etapaDestino.titulo));
    if (!match) {
      nuevas.push(etapaDestino.titulo);
    } else if (match.completada) {
      transferibles.push(etapaDestino.titulo);
    } else {
      pendientesTransferibles.push(etapaDestino.titulo);
    }
  }

  const porcentajeReutilizable =
    destino.length === 0 ? 0 : Math.round((transferibles.length / destino.length) * 100);

  return { transferibles, pendientesTransferibles, nuevas, porcentajeReutilizable };
}

// ──────────────────────────────────────────────
//  Utilidades de progreso
// ──────────────────────────────────────────────

export function calcularProgreso(etapas: { completada: boolean }[]): number {
  if (etapas.length === 0) return 0;
  const completas = etapas.filter((e) => e.completada).length;
  return Math.round((completas / etapas.length) * 100);
}
