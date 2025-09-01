const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const readline = require('readline');

async function applyMigration() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Get Supabase credentials
    const serviceRoleKey = await new Promise(resolve => {
      rl.question('Enter your Supabase service role key: ', resolve);
    });

    // Read the migration file
    const migrationSql = await fs.readFile(
      'supabase/migrations/20240831233800_create_get_user_role_function.sql',
      'utf8'
    );

    // Initialize Supabase
    const supabase = createClient(
      'https://xqnnayhsfnomihkajmqn.supabase.co',
      serviceRoleKey.trim(),
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    );

    console.log('Applying migration...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('pgmigrate', {
      query: migrationSql
    });

    if (error) throw error;
    
    console.log('✅ Migration applied successfully!');
    console.log('The get_user_role function has been created.');

  } catch (error) {
    console.error('\n❌ Error applying migration:', error.message);
  } finally {
    rl.close();
  }
}

applyMigration();
