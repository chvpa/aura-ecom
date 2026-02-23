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

const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface TableData {
  table: string;
  data: any[];
  count: number;
}

async function fetchTableData(tableName: string): Promise<TableData> {
  console.log(`Fetching ${tableName}...`);
  
  try {
    const { data, error, count } = await oldSupabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(10000); // Limitar para evitar problemas de memoria

    if (error) {
      console.error(`  ✗ Error: ${error.message}`);
      return { table: tableName, data: [], count: 0 };
    }

    console.log(`  ✓ Fetched ${count || data?.length || 0} records`);
    return {
      table: tableName,
      data: data || [],
      count: count || data?.length || 0,
    };
  } catch (error: any) {
    console.error(`  ✗ Error: ${error.message}`);
    return { table: tableName, data: [], count: 0 };
  }
}

async function fetchAuthUsers(): Promise<TableData> {
  console.log('Fetching auth.users...');
  
  try {
    const { data: { users }, error } = await oldSupabase.auth.admin.listUsers();
    
    if (error) {
      console.error(`  ✗ Error: ${error.message}`);
      return { table: 'auth.users', data: [], count: 0 };
    }

    console.log(`  ✓ Fetched ${users?.length || 0} auth users`);
    return {
      table: 'auth.users',
      data: users || [],
      count: users?.length || 0,
    };
  } catch (error: any) {
    console.error(`  ✗ Error: ${error.message}`);
    return { table: 'auth.users', data: [], count: 0 };
  }
}

function generateInsertSQL(tableName: string, records: any[]): string {
  if (records.length === 0) return '';

  const columns = Object.keys(records[0]).filter(col => col !== 'id' || tableName === 'users');
  const values = records.map(record => {
    const rowValues = columns.map(col => {
      const value = record[col];
      if (value === null || value === undefined) {
        return 'NULL';
      }
      if (typeof value === 'string') {
        // Escapar comillas simples
        return `'${value.replace(/'/g, "''")}'`;
      }
      if (typeof value === 'boolean') {
        return value ? 'TRUE' : 'FALSE';
      }
      if (typeof value === 'object') {
        // JSONB
        return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
      }
      if (typeof value === 'number') {
        return String(value);
      }
      return `'${String(value).replace(/'/g, "''")}'`;
    });
    return `(${rowValues.join(', ')})`;
  });

  // Para users, incluir el id explícitamente
  if (tableName === 'users') {
    const userColumns = ['id', ...columns.filter(c => c !== 'id')];
    const userValues = records.map(record => {
      const rowValues = userColumns.map(col => {
        const value = record[col];
        if (col === 'id') {
          return `'${value}'::uuid`;
        }
        if (value === null || value === undefined) {
          return 'NULL';
        }
        if (typeof value === 'string') {
          return `'${value.replace(/'/g, "''")}'`;
        }
        if (typeof value === 'boolean') {
          return value ? 'TRUE' : 'FALSE';
        }
        if (typeof value === 'object') {
          return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
        }
        return String(value);
      });
      return `(${rowValues.join(', ')})`;
    });
    return `INSERT INTO ${tableName} (${userColumns.join(', ')})\nVALUES\n${userValues.join(',\n')}\nON CONFLICT (id) DO UPDATE SET\n  email = EXCLUDED.email,\n  full_name = EXCLUDED.full_name,\n  phone = EXCLUDED.phone,\n  updated_at = EXCLUDED.updated_at;\n\n`;
  }

  return `INSERT INTO ${tableName} (${columns.join(', ')})\nVALUES\n${values.join(',\n')}\nON CONFLICT DO NOTHING;\n\n`;
}

async function main() {
  console.log('=== Supabase Migration Tool ===\n');
  console.log(`Old DB: ${OLD_SUPABASE_URL}\n`);

  const tables = [
    'brands',
    'olfactory_families',
    'users',
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

  const allData: TableData[] = [];

  // Fetch auth.users primero
  const authUsers = await fetchAuthUsers();
  allData.push(authUsers);

  // Fetch todas las tablas
  for (const table of tables) {
    const data = await fetchTableData(table);
    allData.push(data);
  }

  // Generar SQL para importación
  const sqlDir = path.join(process.cwd(), 'scripts', 'migrate-db', 'import-sql');
  if (!fs.existsSync(sqlDir)) {
    fs.mkdirSync(sqlDir, { recursive: true });
  }

  console.log('\n=== Generating SQL Files ===\n');

  // Orden de importación
  const importOrder = [
    'auth.users',
    'brands',
    'olfactory_families',
    'users',
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

  let allSQL = '-- Migration SQL Generated\n';
  allSQL += `-- Generated at: ${new Date().toISOString()}\n`;
  allSQL += `-- Old Database: ${OLD_SUPABASE_URL}\n\n`;
  allSQL += '-- IMPORTANT: Execute in order!\n';
  allSQL += '-- For auth.users, you may need to use Supabase Admin API\n\n';

  for (const tableName of importOrder) {
    const tableData = allData.find(d => d.table === tableName);
    if (!tableData || tableData.data.length === 0) {
      console.log(`⚠ Skipping ${tableName} (no data)`);
      continue;
    }

    const sql = generateInsertSQL(tableName, tableData.data);
    if (sql) {
      const sqlFile = path.join(sqlDir, `${tableName}.sql`);
      fs.writeFileSync(sqlFile, sql);
      allSQL += `-- ${tableName} (${tableData.count} records)\n`;
      allSQL += sql;
      console.log(`✓ Generated ${tableName}.sql (${tableData.count} records)`);
    }
  }

  // Guardar SQL completo
  fs.writeFileSync(path.join(sqlDir, '00_all_tables.sql'), allSQL);

  // Guardar resumen
  const summary = {
    exportedAt: new Date().toISOString(),
    oldDatabaseUrl: OLD_SUPABASE_URL,
    tables: allData.map(d => ({
      table: d.table,
      count: d.count,
    })),
    totalRecords: allData.reduce((sum, d) => sum + d.count, 0),
  };

  fs.writeFileSync(
    path.join(sqlDir, 'migration-summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log('\n=== Summary ===');
  console.log(`Total tables: ${allData.length}`);
  console.log(`Total records: ${summary.totalRecords}`);
  console.log(`\nSQL files saved to: ${sqlDir}`);
  console.log('\nNext steps:');
  console.log('1. Review the SQL files in scripts/migrate-db/import-sql/');
  console.log('2. Execute them in the new Supabase database via MCP apply_migration');
  console.log('3. For auth.users, users will need to re-authenticate');
}

main().catch(console.error);
