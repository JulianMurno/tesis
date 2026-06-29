import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUsuarioActual, getUserId } from "@/lib/session";
import { construirCvPorDefecto, sanitizarCv, cvDesbloqueado, type CvData } from "@/lib/cv";

/** GET: devuelve el CV guardado, o uno inicial armado desde el perfil/roadmap. */
export async function GET() {
  const usuario = await getUsuarioActual();
  if (!usuario) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  if (!cvDesbloqueado(usuario.roadmap?.progreso)) {
    return NextResponse.json({ error: "Roadmap incompleto" }, { status: 403 });
  }

  const existente = await prisma.cv.findUnique({ where: { userId: usuario.id } });
  const cv = (existente?.data as CvData | undefined) ?? construirCvPorDefecto(usuario);
  return NextResponse.json({ cv, guardado: Boolean(existente) });
}

/** POST: guarda (upsert) el CV editado por el usuario. */
export async function POST(req: Request) {
  const usuario = await getUsuarioActual();
  if (!usuario) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  if (!cvDesbloqueado(usuario.roadmap?.progreso)) {
    return NextResponse.json({ error: "Roadmap incompleto" }, { status: 403 });
  }

  const userId = (await getUserId())!;
  const body = await req.json().catch(() => null);
  if (!body?.cv) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const data = sanitizarCv(body.cv) as unknown as Prisma.InputJsonValue;
  const cv = await prisma.cv.upsert({
    where: { userId },
    create: { userId, data },
    update: { data },
  });

  return NextResponse.json({ ok: true, cv: cv.data });
}
