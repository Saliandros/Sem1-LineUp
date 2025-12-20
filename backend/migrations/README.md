# Database Migration Guide

## Migration: 001_fix_chat_structure.sql

### Hvad rettes?

1. **messages tabel**
   - ❌ `messages_content timestamp` → ✅ `message_content text`
   - ✅ Tilføjer `updated_at` og `is_deleted` kolonner
   - ✅ Ændrer `created_at` fra `date` til `timestamp`
   - ✅ Tilføjer CASCADE delete på foreign keys

2. **threads tabel**
   - ❌ `user_id` → ✅ `created_by_user_id` (tydeligere navn)
   - ❌ Fjerner `group_id` (bruges ikke)
   - ✅ Tilføjer `thread_name` (til gruppe chats)
   - ✅ Tilføjer `thread_type` ('direct' eller 'group')
   - ✅ Tilføjer `updated_at`

3. **thread_participants tabel**
   - ❌ `role uuid` → ✅ `role varchar(20) DEFAULT 'member'`
   - ✅ Tilføjer `last_read_at` (til ulæste beskeder funktion)
   - ✅ Tilføjer CASCADE delete på foreign keys

### Før du kører migrationen

1. **BACKUP DIN DATABASE!**
   ```bash
   # Hvis du bruger Supabase, tag et snapshot via dashboard
   # Eller eksporter data:
   pg_dump -U postgres -h [your-host] -d [your-db] > backup_before_migration.sql
   ```

2. **Tjek din nuværende struktur:**
   ```sql
   -- Tjek messages tabellen
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'messages';
   
   -- Tjek threads tabellen
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'threads';
   
   -- Tjek om der er data
   SELECT COUNT(*) FROM messages;
   SELECT COUNT(*) FROM threads;
   ```

3. **Er der data i tabellerne?**
   - Hvis `messages_content` kolonnen eksisterer som timestamp, er data sandsynligvis korrupt
   - Du skal muligvis manuelt rette data først

### Kør migrationen

#### Via Supabase SQL Editor:
1. Åbn Supabase Dashboard
2. Gå til SQL Editor
3. Kopier indholdet fra `backend/migrations/001_fix_chat_structure.sql`
4. Kør scriptet
5. Tjek output for fejl eller warnings

#### Via psql:
```bash
psql -U postgres -h [your-host] -d [your-db] -f backend/migrations/001_fix_chat_structure.sql
```

### Efter migrationen

1. **Verificer strukturen:**
   ```sql
   -- Tjek messages
   SELECT column_name, data_type, column_default
   FROM information_schema.columns 
   WHERE table_name = 'messages'
   ORDER BY ordinal_position;
   
   -- Tjek threads
   SELECT column_name, data_type, column_default
   FROM information_schema.columns 
   WHERE table_name = 'threads'
   ORDER BY ordinal_position;
   
   -- Tjek thread_participants
   SELECT column_name, data_type, column_default
   FROM information_schema.columns 
   WHERE table_name = 'thread_participants'
   ORDER BY ordinal_position;
   ```

2. **Kør post-migration checks** (findes i bunden af migration filen):
   ```sql
   -- Check at alle messages har content
   SELECT message_id, thread_id, message_content 
   FROM messages 
   WHERE message_content IS NULL 
   LIMIT 10;
   
   -- Check at alle threads har deltagere
   SELECT t.thread_id, COUNT(tp.user_id) as participant_count 
   FROM threads t 
   LEFT JOIN thread_participants tp ON t.thread_id = tp.thread_id 
   GROUP BY t.thread_id 
   HAVING COUNT(tp.user_id) = 0;
   ```

3. **Test din app:**
   - Prøv at oprette en ny chat
   - Send beskeder
   - Tjek at de vises korrekt

### Næste skridt

Efter migrationen skal du:
1. ✅ Opdatere backend API routes (`messages.js`, `threads.js`)
2. ✅ Opdatere frontend hooks og komponenter
3. ✅ Teste gruppe chat funktionalitet (ny feature!)

### Rollback (hvis noget går galt)

Hvis migrationen fejler:
1. Restore dit backup
2. Gennemgå fejlbeskeden
3. Ret migration scriptet
4. Prøv igen

```sql
-- Eller manual rollback hvis du ikke har backup:
BEGIN;
-- Gendan gamle kolonnenavne og typer
-- (Dette er kompliceret - derfor er backup vigtigt!)
ROLLBACK;
```

### Support

Hvis du støder på problemer:
1. Tjek Supabase logs
2. Tjek PostgreSQL error messages
3. Kontakt hvis du har brug for hjælp til specifik datamigration
