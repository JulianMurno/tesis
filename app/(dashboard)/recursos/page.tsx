import { getBibliotecaCurada } from "@/lib/biblioteca";
import BibliotecaFiltros from "@/components/recursos/BibliotecaFiltros";

export const metadata = { title: "Biblioteca · MentorIT" };

export default function RecursosPage() {
  const recursos = getBibliotecaCurada();
  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
        <i className="fa-solid fa-book-open text-brand-500" /> Biblioteca de recursos
      </h1>
      <p className="mb-6 text-slate-500">
        Contenidos curados, filtrables por tipo, costo y rubro. Explorá libremente o seguí tu roadmap.
      </p>
      <BibliotecaFiltros recursos={recursos} />
    </div>
  );
}
