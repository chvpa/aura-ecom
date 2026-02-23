import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const OLD_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const OLD_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!OLD_SUPABASE_URL || !OLD_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase credentials in .env.local');
}

const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SERVICE_ROLE_KEY);

interface ExportResult {
  table: string;
  count: number;
  data: any[];
  error?: string;
}

async function exportTable(tableName: string): Promise<ExportResult> {
  console.log(`Exporting ${tableName}...`);
  
  try {
    const { data, error, count } = await oldSupabase
      .from(tableName)
      .select('*', { count: 'exact' });

    if (error) {
      console.error(`Error exporting ${tableName}:`, error);
      return { table: tableName, count: 0, data: [], error: error.message };
    }

    console.log(`  ✓ Exported ${count || data?.length || 0} records`);
    return {
      table: tableName,
      count: count || data?.length || 0,
      data: data || [],
    };
  } catch (error: any) {
    console.error(`Error exporting ${tableName}:`, error);
    return {
      table: tableName,
      count: 0,
      data: [],
      error: error.message,
    };
  }
}

async function exportAuthUsers(): Promise<ExportResult> {
  console.log('Exporting auth.users...');
  
  try {
    // Usar admin API para obtener usuarios de auth
    const { data: { users }, error } = await oldSupabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error exporting auth.users:', error);
      return { table: 'auth.users', count: 0, data: [], error: error.message };
    }

    console.log(`  ✓ Exported ${users?.length || 0} auth users`);
    return {
      table: 'auth.users',
      count: users?.length || 0,
      data: users || [],
    };
  } catch (error: any) {
    console.error('Error exporting auth.users:', error);
    return {
      table: 'auth.users',
      count: 0,
      data: [],
      error: error.message,
    };
  }
}

async function main() {
  console.log('Starting data export from old Supabase database...\n');

  const exportDir = path.join(process.cwd(), 'scripts', 'migrate-db', 'exported-data');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const results: ExportResult[] = [];

  // Exportar en orden de dependencias
  const tables = [
    'brands',
    'olfactory_families',
    'users', // Tabla users (no auth.users)
    'user_profiles',
    'products',
    'product_families',
    'wishlists',
    'orders',
    'order_items',
    'product_matches',
    'ai_search_history',
    'product_comparisons',
    'notifications',
    'saved_addresses',
  ];

  // Exportar auth.users primero
  const authUsersResult = await exportAuthUsers();
  results.push(authUsersResult);
  fs.writeFileSync(
    path.join(exportDir, 'auth_users.json'),
    JSON.stringify(authUsersResult, null, 2)
  );

  // Exportar tablas públicas
  for (const table of tables) {
    const result = await exportTable(table);
    results.push(result);
    
    if (result.data.length > 0) {
      fs.writeFileSync(
        path.join(exportDir, `${table}.json`),
        JSON.stringify(result, null, 2)
      );
    }
  }

  // Guardar resumen
  const summary = {
    exportedAt: new Date().toISOString(),
    oldDatabaseUrl: OLD_SUPABASE_URL,
    results: results.map(r => ({
      table: r.table,
      count: r.count,
      error: r.error,
    })),
    totalRecords: results.reduce((sum, r) => sum + r.count, 0),
  };

  fs.writeFileSync(
    path.join(exportDir, 'export-summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log('\n=== Export Summary ===');
  console.log(`Total tables exported: ${results.length}`);
  console.log(`Total records: ${summary.totalRecords}`);
  console.log(`\nExport files saved to: ${exportDir}`);
  console.log('\nExport completed!');
}

main().catch(console.error);
