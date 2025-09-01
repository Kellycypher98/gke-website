const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

async function resetPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Get Supabase credentials
    const serviceRoleKey = await new Promise(resolve => {
      rl.question('Enter your Supabase service role key: ', resolve);
    });

    const email = await new Promise(resolve => {
      rl.question('Enter admin email (kelvinboateng94@outlook.com): ', resolve);
    });

    const newPassword = await new Promise(resolve => {
      rl.question('Enter new password (min 6 characters): ', resolve);
    });

    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Initialize Supabase
    const supabase = createClient(
      'https://xqnnayhsfnomihkajmqn.supabase.co',
      serviceRoleKey.trim(),
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    );

    console.log('\nResetting password...');

    // Update the password
    const { data, error } = await supabase.auth.admin.updateUserById(
      'f8aa3c52-b250-4a85-8b30-3c88b3e616a7', // User ID from earlier
      { password: newPassword }
    );

    if (error) {
      throw error;
    }

    console.log('\n✅ Password updated successfully!');
    console.log(`Email: ${email}`);
    console.log('New password has been set.');
    console.log('You can now log in with your new password.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

resetPassword();
