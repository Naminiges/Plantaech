require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// Disable realtime to avoid Windows libuv assertion on process.exit()
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { realtime: { enabled: false } }
);

const ADMIN_EMAIL    = 'admin@plantaech.com';
const ADMIN_PASSWORD = 'Plantaech1'; // meets: min 8 chars, 1 uppercase, 1 number
const forceUpdate    = process.argv.includes('--update');

async function seedAdmin() {
  console.log('🌱 Seeding admin user...');

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', ADMIN_EMAIL)
    .single();

  if (existing && !forceUpdate) {
    console.log('✅ Admin user already exists. Run with --update to reset the password.');
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

  if (existing && forceUpdate) {
    // Update password only
    const { error } = await supabase
      .from('users')
      .update({ password: hashed })
      .eq('email', ADMIN_EMAIL);

    if (error) { console.error('❌ Error updating admin:', error.message); return; }
    console.log('✅ Admin password updated successfully:');
  } else {
    // Insert new admin
    const { data, error } = await supabase
      .from('users')
      .insert({ first_name: 'admin', last_name: 'Plantaech', email: ADMIN_EMAIL, password: hashed, role: 'admin' })
      .select('id, first_name, last_name, email, role')
      .single();

    if (error) { console.error('❌ Error seeding admin:', error.message); return; }
    console.log('✅ Admin user created successfully:');
    console.log(`   Email   : ${data.email}`);
    console.log(`   Name    : ${data.first_name} ${data.last_name}`);
    console.log(`   Role    : ${data.role}`);
  }

  console.log(`   Email   : ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
}

seedAdmin();
