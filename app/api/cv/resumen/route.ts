import { NextResponse } from "next/server";
import { z } from "zod";
import { getUsuarioActual } from "@/lib/session";
import { cvDesbloqueado, construirResumenBase } from "@/lib/cv";
import { generarResumenCv } from "@/lib/gemini";
import { getRubro } from "@/lib/catalogo";

const schema = z.object({
  titular: z.string().min(1).max(120),
  skills: z.array(z.string()).max(40),
});

/** POST: genera un resumen profesional para el CV (IA, con fallback local). */
export async function POST(req: Request) {
  const usuario = await getUsuarioActual();
  if (!usuario) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!cvDesbloqueado(usuario.roadmap?.progreso)) {
    return NextResponse.json({ error: "Roadmap incompleto" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const rubro = getRubro(usuario.perfil?.rubroIT)?.nombre;
  const { titular, skills } = parsed.data;

  const ia = await generarResumenCv({ nombre: usuario.name, titular, rubro, skills });
  const resumen = ia ?? construirResumenBase(usuario.name, titular, rubro, "", skills.length);

  return NextResponse.json({ resumen, fuente: ia ? "ia" : "base" });
}
