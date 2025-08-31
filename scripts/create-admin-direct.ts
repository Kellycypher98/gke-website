const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Helper function to get input from user
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function createAdminUser() {
  try {
    // Get Supabase credentials directly from user
    const supabaseUrl = await question('Enter your Supabase URL (e.g., https://xyzabc123.supabase.co): ')
    const serviceRoleKey = await question('Enter your Supabase service role key: ')
    
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })

    // Get admin credentials
    const email = await question('Enter admin email: ')
    const password = await question('Enter admin password: ')
    const name = await question('Enter admin name: ')

    console.log('\nCreating admin user...')

    // Create the user in auth.users table
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: { name, role: 'ADMIN' }
    })

    if (authError) {
      throw new Error(`Error creating user: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('No user data returned from sign up')
    }

    console.log('Auth user created. Creating user profile...')

    // Create user profile in public.users table
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: email,
        name: name,
        role: 'ADMIN',
        emailVerified: new Date().toISOString()
      })

    if (profileError) {
      throw new Error(`Error creating user profile: ${profileError.message}`)
    }

    console.log('\n✅ Admin user created successfully!')
    console.log(`📧 Email: ${email}`)
    console.log('🔑 Password: [hidden]')
    console.log('\nYou can now log in to the admin dashboard.')

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error && error.message.includes('JWT expired')) {
      console.error('\n⚠️  Your service role key might be invalid or expired. Please check it in your Supabase dashboard.')
    }
  } finally {
    rl.close()
  }
}

// Run the script
createAdminUser()
