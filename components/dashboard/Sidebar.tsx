"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";

const LINKS = [
  { href: "/dashboard", label: "Inicio", icon: "fa-solid fa-house" },
  { href: "/roadmap", label: "Mi Roadmap", icon: "fa-solid fa-route" },
  { href: "/recursos", label: "Biblioteca", icon: "fa-solid fa-book-open" },
  { href: "/perfil", label: "Mi Perfil", icon: "fa-solid fa-user" },
];

export default function Sidebar({ nombre }: { nombre?: string | null }) {
  const pathname = usePathname();
  const inicial = (nombre ?? "U").trim().charAt(0).toUpperCase();

  return (
    <aside className="sticky top-0 z-30 flex w-full shrink-0 items-center gap-2 border-b border-slate-200/70 bg-white/90 px-3 py-3 backdrop-blur md:static md:h-screen md:w-64 md:flex-col md:items-stretch md:gap-1 md:py-4">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex shrink-0 items-center gap-2 px-1 font-display text-lg font-extrabold text-brand-700 md:px-3 md:pb-4 md:text-xl"
      >
        <i className="fa-solid fa-compass text-accent-500" />
        <span className="hidden sm:inline">
          Mentor<span className="text-accent-500">IT</span>
        </span>
      </Link>

      {/* Navegación: fila scrolleable en mobile, columna en desktop */}
      <nav className="flex flex-1 items-center gap-1 overflow-x-auto no-scrollbar md:flex-col md:items-stretch md:overflow-visible">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "group flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition md:gap-3",
                active
                  ? "bg-brand-600 text-white shadow-glow"
                  : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
              )}
            >
              <i
                className={clsx(
                  l.icon,
                  "w-5 text-center",
                  !active && "text-slate-400 group-hover:text-brand-500"
                )}
              />
              <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Usuario + logout (desktop: pie de sidebar) */}
      <div className="mt-auto hidden border-t border-slate-100 pt-3 md:block">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
            {inicial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-700">{nombre ?? "Usuario"}</p>
            <p className="text-xs text-slate-400">Sesión activa</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="btn-ghost mt-1 w-full justify-start text-sm"
        >
          <i className="fa-solid fa-right-from-bracket w-5 text-center" /> Cerrar sesión
        </button>
      </div>

      {/* Logout (mobile: ícono a la derecha) */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 md:hidden"
        aria-label="Cerrar sesión"
      >
        <i className="fa-solid fa-right-from-bracket" />
      </button>
    </aside>
  );
}
