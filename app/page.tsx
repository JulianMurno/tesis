import Link from "next/link";
import Image from "next/image";
import { RUBROS } from "@/lib/catalogo";

const RUBRO_ICON: Record<string, string> = {
  desarrollo: "fa-solid fa-code",
  infraestructura: "fa-solid fa-server",
  datos: "fa-solid fa-chart-line",
  gestion: "fa-solid fa-people-group",
};

const PASOS = [
  {
    icon: "fa-solid fa-clipboard-question",
    t: "1. Diagnóstico",
    d: "Test de personalidad RIASEC, check de hard skills y tus hobbies.",
  },
  {
    icon: "fa-solid fa-route",
    t: "2. Roadmap dinámico",
    d: "La IA arma tu ruta con micro-metas ajustadas a tus horas.",
  },
  {
    icon: "fa-solid fa-trophy",
    t: "3. Avanzá jugando",
    d: "Visualizador estilo Duolingo, racha de estudio y mentor IA 24/7.",
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div className="pointer-events-none absolute inset-0 hero-pattern" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-aurora" aria-hidden />

      <div className="relative">
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:px-6 sm:py-5">
          <span className="font-display text-lg font-extrabold text-brand-700 sm:text-xl">
            <i className="fa-solid fa-compass mr-1.5 text-accent-500 sm:mr-2" />
            Mentor<span className="text-accent-500">IT</span>
          </span>
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/login" className="btn-ghost px-3 sm:px-4">
              Ingresar
            </Link>
            <Link href="/register" className="btn-primary px-3 sm:px-4">
              Crear cuenta
            </Link>
          </nav>
        </header>

        <section className="mx-auto max-w-4xl px-6 pb-12 pt-6 text-center">
          <Image
            src="/logo.png"
            alt="MentorIT"
            width={1024}
            height={1024}
            priority
            className="mx-auto mb-6 h-28 w-28 object-contain animate-float sm:h-32 sm:w-32"
          />
          <span className="chip bg-brand-100 text-brand-700 shadow-sm">
            <i className="fa-solid fa-graduation-cap" />
            EdTech · Orientación vocacional IT para LATAM
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            Dejá la <span className="text-gradient">parálisis por análisis</span>.
            <br /> Encontrá tu camino en IT.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            MentorIT analiza tu perfil psicométrico, tus intereses y tu disponibilidad
            para generar un roadmap de aprendizaje dinámico y personalizado, paso a paso,
            hasta tu primer empleo.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              <i className="fa-solid fa-rocket" /> Empezar gratis
            </Link>
            <Link href="/login" className="btn-secondary px-6 py-3 text-base">
              Ya tengo cuenta
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            <i className="fa-solid fa-wand-magic-sparkles mr-1" />
            Potenciado por IA · Gratis para empezar
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-slate-500">
            Cuatro grandes rubros para descubrir
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RUBROS.map((r) => (
              <div key={r.id} className="card card-hover text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600">
                  <i className={RUBRO_ICON[r.id]} />
                </div>
                <h3 className="mt-4 font-bold text-slate-800">{r.nombre}</h3>
                <p className="mt-1 text-sm text-slate-500">{r.descripcion}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-4 sm:grid-cols-3">
            {PASOS.map((s) => (
              <div key={s.t} className="card card-hover">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg text-white shadow-glow">
                  <i className={s.icon} />
                </div>
                <h3 className="mt-4 font-bold text-brand-700">{s.t}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
          <i className="fa-solid fa-compass mr-1.5 text-brand-400" />
          MentorIT · Proyecto de tesis · {new Date().getFullYear()}
        </footer>
      </div>
    </main>
  );
}
