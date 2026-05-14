require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedAdmin() {
  const email = 'admin@plantaech.com';
  const username = 'admin';
  const password = 'plantaech jaya';

  console.log('🌱 Seeding admin user...');

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    console.log('✅ Admin user already exists. Skipping.');
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 12);

  const { data, error } = await supabase
    .from('users')
    .insert({
      first_name: username,
      last_name: 'Plantaech',
      email,
      password: hashed,
      role: 'admin',
    })
    .select('id, first_name, last_name, email, role')
    .single();

  if (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }

  console.log('✅ Admin user created successfully:');
  console.log(`   Email   : ${data.email}`);
  console.log(`   Name    : ${data.first_name} ${data.last_name}`);
  console.log(`   Role    : ${data.role}`);
  console.log(`   Password: plantaech jaya`);
  process.exit(0);
}

seedAdmin();
