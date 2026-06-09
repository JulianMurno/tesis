import DiagnosticoWizard from "@/components/diagnostico/DiagnosticoWizard";

export const metadata = { title: "Diagnóstico · MentorIT" };

export default function DiagnosticoPage() {
  return (
    <div>
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-extrabold text-slate-900">
        <i className="fa-solid fa-clipboard-question text-brand-500" /> Hagamos tu diagnóstico
      </h1>
      <p className="mb-6 text-slate-500">
        Antes de recomendarte un camino, queremos conocerte. Toma ~5 minutos.
      </p>
      <DiagnosticoWizard />
    </div>
  );
}
