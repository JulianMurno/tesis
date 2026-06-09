import { PLANTILLAS } from "./plantillas";
import { RUBROS, type RubroId } from "./catalogo";

export interface RecursoBiblioteca {
  titulo: string;
  url: string;
  tipo: "video" | "articulo" | "repositorio" | "curso";
  costo: "gratis" | "pago";
  modalidad: string;
  rubroIT: RubroId | "general";
  subRubro: string;
}

/** Mapea cada subrubro a su rubro padre. */
function rubroDeSub(subId: string): RubroId | "general" {
  for (const r of RUBROS) {
    if (r.subRubros.some((s) => s.id === subId)) return r.id;
  }
  return "general";
}

/**
 * Catálogo curado de recursos para la biblioteca (Épica 4).
 * Se arma a partir de todas las plantillas, deduplicado por URL.
 */
export function getBibliotecaCurada(): RecursoBiblioteca[] {
  const map = new Map<string, RecursoBiblioteca>();
  for (const [subId, plantilla] of Object.entries(PLANTILLAS)) {
    for (const etapa of plantilla.etapas) {
      for (const r of etapa.recursos) {
        if (map.has(r.url)) continue;
        map.set(r.url, {
          titulo: r.titulo,
          url: r.url,
          tipo: r.tipo,
          costo: r.costo,
          modalidad: r.modalidad ?? "hibrido",
          rubroIT: rubroDeSub(subId),
          subRubro: subId,
        });
      }
    }
  }
  return Array.from(map.values());
}
