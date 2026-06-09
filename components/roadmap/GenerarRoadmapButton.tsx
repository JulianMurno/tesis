"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerarRoadmapButton({
  label = "Generar mi roadmap",
  variante = "primary",
}: {
  label?: string;
  variante?: "primary" | "secondary";
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function generar() {
    setCargando(true);
    setError("");
    const res = await fetch("/api/roadmap", { method: "POST" });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "No se pudo generar.");
      setCargando(false);
      return;
    }
    setCargando(false);
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={generar}
        disabled={cargando}
        className={variante === "primary" ? "btn-primary" : "btn-secondary"}
      >
        {cargando ? (
          <><i className="fa-solid fa-spinner fa-spin" /> Generando con IA…</>
        ) : (
          <><i className="fa-solid fa-wand-magic-sparkles" /> {label}</>
        )}
      </button>
      {error && (
        <p className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <i className="fa-solid fa-circle-exclamation" /> {error}
        </p>
      )}
    </div>
  );
}
