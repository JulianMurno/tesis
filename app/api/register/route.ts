import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2, "El nombre es muy corto").max(80),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;
    const emailLower = email.toLowerCase();

    const existe = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existe) {
      return NextResponse.json({ error: "Ese email ya está registrado" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email: emailLower,
        password: hash,
        perfil: { create: {} },
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
