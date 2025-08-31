import { createClient } from '@supabase/supabase-js';

async function listUsers() {
  try {
    const supabaseUrl = 'https://xqnnayhsfnomihkajmqn.supabase.co';
    
    // Get service role key from command line arguments or prompt
    let serviceRoleKey = process.argv[2];
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    if (!serviceRoleKey) {
      serviceRoleKey = await new Promise(resolve => {
        rl.question('Enter your Supabase service role key: ', resolve);
      });
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // List all auth users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    console.log('\n=== Auth Users ===');
    console.table(users.map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at,
      role: u.user_metadata?.role || 'USER'
    })));

    // List all users from public.users
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*');
    
    if (dbError) throw dbError;
    
    console.log('\n=== Database Users ===');
    console.table(dbUsers);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

listUsers();
