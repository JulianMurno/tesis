"use client";

import { useState } from "react";
import type { CvData } from "@/lib/cv";

export default function CvBuilder({ inicial }: { inicial: CvData }) {
  const [cv, setCv] = useState<CvData>(inicial);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [generandoIA, setGenerandoIA] = useState(false);
  const [error, setError] = useState("");
  const [nuevaSkill, setNuevaSkill] = useState("");

  function set<K extends keyof CvData>(key: K, value: CvData[K]) {
    setCv((c) => ({ ...c, [key]: value }));
    setGuardado(false);
  }

  // ── Skills ──
  function agregarSkill() {
    const s = nuevaSkill.trim();
    if (!s || cv.skills.includes(s)) return;
    set("skills", [...cv.skills, s]);
    setNuevaSkill("");
  }
  function quitarSkill(i: number) {
    set("skills", cv.skills.filter((_, idx) => idx !== i));
  }

  // ── Formación ──
  function setFormacion(i: number, campo: "titulo" | "detalle", valor: string) {
    set("formacion", cv.formacion.map((f, idx) => (idx === i ? { ...f, [campo]: valor } : f)));
  }
  function quitarFormacion(i: number) {
    set("formacion", cv.formacion.filter((_, idx) => idx !== i));
  }
  function agregarFormacion() {
    set("formacion", [...cv.formacion, { titulo: "", detalle: "" }]);
  }

  // ── Proyectos ──
  function setProyecto(i: number, campo: "titulo" | "descripcion", valor: string) {
    set("proyectos", cv.proyectos.map((p, idx) => (idx === i ? { ...p, [campo]: valor } : p)));
  }
  function quitarProyecto(i: number) {
    set("proyectos", cv.proyectos.filter((_, idx) => idx !== i));
  }
  function agregarProyecto() {
    set("proyectos", [...cv.proyectos, { titulo: "", descripcion: "" }]);
  }

  async function generarResumen() {
    setGenerandoIA(true);
    setError("");
    try {
      const res = await fetch("/api/cv/resumen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titular: cv.titular, skills: cv.skills }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "No se pudo generar el resumen.");
      set("resumen", d.resumen);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al generar.");
    } finally {
      setGenerandoIA(false);
    }
  }

  async function guardar() {
    setGuardando(true);
    setError("");
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "No se pudo guardar.");
      }
      setGuardado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ─────────────── Editor ─────────────── */}
      <div className="space-y-5 cv-no-print">
        {/* Datos personales */}
        <section className="card">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
            <i className="fa-solid fa-id-card text-brand-500" /> Datos personales
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label="Nombre completo" value={cv.nombre} onChange={(v) => set("nombre", v)} />
            <Campo label="Puesto / titular" value={cv.titular} onChange={(v) => set("titular", v)} />
            <Campo label="Email" value={cv.email} onChange={(v) => set("email", v)} />
            <Campo label="Teléfono" value={cv.telefono} onChange={(v) => set("telefono", v)} placeholder="+54 9 ..." />
            <Campo label="Ubicación" value={cv.ubicacion} onChange={(v) => set("ubicacion", v)} placeholder="Buenos Aires, Argentina" />
            <Campo label="LinkedIn" value={cv.linkedin} onChange={(v) => set("linkedin", v)} placeholder="linkedin.com/in/..." />
            <Campo label="GitHub" value={cv.github} onChange={(v) => set("github", v)} placeholder="github.com/..." />
          </div>
        </section>

        {/* Resumen */}
        <section className="card">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-bold text-slate-800">
              <i className="fa-solid fa-align-left text-brand-500" /> Resumen profesional
            </h2>
            <button onClick={generarResumen} disabled={generandoIA} className="btn-secondary px-3 py-1.5 text-xs">
              {generandoIA ? (
                <><i className="fa-solid fa-spinner fa-spin" /> Generando…</>
              ) : (
                <><i className="fa-solid fa-wand-magic-sparkles" /> Generar con IA</>
              )}
            </button>
          </div>
          <textarea
            className="input min-h-[110px] resize-y"
            value={cv.resumen}
            onChange={(e) => set("resumen", e.target.value)}
            placeholder="2-3 frases sobre tu perfil profesional…"
          />
        </section>

        {/* Habilidades */}
        <section className="card">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
            <i className="fa-solid fa-screwdriver-wrench text-brand-500" /> Habilidades
          </h2>
          <div className="mb-3 flex flex-wrap gap-2">
            {cv.skills.map((s, i) => (
              <span key={i} className="chip bg-brand-50 text-brand-700">
                {s}
                <button onClick={() => quitarSkill(i)} className="text-brand-400 hover:text-rose-500" aria-label="Quitar">
                  <i className="fa-solid fa-xmark" />
                </button>
              </span>
            ))}
            {cv.skills.length === 0 && <p className="text-sm text-slate-400">Agregá tus habilidades técnicas.</p>}
          </div>
          <div className="flex gap-2">
            <input
              className="input"
              value={nuevaSkill}
              onChange={(e) => setNuevaSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarSkill())}
              placeholder="Ej: JavaScript, SQL, Git…"
            />
            <button onClick={agregarSkill} className="btn-secondary px-3"><i className="fa-solid fa-plus" /></button>
          </div>
        </section>

        {/* Formación / ruta */}
        <section className="card">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
            <i className="fa-solid fa-graduation-cap text-brand-500" /> Formación y ruta de aprendizaje
          </h2>
          <div className="space-y-3">
            {cv.formacion.map((f, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <input className="input" value={f.titulo} onChange={(e) => setFormacion(i, "titulo", e.target.value)} placeholder="Título" />
                  <button onClick={() => quitarFormacion(i)} className="text-slate-400 hover:text-rose-500" aria-label="Quitar">
                    <i className="fa-solid fa-trash-can" />
                  </button>
                </div>
                <textarea className="input min-h-[56px] resize-y text-sm" value={f.detalle} onChange={(e) => setFormacion(i, "detalle", e.target.value)} placeholder="Detalle breve" />
              </div>
            ))}
          </div>
          <button onClick={agregarFormacion} className="btn-ghost mt-2 text-sm"><i className="fa-solid fa-plus" /> Agregar ítem</button>
        </section>

        {/* Proyectos */}
        <section className="card">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
            <i className="fa-solid fa-folder-open text-brand-500" /> Proyectos
          </h2>
          <div className="space-y-3">
            {cv.proyectos.map((p, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <input className="input" value={p.titulo} onChange={(e) => setProyecto(i, "titulo", e.target.value)} placeholder="Nombre del proyecto" />
                  <button onClick={() => quitarProyecto(i)} className="text-slate-400 hover:text-rose-500" aria-label="Quitar">
                    <i className="fa-solid fa-trash-can" />
                  </button>
                </div>
                <textarea className="input min-h-[56px] resize-y text-sm" value={p.descripcion} onChange={(e) => setProyecto(i, "descripcion", e.target.value)} placeholder="Qué hiciste y con qué tecnologías" />
              </div>
            ))}
            {cv.proyectos.length === 0 && <p className="text-sm text-slate-400">Sumá proyectos para destacar (opcional pero recomendado).</p>}
          </div>
          <button onClick={agregarProyecto} className="btn-ghost mt-2 text-sm"><i className="fa-solid fa-plus" /> Agregar proyecto</button>
        </section>

        {/* Acciones */}
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={guardar} disabled={guardando} className="btn-primary">
            {guardando ? (
              <><i className="fa-solid fa-spinner fa-spin" /> Guardando…</>
            ) : guardado ? (
              <><i className="fa-solid fa-check" /> Guardado</>
            ) : (
              <><i className="fa-solid fa-floppy-disk" /> Guardar CV</>
            )}
          </button>
          <button onClick={() => window.print()} className="btn-secondary">
            <i className="fa-solid fa-file-arrow-down" /> Descargar PDF
          </button>
          {error && (
            <span className="flex items-center gap-2 text-sm text-rose-600">
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </span>
          )}
        </div>
      </div>

      {/* ─────────────── Vista previa ATS ─────────────── */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 cv-no-print">
          Vista previa (formato ATS)
        </p>
        <CvPreview cv={cv} />
      </div>
    </div>
  );
}

function Campo({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

/**
 * Vista previa imprimible y ATS-friendly:
 * una sola columna, sin íconos ni colores de fondo, encabezados estándar,
 * texto negro sobre blanco para que cualquier parser lo lea bien.
 */
function CvPreview({ cv }: { cv: CvData }) {
  const contacto = [cv.email, cv.telefono, cv.ubicacion, cv.linkedin, cv.github].filter(Boolean);
  return (
    <div id="cv-print" className="cv-paper rounded-2xl bg-white p-8 text-slate-900 shadow-soft ring-1 ring-slate-100">
      <header className="border-b border-slate-300 pb-3">
        <h1 className="text-2xl font-bold tracking-tight">{cv.nombre || "Tu nombre"}</h1>
        {cv.titular && <p className="text-sm font-medium text-slate-700">{cv.titular}</p>}
        {contacto.length > 0 && (
          <p className="mt-1.5 text-xs text-slate-600">{contacto.join("  ·  ")}</p>
        )}
      </header>

      {cv.resumen && (
        <Seccion titulo="Resumen profesional">
          <p className="text-sm leading-relaxed">{cv.resumen}</p>
        </Seccion>
      )}

      {cv.skills.length > 0 && (
        <Seccion titulo="Habilidades">
          <p className="text-sm leading-relaxed">{cv.skills.join(" · ")}</p>
        </Seccion>
      )}

      {cv.formacion.length > 0 && (
        <Seccion titulo="Formación y ruta de aprendizaje">
          <ul className="space-y-1.5">
            {cv.formacion.map((f, i) => (
              <li key={i} className="text-sm">
                <span className="font-semibold">{f.titulo || "—"}</span>
                {f.detalle && <span className="text-slate-700"> — {f.detalle}</span>}
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      {cv.proyectos.some((p) => p.titulo || p.descripcion) && (
        <Seccion titulo="Proyectos">
          <ul className="space-y-1.5">
            {cv.proyectos.map((p, i) => (
              <li key={i} className="text-sm">
                <span className="font-semibold">{p.titulo || "—"}</span>
                {p.descripcion && <span className="text-slate-700"> — {p.descripcion}</span>}
              </li>
            ))}
          </ul>
        </Seccion>
      )}
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">{titulo}</h2>
      {children}
    </section>
  );
}
