import { redirect } from "next/navigation";
import Link from "next/link";
import { getUsuarioActual } from "@/lib/session";
import { geminiDisponible } from "@/lib/gemini";
import RoadmapView, { type EtapaVM } from "@/components/roadmap/RoadmapView";
import PivotajeSimulator from "@/components/roadmap/PivotajeSimulator";
import GenerarRoadmapButton from "@/components/roadmap/GenerarRoadmapButton";

export const metadata = { title: "Mi Roadmap · MentorIT" };

export default async function RoadmapPage() {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/login");
  if (!usuario.perfil?.diagnosticoCompleto) redirect("/diagnostico");

  const roadmap = usuario.roadmap;

  if (!roadmap || roadmap.etapas.length === 0) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 text-4xl text-brand-500 animate-float">
          <i className="fa-solid fa-route" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Todavía no tenés roadmap</h1>
        <p className="mt-2 text-slate-500">
          Generá tu ruta personalizada a partir del diagnóstico que completaste.
        </p>
        <div className="mt-6 flex justify-center">
          <GenerarRoadmapButton />
        </div>
      </div>
    );
  }

  const etapasVM: EtapaVM[] = roadmap.etapas.map((e) => ({
    id: e.id,
    titulo: e.titulo,
    descripcion: e.descripcion,
    orden: e.orden,
    completada: e.completada,
    recursos: e.recursos.map((r) => ({
      id: r.id, titulo: r.titulo, url: r.url, tipo: r.tipo, costo: r.costo, visitado: r.visitado,
    })),
    micrometas: e.micrometas.map((m) => ({
      id: m.id, titulo: m.titulo,
      fechaLimite: m.fechaLimite ? m.fechaLimite.toISOString() : null,
      completada: m.completada,
    })),
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
            <i className="fa-solid fa-route text-brand-500" /> {roadmap.titulo}
          </h1>
          <p className="mt-1 text-slate-500">
            {roadmap.progreso}% completado · {roadmap.etapas.length} etapas
            {!geminiDisponible() && (
              <span className="ml-2 chip bg-slate-100 text-slate-500">
                <i className="fa-solid fa-table-cells" /> generado con plantilla
              </span>
            )}
          </p>
        </div>
        <GenerarRoadmapButton label="Regenerar" variante="secondary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RoadmapView etapas={etapasVM} />
        </div>
        <div className="space-y-6">
          <PivotajeSimulator subRubroActual={roadmap.subRubro} />
          <Link href="/recursos" className="card card-hover block">
            <h2 className="flex items-center gap-2 font-bold text-slate-800">
              <i className="fa-solid fa-book-open text-brand-500" /> Biblioteca de recursos
            </h2>
            <p className="mt-1 text-sm text-slate-500">Explorá más recursos filtrados por tu perfil.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
