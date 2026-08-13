#!/usr/bin/env node
// Usage:
// SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/check_db.js --prekey mna_xxx
// or
// SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/check_db.js --list-admins

const { createClient } = require('@supabase/supabase-js');

const argv = require('minimist')(process.argv.slice(2));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  if (argv.prekey) {
    const key = String(argv.prekey).trim().toLowerCase();
    console.log('Looking for pre_leader with access_key="%s"', key);
    const { data, error } = await supabase
      .from('pre_leaders')
      .select('id, access_key, bi_number, full_name, region_id, church_id, status')
      .eq('access_key', key)
      .maybeSingle();
    if (error) {
      console.error('Error:', error.message || error);
      process.exit(1);
    }
    console.log('Result:', data || 'NOT FOUND');
    process.exit(0);
  }

  if (argv.bi) {
    const bi = String(argv.bi).trim().toLowerCase();
    console.log('Looking for pre_leader with bi_number="%s"', bi);
    const { data, error } = await supabase
      .from('pre_leaders')
      .select('id, access_key, bi_number, full_name, region_id, church_id, status')
      .ilike('bi_number', bi)
      .limit(10);
    if (error) {
      console.error('Error:', error.message || error);
      process.exit(1);
    }
    console.log('Results:', data || 'NONE');
    process.exit(0);
  }

  if (argv['list-admins']) {
    console.log('Listing admin_regions and user_roles (first 200)');
    const [{ data: admins }, { data: roles }] = await Promise.all([
      supabase.from('admin_regions').select('user_id, region_id').limit(200),
      supabase.from('user_roles').select('user_id, role').limit(200),
    ]);
    console.log('admin_regions:', admins || []);
    console.log('user_roles:', roles || []);
    process.exit(0);
  }

  console.log('Nothing to do. Use --prekey, --bi or --list-admins');
  process.exit(2);
}

run();
