import Link from "next/link";
import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/session";
import {
  construirCvPorDefecto,
  cvDesbloqueado,
  PORCENTAJE_REQUERIDO,
  type CvData,
} from "@/lib/cv";
import { prisma } from "@/lib/prisma";
import CvBuilder from "@/components/cv/CvBuilder";

export const metadata = { title: "Mi CV · MentorIT" };

export default async function CvPage() {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/login");
  if (!usuario.perfil?.diagnosticoCompleto) redirect("/diagnostico");

  const progreso = usuario.roadmap?.progreso ?? 0;

  // ── Gate: requiere ≥90% del roadmap completado ──
  if (!cvDesbloqueado(progreso)) {
    const faltante = PORCENTAJE_REQUERIDO - progreso;
    return (
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
          <i className="fa-solid fa-file-lines text-brand-500" /> Mi CV
        </h1>
        <p className="mb-6 text-slate-500">Tu currículum ATS-friendly, listo para postularte.</p>

        <div className="card mx-auto max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl text-slate-400">
            <i className="fa-solid fa-lock" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Casi lo desbloqueás</h2>
          <p className="mt-2 text-sm text-slate-500">
            Para armar tu CV necesitás completar al menos el{" "}
            <strong>{PORCENTAJE_REQUERIDO}%</strong> de tu roadmap. Así reflejamos habilidades
            reales que ya dominás.
          </p>

          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs font-medium text-slate-500">
              <span>Tu progreso</span>
              <span>{progreso}% / {PORCENTAJE_REQUERIDO}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all"
                style={{ width: `${Math.min(100, (progreso / PORCENTAJE_REQUERIDO) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Te falta avanzar {faltante}% para desbloquear esta sección.
            </p>
          </div>

          <Link href="/roadmap" className="btn-primary mt-6">
            <i className="fa-solid fa-route" /> Seguir mi roadmap
          </Link>
        </div>
      </div>
    );
  }

  // ── Desbloqueado: cargar CV guardado o armar uno inicial ──
  const guardado = await prisma.cv.findUnique({ where: { userId: usuario.id } });
  const inicial = (guardado?.data as CvData | undefined) ?? construirCvPorDefecto(usuario);

  return (
    <div>
      <div className="mb-6 cv-no-print">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
          <i className="fa-solid fa-file-lines text-brand-500" /> Mi CV
          <span className="chip bg-emerald-50 text-emerald-700">
            <i className="fa-solid fa-lock-open" /> Desbloqueado
          </span>
        </h1>
        <p className="text-slate-500">
          Editá tus datos y descargalo en PDF. El formato está pensado para pasar filtros ATS:
          una columna, encabezados estándar y sin gráficos.
        </p>
      </div>

      <CvBuilder inicial={inicial} />
    </div>
  );
}
