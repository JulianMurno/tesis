import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";
import { generarRoadmap, calcularProgreso } from "@/lib/roadmap-engine";
import type { PerfilParaIA } from "@/lib/gemini";

/** POST: genera (o regenera) el roadmap del usuario a partir de su perfil. */
export async function POST() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const perfil = await prisma.perfil.findUnique({ where: { userId } });
  if (!perfil || !perfil.rubroIT) {
    return NextResponse.json(
      { error: "Completá el diagnóstico y elegí un rubro antes de generar el roadmap." },
      { status: 400 }
    );
  }

  const perfilIA: PerfilParaIA = {
    personalidad: perfil.personalidad,
    hardSkills: perfil.hardSkills,
    hobbies: perfil.hobbies,
    rubroIT: perfil.rubroIT,
    subRubro: perfil.subRubro,
    modalidad: perfil.modalidad,
    horasSemanales: perfil.horasSemanales,
    diasEstudio: perfil.diasEstudio,
    preferenciaCosto: perfil.preferenciaCosto,
  };

  const generado = await generarRoadmap(perfilIA);

  // Reemplaza el roadmap anterior (borrando en cascada etapas/recursos/micrometas).
  await prisma.roadmap.deleteMany({ where: { userId } });

  const roadmap = await prisma.roadmap.create({
    data: {
      userId,
      titulo: `Ruta de ${perfil.rubroIT}${perfil.subRubro ? " · " + perfil.subRubro : ""}`,
      rubroIT: perfil.rubroIT,
      subRubro: perfil.subRubro,
      etapas: {
        create: generado.etapas.map((e) => ({
          titulo: e.titulo,
          descripcion: e.descripcion,
          orden: e.orden,
          recursos: {
            create: e.recursos.map((r) => ({
              titulo: r.titulo,
              url: r.url,
              tipo: r.tipo,
              costo: r.costo,
              modalidad: r.modalidad,
              rubroIT: perfil.rubroIT,
            })),
          },
          micrometas: {
            create: e.micrometas.map((m) => ({
              titulo: m.titulo,
              fechaLimite: m.fechaLimite ?? undefined,
            })),
          },
        })),
      },
    },
    include: { etapas: { include: { recursos: true, micrometas: true } } },
  });

  return NextResponse.json({ ok: true, roadmap, fuente: generado.fuente });
}

/** PATCH: marca una etapa o micro-meta como completada/incompleta. */
const patchSchema = z.object({
  etapaId: z.string().optional(),
  micrometaId: z.string().optional(),
  recursoId: z.string().optional(),
  completada: z.boolean().optional(),
  visitado: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const { etapaId, micrometaId, recursoId, completada, visitado } = parsed.data;

  const roadmap = await prisma.roadmap.findUnique({ where: { userId } });
  if (!roadmap) return NextResponse.json({ error: "Sin roadmap" }, { status: 404 });

  if (etapaId && completada !== undefined) {
    await prisma.etapa.update({ where: { id: etapaId }, data: { completada } });
  }
  if (micrometaId && completada !== undefined) {
    await prisma.micrometa.update({ where: { id: micrometaId }, data: { completada } });
  }
  if (recursoId && visitado !== undefined) {
    await prisma.recurso.update({ where: { id: recursoId }, data: { visitado } });
  }

  // Recalcula progreso del roadmap.
  const etapas = await prisma.etapa.findMany({ where: { roadmapId: roadmap.id } });
  const progreso = calcularProgreso(etapas);
  await prisma.roadmap.update({ where: { id: roadmap.id }, data: { progreso } });

  // Actualiza racha de días de estudio (gamificación, Épica 3).
  await actualizarRacha(userId);

  return NextResponse.json({ ok: true, progreso });
}

async function actualizarRacha(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const ultima = user.ultimaActividad ? new Date(user.ultimaActividad) : null;
  if (ultima) ultima.setHours(0, 0, 0, 0);

  let racha = user.rachaDias;
  if (!ultima) {
    racha = 1;
  } else {
    const diff = Math.round((hoy.getTime() - ultima.getTime()) / 86400000);
    if (diff === 0) {
      // misma jornada, no cambia
    } else if (diff === 1) {
      racha += 1;
    } else {
      racha = 1;
    }
  }
  await prisma.user.update({
    where: { id: userId },
    data: { rachaDias: racha, ultimaActividad: new Date() },
  });
}
