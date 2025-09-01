const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

async function checkAdminStatus() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
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

    // Check auth users
    console.log('\nChecking auth users...');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    const adminUser = users.find(u => u.email === 'kelvinboateng94@outlook.com');
    if (!adminUser) {
      console.log('❌ User not found in auth system');
      return;
    }

    console.log('\n=== Auth User ===');
    console.log(`ID: ${adminUser.id}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Created: ${adminUser.created_at}`);
    console.log(`Last Sign In: ${adminUser.last_sign_in_at}`);

    // Check public.users
    console.log('\nChecking public.users table...');
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', adminUser.id)
      .single();

    if (dbError || !dbUser) {
      console.log('❌ User not found in public.users table');
      if (dbError) console.error('Error:', dbError);
      return;
    }

    console.log('\n=== Database User ===');
    console.log(`ID: ${dbUser.id}`);
    console.log(`Email: ${dbUser.email}`);
    console.log(`Role: ${dbUser.role}`);
    console.log(`Created: ${dbUser.createdAt}`);
    console.log(`Updated: ${dbUser.updatedAt}`);

    // Verify the user can query their own role
    console.log('\nTesting role check function...');
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_user_role', { user_id: adminUser.id });
    
    if (roleError) {
      console.log('❌ Error checking role via RPC:', roleError.message);
    } else {
      console.log('✅ RPC role check successful');
      console.log('User role from RPC:', roleData);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

checkAdminStatus();
