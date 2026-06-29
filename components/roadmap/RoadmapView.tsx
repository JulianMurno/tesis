"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export interface RecursoVM {
  id: string;
  titulo: string;
  url: string;
  tipo: string;
  costo: string;
  visitado: boolean;
}
export interface MicrometaVM {
  id: string;
  titulo: string;
  fechaLimite: string | null;
  completada: boolean;
}
export interface EtapaVM {
  id: string;
  titulo: string;
  descripcion: string;
  orden: number;
  completada: boolean;
  recursos: RecursoVM[];
  micrometas: MicrometaVM[];
}

type Estado = "completada" | "en-progreso" | "disponible" | "bloqueada";

function estadoEtapa(etapas: EtapaVM[], i: number): Estado {
  const e = etapas[i];
  if (e.completada) return "completada";
  const anteriorOk = i === 0 || etapas[i - 1].completada;
  if (!anteriorOk) return "bloqueada";
  // disponible; "en-progreso" si tiene algún recurso visitado o micrometa hecha
  const empezada =
    e.recursos.some((r) => r.visitado) || e.micrometas.some((m) => m.completada);
  return empezada ? "en-progreso" : "disponible";
}

const ESTILO_NODO: Record<Estado, string> = {
  completada: "bg-accent-500 text-white ring-accent-200",
  "en-progreso": "bg-brand-600 text-white ring-brand-200 animate-pop",
  disponible: "bg-white text-brand-600 ring-brand-300",
  bloqueada: "bg-slate-100 text-slate-300 ring-slate-200",
};

const ICONO_ESTADO: Record<Estado, string> = {
  completada: "fa-solid fa-check",
  "en-progreso": "fa-solid fa-play",
  disponible: "fa-solid fa-circle-dot",
  bloqueada: "fa-solid fa-lock",
};

const TIPO_ICONO: Record<string, string> = {
  video: "fa-solid fa-circle-play",
  articulo: "fa-solid fa-file-lines",
  repositorio: "fa-brands fa-github",
  curso: "fa-solid fa-graduation-cap",
};

export default function RoadmapView({ etapas: inicial }: { etapas: EtapaVM[] }) {
  const router = useRouter();
  const [etapas, setEtapas] = useState(inicial);
  const [abierta, setAbierta] = useState<string | null>(
    inicial.find((e) => !e.completada)?.id ?? null
  );
  const [cargando, setCargando] = useState<string | null>(null);

  async function toggleEtapa(etapa: EtapaVM) {
    setCargando(etapa.id);
    const nuevo = !etapa.completada;
    setEtapas((prev) => prev.map((e) => (e.id === etapa.id ? { ...e, completada: nuevo } : e)));
    await fetch("/api/roadmap", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etapaId: etapa.id, completada: nuevo }),
    });
    setCargando(null);
    router.refresh();
  }

  async function marcarVisitado(recurso: RecursoVM) {
    if (recurso.visitado) return;
    setEtapas((prev) =>
      prev.map((e) => ({
        ...e,
        recursos: e.recursos.map((r) => (r.id === recurso.id ? { ...r, visitado: true } : r)),
      }))
    );
    await fetch("/api/roadmap", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recursoId: recurso.id, visitado: true }),
    });
    router.refresh();
  }

  return (
    <div className="relative">
      {etapas.map((etapa, i) => {
        const estado = estadoEtapa(etapas, i);
        const bloqueada = estado === "bloqueada";
        const expandida = abierta === etapa.id;
        return (
          <div key={etapa.id} className="relative">
            {/* línea conectora */}
            {i < etapas.length - 1 && (
              <span className="absolute left-6 top-12 h-full w-0.5 -translate-x-1/2 bg-slate-200" />
            )}
            <div className="relative flex gap-4 pb-6">
              {/* nodo */}
              <button
                onClick={() => !bloqueada && toggleEtapa(etapa)}
                disabled={bloqueada || cargando === etapa.id}
                className={clsx(
                  "z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold shadow ring-4 transition",
                  ESTILO_NODO[estado],
                  !bloqueada && "hover:scale-105"
                )}
                title={bloqueada ? "Completá la etapa anterior" : "Marcar etapa"}
              >
                <i className={ICONO_ESTADO[estado]} />
              </button>

              {/* tarjeta */}
              <div
                className={clsx(
                  "min-w-0 flex-1 rounded-2xl p-4 ring-1 transition",
                  bloqueada ? "bg-slate-50 ring-slate-100" : "bg-white ring-slate-100 shadow-sm"
                )}
              >
                <div
                  className="flex cursor-pointer items-start justify-between gap-2"
                  onClick={() => !bloqueada && setAbierta(expandida ? null : etapa.id)}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                      Etapa {etapa.orden}
                    </p>
                    <h3 className={clsx("font-bold", bloqueada ? "text-slate-400" : "text-slate-900")}>
                      {etapa.titulo}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">{etapa.descripcion}</p>
                  </div>
                  {!bloqueada && (
                    <span className="text-slate-300">
                      <i className={expandida ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"} />
                    </span>
                  )}
                </div>

                {expandida && !bloqueada && (
                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-3 animate-fade-in">
                    {/* micrometas */}
                    {etapa.micrometas.length > 0 && (
                      <div>
                        {etapa.micrometas.map((m) => (
                          <div key={m.id} className="flex items-center gap-2 text-sm text-slate-600">
                            <i className="fa-solid fa-bullseye text-brand-400" />
                            <span>{m.titulo}</span>
                            {m.fechaLimite && (
                              <span className="ml-auto text-xs text-slate-400">
                                {new Date(m.fechaLimite).toLocaleDateString("es-AR", {
                                  day: "2-digit", month: "short",
                                })}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {/* recursos */}
                    <div className="space-y-1.5">
                      {etapa.recursos.length === 0 && (
                        <p className="text-sm text-slate-400">
                          Sin recursos para tu filtro de costo. Explorá la biblioteca.
                        </p>
                      )}
                      {etapa.recursos.map((r) => (
                        <a
                          key={r.id}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => marcarVisitado(r)}
                          className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2 text-sm transition hover:bg-brand-50"
                        >
                          <i className={clsx(TIPO_ICONO[r.tipo] ?? "fa-solid fa-link", "w-4 shrink-0 text-center text-brand-500")} />
                          <span className="min-w-0 flex-1 truncate text-slate-700">{r.titulo}</span>
                          <span className={clsx(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            r.costo === "gratis" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {r.costo}
                          </span>
                          {r.visitado && <i className="fa-solid fa-circle-check text-accent-500" />}
                        </a>
                      ))}
                    </div>

                    <button
                      onClick={() => toggleEtapa(etapa)}
                      disabled={cargando === etapa.id}
                      className={etapa.completada ? "btn-secondary" : "btn-primary"}
                    >
                      {etapa.completada ? (
                        <><i className="fa-solid fa-rotate-left" /> Marcar como no completada</>
                      ) : (
                        <><i className="fa-solid fa-check" /> Completar etapa</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
