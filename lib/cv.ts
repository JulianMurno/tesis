import type { UsuarioActual } from "./session";
import { getRubro, getSubRubro, RIASEC_LABELS, type RiasecTipo } from "./catalogo";

/**
 * Estructura editable del CV (Épica: Mi CV).
 * Se guarda como JSON en el modelo Cv. Todo es editable por el usuario.
 */
export interface CvData {
  // Datos personales
  nombre: string;
  titular: string; // headline profesional, ej. "Desarrollador Web Junior"
  email: string;
  telefono: string;
  ubicacion: string;
  linkedin: string;
  github: string;

  // Contenido
  resumen: string; // perfil profesional (editable, puede generarse con IA)
  skills: string[]; // habilidades técnicas
  formacion: { titulo: string; detalle: string }[]; // ruta de aprendizaje completada
  proyectos: { titulo: string; descripcion: string }[];
}

export const PORCENTAJE_REQUERIDO = 90;

/** Umbral cumplido para desbloquear la sección Mi CV. */
export function cvDesbloqueado(progreso: number | undefined | null): boolean {
  return (progreso ?? 0) >= PORCENTAJE_REQUERIDO;
}

/**
 * Arma un CV inicial a partir del perfil y el roadmap del usuario.
 * Sirve como punto de partida; luego el usuario lo edita libremente.
 */
export function construirCvPorDefecto(usuario: UsuarioActual): CvData {
  const perfil = usuario.perfil;
  const rubro = getRubro(perfil?.rubroIT);
  const sub = getSubRubro(perfil?.rubroIT, perfil?.subRubro);

  const titular = sub
    ? `${sub.nombre} Junior`
    : rubro
    ? `${rubro.nombre} Junior`
    : "Profesional IT Junior";

  // Skills: títulos de etapas completadas (son las áreas que dominó).
  const etapasCompletadas = usuario.roadmap?.etapas.filter((e) => e.completada) ?? [];
  const skills = Array.from(new Set(etapasCompletadas.map((e) => e.titulo)));

  // Formación: cada etapa completada como un ítem de la ruta de aprendizaje.
  const formacion = etapasCompletadas.map((e) => ({
    titulo: e.titulo,
    detalle: e.descripcion,
  }));

  const personalidad = perfil?.personalidad as
    | { dominante?: RiasecTipo }
    | null
    | undefined;
  const rasgo = personalidad?.dominante ? RIASEC_LABELS[personalidad.dominante] : "";

  const resumen = construirResumenBase(usuario.name, titular, rubro?.nombre, rasgo, skills.length);

  return {
    nombre: usuario.name ?? "",
    titular,
    email: usuario.email ?? "",
    telefono: "",
    ubicacion: "",
    linkedin: "",
    github: "",
    resumen,
    skills,
    formacion,
    proyectos: [],
  };
}

/** Resumen profesional base (fallback sin IA). */
export function construirResumenBase(
  nombre: string | null | undefined,
  titular: string,
  rubro: string | undefined,
  rasgo: string,
  cantSkills: number
): string {
  const partes: string[] = [];
  partes.push(
    `${titular} formado/a a través de una ruta de aprendizaje estructurada${
      rubro ? ` en ${rubro}` : ""
    }.`
  );
  if (cantSkills > 0) {
    partes.push(
      `Completé ${cantSkills} etapas de especialización con proyectos prácticos.`
    );
  }
  if (rasgo) {
    partes.push(`Perfil ${rasgo.toLowerCase()}, orientado a resolver problemas y aprender continuamente.`);
  }
  partes.push("Busco mi primera oportunidad para aportar valor en un equipo de tecnología.");
  return partes.join(" ");
}

/** Normaliza/saneamiento mínimo de un CvData recibido del cliente. */
export function sanitizarCv(input: Partial<CvData>): CvData {
  const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 2000) : "");
  const arrStr = (v: unknown) =>
    Array.isArray(v) ? v.filter((x) => typeof x === "string").map((x) => x.slice(0, 200)).slice(0, 40) : [];
  const arrObj = (v: unknown) =>
    Array.isArray(v)
      ? v
          .filter((x) => x && typeof x === "object")
          .map((x) => ({
            titulo: str((x as Record<string, unknown>).titulo),
            detalle: str((x as Record<string, unknown>).detalle ?? (x as Record<string, unknown>).descripcion),
          }))
          .slice(0, 30)
      : [];

  return {
    nombre: str(input.nombre),
    titular: str(input.titular),
    email: str(input.email),
    telefono: str(input.telefono),
    ubicacion: str(input.ubicacion),
    linkedin: str(input.linkedin),
    github: str(input.github),
    resumen: str(input.resumen),
    skills: arrStr(input.skills),
    formacion: arrObj(input.formacion).map((x) => ({ titulo: x.titulo, detalle: x.detalle })),
    proyectos: arrObj(input.proyectos).map((x) => ({ titulo: x.titulo, descripcion: x.detalle })),
  };
}
