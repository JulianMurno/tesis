import { redirect } from "next/navigation";
import { getUsuarioActual } from "@/lib/session";
import { getRubro } from "@/lib/catalogo";
import CarrerasExplorer from "@/components/carreras/CarrerasExplorer";

export const metadata = { title: "Carreras · MentorIT" };

export default async function CarrerasPage() {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/login");
  if (!usuario.perfil?.diagnosticoCompleto) redirect("/diagnostico");

  const rubro = getRubro(usuario.perfil?.rubroIT)?.nombre ?? null;

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
        <i className="fa-solid fa-building-columns text-brand-500" /> Carreras cerca tuyo
      </h1>
      <p className="mb-6 text-slate-500">
        La IA investiga universidades, tecnicaturas y terciarios reales según tu ciudad y tu
        rubro elegido. Una forma de complementar tu roadmap con formación formal.
      </p>

      <CarrerasExplorer
        ciudad={usuario.perfil?.ciudad ?? null}
        pais={usuario.perfil?.pais ?? null}
        rubro={rubro}
      />
    </div>
  );
}
