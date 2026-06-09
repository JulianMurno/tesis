/**
 * Seed de demostración.
 * Crea un usuario demo con diagnóstico completo y un roadmap generado
 * a partir de las plantillas locales, para poder explorar la app sin Gemini.
 *
 *   Usuario: demo@mentorit.app   Contraseña: demo1234
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generarRoadmap } from "../lib/roadmap-engine";
import type { PerfilParaIA } from "../lib/gemini";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@mentorit.app";
  const password = await bcrypt.hash("demo1234", 10);

  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      email,
      name: "Estudiante Demo",
      password,
      rachaDias: 4,
      ultimaActividad: new Date(),
      perfil: {
        create: {
          personalidad: { dominante: "I", codigo: "IRA", puntajes: { R: 7, I: 9, A: 6, S: 4, E: 3, C: 5 } },
          hardSkills: { nivel: "principiante", porcentaje: 33, aciertos: 2, total: 6 },
          hobbies: ["logica", "gaming", "escribir"],
          modalidad: "hibrido",
          horasSemanales: 8,
          diasEstudio: ["lunes", "miercoles", "viernes"],
          rubroIT: "desarrollo",
          subRubro: "web",
          preferenciaCosto: "mixto",
          diagnosticoCompleto: true,
        },
      },
    },
  });

  const perfil: PerfilParaIA = {
    name: user.name,
    hobbies: ["logica", "gaming", "escribir"],
    rubroIT: "desarrollo",
    subRubro: "web",
    modalidad: "hibrido",
    horasSemanales: 8,
    diasEstudio: ["lunes", "miercoles", "viernes"],
    preferenciaCosto: "mixto",
  };

  const generado = await generarRoadmap(perfil);

  await prisma.roadmap.create({
    data: {
      userId: user.id,
      titulo: "Ruta de desarrollo · web",
      rubroIT: "desarrollo",
      subRubro: "web",
      progreso: 0,
      etapas: {
        create: generado.etapas.map((e, idx) => ({
          titulo: e.titulo,
          descripcion: e.descripcion,
          orden: e.orden,
          completada: idx === 0, // primera etapa ya completada para mostrar progreso
          recursos: { create: e.recursos.map((r) => ({ ...r, rubroIT: "desarrollo" })) },
          micrometas: {
            create: e.micrometas.map((m) => ({ titulo: m.titulo, fechaLimite: m.fechaLimite ?? undefined })),
          },
        })),
      },
    },
  });

  // Recalcular progreso con la primera etapa completa
  const etapas = await prisma.etapa.findMany({ where: { roadmap: { userId: user.id } } });
  const progreso = Math.round((etapas.filter((e) => e.completada).length / etapas.length) * 100);
  await prisma.roadmap.update({ where: { userId: user.id }, data: { progreso } });

  console.log("✅ Seed listo. Login: demo@mentorit.app / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
