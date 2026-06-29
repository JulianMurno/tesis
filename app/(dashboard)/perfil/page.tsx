import Link from "next/link";
import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/session";
import { getRubro, getSubRubro, HOBBIES, RIASEC_LABELS, type RiasecTipo } from "@/lib/catalogo";
import EliminarCuentaButton from "@/components/perfil/EliminarCuentaButton";

export const metadata = { title: "Mi Perfil · MentorIT" };

const DIAS_LABEL: Record<string, string> = {
  lunes: "Lun", martes: "Mar", miercoles: "Mié", jueves: "Jue",
  viernes: "Vie", sabado: "Sáb", domingo: "Dom",
};

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-slate-800">{children}</p>
    </div>
  );
}

export default async function PerfilPage() {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/login");
  const p = usuario.perfil;

  const rubro = getRubro(p?.rubroIT);
  const sub = getSubRubro(p?.rubroIT, p?.subRubro);
  const personalidad = p?.personalidad as
    | { dominante?: RiasecTipo; codigo?: string; puntajes?: Record<string, number> }
    | null;
  const skills = p?.hardSkills as { nivel?: string; porcentaje?: number } | null;

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
        <i className="fa-solid fa-id-card text-brand-500" /> Mi Perfil
      </h1>
      <p className="mb-6 text-slate-500">Lo que MentorIT sabe de vos para personalizar tu camino.</p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Identidad */}
        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
            <i className="fa-solid fa-user text-brand-500" /> Cuenta
          </h2>
          <div className="space-y-3">
            <Dato label="Nombre">{usuario.name ?? "—"}</Dato>
            <Dato label="Email">{usuario.email}</Dato>
            <Dato label="Racha actual">
              <i className="fa-solid fa-fire text-orange-500" /> {usuario.rachaDias ?? 0} días
            </Dato>
          </div>
        </div>

        {/* Diagnóstico */}
        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
            <i className="fa-solid fa-clipboard-check text-brand-500" /> Diagnóstico vocacional
          </h2>
          {p?.diagnosticoCompleto ? (
            <div className="space-y-3">
              <Dato label="Personalidad (RIASEC)">
                {personalidad?.dominante
                  ? `${RIASEC_LABELS[personalidad.dominante]} (${personalidad.codigo})`
                  : "—"}
              </Dato>
              <Dato label="Nivel técnico">
                {skills?.nivel ? `${skills.nivel} (${skills.porcentaje}%)` : "—"}
              </Dato>
              <Dato label="Rubro IT">
                {rubro ? `${rubro.icono} ${rubro.nombre}${sub ? ` · ${sub.nombre}` : ""}` : "—"}
              </Dato>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-500">Todavía no completaste el diagnóstico.</p>
              <Link href="/diagnostico" className="btn-primary mt-3">
                <i className="fa-solid fa-clipboard-question" /> Hacer diagnóstico
              </Link>
            </div>
          )}
        </div>

        {/* Intereses */}
        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
            <i className="fa-solid fa-heart text-brand-500" /> Intereses
          </h2>
          <div className="flex flex-wrap gap-2">
            {(p?.hobbies ?? []).length === 0 && <p className="text-sm text-slate-500">—</p>}
            {(p?.hobbies ?? []).map((h) => {
              const hobby = HOBBIES.find((x) => x.id === h);
              return (
                <span key={h} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
                  {hobby ? `${hobby.icono} ${hobby.nombre}` : h}
                </span>
              );
            })}
          </div>
        </div>

        {/* Disponibilidad */}
        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
            <i className="fa-solid fa-calendar-days text-brand-500" /> Disponibilidad y preferencias
          </h2>
          <div className="space-y-3">
            <Dato label="Ubicación">
              {p?.ciudad ? `${p.ciudad}${p.pais ? `, ${p.pais}` : ""}` : "—"}
            </Dato>
            <Dato label="Horas por semana">{p?.horasSemanales ? `${p.horasSemanales}h` : "—"}</Dato>
            <Dato label="Días de estudio">
              {(p?.diasEstudio ?? []).map((d) => DIAS_LABEL[d] ?? d).join(", ") || "—"}
            </Dato>
            <Dato label="Modalidad">{p?.modalidad ?? "—"}</Dato>
            <Dato label="Preferencia de costo">{p?.preferenciaCosto ?? "—"}</Dato>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href="/diagnostico" className="btn-secondary">
          <i className="fa-solid fa-rotate-right" /> Rehacer diagnóstico
        </Link>
        <EliminarCuentaButton />
      </div>
    </div>
  );
}
