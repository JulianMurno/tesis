import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

/** Devuelve el id del usuario autenticado o null. */
export async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

/** Carga el usuario completo con perfil y roadmap (etapas/recursos/micrometas). */
export async function getUsuarioActual() {
  const userId = await getUserId();
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      perfil: true,
      roadmap: {
        include: {
          etapas: {
            orderBy: { orden: "asc" },
            include: { recursos: true, micrometas: true },
          },
        },
      },
    },
  });
}

export type UsuarioActual = NonNullable<Awaited<ReturnType<typeof getUsuarioActual>>>;
