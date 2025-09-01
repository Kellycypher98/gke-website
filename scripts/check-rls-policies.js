const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

async function checkRLSPolicies() {
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

    console.log('\nChecking RLS policies on users table...');
    
    // Check if RLS is enabled
    const { data: rlsEnabled, error: rlsError } = await supabase.rpc('pg_rls_enabled', {
      schema_name: 'public',
      table_name: 'users'
    });

    if (rlsError) {
      console.error('Error checking RLS status:', rlsError.message);
    } else {
      console.log(`Row Level Security is ${rlsEnabled ? 'ENABLED' : 'DISABLED'} on users table`);
    }

    // List all RLS policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'public')
      .eq('tablename', 'users');

    if (policiesError) {
      console.error('Error fetching RLS policies:', policiesError.message);
    } else if (policies.length === 0) {
      console.log('No RLS policies found on users table');
    } else {
      console.log('\nCurrent RLS policies on users table:');
      policies.forEach(policy => {
        console.log(`\nPolicy: ${policy.policyname}`);
        console.log(`  Command: ${policy.cmd}`);
        console.log(`  Roles: ${policy.roles}`);
        console.log(`  Using: ${policy.qual}`);
        console.log(`  With Check: ${policy.with_check}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

checkRLSPolicies();
