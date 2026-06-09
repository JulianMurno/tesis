# MentorIT — Prompt de desarrollo

## Contexto del proyecto

MentorIT es una plataforma EdTech orientada a estudiantes y profesionales de LATAM que buscan insertarse o reconvertirse al sector IT. El problema central que resuelve es la "parálisis por análisis": hay demasiados recursos educativos desestructurados y sin orientación personalizada. MentorIT genera roadmaps de aprendizaje dinámicos y personalizados según el perfil psicométrico, disponibilidad horaria y estilo de aprendizaje del usuario.

---

## Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend + Backend | Next.js 14 (App Router) | Unifica todo en un solo proyecto. Ideal para MVP y tesis. |
| Estilos | Tailwind CSS | UI moderna y responsiva sin overhead de configuración. |
| Base de datos | PostgreSQL | Relacional, robusto, fácil de visualizar con herramientas como TablePlus. |
| ORM | Prisma | Tipado, migraciones simples, compatible con Next.js. |
| Autenticación | NextAuth.js | Login con email/contraseña o Google. |
| IA | Google Gemini API (gemini-1.5-flash) | Personalización de roadmaps y diagnóstico vocacional. |
| Entorno local | Docker Compose | Levanta PostgreSQL localmente sin instalación manual. |

> **Mejora futura (no MVP):** Neo4j para representar el roadmap como grafo de dependencias de conocimiento.

---

## Estructura del proyecto

```
mentorit/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── roadmap/page.tsx
│   │   ├── recursos/page.tsx
│   │   └── perfil/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── diagnostico/route.ts
│   │   ├── roadmap/route.ts
│   │   └── gemini/route.ts
│   └── layout.tsx
├── components/
│   ├── diagnostico/
│   ├── roadmap/
│   ├── dashboard/
│   └── ui/
├── lib/
│   ├── prisma.ts
│   ├── gemini.ts
│   └── roadmap-engine.ts
├── prisma/
│   └── schema.prisma
├── public/
├── .env.local
└── docker-compose.yml
```

---

## Modelo de base de datos (Prisma Schema)

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  createdAt       DateTime  @default(now())
  perfil          Perfil?
  roadmap         Roadmap?
}

model Perfil {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])

  // Épica 1: Diagnóstico
  personalidad      Json?    // Resultado Big Five / RIASEC
  hardSkills        Json?    // Resultado del check técnico
  hobbies           String[] // Lista de intereses seleccionados
  modalidad         String   // "academico" | "autodidacta" | "hibrido"

  // Épica 2: Disponibilidad
  horasSemanales    Int?
  diasEstudio       String[] // ["lunes", "miercoles", "viernes"]

  // Épica 3: Rubro IT elegido
  rubroIT           String?  // "desarrollo" | "infraestructura" | "datos" | "gestion"
  subRubro          String?  // "web" | "mobile" | "gamedev" | "devops" | etc.

  // Preferencia de costo
  preferenciaCosto  String   @default("mixto") // "gratis" | "pago" | "mixto"
}

model Roadmap {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  etapas      Etapa[]
  progreso    Int      @default(0)
  creadoEn    DateTime @default(now())
  actualizadoEn DateTime @updatedAt
}

model Etapa {
  id          String    @id @default(cuid())
  roadmapId   String
  roadmap     Roadmap   @relation(fields: [roadmapId], references: [id])
  titulo      String
  descripcion String
  orden       Int
  completada  Boolean   @default(false)
  recursos    Recurso[]
  micrometas  Micrometa[]
}

model Micrometa {
  id          String   @id @default(cuid())
  etapaId     String
  etapa       Etapa    @relation(fields: [etapaId], references: [id])
  titulo      String
  fechaLimite DateTime?
  completada  Boolean  @default(false)
}

model Recurso {
  id          String   @id @default(cuid())
  etapaId     String
  etapa       Etapa    @relation(fields: [etapaId], references: [id])
  titulo      String
  url         String
  tipo        String   // "video" | "articulo" | "repositorio" | "curso"
  costo       String   // "gratis" | "pago"
  modalidad   String   // "academico" | "autodidacta" | "hibrido"
}
```

---

## Épicas y funcionalidades a implementar

### ÉPICA 1 — Diagnóstico y perfil de usuario
**Objetivo:** Descubrir quién es el usuario antes de recomendarle un camino.

- **Test de personalidad (Big Five / RIASEC):** Formulario multi-paso con preguntas adaptadas al contexto IT latinoamericano. Al finalizar, calcular el perfil dominante y guardarlo en `Perfil.personalidad`.
- **Check de hard skills:** Mini-tests técnicos de opción múltiple (ej. "¿Qué es una variable?", "¿Qué hace un `SELECT`?"). Validar conocimientos previos para no empezar desde cero innecesariamente.
- **Análisis de hobbies:** Selección de intereses visuales (gaming → GameDev, lógica/orden → QA o Backend, diseño → Frontend/UX). Guardar en `Perfil.hobbies`.
- **Selección de modalidad de aprendizaje:** El usuario elige entre Académico, Autodidacta o Híbrido. Define qué tipo de recursos se priorizarán en el roadmap.

### ÉPICA 2 — Generación de roadmaps dinámicos
**Objetivo:** Construir la ruta de aprendizaje personalizada desde cero hasta empleabilidad.

- **Generador de roadmaps:** Función en `lib/roadmap-engine.ts` que, a partir del perfil completo del usuario, genera un array de etapas ordenadas con sus recursos. Usar Gemini API para personalizar el contenido y los textos.
- **Mapeo a rubros IT:** Derivar al usuario hacia una de las cuatro categorías: Desarrollo (Web, Mobile, GameDev), Infraestructura (Soporte, DevOps, Cloud), Datos (Analista, Científico de Datos, IA), Gestión y Educación (Product Manager, Profesor IT).
- **Gestión de disponibilidad horaria (time-blocking):** El usuario ingresa cuántas horas semanales tiene y qué días estudia. El sistema divide el roadmap en micro-metas con fechas límite ajustadas a ese calendario.
- **Simulador de pivotaje:** Función que compara dos roadmaps (rama actual vs. rama destino) y muestra qué etapas ya completadas son transferibles. Ej: Frontend → Mobile reutiliza JavaScript y lógica de componentes.

### ÉPICA 3 — Experiencia de usuario y gamificación
**Objetivo:** Mantener la motivación del usuario a lo largo del proceso.

- **Dashboard principal:** Panel con porcentaje de progreso general, próximas micro-metas con fechas, racha de días de estudio activos y estadísticas básicas (etapas completadas, recursos visitados).
- **Visualizador estilo Duolingo:** Interfaz visual del roadmap como un "camino" con nodos/etapas. Cada etapa tiene un estado: bloqueada, disponible, en progreso, completada. Usar íconos o badges por nivel alcanzado.
- **Sistema de notificaciones:** Recordatorios visuales dentro de la app cuando hay micro-metas próximas a vencer o cuando el usuario lleva días sin actividad.

### ÉPICA 4 — Biblioteca de recursos
**Objetivo:** Centralizar contenidos de calidad filtrados por el perfil del usuario.

- **Biblioteca curada:** Sección de recursos filtrable por tipo (video, artículo, repositorio), costo (gratis/pago) y modalidad. Los recursos se asocian a etapas del roadmap pero también son explorables independientemente.
- **Filtro de costo de inversión:** Al generar el roadmap, el usuario puede elegir "Solo recursos gratuitos", "Incluir recursos de pago" o "Sin preferencia". El sistema filtra en consecuencia.
- **Conector de mercado laboral (fase futura):** Integración con la API de Computrabajo o Bumeran para mostrar cuántas vacantes activas hay en Argentina para el rubro que el usuario está cursando.

### ÉPICA 5 — IA y personalización
**Objetivo:** Usar Gemini para adaptar el contenido y acompañar al usuario.

- **IA Mentor (chatbot):** Widget de chat flotante disponible en todas las páginas. El contexto enviado a Gemini incluye el perfil del usuario y la etapa actual del roadmap. Permite hacer preguntas del tipo "¿Qué es una API REST?" o "¿Debería cambiarme a Mobile?".
- **Personalización del roadmap por IA:** En lugar de roadmaps estáticos predefinidos, llamar a Gemini con el perfil completo del usuario y recibir un roadmap estructurado en JSON que se persiste en la base de datos.
- **Recomendaciones de re-enrutamiento:** La IA analiza el progreso del usuario (etapas sin completar, tiempo sin actividad, cambios de interés) y sugiere ajustar la ruta activa.

---

## Instrucciones para Gemini API

### Prompt base para generación de roadmap

```typescript
// lib/gemini.ts
const prompt = `
Eres MentorIT, un sistema experto en orientación vocacional IT para LATAM.

Dado el siguiente perfil de usuario, genera un roadmap de aprendizaje estructurado en JSON.

PERFIL:
- Personalidad (RIASEC): ${perfil.personalidad}
- Habilidades previas: ${perfil.hardSkills}
- Hobbies: ${perfil.hobbies.join(", ")}
- Rubro IT elegido: ${perfil.rubroIT} / ${perfil.subRubro}
- Modalidad de aprendizaje: ${perfil.modalidad}
- Horas semanales disponibles: ${perfil.horasSemanales}
- Días de estudio: ${perfil.diasEstudio.join(", ")}
- Preferencia de costo: ${perfil.preferenciaCosto}

INSTRUCCIONES:
1. Genera entre 5 y 8 etapas ordenadas desde nivel cero hasta empleabilidad.
2. Cada etapa debe tener título, descripción breve y entre 2 y 4 recursos reales.
3. Los recursos deben ser gratuitos si preferenciaCosto es "gratis".
4. Usa español de Argentina. Sé concreto y directo.
5. Responde ÚNICAMENTE con un JSON válido con esta estructura:

{
  "etapas": [
    {
      "titulo": "string",
      "descripcion": "string",
      "orden": number,
      "recursos": [
        {
          "titulo": "string",
          "url": "string",
          "tipo": "video|articulo|repositorio|curso",
          "costo": "gratis|pago"
        }
      ]
    }
  ]
}
`;
```

### Prompt base para el chatbot mentor

```typescript
const systemPrompt = `
Eres el mentor de IA de MentorIT. Ayudás a estudiantes de LATAM a aprender tecnología.

Contexto del usuario:
- Nombre: ${user.name}
- Rubro IT: ${perfil.rubroIT} / ${perfil.subRubro}
- Etapa actual: ${etapaActual.titulo}
- Progreso general: ${roadmap.progreso}%

Respondé siempre en español argentino. Sé claro, motivador y concreto.
Si el usuario pregunta sobre cambiar de rama, usá el simulador de pivotaje para comparar.
`;
```

---

## Variables de entorno (.env.local)

```env
# Base de datos
DATABASE_URL="postgresql://mentorit:password@localhost:5432/mentorit_db"

# NextAuth
NEXTAUTH_SECRET="tu_secret_aqui"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Gemini
GEMINI_API_KEY="tu_api_key_aqui"
```

---

## Docker Compose (base de datos local)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: mentorit
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mentorit_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## Comandos para arrancar

```bash
# 1. Clonar e instalar
git clone <repo>
cd mentorit
npm install

# 2. Levantar la base de datos
docker compose up -d

# 3. Crear las tablas
npx prisma migrate dev --name init

# 4. Variables de entorno
cp .env.example .env.local
# Completar GEMINI_API_KEY y NEXTAUTH_SECRET

# 5. Correr en desarrollo
npm run dev
```

---

## Fases de desarrollo (según tesis)

| Fase | Contenido | Épicas involucradas |
|---|---|---|
| 1 — Investigación | Validar modelos psicométricos. Definir los rubros IT y sus roadmaps base. | — |
| 2 — UX/UI | Wireframes del flujo de diagnóstico y visualizador de roadmap. | Épica 3 |
| 3 — MVP | Test de diagnóstico funcional + generación de roadmap estático. | Épicas 1 y 2 |
| 4 — IA y dinamismo | Integrar Gemini, time-blocking y curación de recursos. | Épicas 2, 4 y 5 |
| 5 — Pruebas | Testing con usuarios reales. Medir efectividad de la orientación. | Todas |

---

## Notas de arquitectura

- **No implementar Neo4j en el MVP.** El roadmap como grafo es una mejora interesante para representar dependencias de conocimiento, pero agrega complejidad innecesaria para la tesis. PostgreSQL con relaciones ordenadas (`orden: Int`) es suficiente.
- **El conector de mercado laboral** requiere acceso a APIs externas (Computrabajo, Bumeran). Dejarlo como propuesta de trabajo futuro en la tesis si no hay tiempo.
- **La API de Gemini** tiene capa gratuita generosa. Usar `gemini-1.5-flash` para mantener costos bajos durante el desarrollo.
- **Separar la lógica del roadmap** en `lib/roadmap-engine.ts` para que pueda testearse independientemente del frontend.
