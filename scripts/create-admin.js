const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function createAdminUser() {
  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || await question('Enter your Supabase URL: ');
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || await question('Enter your Supabase anon key: ');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get admin credentials
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');

    console.log('\nCreating admin user...');

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new Error(`Error creating user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('No user data returned from sign up');
    }

    console.log('User created. Setting admin role...');

    // Update user role to ADMIN
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'ADMIN' })
      .eq('id', authData.user.id);

    if (updateError) {
      throw new Error(`Error updating user role: ${updateError.message}`);
    }

    console.log('\n✅ Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log('🔑 Password: [hidden]');
    console.log('\nYou can now log in to the admin dashboard at /admin');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
createAdminUser();
