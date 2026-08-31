const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProp() {
  const { data, error } = await supabase
    .from('properties')
    .select('id, agent_name, agent_email')
    .eq('id', 2848)
    .single();
    
  console.log('Data:', data);
  console.log('Error:', error);
}

checkProp();
