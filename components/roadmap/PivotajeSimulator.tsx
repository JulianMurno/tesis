"use client";

import { useState } from "react";
import { RUBROS } from "@/lib/catalogo";

interface Resultado {
  transferibles: string[];
  pendientesTransferibles: string[];
  nuevas: string[];
  porcentajeReutilizable: number;
}

/** Simulador de pivotaje (Épica 2): compara la ruta actual con otra especialización. */
export default function PivotajeSimulator({ subRubroActual }: { subRubroActual?: string | null }) {
  const [abierto, setAbierto] = useState(false);
  const [destino, setDestino] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [cargando, setCargando] = useState(false);

  const opciones = RUBROS.flatMap((r) => r.subRubros).filter((s) => s.id !== subRubroActual);

  async function simular(sub: string) {
    setDestino(sub);
    setCargando(true);
    setResultado(null);
    const res = await fetch("/api/pivotaje", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subRubroDestino: sub }),
    });
    const data = await res.json();
    setResultado(data.resultado ?? null);
    setCargando(false);
  }

  return (
    <div className="card">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between"
      >
        <div className="text-left">
          <h2 className="flex items-center gap-2 font-bold text-slate-800">
            <i className="fa-solid fa-shuffle text-brand-500" /> Simulador de pivotaje
          </h2>
          <p className="text-sm text-slate-500">¿Y si me cambio de rama? Mirá qué reutilizás.</p>
        </div>
        <span className="text-slate-300">
          <i className={abierto ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"} />
        </span>
      </button>

      {abierto && (
        <div className="mt-4 animate-fade-in">
          <label className="label">Probá cambiarte a:</label>
          <div className="flex flex-wrap gap-2">
            {opciones.map((s) => (
              <button
                key={s.id}
                onClick={() => simular(s.id)}
                className={
                  "rounded-full border px-3 py-1.5 text-sm transition " +
                  (destino === s.id
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600 hover:border-brand-300")
                }
              >
                {s.nombre}
              </button>
            ))}
          </div>

          {cargando && (
            <p className="mt-4 text-sm text-slate-400">
              <i className="fa-solid fa-spinner fa-spin mr-1" /> Calculando…
            </p>
          )}

          {resultado && (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-accent-500/10 p-4 text-center">
                <p className="text-3xl font-extrabold text-accent-600">
                  {resultado.porcentajeReutilizable}%
                </p>
                <p className="text-sm text-slate-600">de la nueva ruta ya lo tenés cubierto</p>
              </div>

              <Bloque icon="fa-solid fa-circle-check" titulo="Ya completaste (transferible)" items={resultado.transferibles} color="text-emerald-700" />
              <Bloque icon="fa-solid fa-arrows-rotate" titulo="En común, pero te falta" items={resultado.pendientesTransferibles} color="text-amber-700" />
              <Bloque icon="fa-solid fa-circle-plus" titulo="Tendrías que aprender" items={resultado.nuevas} color="text-slate-700" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Bloque({ icon, titulo, items, color }: { icon: string; titulo: string; items: string[]; color: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className={`mb-1 flex items-center gap-2 text-sm font-semibold ${color}`}>
        <i className={icon} /> {titulo}
      </p>
      <ul className="space-y-1">
        {items.map((t) => (
          <li key={t} className="rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-600">{t}</li>
        ))}
      </ul>
    </div>
  );
}
