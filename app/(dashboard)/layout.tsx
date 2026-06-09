import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getUsuarioActual } from "@/lib/session";
import Sidebar from "@/components/dashboard/Sidebar";
import MentorChat from "@/components/MentorChat";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7fb] md:flex-row">
      <Sidebar nombre={usuario.name ?? usuario.email} />
      <main className="relative flex-1 overflow-x-hidden p-5 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-5xl animate-fade-in">{children}</div>
      </main>
      <MentorChat />
    </div>
  );
}
