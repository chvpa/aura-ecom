import * as fs from 'fs';
import * as path from 'path';

// Mapeo de product_id antiguos a nuevos basado en SKU
const productMapping: Record<string, string> = {
  '2c5bd10f-3c5c-4669-be3c-9a66364897f4': '4dd06a75-2ab6-4735-b84c-f07192a9304e', // AU-2025-001
  'fba0f332-0777-426f-826e-7b0260b00f1e': '03826908-873d-4dde-9916-3cacc707b3fa', // AU-2025-004
  'e788c529-30f9-4303-a1f3-198412b38fb5': 'f1178ea7-1b3c-4d21-8296-084656b2d3d2', // AU-2025-008
  '345ef30d-3fd7-4d97-9d73-3d5713e84232': '00b02c38-fe6c-45c7-a712-96edb256592b', // AU-2025-002
  '7a340fe8-0619-4337-8054-9680c096b121': '86c8787e-4679-49ef-bc0c-3a7b70dad030', // AU-2025-005
  'be3f9cb6-7cc1-4909-b614-c5d31f4536d2': '3013171f-8ac2-4b7e-b409-ba8d378ca30f', // AU-2025-003
  '4a5b6f35-b9a6-47a0-8c12-00b96219bc16': 'aa0d4a09-7bba-4a3e-9270-073fe3cdfbff', // AU-2025-006
  '18012a43-8987-40b5-889a-cdefc4acc1b4': 'f81a4dac-e713-4add-a454-ac4673967c47', // AU-2025-007
};

const sqlDir = path.join(process.cwd(), 'scripts', 'migrate-db', 'import-sql');
const filesToUpdate = [
  'product_families.sql',
  'wishlists.sql',
  'order_items.sql',
  'product_matches.sql',
  'ai_search_history.sql',
];

for (const fileName of filesToUpdate) {
  const filePath = path.join(sqlDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ Skipping ${fileName} (not found)`);
    continue;
  }

  let sql = fs.readFileSync(filePath, 'utf-8');

  // Reemplazar product_id antiguos con nuevos
  for (const [oldId, newId] of Object.entries(productMapping)) {
    sql = sql.replace(new RegExp(oldId, 'g'), newId);
  }

  fs.writeFileSync(filePath, sql);
  console.log(`✓ Updated ${fileName}`);
}

console.log('\n✓ All product IDs updated');
