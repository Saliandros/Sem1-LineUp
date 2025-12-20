# Mojah Web Consulting – Frontend

Dette repo indeholder frontend‑delen af *Mojah Web Consulting*, en moderne webapplikation bygget som en single‑page application med React Router.  
Applikationen understøtter onboarding, brugerprofiler, noter, service‑oversigt samt chat mellem brugere.

---

## Tech stack

- React 19 + React Router 7
- TypeScript
- Vite
- Tailwind CSS
- Supabase (`@supabase/supabase-js`) til data og auth
- Axios til HTTP‑kald

---

## Funktioner

- **Onboarding & auth**
  - `get-started`, `login`, `register` sider
- **Brugerprofil**
  - Visning og redigering af profil (`/profile`, `/edit-profile`)
- **Noter & indhold**
  - Noter‑oversigt (`/notes`)
  - Opret indhold via `/create`:
    - `/create/note`
    - `/create/story`
    - `/create/request`
- **Services**
  - Services oversigt (`/services`)
- **Chat**
  - Chat‑liste (`/chat`)
  - Opret ny chat (`/chat/new`)
  - Gruppechat (`/chat/group`)
  - 1‑til‑1 chat (`/chat/:threadId`)
- **Layouts & navigation**
  - Offentlige sider gennem `PublicLayout`
  - Beskyttede sider gennem `ProtectedLayout` og `Root` layout

---

## Kom i gang

### Forudsætninger

- Node.js (anbefalet: version 20+)
- npm (installeres normalt sammen med Node)

### Installation

Installer dependencies:

```bash
npm install
