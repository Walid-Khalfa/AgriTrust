import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('Testing Supabase connection...');
console.log('URL:', process.env.SUPABASE_URL);
console.log('Key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20));

const { data, error } = await supabase.from('batches').select('count');

if (error) {
  console.error('❌ Error:', error.message);
  console.error('Details:', error);
} else {
  console.log('✅ Connection successful!');
  console.log('Data:', data);
}
