"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  PREGUNTAS_RIASEC,
  PREGUNTAS_SKILLS,
  HOBBIES,
  RUBROS,
  calcularRiasec,
  calcularSkills,
  sugerirRubros,
  sugerirSubRubros,
  RIASEC_LABELS,
  type RubroId,
} from "@/lib/catalogo";

const DIAS = [
  { id: "lunes", label: "Lun" },
  { id: "martes", label: "Mar" },
  { id: "miercoles", label: "Mié" },
  { id: "jueves", label: "Jue" },
  { id: "viernes", label: "Vie" },
  { id: "sabado", label: "Sáb" },
  { id: "domingo", label: "Dom" },
];

const LIKERT = [
  { v: 1, l: "Nada" },
  { v: 2, l: "Poco" },
  { v: 3, l: "Neutro" },
  { v: 4, l: "Mucho" },
  { v: 5, l: "Bastante" },
];

const TOTAL_PASOS = 7;

export default function DiagnosticoWizard() {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Estado del diagnóstico
  const [riasec, setRiasec] = useState<Record<string, number>>({});
  const [skills, setSkills] = useState<Record<string, number>>({});
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [modalidad, setModalidad] = useState("hibrido");
  const [rubroIT, setRubroIT] = useState<RubroId | "">("");
  const [subRubro, setSubRubro] = useState("");
  const [horasSemanales, setHorasSemanales] = useState(6);
  const [diasEstudio, setDiasEstudio] = useState<string[]>(["lunes", "miercoles", "viernes"]);
  const [preferenciaCosto, setPreferenciaCosto] = useState("mixto");

  // Geolocalización (se pregunta al principio, antes de los pasos)
  const [ubicacionLista, setUbicacionLista] = useState(false);
  const [ciudad, setCiudad] = useState("");
  const [pais, setPais] = useState("Argentina");

  const resultadoRiasec = calcularRiasec(riasec);
  const sugerencias = sugerirRubros(resultadoRiasec, hobbies);
  const subSugerencias = sugerirSubRubros(resultadoRiasec, hobbies, 5);

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function puedeAvanzar(): boolean {
    if (paso === 0) return Object.keys(riasec).length === PREGUNTAS_RIASEC.length;
    if (paso === 1) return Object.keys(skills).length === PREGUNTAS_SKILLS.length;
    if (paso === 2) return hobbies.length >= 1;
    if (paso === 4) return Boolean(rubroIT && subRubro);
    if (paso === 5) return horasSemanales > 0 && diasEstudio.length >= 1;
    return true;
  }

  async function finalizar() {
    setGuardando(true);
    setError("");
    try {
      const perfil = {
        personalidad: { ...calcularRiasec(riasec), respuestas: riasec },
        hardSkills: { ...calcularSkills(skills), respuestas: skills },
        hobbies,
        modalidad,
        rubroIT,
        subRubro,
        horasSemanales,
        diasEstudio,
        preferenciaCosto,
        ciudad: ciudad.trim(),
        pais: pais.trim(),
        diagnosticoCompleto: true,
      };
      const r1 = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(perfil),
      });
      if (!r1.ok) throw new Error("No se pudo guardar el perfil.");

      const r2 = await fetch("/api/roadmap", { method: "POST" });
      if (!r2.ok) {
        const d = await r2.json();
        throw new Error(d.error ?? "No se pudo generar el roadmap.");
      }
      router.push("/roadmap");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
      setGuardando(false);
    }
  }

  const subRubrosDisponibles = RUBROS.find((r) => r.id === rubroIT)?.subRubros ?? [];

  // ── Pantalla inicial: ¿Dónde vivís? (geolocalización) ──
  if (!ubicacionLista) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card animate-fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600">
            <i className="fa-solid fa-location-dot" />
          </div>
          <h2 className="mt-4 text-center text-xl font-bold text-slate-900">¿Dónde vivís?</h2>
          <p className="mx-auto mt-1 max-w-md text-center text-sm text-slate-500">
            Lo usamos para sugerirte carreras universitarias y tecnicaturas cercanas a tu ciudad.
          </p>

          <div className="mx-auto mt-6 max-w-md space-y-4">
            <div>
              <label className="label">Ciudad</label>
              <div className="relative">
                <i className="fa-solid fa-city pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pl-10"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  placeholder="Ej: Córdoba, Rosario, La Plata…"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="label">País</label>
              <div className="relative">
                <i className="fa-solid fa-earth-americas pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pl-10"
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  placeholder="País"
                />
              </div>
            </div>
            <button
              className="btn-primary w-full"
              disabled={ciudad.trim().length < 2 || pais.trim().length < 2}
              onClick={() => setUbicacionLista(true)}
            >
              Empezar diagnóstico <i className="fa-solid fa-arrow-right" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progreso */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
          <span>Diagnóstico</span>
          <span>Paso {paso + 1} de {TOTAL_PASOS}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${((paso + 1) / TOTAL_PASOS) * 100}%` }} />
        </div>
      </div>

      <div className="card animate-fade-in">
        {/* Paso 0: RIASEC */}
        {paso === 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">Test de personalidad</h2>
            <p className="mt-1 text-sm text-slate-500">
              Respondé qué tan de acuerdo estás con cada frase. No hay respuestas correctas.
            </p>
            <div className="mt-5 space-y-5">
              {PREGUNTAS_RIASEC.map((p) => (
                <div key={p.id}>
                  <p className="mb-2 text-sm font-medium text-slate-700">{p.texto}</p>
                  <div className="flex gap-1 sm:gap-1.5">
                    {LIKERT.map((opt) => (
                      <button
                        key={opt.v}
                        onClick={() => setRiasec({ ...riasec, [p.id]: opt.v })}
                        className={clsx(
                          "flex flex-1 flex-col items-center gap-0.5 rounded-lg border px-0.5 py-1.5 transition sm:py-2",
                          riasec[p.id] === opt.v
                            ? "border-brand-500 bg-brand-50 font-semibold text-brand-700"
                            : "border-slate-200 text-slate-500 hover:border-brand-300"
                        )}
                      >
                        <span className="text-sm font-bold sm:text-xs sm:font-semibold">{opt.v}</span>
                        <span className="text-[9px] leading-tight sm:text-xs">{opt.l}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 1: Hard skills */}
        {paso === 1 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">Check de conocimientos</h2>
            <p className="mt-1 text-sm text-slate-500">
              Para no hacerte empezar desde cero si ya sabés algo. Si no sabés, elegí lo que creas.
            </p>
            <div className="mt-5 space-y-5">
              {PREGUNTAS_SKILLS.map((p) => (
                <div key={p.id}>
                  <p className="mb-2 text-sm font-medium text-slate-700">{p.texto}</p>
                  <div className="space-y-2">
                    {p.opciones.map((op, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSkills({ ...skills, [p.id]: idx })}
                        className={clsx(
                          "block w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                          skills[p.id] === idx
                            ? "border-brand-500 bg-brand-50 text-brand-800"
                            : "border-slate-200 text-slate-600 hover:border-brand-300"
                        )}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 2: Hobbies */}
        {paso === 2 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">¿Qué te gusta?</h2>
            <p className="mt-1 text-sm text-slate-500">Elegí todos los que te representen (al menos 1).</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {HOBBIES.map((h) => (
                <button
                  key={h.id}
                  onClick={() => toggle(hobbies, setHobbies, h.id)}
                  className={clsx(
                    "flex flex-col items-center gap-1 rounded-xl border p-4 text-center transition",
                    hobbies.includes(h.id)
                      ? "border-brand-500 bg-brand-50"
                      : "border-slate-200 hover:border-brand-300"
                  )}
                >
                  <span className="text-2xl">{h.icono}</span>
                  <span className="text-xs font-medium text-slate-700">{h.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Modalidad */}
        {paso === 3 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">¿Cómo te gusta aprender?</h2>
            <p className="mt-1 text-sm text-slate-500">Define qué tipo de recursos vamos a priorizar.</p>
            <div className="mt-5 space-y-3">
              {[
                { id: "academico", t: "Académico", d: "Cursos estructurados, certificaciones, universidad." },
                { id: "autodidacta", t: "Autodidacta", d: "Tutoriales, documentación y proyectos por mi cuenta." },
                { id: "hibrido", t: "Híbrido", d: "Una mezcla de ambos según el tema." },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModalidad(m.id)}
                  className={clsx(
                    "block w-full rounded-xl border p-4 text-left transition",
                    modalidad === m.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-300"
                  )}
                >
                  <p className="font-semibold text-slate-800">{m.t}</p>
                  <p className="text-sm text-slate-500">{m.d}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paso 4: Resultados del test + elección de rol */}
        {paso === 4 && (
          <div>
            {/* Resumen de personalidad */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-100">
                Tu perfil vocacional
              </p>
              <p className="mt-1 text-2xl font-extrabold">
                {RIASEC_LABELS[resultadoRiasec.dominante]}
                <span className="ml-2 text-base font-medium text-brand-200">
                  código {resultadoRiasec.codigo}
                </span>
              </p>
              <p className="mt-1 text-sm text-brand-100">
                Combinamos tu personalidad con tus intereses para encontrar tu lugar en IT.
              </p>
            </div>

            {/* Áreas más afines (rubros) — visual mejorado */}
            <h3 className="mt-6 mb-3 flex items-center gap-2 font-bold text-slate-800">
              <i className="fa-solid fa-chart-simple text-brand-500" /> Tus áreas más afines
            </h3>
            <div className="space-y-3">
              {sugerencias.map((s, i) => {
                const rubro = RUBROS.find((r) => r.id === s.rubroId)!;
                return (
                  <div key={s.rubroId} className={clsx(
                    "rounded-xl p-3 ring-1 transition",
                    i === 0 ? "bg-accent-500/10 ring-accent-400/40" : "bg-slate-50 ring-slate-100"
                  )}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <span className="text-lg">{rubro.icono}</span>
                        {s.nombre}
                        {i === 0 && (
                          <span className="chip bg-accent-500 text-white">
                            <i className="fa-solid fa-star text-[10px]" /> top
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-bold text-slate-700">{s.porcentaje}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/70">
                      <div
                        className={clsx("h-full rounded-full", i === 0 ? "bg-accent-500" : "bg-brand-400")}
                        style={{ width: `${s.porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Roles recomendados (subrubros) */}
            <h3 className="mt-6 mb-1 flex items-center gap-2 font-bold text-slate-800">
              <i className="fa-solid fa-wand-magic-sparkles text-accent-500" /> Roles que mejor encajan con vos
            </h3>
            <p className="mb-3 text-sm text-slate-500">Tocá uno para elegirlo como tu camino:</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {subSugerencias.map((s, i) => {
                const elegido = rubroIT === s.rubroId && subRubro === s.subId;
                return (
                  <button
                    key={s.subId}
                    onClick={() => { setRubroIT(s.rubroId); setSubRubro(s.subId); }}
                    className={clsx(
                      "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                      elegido ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200" : "border-slate-200 hover:border-brand-300"
                    )}
                  >
                    <span className="text-xl">{s.icono}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold text-slate-800">{s.nombre}</p>
                        {elegido && <i className="fa-solid fa-circle-check text-brand-600" />}
                      </div>
                      <p className="truncate text-xs text-slate-500">{s.rubroNombre}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-accent-500" style={{ width: `${s.match}%` }} />
                        </div>
                        <span className="text-[11px] font-semibold text-accent-600">{s.match}% match</span>
                      </div>
                      {i === 0 && (
                        <span className="mt-1.5 inline-block text-[11px] font-semibold text-accent-600">
                          <i className="fa-solid fa-star text-[9px]" /> Tu mejor match
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Elección manual (override) */}
            <details className="mt-5 rounded-xl border border-slate-200 p-3">
              <summary className="cursor-pointer text-sm font-medium text-slate-600">
                ¿Preferís elegir otro rol manualmente?
              </summary>
              <p className="mt-3 mb-2 text-sm font-medium text-slate-700">Rubro:</p>
              <div className="grid grid-cols-2 gap-2">
                {RUBROS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setRubroIT(r.id); setSubRubro(""); }}
                    className={clsx(
                      "rounded-xl border p-3 text-left transition",
                      rubroIT === r.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-300"
                    )}
                  >
                    <span className="text-xl">{r.icono}</span>
                    <p className="text-sm font-semibold text-slate-800">{r.nombre}</p>
                  </button>
                ))}
              </div>
              {subRubrosDisponibles.length > 0 && (
                <>
                  <p className="mt-4 mb-2 text-sm font-medium text-slate-700">Especialización:</p>
                  <div className="flex flex-wrap gap-2">
                    {subRubrosDisponibles.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSubRubro(s.id)}
                        className={clsx(
                          "rounded-full border px-3 py-1.5 text-sm transition",
                          subRubro === s.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-brand-300"
                        )}
                      >
                        {s.nombre}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </details>

            {rubroIT && subRubro && (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5 text-sm text-brand-800">
                <i className="fa-solid fa-circle-check text-brand-600" />
                Elegiste: <strong>{subRubrosDisponibles.find((s) => s.id === subRubro)?.nombre}</strong>
              </p>
            )}
          </div>
        )}

        {/* Paso 5: Disponibilidad */}
        {paso === 5 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">Tu disponibilidad</h2>
            <p className="mt-1 text-sm text-slate-500">Con esto armamos tus micro-metas con fechas reales.</p>
            <div className="mt-5">
              <label className="label">Horas por semana: {horasSemanales}h</label>
              <input type="range" min={1} max={40} value={horasSemanales}
                onChange={(e) => setHorasSemanales(Number(e.target.value))} className="w-full accent-brand-600" />
            </div>
            <div className="mt-5">
              <label className="label">Días que vas a estudiar:</label>
              <div className="flex flex-wrap gap-2">
                {DIAS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => toggle(diasEstudio, setDiasEstudio, d.id)}
                    className={clsx(
                      "rounded-lg border px-3 py-2 text-sm transition",
                      diasEstudio.includes(d.id) ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-brand-300"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Paso 6: Costo */}
        {paso === 6 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">Inversión en recursos</h2>
            <p className="mt-1 text-sm text-slate-500">¿Qué tipo de recursos querés en tu roadmap?</p>
            <div className="mt-5 space-y-3">
              {[
                { id: "gratis", t: "Solo recursos gratuitos", d: "Todo lo que necesitás, sin gastar un peso." },
                { id: "pago", t: "Incluir recursos de pago", d: "También cursos y certificaciones pagas." },
                { id: "mixto", t: "Sin preferencia", d: "Mostrame lo mejor, gratis o pago." },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setPreferenciaCosto(c.id)}
                  className={clsx(
                    "block w-full rounded-xl border p-4 text-left transition",
                    preferenciaCosto === c.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-300"
                  )}
                >
                  <p className="font-semibold text-slate-800">{c.t}</p>
                  <p className="text-sm text-slate-500">{c.d}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {/* Navegación */}
        <div className="mt-7 flex justify-between">
          <button
            className="btn-ghost"
            onClick={() => setPaso((p) => Math.max(0, p - 1))}
            disabled={paso === 0 || guardando}
          >
            <i className="fa-solid fa-arrow-left" /> Atrás
          </button>
          {paso < TOTAL_PASOS - 1 ? (
            <button className="btn-primary" disabled={!puedeAvanzar()} onClick={() => setPaso((p) => p + 1)}>
              Siguiente <i className="fa-solid fa-arrow-right" />
            </button>
          ) : (
            <button className="btn-primary" disabled={guardando} onClick={finalizar}>
              {guardando ? (
                <><i className="fa-solid fa-spinner fa-spin" /> Generando tu roadmap…</>
              ) : (
                <><i className="fa-solid fa-rocket" /> Generar mi roadmap</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
