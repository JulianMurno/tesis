import Link from "next/link";
import GoogleButton from "@/components/auth/GoogleButton";

export const metadata = { title: "Crear cuenta · MentorIT" };

const BENEFICIOS = [
  { icon: "fa-solid fa-bolt", txt: "Sin contraseñas: entrás en un click." },
  { icon: "fa-solid fa-wand-magic-sparkles", txt: "Tu roadmap personalizado con IA." },
  { icon: "fa-solid fa-trophy", txt: "Seguí tu progreso y tu racha de estudio." },
];

export default function RegisterPage() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600">
        <i className="fa-solid fa-user-plus" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Creá tu cuenta</h1>
      <p className="mt-1 text-sm text-slate-500">Empezá tu diagnóstico vocacional IT en segundos.</p>

      <ul className="mt-5 space-y-2 text-left">
        {BENEFICIOS.map((b) => (
          <li key={b.txt} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            <i className={`${b.icon} text-brand-500`} />
            {b.txt}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <GoogleButton label="Registrarme con Google" />
      </div>

      <p className="mt-6 text-sm text-slate-500">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Ingresá
        </Link>
      </p>
    </div>
  );
}
