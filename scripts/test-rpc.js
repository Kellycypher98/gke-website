const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

async function testRPC() {
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

    console.log('\nTesting RPC function...');
    
    // Test the RPC function
    const { data, error } = await supabase
      .rpc('get_user_role', { 
        user_id: 'f8aa3c52-b250-4a85-8b30-3c88b3e616a7' 
      });

    if (error) {
      console.error('❌ RPC Error:', error);
    } else {
      console.log('✅ RPC Response:', data);
      console.log('If you see the user\'s role above, the RPC function is working!');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

testRPC();
