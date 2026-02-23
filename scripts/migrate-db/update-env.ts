/**
 * Script para actualizar .env.local con las nuevas credenciales de Supabase
 * 
 * IMPORTANTE: Necesitas obtener el SUPABASE_SERVICE_ROLE_KEY desde el dashboard
 * Project Settings > API > service_role key
 */

import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('.env.local not found');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf-8');

// Actualizar URL y anon key
envContent = envContent.replace(
  /NEXT_PUBLIC_SUPABASE_URL=.*/,
  'NEXT_PUBLIC_SUPABASE_URL=https://uoqwgzhbsryopotxxohy.supabase.co'
);

// Actualizar anon key - obtener desde Supabase Dashboard
const newAnonKey = process.env.NEW_SUPABASE_ANON_KEY || 'REPLACE_WITH_NEW_ANON_KEY';
envContent = envContent.replace(
  /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=${newAnonKey}`
);

// Nota sobre service role key - debe actualizarse manualmente
if (!envContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
  console.log('\n⚠️  IMPORTANTE: Necesitas actualizar SUPABASE_SERVICE_ROLE_KEY manualmente');
  console.log('   Obtén el nuevo service_role key desde:');
  console.log('   Supabase Dashboard > Project Settings > API > service_role key\n');
}

fs.writeFileSync(envPath, envContent);
console.log('✓ .env.local actualizado con nuevas credenciales de Supabase');
console.log('  - NEXT_PUBLIC_SUPABASE_URL');
console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('\n⚠️  Recuerda actualizar SUPABASE_SERVICE_ROLE_KEY manualmente');
