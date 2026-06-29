"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Msg {
  role: "user" | "model";
  content: string;
}

const SUGERENCIAS = [
  "¿Qué es una API REST?",
  "¿Por dónde empiezo?",
  "¿Debería cambiarme a Mobile?",
];

/** Widget de chat flotante con el Mentor IA (Épica 5), disponible en todo el dashboard. */
export default function MentorChat() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Msg[]>([
    { role: "model", content: "¡Hola! Soy tu mentor IA. Preguntame lo que quieras sobre tu camino IT 🚀" },
  ]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, abierto]);

  async function enviar(contenido: string) {
    const limpio = contenido.trim();
    if (!limpio || cargando) return;
    const nuevos: Msg[] = [...mensajes, { role: "user", content: limpio }];
    setMensajes(nuevos);
    setTexto("");
    setCargando(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: limpio,
          historial: mensajes.filter((_, i) => i > 0).slice(-10),
        }),
      });
      const data = await res.json();
      setMensajes([...nuevos, { role: "model", content: data.respuesta ?? data.error ?? "Sin respuesta." }]);
    } catch {
      setMensajes([...nuevos, { role: "model", content: "No pude conectarme. Probá de nuevo." }]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setAbierto((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xl text-white shadow-glow transition hover:scale-105"
        aria-label="Abrir mentor IA"
      >
        <i className={abierto ? "fa-solid fa-xmark" : "fa-solid fa-robot"} />
      </button>

      {abierto && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 animate-fade-in">
          <div className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <i className="fa-solid fa-robot" />
            </span>
            <div>
              <p className="font-semibold leading-tight">Mentor IA</p>
              <p className="text-xs text-brand-100">
                <i className="fa-solid fa-circle mr-1 text-[7px] text-accent-400" />
                Tu guía personal 24/7
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
            {mensajes.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                {m.role === "user" ? (
                  <span className="inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl bg-brand-600 px-3 py-2 text-sm text-white">
                    {m.content}
                  </span>
                ) : (
                  <div className="chat-md inline-block max-w-[85%] rounded-2xl bg-white px-3 py-2 text-left text-sm text-slate-700 ring-1 ring-slate-200">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            {cargando && (
              <p className="text-sm text-slate-400">
                <i className="fa-solid fa-spinner fa-spin mr-1" /> Escribiendo…
              </p>
            )}
            <div ref={finRef} />
          </div>

          {mensajes.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-3 py-2">
              {SUGERENCIAS.map((s) => (
                <button key={s} onClick={() => enviar(s)}
                  className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700 hover:bg-brand-100">
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); enviar(texto); }}
            className="flex gap-2 border-t border-slate-100 p-2"
          >
            <input
              className="input"
              placeholder="Escribí tu pregunta…"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <button className="btn-primary px-3.5" disabled={cargando} aria-label="Enviar">
              <i className="fa-solid fa-paper-plane" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
