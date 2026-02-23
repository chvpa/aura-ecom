/**
 * Script para crear y configurar Storage buckets en la nueva BD
 * Usa la API de Supabase Storage con service_role key
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase credentials in .env.local');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createBucket(name: string, isPublic: boolean) {
  console.log(`\n📦 Creando bucket: ${name}...`);
  
  // Verificar si el bucket ya existe
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    throw new Error(`Error al listar buckets: ${listError.message}`);
  }

  const bucketExists = existingBuckets?.some(b => b.name === name);
  
  if (bucketExists) {
    console.log(`✅ Bucket "${name}" ya existe`);
    return;
  }

  // Crear bucket usando la API REST directamente
  const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      name,
      public: isPublic,
      file_size_limit: 5242880, // 5MB
      allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al crear bucket "${name}": ${error}`);
  }

  console.log(`✅ Bucket "${name}" creado exitosamente`);
}

async function setupStorageBuckets() {
  console.log('=== Configuración de Storage Buckets ===\n');

  try {
    // Crear buckets
    await createBucket('product-images', true);
    await createBucket('brand-logos', true);

    console.log('\n✅ Configuración de Storage completada');
    console.log('\n📝 Nota: Las políticas RLS para Storage se configuran automáticamente');
    console.log('   Si necesitas políticas personalizadas, configúralas en el dashboard de Supabase');
  } catch (error) {
    console.error('\n❌ Error al configurar Storage:', error);
    process.exit(1);
  }
}

setupStorageBuckets();
