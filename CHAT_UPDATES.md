# Opdateringer til Chat Funktionalitet

## 🎯 Hvad er blevet opdateret?

Kodebasen er nu opdateret til at bruge den nye database struktur med `thread_participants` tabellen. Dette giver bedre support for både 1-to-1 chats og gruppe chats.

---

## 📝 Ændringer i Database Struktur

### Før:
```sql
threads (thread_id, user_id, user_id_1, created_at)
messages (message_id, thread_id, user_id, messages_content, created_at)
```

### Efter:
```sql
threads (
  thread_id, 
  created_by_user_id, 
  thread_name, 
  thread_type, 
  created_at, 
  updated_at
)

thread_participants (
  thread_id, 
  user_id, 
  role, 
  joined_at, 
  last_read_at
)

messages (
  message_id, 
  thread_id, 
  user_id, 
  message_content,  -- Rettet fra messages_content
  created_at, 
  updated_at, 
  is_deleted
)
```

---

## 🔧 Backend Ændringer

### `routes/messages.js`
- ✅ Opdateret til at bruge `message_content` i stedet for `messages_content`
- ✅ Tilføjet `user_id` til alle messages
- ✅ Authorization tjekker nu via `thread_participants` i stedet for `user_id`/`user_id_1`
- ✅ Tilføjet ownership checks til update/delete operationer
- ✅ Tilføjet `updated_at` felt når beskeder opdateres

### `routes/threads.js`
- ✅ Opdateret til at bruge `created_by_user_id` i stedet for `user_id`
- ✅ Returnerer nu participants med thread data
- ✅ Create endpoint tager nu `participant_ids` array i stedet for `user_id_1`
- ✅ Understøtter både direct (1-to-1) og group chats
- ✅ Tilføjer automatisk alle deltagere til `thread_participants` tabellen
- ✅ Rollback hvis participants ikke kan tilføjes

---

## 💻 Frontend Ændringer

### `data/messages.js`
- ✅ `sendMessage()` bruger nu `user_id` i stedet for `sender_id`
- ✅ `transformMessages()` håndterer både `message_id` og `id` felter
- ✅ `getUserThreads()` henter nu threads via `thread_participants` tabellen
- ✅ `getOrCreateThread()` omskrevet til at bruge ny struktur:
  - Finder eksisterende direct threads ved at krydstjekke participants
  - Opretter automatisk participants når ny thread oprettes
  - Rollback hvis noget går galt

### `routes/OneToOneChatPage.jsx`
- ✅ Henter nu den anden bruger via `thread_participants` i stedet af `user_id`/`user_id_1`
- ✅ Tilføjet supabase import
- ✅ Dynamisk loading af participants når komponenten mounter

### `routes/ChatList.jsx`
- ✅ Opdateret til at hente participants for hver thread
- ✅ Finder den anden bruger korrekt via `thread_participants`
- ✅ Håndterer null/manglende participants

---

## 🚀 Nye Features (Klar til Brug)

Med den nye struktur kan du nu nemt implementere:

### 1. Gruppe Chats
```javascript
// Opret en gruppe chat med flere deltagere
const response = await fetch('/api/threads', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    participant_ids: [userId1, userId2, userId3],
    thread_name: "Min Gruppe",
    thread_type: "group"
  })
});
```

### 2. Roller i Threads
```javascript
// thread_participants.role kan være:
// - "member" (standard)
// - "admin" (gruppe administrator)
// Implementer custom rolle-baseret adgang senere
```

### 3. Ulæste Beskeder
```javascript
// Brug thread_participants.last_read_at til at tracke
// Opdater når brugeren åbner en chat:
await supabase
  .from('thread_participants')
  .update({ last_read_at: new Date().toISOString() })
  .eq('thread_id', threadId)
  .eq('user_id', userId);
```

---

## ⚠️ Breaking Changes

### API Ændringer:
1. **Create Thread endpoint**
   - Før: `{ user_id_1: "uuid" }`
   - Nu: `{ participant_ids: ["uuid"] }`

2. **Thread Response**
   - Før: Inkluderede `user_id` og `user_id_1`
   - Nu: Inkluderer `created_by_user_id` og `participants` array

### Database Ændringer:
1. `threads.user_id` → `threads.created_by_user_id`
2. `messages.messages_content` → `messages.message_content`
3. `threads.user_id_1` fjernet (brug `thread_participants`)

---

## 📋 Migration Checklist

- [ ] 1. **Backup database**
- [ ] 2. Kør migration script: `backend/migrations/001_fix_chat_structure.sql`
- [ ] 3. Verificer struktur efter migration
- [ ] 4. Test at eksisterende chats virker
- [ ] 5. Test at oprette nye chats virker
- [ ] 6. Test at sende beskeder virker
- [ ] 7. Opdater frontend deployment
- [ ] 8. Opdater backend deployment
- [ ] 9. Test i produktion

---

## 🧪 Test Scenarios

### 1. Test Eksisterende 1-to-1 Chat
```bash
# Hent dine threads
GET /api/threads/user/{yourUserId}

# Åbn en chat
GET /api/threads/{threadId}

# Send besked
POST /api/messages
{
  "thread_id": "...",
  "message_content": "Test message"
}
```

### 2. Test Opret Ny 1-to-1 Chat
```javascript
// Frontend
const thread = await getOrCreateThread(currentUserId, friendUserId);
// Skal enten finde eksisterende eller oprette ny med 2 participants
```

### 3. Test Opret Gruppe Chat
```bash
POST /api/threads
{
  "participant_ids": ["user-id-1", "user-id-2", "user-id-3"],
  "thread_name": "Test Gruppe",
  "thread_type": "group"
}
```

---

## 🐛 Troubleshooting

### Problem: "thread_participants table does not exist"
**Løsning:** Kør migration scriptet først

### Problem: "column messages_content does not exist"
**Løsning:** Migration scriptet retter dette, kør det

### Problem: Kan ikke se gamle beskeder
**Løsning:** Tjek at migration scriptet migrerede data korrekt fra `user_id`/`user_id_1` til `thread_participants`

### Problem: TypeError ved getOrCreateThread
**Løsning:** Sørg for at både frontend og backend er opdateret

---

## 📚 Relaterede Filer

- Migration: `/backend/migrations/001_fix_chat_structure.sql`
- Schema: `/schema.db`
- Backend Routes: 
  - `/backend/routes/messages.js`
  - `/backend/routes/threads.js`
- Frontend:
  - `/frontend/data/messages.js`
  - `/frontend/routes/OneToOneChatPage.jsx`
  - `/frontend/routes/ChatList.jsx`
  - `/frontend/components/Chat.jsx`
- API Docs: `/backend/API_DOCS.md`
