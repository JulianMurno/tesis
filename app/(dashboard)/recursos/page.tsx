import { getBibliotecaCurada } from "@/lib/biblioteca";
import BibliotecaFiltros from "@/components/recursos/BibliotecaFiltros";
import YoutubePanel from "@/components/recursos/YoutubePanel";
import { youtubeDisponible } from "@/lib/youtube";
import { getUsuarioActual } from "@/lib/session";
import { getRubro, getSubRubro } from "@/lib/catalogo";

export const metadata = { title: "Biblioteca · MentorIT" };

export default async function RecursosPage() {
  const recursos = getBibliotecaCurada();

  // Query inicial para YouTube según el rubro elegido.
  const usuario = await getUsuarioActual();
  const sub = getSubRubro(usuario?.perfil?.rubroIT, usuario?.perfil?.subRubro)?.nombre;
  const rubro = getRubro(usuario?.perfil?.rubroIT)?.nombre;
  const queryInicial = [sub ?? rubro, "tutorial español"].filter(Boolean).join(" ") || "programación tutorial";

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
        <i className="fa-solid fa-book-open text-brand-500" /> Biblioteca de recursos
      </h1>
      <p className="mb-6 text-slate-500">
        Contenidos curados, filtrables por tipo, costo y rubro. Explorá libremente o seguí tu roadmap.
      </p>

      {youtubeDisponible() && <YoutubePanel queryInicial={queryInicial} />}

      <BibliotecaFiltros recursos={recursos} />
    </div>
  );
}
