import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";

const schema = z.object({
  personalidad: z.any().optional(),
  hardSkills: z.any().optional(),
  hobbies: z.array(z.string()).optional(),
  modalidad: z.enum(["academico", "autodidacta", "hibrido"]).optional(),
  horasSemanales: z.number().int().min(1).max(80).optional(),
  diasEstudio: z.array(z.string()).optional(),
  rubroIT: z.string().optional(),
  subRubro: z.string().optional(),
  preferenciaCosto: z.enum(["gratis", "pago", "mixto"]).optional(),
  diagnosticoCompleto: z.boolean().optional(),
});

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const data = parsed.data;
  const perfil = await prisma.perfil.upsert({
    where: { userId },
    create: { userId, ...data },
    update: { ...data },
  });

  return NextResponse.json({ ok: true, perfil });
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const perfil = await prisma.perfil.findUnique({ where: { userId } });
  return NextResponse.json({ perfil });
}
