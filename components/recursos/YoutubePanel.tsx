"use client";

import { useState } from "react";

interface VideoYT {
  videoId: string;
  titulo: string;
  canal: string;
  url: string;
  thumbnail?: string;
}

export default function YoutubePanel({ queryInicial }: { queryInicial: string }) {
  const [query, setQuery] = useState(queryInicial);
  const [videos, setVideos] = useState<VideoYT[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function buscar(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`/api/youtube?q=${encodeURIComponent(query.trim())}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "No se pudo buscar.");
      setVideos(d.videos ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al buscar videos.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="card mb-6 bg-gradient-to-br from-brand-50/60 to-white">
      <h2 className="flex items-center gap-2 font-bold text-slate-800">
        <i className="fa-brands fa-youtube text-[#ff0000]" /> Buscar videos en YouTube
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Videos reales y reproducibles, traídos en vivo desde YouTube según el tema que busques.
      </p>

      <form onSubmit={buscar} className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: React desde cero, SQL joins, Git tutorial…"
          />
        </div>
        <button className="btn-primary px-4" disabled={cargando}>
          {cargando ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-magnifying-glass" />}
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </form>

      {error && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          <i className="fa-solid fa-circle-exclamation" /> {error}
        </p>
      )}

      {videos && videos.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <a
              key={v.videoId}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-xl bg-white ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="relative aspect-video bg-slate-100">
                {v.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.thumbnail} alt={v.titulo} className="h-full w-full object-cover" />
                )}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff0000]/90 text-white opacity-90 transition group-hover:scale-110">
                    <i className="fa-solid fa-play" />
                  </span>
                </span>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-semibold text-slate-800">{v.titulo}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <i className="fa-brands fa-youtube text-[#ff0000]" /> {v.canal}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}

      {videos && videos.length === 0 && (
        <p className="mt-4 text-sm text-slate-400">No se encontraron videos para esa búsqueda.</p>
      )}
    </div>
  );
}
