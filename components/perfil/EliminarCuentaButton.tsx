"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function EliminarCuentaButton() {
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function eliminar() {
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "No se pudo eliminar la cuenta.");
      }
      // Cierra la sesión y vuelve al inicio.
      await signOut({ callbackUrl: "/" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
      setCargando(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="btn bg-white text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-50 hover:ring-rose-300"
      >
        <i className="fa-solid fa-trash-can" /> Eliminar cuenta
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-xl text-rose-600">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <h2 className="mt-4 text-center text-lg font-bold text-slate-900">
              ¿Eliminar tu cuenta?
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">
              Esta acción es permanente. Se borrarán tu perfil, tu roadmap, tu progreso
              y tu racha. No se puede deshacer.
            </p>

            {error && (
              <p className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                <i className="fa-solid fa-circle-exclamation" /> {error}
              </p>
            )}

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setAbierto(false)}
                disabled={cargando}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={eliminar}
                disabled={cargando}
                className="btn flex-1 bg-rose-600 text-white hover:bg-rose-700"
              >
                {cargando ? (
                  <><i className="fa-solid fa-spinner fa-spin" /> Eliminando…</>
                ) : (
                  <><i className="fa-solid fa-trash-can" /> Sí, eliminar</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
