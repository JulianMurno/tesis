"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { RecursoBiblioteca } from "@/lib/biblioteca";
import { RUBROS } from "@/lib/catalogo";

const TIPO_ICONO: Record<string, string> = {
  video: "fa-solid fa-circle-play",
  articulo: "fa-solid fa-file-lines",
  repositorio: "fa-brands fa-github",
  curso: "fa-solid fa-graduation-cap",
};

const TIPOS = ["todos", "video", "articulo", "repositorio", "curso"];
const COSTOS = ["todos", "gratis", "pago"];

export default function BibliotecaFiltros({ recursos }: { recursos: RecursoBiblioteca[] }) {
  const [tipo, setTipo] = useState("todos");
  const [costo, setCosto] = useState("todos");
  const [rubro, setRubro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    return recursos.filter((r) => {
      if (tipo !== "todos" && r.tipo !== tipo) return false;
      if (costo !== "todos" && r.costo !== costo) return false;
      if (rubro !== "todos" && r.rubroIT !== rubro) return false;
      if (busqueda && !r.titulo.toLowerCase().includes(busqueda.toLowerCase())) return false;
      return true;
    });
  }, [recursos, tipo, costo, rubro, busqueda]);

  return (
    <div>
      {/* Buscador */}
      <div className="relative mb-4">
        <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-10"
          placeholder="Buscar recurso…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Filtros */}
      <div className="mb-5 space-y-3">
        <FiltroFila label="Tipo" valores={TIPOS} activo={tipo} onChange={setTipo} />
        <FiltroFila label="Costo" valores={COSTOS} activo={costo} onChange={setCosto} />
        <FiltroFila
          label="Rubro"
          valores={["todos", ...RUBROS.map((r) => r.id)]}
          etiquetas={{ todos: "todos", ...Object.fromEntries(RUBROS.map((r) => [r.id, r.nombre])) }}
          activo={rubro}
          onChange={setRubro}
        />
      </div>

      <p className="mb-3 text-sm text-slate-500">{filtrados.length} recurso(s)</p>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filtrados.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card card-hover flex items-start gap-3"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-600">
              <i className={TIPO_ICONO[r.tipo] ?? "fa-solid fa-link"} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-800">{r.titulo}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge>{r.tipo}</Badge>
                <span className={clsx(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  r.costo === "gratis" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                  {r.costo}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {filtrados.length === 0 && (
        <p className="py-10 text-center text-slate-400">
          <i className="fa-solid fa-folder-open mb-2 block text-3xl" />
          No hay recursos con esos filtros.
        </p>
      )}
    </div>
  );
}

function FiltroFila({
  label, valores, activo, onChange, etiquetas,
}: {
  label: string;
  valores: string[];
  activo: string;
  onChange: (v: string) => void;
  etiquetas?: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-14 text-xs font-semibold uppercase text-slate-400">{label}</span>
      {valores.map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={clsx(
            "rounded-full border px-3 py-1 text-xs capitalize transition",
            activo === v
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "border-slate-200 text-slate-600 hover:border-brand-300"
          )}
        >
          {etiquetas?.[v] ?? v}
        </button>
      ))}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-slate-600">
      {children}
    </span>
  );
}
