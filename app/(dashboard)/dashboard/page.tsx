import Link from "next/link";
import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/session";
import { generarNotificaciones } from "@/lib/notificaciones";
import NotificacionBanner from "@/components/dashboard/NotificacionBanner";
import { getRubro, getSubRubro } from "@/lib/catalogo";

export const metadata = { title: "Inicio · MentorIT" };

function StatCard({
  valor, label, icon, color,
}: {
  valor: string | number;
  label: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="card card-hover flex items-center gap-4">
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg ${color}`}>
        <i className={icon} />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{valor}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/login");

  // Si no completó el diagnóstico, lo mandamos a hacerlo.
  if (!usuario.perfil?.diagnosticoCompleto) redirect("/diagnostico");

  const roadmap = usuario.roadmap;
  const etapas = roadmap?.etapas ?? [];
  const etapasCompletas = etapas.filter((e) => e.completada).length;
  const recursos = etapas.flatMap((e) => e.recursos);
  const recursosVisitados = recursos.filter((r) => r.visitado).length;
  const notificaciones = generarNotificaciones(usuario);

  const proximasMetas = etapas
    .flatMap((e) => e.micrometas.map((m) => ({ ...m, etapa: e.titulo })))
    .filter((m) => !m.completada)
    .sort((a, b) => {
      const fa = a.fechaLimite ? new Date(a.fechaLimite).getTime() : Infinity;
      const fb = b.fechaLimite ? new Date(b.fechaLimite).getTime() : Infinity;
      return fa - fb;
    })
    .slice(0, 3);

  const rubro = getRubro(usuario.perfil?.rubroIT);
  const sub = getSubRubro(usuario.perfil?.rubroIT, usuario.perfil?.subRubro);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">
        ¡Hola, {usuario.name ?? "crack"}! <i className="fa-solid fa-hand-sparkles text-brand-500" />
      </h1>
      <p className="mb-6 text-slate-500">
        {rubro ? (
          <>
            Tu camino actual:{" "}
            <strong className="text-brand-700">
              {rubro.nombre}{sub ? ` · ${sub.nombre}` : ""}
            </strong>
          </>
        ) : (
          "Todavía no elegiste un rubro."
        )}
      </p>

      <NotificacionBanner notificaciones={notificaciones} />

      {/* Progreso general */}
      <div className="card mb-6 overflow-hidden">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold text-slate-800">
            <i className="fa-solid fa-chart-pie text-brand-500" /> Progreso general
          </h2>
          <span className="text-2xl font-extrabold text-brand-600">{roadmap?.progreso ?? 0}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all"
            style={{ width: `${roadmap?.progreso ?? 0}%` }}
          />
        </div>
        {!roadmap && (
          <Link href="/diagnostico" className="btn-primary mt-4">
            <i className="fa-solid fa-wand-magic-sparkles" /> Generar mi roadmap
          </Link>
        )}
      </div>

      {/* Estadísticas */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon="fa-solid fa-fire" color="bg-orange-50 text-orange-500" valor={usuario.rachaDias ?? 0} label="Días de racha" />
        <StatCard icon="fa-solid fa-circle-check" color="bg-emerald-50 text-emerald-500" valor={`${etapasCompletas}/${etapas.length}`} label="Etapas completadas" />
        <StatCard icon="fa-solid fa-book-open" color="bg-brand-50 text-brand-500" valor={recursosVisitados} label="Recursos visitados" />
        <StatCard icon="fa-solid fa-bullseye" color="bg-rose-50 text-rose-500" valor={proximasMetas.length} label="Metas pendientes" />
      </div>

      {/* Próximas micro-metas */}
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold text-slate-800">
            <i className="fa-solid fa-flag-checkered text-brand-500" /> Próximas micro-metas
          </h2>
          <Link href="/roadmap" className="text-sm font-semibold text-brand-600 hover:underline">
            Ver roadmap <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
        </div>
        {proximasMetas.length === 0 ? (
          <p className="text-sm text-slate-500">No hay metas pendientes. ¡Buen trabajo!</p>
        ) : (
          <ul className="space-y-2">
            {proximasMetas.map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-bullseye text-brand-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{m.titulo}</p>
                    <p className="text-xs text-slate-400">{m.etapa}</p>
                  </div>
                </div>
                {m.fechaLimite && (
                  <span className="chip bg-white text-slate-500 ring-1 ring-slate-200">
                    <i className="fa-regular fa-calendar" />
                    {new Date(m.fechaLimite).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
