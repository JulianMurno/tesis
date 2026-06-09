import type { UsuarioActual } from "./session";
import type { Notificacion } from "@/components/dashboard/NotificacionBanner";

/**
 * Genera notificaciones in-app (Épica 3) a partir del estado del usuario:
 *  - micro-metas próximas a vencer o vencidas,
 *  - inactividad (días sin estudiar),
 *  - logros (etapas completadas, rachas).
 */
export function generarNotificaciones(usuario: UsuarioActual): Notificacion[] {
  const out: Notificacion[] = [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Micro-metas próximas / vencidas
  const micrometas =
    usuario.roadmap?.etapas.flatMap((e) => e.micrometas) ?? [];
  for (const m of micrometas) {
    if (m.completada || !m.fechaLimite) continue;
    const limite = new Date(m.fechaLimite);
    limite.setHours(0, 0, 0, 0);
    const dias = Math.round((limite.getTime() - hoy.getTime()) / 86400000);
    if (dias < 0) {
      out.push({ tipo: "vencimiento", mensaje: `Tenés una micro-meta vencida: "${m.titulo}". ¡Retomala!` });
    } else if (dias <= 3) {
      out.push({
        tipo: "vencimiento",
        mensaje: `Tu micro-meta "${m.titulo}" vence en ${dias === 0 ? "hoy" : dias + " día(s)"}.`,
      });
    }
  }

  // Inactividad
  if (usuario.ultimaActividad) {
    const ult = new Date(usuario.ultimaActividad);
    ult.setHours(0, 0, 0, 0);
    const diasSin = Math.round((hoy.getTime() - ult.getTime()) / 86400000);
    if (diasSin >= 3) {
      out.push({
        tipo: "inactividad",
        mensaje: `Hace ${diasSin} días que no estudiás. Un pasito hoy mantiene tu racha viva 💪`,
      });
    }
  }

  // Logros
  if ((usuario.rachaDias ?? 0) >= 3) {
    out.push({ tipo: "logro", mensaje: `¡Llevás una racha de ${usuario.rachaDias} días! Seguí así 🔥` });
  }
  const completadas = usuario.roadmap?.etapas.filter((e) => e.completada).length ?? 0;
  if (completadas > 0 && completadas === usuario.roadmap?.etapas.length) {
    out.push({ tipo: "logro", mensaje: "¡Completaste todo tu roadmap! Es hora de pensar el próximo paso 🚀" });
  }

  return out.slice(0, 4);
}
