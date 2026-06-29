"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface Carrera {
  institucion: string;
  programa: string;
  tipo: string;
  modalidad: string;
  duracion: string;
  ciudad: string;
  gestion?: string;
  url?: string;
}

const TIPO_BADGE: Record<string, string> = {
  universidad: "bg-brand-50 text-brand-700",
  tecnicatura: "bg-emerald-50 text-emerald-700",
  terciario: "bg-amber-50 text-amber-700",
  curso: "bg-slate-100 text-slate-600",
};

export default function CarrerasExplorer({
  ciudad,
  pais,
  rubro,
}: {
  ciudad: string | null;
  pais: string | null;
  rubro: string | null;
}) {
  const router = useRouter();

  // Si el usuario no tiene ciudad cargada (perfil viejo), la pedimos acá.
  const [ciudadInput, setCiudadInput] = useState(ciudad ?? "");
  const [paisInput, setPaisInput] = useState(pais ?? "Argentina");
  const [guardandoUbic, setGuardandoUbic] = useState(false);

  const [carreras, setCarreras] = useState<Carrera[] | null>(null);
  const [conBusquedaWeb, setConBusquedaWeb] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function guardarUbicacion() {
    setGuardandoUbic(true);
    setError("");
    try {
      const res = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ciudad: ciudadInput.trim(), pais: paisInput.trim() }),
      });
      if (!res.ok) throw new Error("No se pudo guardar la ubicación.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error.");
    } finally {
      setGuardandoUbic(false);
    }
  }

  async function buscar() {
    setCargando(true);
    setError("");
    setCarreras(null);
    try {
      const res = await fetch("/api/carreras");
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "No se pudo buscar.");
      setCarreras(d.carreras ?? []);
      setConBusquedaWeb(Boolean(d.conBusquedaWeb));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al buscar carreras.");
    } finally {
      setCargando(false);
    }
  }

  // ── Sin ciudad: pedirla ──
  if (!ciudad) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600">
          <i className="fa-solid fa-location-dot" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Decinos dónde vivís</h2>
        <p className="mt-1 text-sm text-slate-500">
          Necesitamos tu ciudad para buscar carreras y tecnicaturas cercanas.
        </p>
        <div className="mt-5 space-y-3 text-left">
          <input className="input" value={ciudadInput} onChange={(e) => setCiudadInput(e.target.value)} placeholder="Ciudad" />
          <input className="input" value={paisInput} onChange={(e) => setPaisInput(e.target.value)} placeholder="País" />
          <button
            onClick={guardarUbicacion}
            disabled={ciudadInput.trim().length < 2 || guardandoUbic}
            className="btn-primary w-full"
          >
            {guardandoUbic ? <><i className="fa-solid fa-spinner fa-spin" /> Guardando…</> : <>Guardar ubicación</>}
          </button>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
      </div>
    );
  }

  // ── Con ciudad: buscar y mostrar ──
  return (
    <div>
      <div className="card mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <i className="fa-solid fa-location-dot text-brand-500" />
            Buscando cerca de <strong className="text-slate-800">{ciudad}, {pais}</strong>
            {rubro && <span className="text-slate-400">· {rubro}</span>}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            ¿Te mudaste? Podés actualizar tu ciudad rehaciendo el{" "}
            <a href="/diagnostico" className="underline">diagnóstico</a>.
          </p>
        </div>
        <button onClick={buscar} disabled={cargando} className="btn-primary">
          {cargando ? (
            <><i className="fa-solid fa-spinner fa-spin" /> Investigando…</>
          ) : (
            <><i className="fa-solid fa-magnifying-glass" /> Buscar carreras</>
          )}
        </button>
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          <i className="fa-solid fa-circle-exclamation" /> {error}
        </p>
      )}

      {cargando && (
        <div className="card text-center text-slate-500">
          <i className="fa-solid fa-robot mb-2 block text-2xl text-brand-400" />
          La IA está investigando carreras en tu zona… esto puede tardar unos segundos.
        </div>
      )}

      {carreras && carreras.length > 0 && (
        <>
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
            <span className="chip bg-slate-100 text-slate-600">{carreras.length} opciones</span>
            {conBusquedaWeb ? (
              <span className="chip bg-emerald-50 text-emerald-700">
                <i className="fa-solid fa-globe" /> con búsqueda web
              </span>
            ) : (
              <span className="chip bg-amber-50 text-amber-700">
                <i className="fa-solid fa-circle-info" /> conocimiento de la IA
              </span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {carreras.map((c, i) => (
              <div key={i} className="card card-hover">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900">{c.programa}</h3>
                  <span className={clsx("chip shrink-0 capitalize", TIPO_BADGE[c.tipo] ?? "bg-slate-100 text-slate-600")}>
                    {c.tipo}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-brand-700">
                  <i className="fa-solid fa-building-columns text-xs" /> {c.institucion}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span><i className="fa-solid fa-location-dot mr-1" />{c.ciudad}</span>
                  {c.modalidad && <span><i className="fa-solid fa-laptop mr-1" />{c.modalidad}</span>}
                  {c.duracion && <span><i className="fa-regular fa-clock mr-1" />{c.duracion}</span>}
                  {c.gestion && <span><i className="fa-solid fa-tag mr-1" />{c.gestion}</span>}
                </div>
                {c.url && (
                  <a href={c.url} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
                    Ver más <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                  </a>
                )}
              </div>
            ))}
          </div>

          <p className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <i className="fa-solid fa-triangle-exclamation mt-0.5 text-amber-500" />
            Los resultados los genera una IA y pueden contener errores o datos desactualizados.
            Verificá siempre en el sitio oficial de cada institución antes de inscribirte.
          </p>
        </>
      )}

      {carreras && carreras.length === 0 && (
        <p className="card text-center text-slate-500">No encontramos carreras. Probá de nuevo.</p>
      )}
    </div>
  );
}
