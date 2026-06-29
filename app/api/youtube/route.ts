import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";
import { buscarVideos, youtubeDisponible } from "@/lib/youtube";

/** GET ?q=...: busca videos reales en YouTube para la biblioteca. */
export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  if (!youtubeDisponible()) {
    return NextResponse.json(
      { error: "La búsqueda de videos necesita YOUTUBE_API_KEY configurada." },
      { status: 503 }
    );
  }

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "Falta el término de búsqueda" }, { status: 400 });

  const videos = await buscarVideos(q, 9);
  return NextResponse.json({ videos });
}
