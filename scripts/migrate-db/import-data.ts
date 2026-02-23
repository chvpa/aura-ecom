import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// Importar MCP Supabase tools
// Nota: Este script debe ejecutarse en un contexto donde MCP está disponible
// O usar las nuevas credenciales de Supabase directamente

const NEW_SUPABASE_URL = process.env.NEW_SUPABASE_URL || '';
const NEW_SERVICE_ROLE_KEY = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY || '';

if (!NEW_SUPABASE_URL || !NEW_SERVICE_ROLE_KEY) {
  console.warn('Warning: NEW_SUPABASE_URL and NEW_SUPABASE_SERVICE_ROLE_KEY not set.');
  console.warn('This script is designed to use MCP Supabase tools.');
  console.warn('Make sure you have the new Supabase project connected via MCP.');
}

interface ImportResult {
  table: string;
  imported: number;
  errors: number;
  errorMessages: string[];
}

async function importTableData(
  tableName: string,
  data: any[],
  useMCP: boolean = true
): Promise<ImportResult> {
  console.log(`Importing ${tableName}... (${data.length} records)`);

  const result: ImportResult = {
    table: tableName,
    imported: 0,
    errors: 0,
    errorMessages: [],
  };

  if (data.length === 0) {
    console.log(`  ⚠ No data to import for ${tableName}`);
    return result;
  }

  // Para auth.users, necesitamos usar el admin API
  if (tableName === 'auth.users') {
    // Nota: La migración de auth.users requiere crear usuarios manualmente
    // o usar el admin API de Supabase
    console.log(`  ⚠ auth.users requires manual migration via Supabase Admin API`);
    console.log(`  ⚠ Users will need to re-authenticate after migration`);
    return result;
  }

  // Procesar en lotes de 100 para evitar timeouts
  const batchSize = 100;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    try {
      if (useMCP) {
        // Usar MCP para insertar datos
        // Nota: Esto requiere que el script se ejecute en un contexto con MCP
        // Por ahora, generamos SQL que puede ejecutarse manualmente
        const sql = generateInsertSQL(tableName, batch);
        const sqlFile = path.join(
          process.cwd(),
          'scripts',
          'migrate-db',
          'import-sql',
          `${tableName}_batch_${Math.floor(i / batchSize)}.sql`
        );
        
        const sqlDir = path.dirname(sqlFile);
        if (!fs.existsSync(sqlDir)) {
          fs.mkdirSync(sqlDir, { recursive: true });
        }
        
        fs.writeFileSync(sqlFile, sql);
        result.imported += batch.length;
        console.log(`  ✓ Batch ${Math.floor(i / batchSize) + 1} prepared (${batch.length} records)`);
      }
    } catch (error: any) {
      result.errors += batch.length;
      result.errorMessages.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      console.error(`  ✗ Error in batch ${Math.floor(i / batchSize) + 1}:`, error.message);
    }
  }

  return result;
}

function generateInsertSQL(tableName: string, records: any[]): string {
  if (records.length === 0) return '';

  const columns = Object.keys(records[0]);
  const values = records.map(record => {
    const rowValues = columns.map(col => {
      const value = record[col];
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

  return `INSERT INTO ${tableName} (${columns.join(', ')})\nVALUES\n${values.join(',\n')}\nON CONFLICT DO NOTHING;\n\n`;
}

async function main() {
  console.log('Starting data import to new Supabase database...\n');

  const exportDir = path.join(process.cwd(), 'scripts', 'migrate-db', 'exported-data');
  
  if (!fs.existsSync(exportDir)) {
    console.error('Export directory not found. Please run export-data.ts first.');
    process.exit(1);
  }

  // Leer resumen de exportación
  const summaryPath = path.join(exportDir, 'export-summary.json');
  if (!fs.existsSync(summaryPath)) {
    console.error('Export summary not found. Please run export-data.ts first.');
    process.exit(1);
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
  console.log(`Found export from: ${summary.exportedAt}`);
  console.log(`Total records to import: ${summary.totalRecords}\n`);

  const results: ImportResult[] = [];

  // Importar en orden de dependencias
  const importOrder = [
    'auth.users', // Primero auth.users (requiere manejo especial)
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

  for (const table of importOrder) {
    const filePath = path.join(exportDir, `${table}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠ File not found for ${table}, skipping...`);
      continue;
    }

    const exportData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (exportData.error) {
      console.log(`⚠ Error in export for ${table}: ${exportData.error}`);
      continue;
    }

    const result = await importTableData(table, exportData.data || []);
    results.push(result);
  }

  // Guardar resumen de importación
  const importSummary = {
    importedAt: new Date().toISOString(),
    results: results.map(r => ({
      table: r.table,
      imported: r.imported,
      errors: r.errors,
    })),
    totalImported: results.reduce((sum, r) => sum + r.imported, 0),
    totalErrors: results.reduce((sum, r) => sum + r.errors, 0),
  };

  const importSummaryPath = path.join(
    process.cwd(),
    'scripts',
    'migrate-db',
    'import-summary.json'
  );
  fs.writeFileSync(importSummaryPath, JSON.stringify(importSummary, null, 2));

  console.log('\n=== Import Summary ===');
  console.log(`Total tables processed: ${results.length}`);
  console.log(`Total records imported: ${importSummary.totalImported}`);
  console.log(`Total errors: ${importSummary.totalErrors}`);
  console.log(`\nSQL files generated in: scripts/migrate-db/import-sql/`);
  console.log('\nNext steps:');
  console.log('1. Review the generated SQL files');
  console.log('2. Execute them in the new Supabase database via MCP or SQL Editor');
  console.log('3. For auth.users, use Supabase Admin API to recreate users');
  console.log('\nImport preparation completed!');
}

main().catch(console.error);
