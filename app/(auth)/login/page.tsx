import Link from "next/link";
import GoogleButton from "@/components/auth/GoogleButton";

export const metadata = { title: "Ingresar · MentorIT" };

export default function LoginPage() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600">
        <i className="fa-solid fa-right-to-bracket" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Bienvenido de vuelta</h1>
      <p className="mt-1 text-sm text-slate-500">Ingresá con tu cuenta de Google para seguir tu camino IT.</p>

      <div className="mt-7">
        <GoogleButton label="Ingresar con Google" />
      </div>

      <p className="mt-6 text-sm text-slate-500">
        ¿Es tu primera vez?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Creá tu cuenta
        </Link>
      </p>
    </div>
  );
}
