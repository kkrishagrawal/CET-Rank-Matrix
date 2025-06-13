const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY environment variable is required');
}

// Initialize Supabase client with configuration
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    // Add any additional configuration options here
    // realtime: {
    //   params: {
    //     eventsPerSecond: 10,
    //   },
    // },
  }
);

// Optional: Add connection test function
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('CET Rank Matrix - 2024')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Supabase connection error:', err.message);
    return false;
  }
};

module.exports = {
  supabase,
  testConnection
};