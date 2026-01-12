# LineUp - Komplet Eksamensguide

## 📚 Indholdsfortegnelse
1. [Projekt Oversigt](#projekt-oversigt)
2. [Teknologi Stack](#teknologi-stack)
3. [Arkitektur](#arkitektur)
4. [Database Design](#database-design)
5. [Authentication Flow](#authentication-flow)
6. [Chat System (Din Hovedopgave)](#chat-system)
7. [API Endpoints](#api-endpoints)
8. [Frontend Routing](#frontend-routing)
9. [Vigtige Koncepter](#vigtige-koncepter)
10. [Typiske Eksamensspørgsmål](#typiske-eksamensspørgsmål)

---

## 🎯 Projekt Oversigt

### Hvad er LineUp?
En social media platform for musikere, producere og andre i den nordiske musikindustri.
Formål: Gøre det lettere at finde samarbejdspartnere, netværke og vokse i et troværdigt miljø.

### Hvem lavede hvad?
- **Jimmi Larsen (dig)**: Chat system (1-til-1 og gruppe chat), onboarding flow
- **Omar Gaal**: Profiler, connections, genres & tags
- **Mikkel Ruby**: Posts/feed, root layout setup
- **Anders Flæng**: Collaborations, tags
- **Hani Zaghmout**: Profil visning

### Dit Ansvarsområde
Du har primært arbejdet med:
1. **Chat System** - Kompleks real-time chat med 1-til-1 og gruppe funktionalitet
2. **Onboarding** - Get started flow, signup, login
3. **Real-time Subscriptions** - Supabase websocket integration
4. **Data Layer** - messages.js med backend API integration

---

## 💻 Teknologi Stack

### Frontend
```
React 19 - UI bibliotek
React Router 7 - Routing med SSR support
TypeScript - Type safety
Tailwind CSS 4 - Utility-first styling
Vite 6 - Build tool og dev server
Supabase Client - Authentication og real-time
```

**Hvorfor React Router 7?**
- SSR (Server-Side Rendering) support
- Data loading med clientLoader/loader
- Type-safe routing
- Better developer experience end Router 6

**Hvorfor Vite over Create React App?**
- Meget hurtigere build times
- ESM-first approach
- Better HMR (Hot Module Replacement)
- Mindre bundle sizes

### Backend
```
Node.js 20+ - Runtime
Express.js 4 - Web framework
Supabase Client - Database queries og auth validation
Multer - File upload middleware
```

**Hvorfor Express?**
- Simpelt og veldokumenteret
- Store ecosystem af middleware
- Perfekt til REST APIs
- Nemt at deploye

### Database
```
Supabase PostgreSQL - Relational database
Row Level Security (RLS) - Database-level security
Realtime - WebSocket subscriptions
Storage - File hosting
```

**Hvorfor Supabase?**
- Built-in authentication
- Auto-generated REST API
- Real-time subscriptions
- Storage for billeder
- Gratis tier til development

---

## 🏗️ Arkitektur

### High-Level Oversigt
```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│  Port 5173  (Development)               │
└────────────┬────────────────────────────┘
             │
             │ HTTP Requests (Fetch API)
             │ + JWT Auth Headers
             │
┌────────────▼────────────────────────────┐
│      Backend (Express Server)           │
│  Port 3000  (Development)               │
│  - JWT Token Validation                 │
│  - Business Logic                       │
│  - API Endpoints                        │
└────────────┬────────────────────────────┘
             │
             │ Supabase Client SDK
             │ + Service Role Key
             │
┌────────────▼────────────────────────────┐
│      Supabase (PostgreSQL)              │
│  - Database Tables                      │
│  - Row Level Security                   │
│  - Authentication                       │
│  - Storage                              │
│  - Realtime (WebSockets)                │
└─────────────────────────────────────────┘
```

### Hybrid Approach
Vi bruger en **hybrid arkitektur**:

**Backend API bruges til:**
- Chat threads CRUD operationer
- Send beskeder
- Profil opdateringer
- Connections håndtering
- Posts og collaborations

**Direkte Supabase bruges til:**
- Authentication (signIn, signOut, getUser)
- Real-time subscriptions (chat beskeder)
- Nogle legacy queries (thread participants)
- File uploads til storage

**Hvorfor hybrid?**
- Backend giver server-side validation og sikkerhed
- Direkte Supabase er hurtigere for simple queries
- Real-time SKAL gå direkte til Supabase
- Gradvis migration: Vi konverterer løbende til backend

---

## 🗄️ Database Design

### Vigtigste Tabeller

#### profiles
Bruger profiler med musik information
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  displayname TEXT,
  user_image TEXT,
  bio TEXT,
  location TEXT,
  spotify_url TEXT,
  instagram TEXT,
  soundcloud TEXT,
  user_type TEXT CHECK (user_type IN ('musician', 'producer', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Vigtige punkter:**
- `id` er foreign key til Supabase auth.users
- One-to-one relation mellem auth user og profil
- `user_type` har constraint (kun 3 værdier tilladt)

#### threads
Chat samtaler (kan være 1-til-1 eller gruppe)
```sql
CREATE TABLE threads (
  thread_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id UUID REFERENCES profiles(id),
  group_name TEXT,
  group_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Vigtige punkter:**
- UUID auto-genereres med `gen_random_uuid()`
- `group_name` og `group_image` er NULL for 1-til-1 chats
- `created_by_user_id` tracker hvem der startede chatten

#### thread_participants
Many-to-many relation mellem threads og users
```sql
CREATE TABLE thread_participants (
  thread_id UUID REFERENCES threads(thread_id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'member',
  PRIMARY KEY (thread_id, user_id)
);
```

**Vigtige punkter:**
- Composite primary key (thread_id + user_id)
- `ON DELETE CASCADE`: Hvis thread slettes, slettes deltagere automatisk
- `role` kan udvides til admin/moderator i fremtiden

#### messages
Beskeder i threads
```sql
CREATE TABLE messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(thread_id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  message_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Vigtige punkter:**
- Hver besked tilhører én thread
- `ON DELETE CASCADE`: Hvis thread slettes, slettes beskeder
- `created_at` bruges til sorting (nyeste først)

#### connections
Venskaber/forbindelser mellem brugere
```sql
CREATE TABLE connections (
  connection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID REFERENCES profiles(id),
  user_id_2 UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT different_users CHECK (user_id_1 != user_id_2)
);
```

**Vigtige punkter:**
- Symmetrisk relation (begge retninger)
- Status flow: pending → accepted/rejected
- Constraint forhindrer self-connections

### Relationer
```
profiles (1) ──── (M) connections
profiles (1) ──── (M) thread_participants ──── (M) threads
threads (1) ──── (M) messages
profiles (1) ──── (M) messages
profiles (1) ──── (M) posts
posts (1) ──── (M) post_collaborators
```

---

## 🔐 Authentication Flow

### Hvordan virker authentication?

#### 1. Sign Up Flow
```
User → Frontend Form
  ↓
  signUp(email, password, username)
  ↓
  Supabase Auth API
  ↓
  Opret user i auth.users tabel
  ↓
  Trigger: auto_create_profile
  ↓
  Opret row i profiles tabel
  ↓
  Return JWT tokens (access_token + refresh_token)
  ↓
  Frontend gemmer i localStorage via Supabase client
```

#### 2. Sign In Flow
```
User → Login Form
  ↓
  signInWithPassword(email, password)
  ↓
  Supabase validerer credentials
  ↓
  Return session med JWT tokens
  ↓
  Frontend opdaterer AuthContext state
  ↓
  User redirectes til /feed
```

#### 3. API Request Flow
```
Frontend function (f.eks. sendMessage)
  ↓
  Hent access_token fra Supabase session
  ↓
  fetch('http://localhost:3000/api/messages', {
    headers: { Authorization: 'Bearer <access_token>' }
  })
  ↓
  Backend authenticate middleware
  ↓
  Kald supabase.auth.getUser(token)
  ↓
  Hvis valid: req.user = user, next()
  ↓
  Route handler kører med req.user.id
```

### JWT Token Forklaring

**Hvad er JWT?**
JSON Web Token - En signeret string der indeholder bruger info

**Token Struktur:**
```
eyJhbGc... (Header) . eyJzdWI... (Payload) . SflKxw... (Signature)
```

**Payload indeholder:**
```json
{
  "sub": "59871f03-e99c-4440-aaf3-fc197dbb8127",  // User ID
  "email": "user@example.com",
  "role": "authenticated",
  "iat": 1704891234,  // Issued at
  "exp": 1704894834   // Expires at (1 time fra iat)
}
```

**Hvorfor er det sikkert?**
- Signeret med secret key (kun Supabase kender denne)
- Kan ikke modificeres uden at signature bliver invalid
- Udløber efter 1 time (må fornyes med refresh_token)
- Valideres på serveren ved hver request

### Token Refresh
```
Access Token udløber efter 1 time
  ↓
  Supabase client detector udløb
  ↓
  Automatisk kald til refresh endpoint
  ↓
  Send refresh_token
  ↓
  Få ny access_token
  ↓
  Fortsæt uden at user mærker noget
```

---

## 💬 Chat System (Din Hovedopgave)

### Overordnet Flow

#### 1. Start New Chat (NewChatPage.jsx)
```
User klikker på "New Chat"
  ↓
  NewChatPage viser liste af venner
  ↓
  User klikker på en ven
  ↓
  handleFriendClick(friendId) kaldes
  ↓
  getOrCreateThread(myId, friendId)
  ↓
  API: POST /api/threads
  ↓
  Backend tjekker om thread allerede eksisterer:
    - Query thread_participants for begge user IDs
    - Hvis eksisterer: Return eksisterende thread
    - Hvis ikke: Opret ny thread + participants
  ↓
  Return thread_id
  ↓
  navigate(`/chat/${thread_id}`)
```

#### 2. Chat Interface (OneToOneChatPage.jsx)
```
Route: /chat/:threadId
  ↓
  clientLoader({ params }) kører
  ↓
  Hent thread data: GET /api/threads/:threadId
  ↓
  Hent beskeder: GET /api/messages/thread/:threadId
  ↓
  Return { thread, messages }
  ↓
  Component renderer med useLoaderData()
  ↓
  useEffect setup:
    1. Hent venner liste
    2. Hent current user profil
    3. Identificér "other user" i 1-til-1
    4. Setup Supabase realtime subscription
  ↓
  User ser chat interface
```

#### 3. Send Besked
```
User skriver besked i ChatInput
  ↓
  Tryk Enter eller Send knap
  ↓
  handleSendMessage(text) kaldes
  ↓
  Optimistic update: Tilføj besked til state med det samme
  ↓
  API call: POST /api/messages
  Body: { thread_id, message_content }
  ↓
  Backend:
    1. Validér token
    2. Insert i messages tabel
    3. Return den oprettede besked
  ↓
  Database trigger: Realtime notification sendes
  ↓
  Andre deltageres clients modtager beskeden via websocket
  ↓
  De opdaterer deres state og viser den nye besked
```

#### 4. Real-time Modtagelse
```
Supabase Realtime Channel setup i useEffect:
  ↓
  supabase.channel(`messages-${threadId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `thread_id=eq.${threadId}`
  }, (payload) => {
    // payload.new indeholder den nye besked
    setRawMessages(prev => [...prev, payload.new])
  })
  .subscribe()
```

### Gruppe Chat vs 1-til-1

**Hvordan beslutter vi type?**
```javascript
const participantCount = allParticipants.length;

if (participantCount <= 2) {
  // 1-til-1 chat
  // - Vis den anden persons navn som titel
  // - Brug deres avatar i header
  // - Ingen gruppe features
} else {
  // Gruppe chat  
  // - Vis gruppe navn (eller genereret fra deltagere)
  // - Vis gruppe ikon eller billede
  // - Vis afsender navn på hver besked
  // - Tillad redigering af gruppe navn/billede
}
```

**Add People Feature:**
```
1-til-1 chat → Klik "+" ikon → AddPeopleModal
  ↓
  Vælg flere venner
  ↓
  Klik "Add to conversation"
  ↓
  createGroupThread(myId, [otherId, ...selectedIds])
  ↓
  VIGTIGT: Vi opretter en NY thread (ikke modificerer eksisterende)
  ↓
  Hvorfor? Historik separation - 1-til-1 samtale forbliver privat
  ↓
  navigate(`/chat/${newThreadId}`)
```

### React Router 7 clientLoader

**Problem:**
React Router 7 introducerede "Single Fetch" mode som standard.
Loader functions forsøger at hente data via `.data` endpoints på serveren.

**Vores løsning:**
Brug `clientLoader` i stedet for `loader`:
```javascript
export async function clientLoader({ params }) {
  // Kører KUN på klienten
  // Undgår .data endpoint problemer
  // Kan kalde eksterne APIs direkte
  const thread = await getThread(params.threadId);
  return { thread };
}
```

**Fordele ved clientLoader:**
- Simpel integration med backend API
- Auth tokens let tilgængelige (localStorage)
- Ingen SSR kompleksitet
- Fungerer identisk under development og production

### Data Transformation

**Hvorfor transformere beskeder?**
Database data er ikke altid i det format UI komponenter forventer.

**Fra database:**
```javascript
{
  message_id: "uuid-1234",
  thread_id: "uuid-5678", 
  user_id: "uuid-9012",
  message_content: "Hello world",
  created_at: "2024-01-12T10:30:00Z"
}
```

**Til UI komponent:**
```javascript
{
  id: "uuid-1234",
  senderId: "uuid-9012",
  content: "Hello world",
  time: "10:30",
  isSent: true,  // true hvis fra current user
  avatar: "https://...",  // afsenders profilbillede
  senderName: "John Doe"  // kun for gruppe chats
}
```

**Transform funktioner:**
```javascript
// 1-til-1 chat
transformMessages(rawMessages, currentUserId, myAvatar, friendAvatar)

// Gruppe chat  
transformGroupMessages(rawMessages, currentUserId, participantsMap, myAvatar)
```

---

## 🔌 API Endpoints

### Threads Endpoints

#### POST /api/threads
Opret ny chat thread

**Request:**
```json
{
  "participant_ids": ["uuid1", "uuid2"],
  "group_name": "Optional group name"
}
```

**Response:**
```json
{
  "thread": {
    "thread_id": "uuid",
    "created_by_user_id": "uuid",
    "created_at": "2024-01-12T10:00:00Z",
    "group_name": null,
    "participants": ["uuid1", "uuid2", "uuid3"]
  }
}
```

#### GET /api/threads/user/:userId
Hent alle threads for en bruger

**Response:**
```json
{
  "threads": [
    {
      "thread_id": "uuid",
      "created_by_user_id": "uuid",
      "group_name": null,
      "last_message": {
        "content": "Last message text",
        "created_at": "2024-01-12T10:00:00Z"
      },
      "participants": [...]
    }
  ]
}
```

#### GET /api/threads/:threadId
Hent specifik thread med deltagere

**Response:**
```json
{
  "thread": {
    "thread_id": "uuid",
    "group_name": "My Group",
    "group_image": "https://...",
    "participants": [
      {
        "user_id": "uuid",
        "role": "member",
        "profiles": {
          "displayname": "John",
          "user_image": "https://..."
        }
      }
    ]
  }
}
```

#### DELETE /api/threads/:threadId
Slet en thread

**Auth:** Kun deltagere kan slette

**Response:**
```json
{
  "message": "Thread deleted successfully"
}
```

### Messages Endpoints

#### POST /api/messages
Send ny besked

**Request:**
```json
{
  "thread_id": "uuid",
  "message_content": "Hello world"
}
```

**Response:**
```json
{
  "messageData": {
    "message_id": "uuid",
    "thread_id": "uuid",
    "user_id": "uuid",
    "message_content": "Hello world",
    "created_at": "2024-01-12T10:00:00Z"
  }
}
```

#### GET /api/messages/thread/:threadId
Hent alle beskeder i en thread

**Response:**
```json
{
  "messages": [
    {
      "message_id": "uuid",
      "user_id": "uuid",
      "message_content": "Hello",
      "created_at": "2024-01-12T10:00:00Z"
    }
  ]
}
```

---

## 🛣️ Frontend Routing

### Route Struktur
```
/ (root.tsx)
├── /get-started (PublicLayout)
├── /login (PublicLayout)
├── /register (PublicLayout)
└── /app (ProtectedLayout) [Kræver login]
    ├── /feed
    ├── /create-post
    ├── /profile/:userId
    ├── /chat
    │   ├── / (ChatList)
    │   ├── /new (NewChatPage) 
    │   └── /:threadId (OneToOneChatPage)
    ├── /collaborations
    └── /settings
```

### Layout Hierarki
```
Root Layout (root.tsx)
  → Indeholder AuthProvider
  → Loader auth state
  → Beslutter PublicLayout vs ProtectedLayout

PublicLayout
  → Ingen navigation
  → Fuld-skærm pages
  → Redirect til /feed hvis logged in

ProtectedLayout
  → Navigation bar
  → Header med profil
  → Redirect til /login hvis ikke logged in
```

### ProtectedRoute Pattern
```javascript
// ProtectedRoute.jsx
export function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();
  
  if (initializing) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
```

### React Router 7 Features

**clientLoader:**
```javascript
export async function clientLoader({ params, request }) {
  // Kører på klienten før component render
  // Perfekt til at hente data fra API
  const data = await fetchData(params.id);
  return { data };
}

// I component:
const { data } = useLoaderData();
```

**useNavigate:**
```javascript
const navigate = useNavigate();

// Programmatisk navigation
navigate('/chat/uuid-1234');

// Med state
navigate('/chat/uuid', { state: { from: 'newchat' } });

// Replace (ingen history entry)
navigate('/login', { replace: true });
```

---

## 🧠 Vigtige Koncepter

### 1. React Hooks

**useState:**
```javascript
const [messages, setMessages] = useState([]);
// messages: Current state value
// setMessages: Function til at opdatere state

setMessages([...messages, newMessage]);  // Tilføj element
setMessages(prev => [...prev, newMessage]);  // Med previous state
```

**useEffect:**
```javascript
useEffect(() => {
  // Kører efter component render
  fetchData();
  
  // Cleanup function
  return () => {
    cleanup();
  };
}, [dependency]);  // Kør igen hvis dependency ændres
```

**useRef:**
```javascript
const inputRef = useRef(null);
// Persistent værdi mellem renders
// Ændrer ikke når opdateret (ingen re-render)

// Brug til DOM references:
<input ref={inputRef} />
inputRef.current.focus();
```

**useContext:**
```javascript
const { user, signOut } = useAuth();
// Få adgang til global state fra Context
// Ingen prop drilling nødvendig
```

### 2. Async/Await

**Hvad er det?**
Syntactic sugar over Promises for at skrive asynkron kode synchront-agtig.

**Før async/await:**
```javascript
function fetchData() {
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(error => {
      console.error(error);
    });
}
```

**Med async/await:**
```javascript
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}
```

**Vigtige regler:**
- `await` kan kun bruges inde i `async` function
- `await` pauser execution indtil Promise resolver
- Brug `try/catch` til error handling
- `async` function returnerer altid en Promise

### 3. REST API Design

**HTTP Methods:**
- `GET` - Hent data (ingen body)
- `POST` - Opret ny resource (med body)
- `PUT` - Opdater hele resource (med body)
- `PATCH` - Opdater dele af resource (med body)
- `DELETE` - Slet resource (ingen body)

**Status Codes:**
- `200 OK` - Success med data
- `201 Created` - Resource oprettet
- `204 No Content` - Success uden data
- `400 Bad Request` - Ugyldig request data
- `401 Unauthorized` - Mangler eller invalid auth
- `403 Forbidden` - Auth ok men ikke tilladelse
- `404 Not Found` - Resource findes ikke
- `500 Internal Server Error` - Server fejl

**JSON Response Format:**
```javascript
// Success:
{
  "thread": { ...data },
  "message": "Optional success message"
}

// Error:
{
  "error": "Human readable error message",
  "code": "ERROR_CODE"  // Optional
}
```

### 4. WebSockets vs HTTP

**HTTP (Request-Response):**
```
Client: "Hej server, giv mig data"
Server: "Her er data"
[Connection lukkes]

Client: "Hej igen, er der nyt?"
Server: "Nej, intet nyt"
[Connection lukkes]
```

**WebSocket (Persistent Connection):**
```
Client: "Hej server, hold forbindelsen åben"
Server: "Ok, connected"
[Connection forbliver åben]

Server: "Her er ny data!" [Når noget sker]
Client: "Modtaget, opdaterer UI"

Server: "Her er mere data!" [Later]
Client: "Cool, opdaterer igen"
```

**Hvornår bruge hvad:**
- HTTP: Standard API calls, CRUD operations
- WebSocket: Real-time updates, chat, live feeds

### 5. Row Level Security (RLS)

**Hvad er RLS?**
Database-level security policies i PostgreSQL.
Sikrer at brugere kun kan se/ændre deres egen data.

**Eksempel Policy:**
```sql
-- Users kan kun læse beskeder fra threads de er deltager i
CREATE POLICY "Users can read messages from their threads"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM thread_participants
    WHERE thread_id = messages.thread_id
    AND user_id = auth.uid()
  )
);
```

**RLS i vores projekt:**
- Nogle policies er disabled under development
- Backend validerer adgang i stedet
- Best practice: Brug begge lag (defense in depth)

### 6. Environment Variables

**Hvad er de?**
Secrets og configuration der IKKE skal i git.

**Frontend (.env):**
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=http://localhost:3000
```

**Backend (.env):**
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # SECRET!
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Vigtigt:**
- `.env` er i `.gitignore`
- VITE_ prefix kræves for Vite
- Service role key KUN i backend (fuld database adgang)

---

## ❓ Typiske Eksamensspørgsmål

### Arkitektur & Design

**Q: "Hvorfor har I både en backend og Supabase?"**

A: "Supabase giver os authentication og database, men backend giver ekstra fordele:
1. **Server-side validation** - Vi validerer JWT tokens på serveren før database adgang
2. **Business logic** - Komplekse operationer som 'find or create thread' håndteres på serveren
3. **Data aggregation** - Vi kan kombinere flere database queries i ét API endpoint
4. **Fejlhåndtering** - Centraliseret logging og konsistent error responses
5. **Fremtidssikring** - Hvis vi skifter database provider, skal frontend ikke ændres

Nogle ting kører stadig direkte til Supabase fordi:
- Real-time subscriptions KAN kun gå direkte til Supabase
- Simple queries er hurtigere uden mellemled
- Vi er i gang med gradvis migration til backend"

**Q: "Forklar jeres database struktur"**

A: "Vi har en relational database med flere nøgle tabeller:

1. **profiles** - One-to-one med Supabase auth.users. Indeholder ekstra bruger info som ikke passer i auth systemet.

2. **connections** - Many-to-many relation mellem brugere. Symmetrisk (begge veje). Status kan være pending/accepted/rejected.

3. **threads** - Repræsenterer chat samtaler. Kan være 1-til-1 eller gruppe.

4. **thread_participants** - Junction table mellem threads og profiles. Many-to-many. Hver deltager har en role.

5. **messages** - Tilhører én thread, sendt af én bruger. ON DELETE CASCADE betyder hvis thread slettes, slettes beskeder automatisk.

Vigtige design beslutninger:
- UUID primary keys (sikkerhed + distribution)
- Foreign key constraints sikrer data integritet
- Timestamps på alt for audit log
- Check constraints på enums (status, user_type osv)"

### Chat System

**Q: "Hvordan virker real-time chat?"**

A: "Vi bruger Supabase Realtime som er bygget på PostgreSQL's LISTEN/NOTIFY og sender over WebSockets.

Flow:
1. I useEffect setup'er vi en channel: `supabase.channel('messages-123')`
2. Vi subscriber til INSERT events på messages tabellen
3. Vi filtrerer kun events for vores thread_id
4. Når en ny besked indsættes i databasen, trigger PostgreSQL en NOTIFY event
5. Supabase sender eventet via WebSocket til alle subscribere
6. Vores callback modtager payload.new med den nye besked
7. Vi tjekker om det er fra en anden bruger (undgå duplicates fra vores egen optimistic update)
8. Tilføj til state: `setMessages(prev => [...prev, payload.new])`
9. React re-renderer og viser den nye besked

Fordele ved denne approach:
- True real-time (ingen polling)
- Efficient (kun data der ændres sendes)
- Scalable (Supabase håndterer connection pooling)
- Automatic reconnection ved network issues"

**Q: "Hvordan forhindrer I duplicate threads mellem samme personer?"**

A: "I `getOrCreateThread()` tjekker vi først om en thread allerede eksisterer:

```javascript
// 1. Hent alle threads hvor user1 er deltager
const { data: threads } = await supabase
  .from('thread_participants')
  .select('thread_id')
  .eq('user_id', user1Id);

// 2. For hver thread, tjek om user2 også er deltager
for (const thread of threads) {
  const { data: participant } = await supabase
    .from('thread_participants')
    .select('user_id')
    .eq('thread_id', thread.thread_id)
    .eq('user_id', user2Id)
    .single();
  
  if (participant) {
    return thread;  // Eksisterende thread fundet
  }
}

// 3. Hvis ingen fundet, opret ny thread
```

Dette sikrer at du ikke får 3 forskellige chats med samme person.
For gruppechats tillader vi duplicates fordi deltagerlisten kan være forskellig."

### React & Frontend

**Q: "Hvad er forskellen på props og state?"**

A: "Props og state er begge ways to håndtere data i React, men de bruges forskelligt:

**Props (Properties):**
- Data sendt fra parent til child component
- Read-only (immutable)
- Kan ikke ændres af child component
- Bruges til at konfigurere komponenter
```javascript
<ChatMessage text='Hello' isSent={true} />
```

**State:**
- Data der tilhører én component
- Kan ændres via setState
- Når state ændres, re-renderer component
- Bruges til data der ændrer sig over tid
```javascript
const [messages, setMessages] = useState([]);
```

**State lifting:**
Når flere components skal dele state, løft den til fælles parent:
```javascript
// Parent har state
const [user, setUser] = useState(null);

// Children får via props
<Header user={user} />
<Profile user={user} />
```

**Eksempel fra vores chat:**
- `messages` er state i OneToOneChatPage
- `messages` sendes som prop til ChatMessages component
- ChatMessages kan vise dem men ikke ændre dem
- Kun OneToOneChatPage kan ændre via setMessages"

**Q: "Hvad er useEffect dependency array?"**

A: "Dependency array kontrollerer HVORNÅR useEffect kører:

```javascript
// Kører ved HVER render
useEffect(() => {
  console.log('Every render');
});

// Kører KUN ved mount (én gang)
useEffect(() => {
  console.log('Only on mount');
}, []);

// Kører når 'count' ændres
useEffect(() => {
  console.log('Count changed:', count);
}, [count]);

// Kører når 'user' ELLER 'threadId' ændres
useEffect(() => {
  fetchMessages(threadId, user.id);
}, [user, threadId]);
```

**Almindelige fejl:**
- Glemme dependency → stale closures (gammel data)
- For mange dependencies → infinite loops
- Objekter i dependencies → re-kører hver gang (brug useMemo)

**Best practice:**
Inkludér ALLE variabler brugt inde i effect.
ESLint plugin fortæller dig hvis du glemmer noget."

### Authentication & Security

**Q: "Hvordan sikrer I at brugere kun kan læse deres egne beskeder?"**

A: "Vi har multiple lag af sikkerhed:

**1. Backend Middleware (Første lag):**
```javascript
// authenticate middleware validerer token
const { data: { user } } = await supabase.auth.getUser(token);
req.user = user;  // Nu ved vi hvem brugeren er
```

**2. Endpoint Validation (Andet lag):**
```javascript
// I /api/messages/thread/:threadId
// Tjek at bruger er deltager i thread
const { data: participant } = await supabase
  .from('thread_participants')
  .select('user_id')
  .eq('thread_id', threadId)
  .eq('user_id', req.user.id)
  .single();

if (!participant) {
  return res.status(403).json({ error: 'Not authorized' });
}
```

**3. Database RLS (Tredje lag - disabled pt.):**
```sql
CREATE POLICY 'users_messages'
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM thread_participants 
    WHERE thread_id = messages.thread_id 
    AND user_id = auth.uid()
  )
);
```

Dette kaldes 'defense in depth' - multiple lag så hvis ét fejler, beskytter de andre stadig."

**Q: "Hvad er forskellen på authentication og authorization?"**

A: "**Authentication** = WHO are you?
Bekræfter identitet. Handler om login, passwords, tokens.
'Jeg er Jimmi Larsen' → Vis mig dit JWT token!

**Authorization** = WHAT can you do?
Checker tilladelser efter login.
'Du er Jimmi, men må du slette denne post?'

**I vores system:**

Authentication:
- Supabase Auth håndterer login/signup
- JWT tokens udstedes efter login
- Tokens valideres i backend middleware

Authorization:  
- Checker om du er deltager i thread før du kan læse beskeder
- Checker om du oprettede posten før du kan slette den
- Checker connection status før du kan sende DM

Eksempel fra threads.js:
```javascript
// Authentication: Er du logged in?
router.delete('/:threadId', authenticate, async (req, res) => {
  
  // Authorization: Er du deltager i denne thread?
  const { data: participant } = await supabase
    .from('thread_participants')
    .eq('thread_id', threadId)
    .eq('user_id', req.user.id)  // <-- req.user fra authenticate
    .single();
  
  if (!participant) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Nu må du slette
});
```"

### Performance & Optimization

**Q: "Hvordan optimerer I performance i chatten?"**

A: "Flere strategier:

**1. Optimistic Updates:**
Når du sender en besked, viser vi den med det samme uden at vente på server:
```javascript
setMessages(prev => [...prev, {
  id: 'temp-' + Date.now(),
  content: newMessage,
  isSent: true
}]);

await sendMessage(newMessage);
```

**2. Pagination (ikke implementeret endnu):**
Load kun de seneste 50 beskeder først, så load mere når man scroller op.

**3. Memo-ization:**
```javascript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

**4. Lazy Loading:**
Chat komponenter loades kun når du åbner chatten, ikke ved app start.

**5. Debouncing:**
Ved søgning venter vi med at kalde API indtil bruger holder op med at skrive:
```javascript
const debouncedSearch = debounce(searchFunction, 300);
```

**6. Connection Pooling:**
Supabase client genanvender connections i stedet for at oprette ny hver gang.

**Ting vi KUNNE optimere mere:**
- Virtual scrolling for lange besked lister
- Image lazy loading og compression
- Service Worker for offline support
- IndexedDB cache for beskeder"

### Debugging & Testing

**Q: "Hvordan debugger du når noget ikke virker?"**

A: "Systematisk approach:

**1. Console Logs:**
```javascript
console.log('🔍 Function called with:', params);
console.log('📋 Data received:', data);
console.error('❌ Error:', error);
```
Emoji gør det nemt at scanne logs!

**2. Network Tab:**
- Tjek om API kald succeeder (status 200)
- Se request/response data
- Checker headers (har vi auth token?)

**3. React DevTools:**
- Inspector props og state
- Se component hierarchi
- Profiler performance issues

**4. Supabase Dashboard:**
- Tjek om data faktisk er i database
- Se SQL queries der køres
- Tjek RLS policies

**5. Backend Logs:**
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});
```

**Typisk debug flow:**
1. Hvilken komponent fejler?
2. Hvilken function kalder fejl?
3. Hvilket API endpoint kaldes?
4. Returner backend success eller error?
5. Hvis error, er det auth, validation eller database?
6. Tjek database direkte - er data der?"

---

## 📝 Samlet Cheat Sheet

### React Hooks
```javascript
// State
const [value, setValue] = useState(initial);

// Effect
useEffect(() => {
  // Do something
  return () => cleanup();
}, [deps]);

// Ref
const ref = useRef(initialValue);

// Context
const value = useContext(MyContext);

// Memo
const memoized = useMemo(() => compute(), [deps]);

// Callback
const memoizedFn = useCallback(() => {}, [deps]);
```

### Supabase Client
```javascript
// Auth
const { data, error } = await supabase.auth.signUp({ email, password });
const { data } = await supabase.auth.getSession();
const { data } = await supabase.auth.getUser(token);
await supabase.auth.signOut();

// Database
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('column', value)
  .single();

const { data, error } = await supabase
  .from('table')
  .insert({ column: value });

const { data, error } = await supabase
  .from('table')
  .update({ column: value })
  .eq('id', id);

const { data, error } = await supabase
  .from('table')
  .delete()
  .eq('id', id);

// Realtime
const channel = supabase
  .channel('channel-name')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    console.log(payload.new);
  })
  .subscribe();
```

### Fetch API
```javascript
// GET
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await response.json();

// POST
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ data })
});
```

### Express Routes
```javascript
// GET
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  res.json({ data });
});

// POST
router.post('/', authenticate, async (req, res) => {
  const { field } = req.body;
  res.status(201).json({ created });
});

// Error handling
try {
  // ...
} catch (error) {
  console.error(error);
  res.status(500).json({ error: error.message });
}
```

---

## 🎯 Hvad skal du kunne forklare?

### Must-know (Vigtigst):
1. ✅ Chat system flow (start til slut)
2. ✅ Real-time subscriptions (hvordan og hvorfor)
3. ✅ Database struktur og relationer
4. ✅ Authentication flow (JWT tokens)
5. ✅ React hooks (useState, useEffect, useContext)
6. ✅ API design (REST endpoints)
7. ✅ Frontend/backend arkitektur

### Should-know (Godt at have):
1. Row Level Security (RLS)
2. React Router 7 clientLoader
3. Optimistic updates
4. Error handling strategies
5. Environment variables
6. CORS og hvorfor det matters
7. WebSocket vs HTTP

### Nice-to-know (Bonus points):
1. Performance optimization
2. TypeScript benefits
3. Tailwind CSS approach
4. Git workflow
5. Deployment process
6. Testing strategies
7. Future improvements

---

## 💡 Tips til Eksamen

### Før eksamen:
1. ✅ Læs denne guide igennem 2-3 gange
2. ✅ Kør projektet lokalt og test alle features
3. ✅ Åbn OneToOneChatPage.jsx og læs alle kommentarer
4. ✅ Tegn database diagram på et stykke papir
5. ✅ Øv dig i at forklare authentication flow højt
6. ✅ Test at sende en besked og se den i database
7. ✅ Se Supabase Realtime virke i praksis

### Under eksamen:
1. ✅ Tag det roligt - du VED det her!
2. ✅ Brug whiteboardet til at tegne flows
3. ✅ Vis kode i projektet når du forklarer
4. ✅ Forklar hvorfor I har truffet beslutninger, ikke kun hvad
5. ✅ Hvis du ikke ved noget, sig det og gæt kvalificeret
6. ✅ Brug tekniske termer korrekt (JWT, WebSocket, RLS osv)
7. ✅ Giv konkrete eksempler fra jeres implementation

### Gode åbninger:
- "Lad mig tegne det på tavlen..."
- "Det bedste eksempel er her i koden..."
- "Vi valgte denne løsning fordi..."
- "Fordelen ved denne tilgang er..."
- "Hvis jeg skulle gøre det igen, ville jeg..."

### Undgå:
- ❌ "Det ved jeg ikke" (sig i stedet "Det er ikke noget jeg har arbejdet med, men min forståelse er...")
- ❌ At mumle eller tale for hurtigt
- ❌ At læse direkte fra kode uden at forklare
- ❌ At springe over til nye emner før det første er forklaret
- ❌ At sige "det er bare sådan React virker" - forklar HVORFOR

---

## 🚀 Held og lykke!

Du har bygget et super fedt projekt med kompleks real-time funktionalitet.
Du VED hvordan chat systemet virker fordi DU har bygget det.
Vær stolt af dit arbejde og forklar det med selvtillid!

**Remember:**
- Chat er din stærkeste del - start der hvis du kan
- Tegn diagrammer - de hjælper både dig og censor
- Vær konkret - "Her i linje 150 ser du hvordan vi..."
- Det er ok at sige "det ved jeg ikke 100%, men..."

**Du har styr på det! 💪**
