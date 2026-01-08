const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://rjvoxuomaidbyecsqymb.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Du skal have service key

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  console.log('💡 Add your service role key to backend/.env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixThreadParticipantsRLS() {
  try {
    console.log('🚀 Fixing thread_participants RLS infinite recursion...');
    
    // Disable RLS på thread_participants tabel
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.thread_participants DISABLE ROW LEVEL SECURITY;'
    });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('✅ Successfully disabled RLS on thread_participants table');
    console.log('🔓 Chat functionality should now work');
    console.log('⚠️  Note: This removes security on thread_participants - only for testing!');
    
  } catch (error) {
    console.error('❌ Error fixing RLS:', error);
  }
}

fixThreadParticipantsRLS();