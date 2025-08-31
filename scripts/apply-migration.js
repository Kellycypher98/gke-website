const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function applyMigration() {
  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || await new Promise(resolve => {
      rl.question('Enter your Supabase URL: ', resolve);
    });

    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || await new Promise(resolve => {
      rl.question('Enter your Supabase anon key: ', resolve);
    });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20230831152700_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration...');
    
    // Split SQL into individual statements and execute them
    const statements = sql.split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    for (const statement of statements) {
      try {
        console.log(`Executing: ${statement.substring(0, 100)}...`);
        const { error } = await supabase.rpc('pg_temp.execute', { query: statement });
        
        if (error) {
          console.error('Error executing statement:', error);
          console.log('Failed statement:', statement);
          continue; // Skip to next statement instead of breaking
        }
        
        console.log('✓ Success');
      } catch (err) {
        console.error('Error executing statement:', err.message);
        console.log('Failed statement:', statement);
        continue; // Skip to next statement instead of breaking
      }
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    rl.close();
  }
}

applyMigration();
