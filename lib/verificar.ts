/**
 * Verificación de URLs de recursos.
 * Descarta enlaces rotos (404/410, dominios inexistentes, timeouts) que la IA
 * a veces inventa. Es tolerante con sitios que bloquean bots (403/405/429),
 * porque esos existen aunque rechacen nuestra petición.
 */

const TIMEOUT_MS = 6000;
const CONCURRENCIA = 8;

// Códigos que consideramos "recurso inexistente".
const CODIGOS_MUERTOS = new Set([404, 410]);

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

/** Devuelve true si la URL parece existir (responde algo distinto de 404/410). */
export async function urlViva(url: string): Promise<boolean> {
  if (!/^https?:\/\//i.test(url)) return false;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    // Primero HEAD (barato). Muchos servidores/CDN responden raro a HEAD
    // (404/403/405), así que ante cualquier código sospechoso reintentamos GET,
    // que es lo que vería el navegador del usuario.
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA },
    });
    if ([403, 404, 405, 429, 501].includes(res.status)) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "User-Agent": UA },
      });
    }
    return !CODIGOS_MUERTOS.has(res.status);
  } catch {
    // DNS inexistente, conexión rechazada o timeout → lo tratamos como roto.
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Filtra una lista de recursos dejando solo los que tienen URL viva. */
export async function filtrarRecursosVivos<T extends { url: string }>(
  recursos: T[]
): Promise<T[]> {
  const vivos: T[] = [];
  for (let i = 0; i < recursos.length; i += CONCURRENCIA) {
    const lote = recursos.slice(i, i + CONCURRENCIA);
    const resultados = await Promise.all(lote.map((r) => urlViva(r.url)));
    lote.forEach((r, idx) => {
      if (resultados[idx]) vivos.push(r);
    });
  }
  return vivos;
}
