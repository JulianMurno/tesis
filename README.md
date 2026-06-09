# MentorIT

Plataforma EdTech de orientación vocacional IT para LATAM. Genera **roadmaps de
aprendizaje dinámicos y personalizados** a partir del perfil psicométrico, la
disponibilidad horaria y el estilo de aprendizaje del usuario.

Proyecto de tesis — MVP construido sobre Next.js 14 (App Router), Prisma,
PostgreSQL y Google Gemini.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) |
| Estilos | Tailwind CSS |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Autenticación | NextAuth.js (credenciales + Google) |
| IA | Google Gemini (`gemini-1.5-flash`) |
| Entorno local | Docker Compose |

> Si no configurás `GEMINI_API_KEY`, el motor de roadmaps usa **plantillas
> locales** como fallback, así que la app funciona igual de punta a punta.

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar PostgreSQL
docker compose up -d

# 3. Variables de entorno
cp .env.example .env.local
#   Completá GEMINI_API_KEY (opcional) y un NEXTAUTH_SECRET propio

# 4. Crear las tablas
npx prisma migrate dev --name init      # o: npm run db:push

# 5. (Opcional) Cargar usuario demo con roadmap
npm run db:seed
#   Login demo: demo@mentorit.app / demo1234

# 6. Correr en desarrollo
npm run dev      # http://localhost:3000
```

## Mapa de funcionalidades (épicas)

- **Épica 1 — Diagnóstico** · `components/diagnostico/DiagnosticoWizard.tsx`,
  `lib/catalogo.ts` (RIASEC, hard skills, hobbies, modalidad).
- **Épica 2 — Roadmaps dinámicos** · `lib/roadmap-engine.ts`
  (generación, time-blocking, simulador de pivotaje) + `lib/gemini.ts`.
- **Épica 3 — UX y gamificación** · dashboard, visualizador estilo Duolingo
  (`components/roadmap/RoadmapView.tsx`), racha y notificaciones
  (`lib/notificaciones.ts`).
- **Épica 4 — Biblioteca de recursos** · `app/(dashboard)/recursos`,
  `lib/biblioteca.ts` (filtros por tipo, costo y rubro).
- **Épica 5 — IA y personalización** · `components/MentorChat.tsx`,
  `app/api/gemini/route.ts` (chatbot mentor con contexto del usuario).

## Estructura

```
app/
  (auth)/          login, register
  (dashboard)/     dashboard, roadmap, recursos, perfil, diagnostico
  api/             auth, register, diagnostico, roadmap, pivotaje, gemini
components/        diagnostico, roadmap, dashboard, recursos, MentorChat
lib/               prisma, gemini, roadmap-engine, catalogo, plantillas,
                   biblioteca, notificaciones, auth, session
prisma/            schema.prisma, seed.ts
```

## Notas de arquitectura

- La lógica del roadmap vive en `lib/roadmap-engine.ts`, **pura y testeable**
  independientemente del frontend.
- No se usa Neo4j en el MVP: el orden de etapas se modela con `orden: Int`.
- El conector de mercado laboral (Computrabajo/Bumeran) queda como trabajo futuro.
