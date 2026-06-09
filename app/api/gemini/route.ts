import { NextResponse } from "next/server";
import { z } from "zod";
import { getUsuarioActual } from "@/lib/session";
import { chatMentor, type ContextoChat, type MensajeChat } from "@/lib/gemini";

const schema = z.object({
  mensaje: z.string().min(1).max(2000),
  historial: z
    .array(z.object({ role: z.enum(["user", "model"]), content: z.string() }))
    .max(20)
    .optional(),
});

/** Chatbot IA Mentor (Épica 5). Inyecta el contexto del usuario en el prompt. */
export async function POST(req: Request) {
  const usuario = await getUsuarioActual();
  if (!usuario) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const etapaActual = usuario.roadmap?.etapas.find((e) => !e.completada)?.titulo ?? null;

  const ctx: ContextoChat = {
    name: usuario.name,
    rubroIT: usuario.perfil?.rubroIT,
    subRubro: usuario.perfil?.subRubro,
    etapaActual,
    progreso: usuario.roadmap?.progreso ?? 0,
  };

  const respuesta = await chatMentor(
    ctx,
    (parsed.data.historial ?? []) as MensajeChat[],
    parsed.data.mensaje
  );

  return NextResponse.json({ respuesta });
}
