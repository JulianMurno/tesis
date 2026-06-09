/**
 * Sistema de notificaciones visuales (Épica 3).
 * Server-friendly: recibe las notificaciones ya calculadas.
 */

export interface Notificacion {
  tipo: "vencimiento" | "inactividad" | "logro" | "info";
  mensaje: string;
}

const ESTILOS: Record<Notificacion["tipo"], string> = {
  vencimiento: "bg-amber-50 text-amber-800 ring-amber-200",
  inactividad: "bg-rose-50 text-rose-800 ring-rose-200",
  logro: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  info: "bg-brand-50 text-brand-800 ring-brand-200",
};

const ICONOS: Record<Notificacion["tipo"], string> = {
  vencimiento: "fa-solid fa-clock",
  inactividad: "fa-solid fa-hand",
  logro: "fa-solid fa-trophy",
  info: "fa-solid fa-circle-info",
};

export default function NotificacionBanner({ notificaciones }: { notificaciones: Notificacion[] }) {
  if (notificaciones.length === 0) return null;
  return (
    <div className="mb-6 space-y-2">
      {notificaciones.map((n, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ring-1 animate-fade-in ${ESTILOS[n.tipo]}`}
        >
          <i className={`${ICONOS[n.tipo]} text-base`} />
          <span>{n.mensaje}</span>
        </div>
      ))}
    </div>
  );
}
