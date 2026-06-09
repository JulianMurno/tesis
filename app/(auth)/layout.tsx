import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-400/10 px-4">
      <div className="pointer-events-none absolute inset-0 hero-pattern" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-aurora" aria-hidden />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 font-display text-2xl font-extrabold text-brand-700"
        >
          <i className="fa-solid fa-compass text-accent-500" />
          Mentor<span className="text-accent-500">IT</span>
        </Link>
        <div className="card shadow-glow">{children}</div>
        <p className="mt-5 text-center text-xs text-slate-400">
          <i className="fa-solid fa-lock mr-1" />
          Tus datos se usan solo para personalizar tu camino.
        </p>
      </div>
    </main>
  );
}
