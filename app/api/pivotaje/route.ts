import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";
import { getPlantilla } from "@/lib/plantillas";
import { simularPivotaje, type EtapaSimple } from "@/lib/roadmap-engine";

const schema = z.object({ subRubroDestino: z.string() });

/** Simula pivotar desde el roadmap actual hacia otro subrubro. */
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const roadmap = await prisma.roadmap.findUnique({
    where: { userId },
    include: { etapas: { orderBy: { orden: "asc" } } },
  });
  if (!roadmap) {
    return NextResponse.json({ error: "Primero generá un roadmap." }, { status: 400 });
  }

  const actual: EtapaSimple[] = roadmap.etapas.map((e) => ({
    titulo: e.titulo,
    completada: e.completada,
  }));

  const destino: EtapaSimple[] = getPlantilla(parsed.data.subRubroDestino).etapas.map((e) => ({
    titulo: e.titulo,
    completada: false,
  }));

  const resultado = simularPivotaje(actual, destino);
  return NextResponse.json({ ok: true, resultado });
}
