import { NextResponse } from "next/server";
import { getUsuarioActual } from "@/lib/session";
import { buscarCarreras, geminiDisponible } from "@/lib/gemini";
import { getRubro, getSubRubro } from "@/lib/catalogo";

/**
 * GET: investiga carreras/tecnicaturas reales según la ciudad del usuario
 * y su rubro IT elegido. Usa IA con búsqueda web cuando está disponible.
 */
export async function GET() {
  const usuario = await getUsuarioActual();
  if (!usuario) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const perfil = usuario.perfil;
  if (!perfil?.ciudad) {
    return NextResponse.json(
      { error: "Falta tu ciudad. Completá tu ubicación en el diagnóstico." },
      { status: 400 }
    );
  }

  if (!geminiDisponible()) {
    return NextResponse.json(
      { error: "La búsqueda de carreras necesita la IA configurada (GEMINI_API_KEY)." },
      { status: 503 }
    );
  }

  const rubro = getRubro(perfil.rubroIT)?.nombre ?? perfil.rubroIT;
  const sub = getSubRubro(perfil.rubroIT, perfil.subRubro)?.nombre ?? perfil.subRubro;

  const resultado = await buscarCarreras({
    ciudad: perfil.ciudad,
    pais: perfil.pais ?? "Argentina",
    rubro,
    subRubro: sub,
  });

  if (!resultado) {
    return NextResponse.json(
      { error: "No pudimos obtener carreras en este momento. Probá de nuevo." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ...resultado,
    ciudad: perfil.ciudad,
    pais: perfil.pais ?? "Argentina",
  });
}
