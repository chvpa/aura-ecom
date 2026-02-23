import * as fs from 'fs';
import * as path from 'path';

// Mapeo de brand_id antiguos a nuevos basado en slug
const brandMapping: Record<string, string> = {
  'hugo-boss': '13048f1c-8f12-4c89-a2d5-1e5e5ad09e80',
  'aura-collection': '91bf9694-be08-41a5-9489-17deec7751f7',
  'dior': '5619a1fe-b02a-4df2-8f59-950d6da9a6fb',
  'calvin-klein': '29e2623d-4a3e-45f4-a926-ca3142fdc7da',
  'tom-ford': 'c84193d7-d3fa-4204-975b-0d741fe4860f',
  'paco-rabanne': 'cb833ecb-103c-43e3-b0bb-1b2fd7c015c4',
};

// Mapeo de brand_id antiguos a slugs (basado en los datos exportados)
const oldBrandIdToSlug: Record<string, string> = {
  '1e2ef326-20f9-4c5a-9825-adce245c49ec': 'hugo-boss',
  'a6920ea5-e902-449c-a8eb-b5ece4711d45': 'aura-collection',
  '5bf74d01-084c-47aa-a762-dd0f54421945': 'dior',
  '35c12d1d-bb93-46b5-a32f-64ab22348984': 'calvin-klein',
  '09f0a0cc-5b0c-4eb7-927a-5ef9fe26e534': 'tom-ford',
  '31b2e026-0454-4263-89d2-a3bdc2bf52ec': 'paco-rabanne',
};

const sqlDir = path.join(process.cwd(), 'scripts', 'migrate-db', 'import-sql');
const productsFile = path.join(sqlDir, 'products.sql');

if (!fs.existsSync(productsFile)) {
  console.error('products.sql not found');
  process.exit(1);
}

let productsSQL = fs.readFileSync(productsFile, 'utf-8');

// Reemplazar brand_id antiguos con nuevos
for (const [oldId, slug] of Object.entries(oldBrandIdToSlug)) {
  const newId = brandMapping[slug];
  if (newId) {
    productsSQL = productsSQL.replace(new RegExp(oldId, 'g'), newId);
    console.log(`Mapped ${slug}: ${oldId} -> ${newId}`);
  }
}

// Guardar archivo actualizado
fs.writeFileSync(productsFile, productsSQL);
console.log('\n✓ Updated products.sql with new brand IDs');
