const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

async function adminResetPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Get Supabase credentials
    const serviceRoleKey = await new Promise(resolve => {
      rl.question('Enter your Supabase service role key: ', resolve);
    });

    const email = 'kelvinboateng94@outlook.com';
    const newPassword = 'NewSecurePassword123!'; // Change this to your desired password

    console.log(`\nResetting password for: ${email}`);
    console.log(`New password will be: ${newPassword}\n`);

    // Initialize Supabase with admin privileges
    const supabase = createClient(
      'https://xqnnayhsfnomihkajmqn.supabase.co',
      serviceRoleKey.trim(),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );

    // First, get the user by email to confirm they exist
    console.log('Looking up user...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error(`No user found with email: ${email}`);
    }

    console.log(`Found user: ${user.id}`);
    
    // Update the user's password
    console.log('Updating password...');
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    console.log('\n✅ Password updated successfully!');
    console.log(`Email: ${email}`);
    console.log(`New password: ${newPassword}`);
    console.log('\nYou can now log in with the new password.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  } finally {
    rl.close();
  }
}

adminResetPassword();
