"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "No se pudo crear la cuenta.");
      return;
    }
    // Auto-login tras registrarse.
    await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    router.push("/diagnostico");
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        <i className="fa-solid fa-user-plus mr-2 text-brand-500" />
        Creá tu cuenta
      </h1>
      <p className="mt-1 text-sm text-slate-500">Empezá tu diagnóstico vocacional IT.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">Nombre</label>
          <div className="relative">
            <i className="fa-solid fa-user pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10" required value={name}
              onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <i className="fa-solid fa-envelope pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="vos@email.com" />
          </div>
        </div>
        <div>
          <label className="label">Contraseña</label>
          <div className="relative">
            <i className="fa-solid fa-lock pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10" type="password" required minLength={6} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
        </div>
        {error && (
          <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            <i className="fa-solid fa-circle-exclamation" /> {error}
          </p>
        )}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? (
            <><i className="fa-solid fa-spinner fa-spin" /> Creando…</>
          ) : (
            <><i className="fa-solid fa-rocket" /> Crear cuenta</>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Ingresá
        </Link>
      </p>
    </div>
  );
}
