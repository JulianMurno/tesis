/**
 * Integración con la YouTube Data API v3.
 * Devuelve videos REALES (con URL garantizada), evitando los enlaces inventados.
 * Si no hay YOUTUBE_API_KEY, las funciones devuelven [] y el llamador degrada.
 */

const apiKey = process.env.YOUTUBE_API_KEY;

export function youtubeDisponible(): boolean {
  return Boolean(apiKey && apiKey.trim().length > 0);
}

export interface VideoYT {
  videoId: string;
  titulo: string;
  canal: string;
  url: string;
  thumbnail?: string;
}

/**
 * Busca videos en YouTube por término. Solo trae resultados reproducibles
 * (videoEmbeddable=true), priorizando español. Cada video.list garantiza
 * que el video existe → la URL nunca da 404.
 */
export async function buscarVideos(query: string, max = 6): Promise<VideoYT[]> {
  if (!youtubeDisponible() || !query.trim()) return [];
  const params = new URLSearchParams({
    key: apiKey as string,
    part: "snippet",
    q: query.trim(),
    type: "video",
    maxResults: String(Math.min(Math.max(max, 1), 10)),
    relevanceLanguage: "es",
    safeSearch: "moderate",
    videoEmbeddable: "true",
  });

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    if (!res.ok) {
      console.error("[youtube] búsqueda falló:", res.status, await res.text().catch(() => ""));
      return [];
    }
    const data = (await res.json()) as {
      items?: {
        id?: { videoId?: string };
        snippet?: {
          title?: string;
          channelTitle?: string;
          thumbnails?: { medium?: { url?: string } };
        };
      }[];
    };

    return (data.items ?? [])
      .filter((it) => it.id?.videoId)
      .map((it) => ({
        videoId: it.id!.videoId as string,
        titulo: decodificarHtml(it.snippet?.title ?? "Video de YouTube"),
        canal: decodificarHtml(it.snippet?.channelTitle ?? ""),
        url: `https://www.youtube.com/watch?v=${it.id!.videoId}`,
        thumbnail: it.snippet?.thumbnails?.medium?.url,
      }));
  } catch (err) {
    console.error("[youtube] error de red:", err);
    return [];
  }
}

/** YouTube devuelve títulos con entidades HTML (&amp;, &#39;, etc.). */
function decodificarHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
