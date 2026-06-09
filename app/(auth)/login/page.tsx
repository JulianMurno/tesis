"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        <i className="fa-solid fa-hand-sparkles mr-2 text-brand-500" />
        Bienvenido de vuelta
      </h1>
      <p className="mt-1 text-sm text-slate-500">Ingresá para seguir tu camino IT.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
            <input className="input pl-10" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        {error && (
          <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            <i className="fa-solid fa-circle-exclamation" /> {error}
          </p>
        )}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? (
            <><i className="fa-solid fa-spinner fa-spin" /> Ingresando…</>
          ) : (
            <><i className="fa-solid fa-right-to-bracket" /> Ingresar</>
          )}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> o <span className="h-px flex-1 bg-slate-200" />
      </div>
      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="btn-secondary w-full"
      >
        <i className="fa-brands fa-google text-[#ea4335]" /> Continuar con Google
      </button>

      <p className="mt-6 text-center text-sm text-slate-500">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  );
}
