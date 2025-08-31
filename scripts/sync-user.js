const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

async function syncUser() {
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
    // Get the user from auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const authUser = users.find(u => u.email === 'kelvinboateng94@outlook.com');
    if (!authUser) {
      console.log('❌ User not found in auth system');
      return;
    }

    console.log('\nFound user in auth system:');
    console.log(`ID: ${authUser.id}`);
    console.log(`Email: ${authUser.email}`);
    console.log(`Created: ${authUser.created_at}`);

    // Check if user exists in public.users
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116 = not found
      throw userError;
    }

    if (existingUser) {
      console.log('\n✅ User already exists in public.users table');
      console.log(existingUser);
      return;
    }

    // Create user in public.users
    console.log('\nCreating user in public.users table...');
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || 'Admin User',
          role: 'ADMIN',
          emailVerified: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (createError) throw createError;

    console.log('\n✅ Successfully created user in public.users table:');
    console.log(newUser);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

syncUser();
