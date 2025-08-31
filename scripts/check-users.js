const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

async function checkUsers() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const serviceRoleKey = await new Promise(resolve => {
    rl.question('Enter your Supabase service role key: ', resolve);
  });

  const supabase = createClient(
    'https://xqnnayhsfnomihkajmqn.supabase.co',
    serviceRoleKey.trim(),
    {
      auth: { autoRefreshToken: false, persistSession: false }
    }
  );

  try {
    // Check auth users
    console.log('\nChecking auth users...');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    console.log('\n=== Auth Users ===');
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Created: ${user.created_at}`);
      console.log('---');
    });

    // Check public.users
    console.log('\nChecking public.users...');
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*');
    
    if (dbError) throw dbError;
    
    console.log('\n=== Database Users ===');
    dbUsers.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

checkUsers();
