import * as fs from 'fs';
import * as path from 'path';

// Mapeo de family_id antiguos a nuevos basado en slug
const familyMapping: Record<string, string> = {
  'floral': 'd4c7d4cc-abb3-46b3-beec-7180619d0f58',
  'citrico': '770f2b23-498d-415c-b611-3f4afa768012',
  'amaderado': '70104991-16e5-4570-8743-b06b2c011837',
  'especiado': '323c05c9-50b7-4eec-ae7b-672d1f721a90',
  'oriental': 'f432e85b-8e41-47df-9bc2-d9911c451353',
  'acuatico': 'dbf135b4-932c-4cf9-998f-a2afaf7fc9ad',
  'gourmand': '8441a020-c513-4203-80a8-ba798dbcf94c',
  'frutal': '7a56c2b1-d034-43c6-924c-6086890ca5a4',
};

// Necesitamos leer el archivo de exportación para obtener el mapeo de IDs antiguos a slugs
const exportDir = path.join(process.cwd(), 'scripts', 'migrate-db', 'exported-data');
const familiesFile = path.join(exportDir, 'olfactory_families.json');

if (!fs.existsSync(familiesFile)) {
  console.error('olfactory_families.json not found. Run migrate-all.ts first.');
  process.exit(1);
}

const familiesData = JSON.parse(fs.readFileSync(familiesFile, 'utf-8'));
const oldFamilyIdToSlug: Record<string, string> = {};

familiesData.data.forEach((family: any) => {
  oldFamilyIdToSlug[family.id] = family.slug;
});

const sqlDir = path.join(process.cwd(), 'scripts', 'migrate-db', 'import-sql');
const productFamiliesFile = path.join(sqlDir, 'product_families.sql');

if (!fs.existsSync(productFamiliesFile)) {
  console.error('product_families.sql not found');
  process.exit(1);
}

let productFamiliesSQL = fs.readFileSync(productFamiliesFile, 'utf-8');

// Reemplazar family_id antiguos con nuevos
for (const [oldId, slug] of Object.entries(oldFamilyIdToSlug)) {
  const newId = familyMapping[slug];
  if (newId) {
    productFamiliesSQL = productFamiliesSQL.replace(new RegExp(oldId, 'g'), newId);
    console.log(`Mapped ${slug}: ${oldId} -> ${newId}`);
  }
}

// Guardar archivo actualizado
fs.writeFileSync(productFamiliesFile, productFamiliesSQL);
console.log('\n✓ Updated product_families.sql with new family IDs');
