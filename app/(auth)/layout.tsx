import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-400/10 px-4">
      <div className="pointer-events-none absolute inset-0 hero-pattern" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-aurora" aria-hidden />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-5 flex justify-center">
          <Image
            src="/logo.png"
            alt="MentorIT"
            width={1024}
            height={1024}
            priority
            className="h-24 w-24 object-contain"
          />
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
