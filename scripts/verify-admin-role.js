const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

async function verifyAdminRole() {
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

    const userId = 'f8aa3c52-b250-4a85-8b30-3c88b3e616a7';
    
    console.log('\nChecking user in auth.users...');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    const authUser = users.find(u => u.id === userId);
    if (!authUser) {
      console.log('❌ User not found in auth.users');
      return;
    }
    
    console.log('✅ User found in auth.users');
    console.log(`Email: ${authUser.email}`);
    console.log(`Created: ${authUser.created_at}`);
    console.log(`Last Sign In: ${authUser.last_sign_in_at}`);
    
    console.log('\nChecking public.users table...');
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (dbError || !dbUser) {
      console.log('❌ User not found in public.users');
      
      // Create the user in public.users if missing
      const confirm = await new Promise(resolve => {
        rl.question('Create user in public.users? (y/n): ', resolve);
      });
      
      if (confirm.toLowerCase() === 'y') {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            id: userId,
            email: authUser.email,
            name: 'Admin User',
            role: 'ADMIN',
            emailVerified: new Date().toISOString()
          }])
          .select()
          .single();
          
        if (createError) throw createError;
        console.log('✅ Created user in public.users:', newUser);
      }
      return;
    }
    
    console.log('✅ User found in public.users');
    console.log(`Role: ${dbUser.role}`);
    
    if (dbUser.role !== 'ADMIN') {
      console.log('\n⚠️  User is not an admin');
      const confirm = await new Promise(resolve => {
        rl.question('Update role to ADMIN? (y/n): ', resolve);
      });
      
      if (confirm.toLowerCase() === 'y') {
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ role: 'ADMIN' })
          .eq('id', userId)
          .select()
          .single();
          
        if (updateError) throw updateError;
        console.log('✅ Updated user role to ADMIN');
      }
    } else {
      console.log('✅ User is already an admin');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  } finally {
    rl.close();
  }
}

verifyAdminRole();
