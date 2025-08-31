import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to get input from user
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function createAdminUser() {
  try {
    // Get Supabase credentials directly from user
    let supabaseUrl = '';
    while (!supabaseUrl.trim()) {
      supabaseUrl = await question('Enter your Supabase URL (e.g., https://xyzabc123.supabase.co): ');
      if (!supabaseUrl.trim()) {
        console.log('❌ Supabase URL is required');
      }
    }

    let serviceRoleKey = '';
    while (!serviceRoleKey.trim()) {
      serviceRoleKey = await question('Enter your Supabase service role key: ');
      if (!serviceRoleKey.trim()) {
        console.log('❌ Service role key is required');
      }
    }
    
    // Create admin client with service role key
    console.log('\nCreating Supabase client...');
    const supabase = createClient(supabaseUrl.trim(), serviceRoleKey.trim(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
    
    // Test the connection
    console.log('Testing connection to Supabase...');
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      throw new Error(`Failed to connect to Supabase: ${error.message}`);
    }
    console.log('✅ Successfully connected to Supabase\n');

    // Get admin credentials
    let email = '';
    while (!email.trim()) {
      email = await question('Enter admin email: ');
      if (!email.trim()) {
        console.log('❌ Email is required');
      }
    }

    let password = '';
    while (!password.trim()) {
      password = await question('Enter admin password (min 6 characters): ');
      if (password.length < 6) {
        console.log('❌ Password must be at least 6 characters');
        password = ''; // Reset to force re-entry
      }
    }

    let name = '';
    while (!name.trim()) {
      name = await question('Enter admin name: ');
      if (!name.trim()) {
        console.log('❌ Name is required');
      }
    }

    console.log('\nCreating admin user...');

    // Create the user in auth.users table
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password: password.trim(),
      email_confirm: true, // Skip email confirmation
      user_metadata: { 
        name: name.trim(), 
        role: 'ADMIN' 
      }
    });

    if (authError) {
      throw new Error(`Error creating user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('No user data returned from sign up');
    }

    console.log('✅ Auth user created. Creating user profile...');

    // Create user profile in public.users table
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: email.trim(),
        name: name.trim(),
        role: 'ADMIN',
        emailVerified: new Date().toISOString()
      });

    if (profileError) {
      throw new Error(`Error creating user profile: ${profileError.message}`);
    }

    console.log('\n✅ Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log('🔑 Password: [hidden]');
    console.log('\nYou can now log in to the admin dashboard.');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.message.includes('JWT')) {
      console.error('\n⚠️  Your service role key might be invalid or expired. Please check it in your Supabase dashboard.');
    }
  } finally {
    rl.close();
  }
}

// Run the script
createAdminUser();
