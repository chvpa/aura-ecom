/**
 * Script para importar datos usando MCP Supabase
 * Este script debe ejecutarse manualmente o vía herramientas que tengan acceso a MCP
 * 
 * Pasos:
 * 1. Ejecutar migrate-all.ts para generar los SQL files
 * 2. Usar MCP apply_migration para ejecutar cada archivo SQL
 */

import * as fs from 'fs';
import * as path from 'path';

const sqlDir = path.join(process.cwd(), 'scripts', 'migrate-db', 'import-sql');

console.log('=== MCP Migration Helper ===\n');
console.log('This script helps prepare SQL files for MCP migration.\n');
console.log('To import data:');
console.log('1. Run: npx tsx scripts/migrate-db/migrate-all.ts');
console.log('2. Review SQL files in scripts/migrate-db/import-sql/');
console.log('3. Use MCP apply_migration tool to execute each SQL file\n');

if (fs.existsSync(sqlDir)) {
  const files = fs.readdirSync(sqlDir).filter(f => f.endsWith('.sql'));
  console.log(`Found ${files.length} SQL files:\n`);
  files.forEach(file => {
    const filePath = path.join(sqlDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').length;
    console.log(`  - ${file} (${lines} lines)`);
  });
} else {
  console.log('SQL directory not found. Run migrate-all.ts first.');
}
