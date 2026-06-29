import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";

/**
 * DELETE: elimina la cuenta del usuario autenticado.
 * Gracias a `onDelete: Cascade` en el schema, borrar el User arrastra
 * su Perfil, Roadmap (etapas/recursos/micrometas), Accounts y Sessions.
 */
export async function DELETE() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[account:delete]", err);
    return NextResponse.json({ error: "No se pudo eliminar la cuenta" }, { status: 500 });
  }
}
