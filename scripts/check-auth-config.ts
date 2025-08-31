import { createClient } from '@supabase/supabase-js'
import 'dotenv/config';

async function checkAuthConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Anon Key in environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get the auth settings
    const { data: settings, error } = await supabase.auth.getSettings();
    
    if (error) throw error;
    
    console.log('Auth Settings:', JSON.stringify(settings, null, 2));
    
    // Check if email/password auth is enabled
    const emailPasswordEnabled = settings.auth?.disable_signup === false;
    console.log('\nEmail/Password Authentication Enabled:', emailPasswordEnabled);
    
    if (!emailPasswordEnabled) {
      console.log('\nTo enable email/password authentication:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to Authentication > Providers');
      console.log('3. Enable "Email" provider');
      console.log('4. Make sure "Confirm email" is disabled for development');
      console.log('5. Add your email domain to "Site URL" in Authentication > URL Configuration');
    }
    
  } catch (error: any) {
    console.error('Error fetching auth settings:', error.message);
    process.exit(1);
  }
}

checkAuthConfig();
