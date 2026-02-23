# Notas de Migración de Supabase

## Estado de la Migración

### ✅ Completado
- [x] Esquema completo creado en nueva BD (tablas, índices, triggers, RLS)
- [x] Brands importados (8 registros)
- [x] Olfactory families importados (8 registros)
- [x] Products importados (8 registros)
- [x] Product families importados (24 registros)

### ⚠️ Pendiente (Requiere usuarios en auth.users)
Las siguientes tablas requieren que los usuarios existan en `auth.users` antes de poder importarse:

- `users` (tabla pública) - Requiere auth.users primero
- `user_profiles` - Depende de users
- `wishlists` - Depende de users
- `orders` - Depende de users
- `order_items` - Depende de orders (que depende de users)
- `product_matches` - Depende de users
- `ai_search_history` - Depende de users
- `saved_addresses` - Depende de auth.users

## Pasos para Completar la Migración

### 1. Recrear Usuarios en auth.users

Los usuarios deben recrearse usando el Supabase Admin API. Los usuarios exportados son:

1. `chvpa.contacto@gmail.com` (ID: 28a3682f-b7eb-44d9-8be0-4e51a9263f77) - Admin
2. `aramiadorno18@gmail.com` (ID: 62761978-3c25-44d6-8f02-9214b3eea20b)
3. `odoraimports@gmail.com` (ID: c73bec6e-a9a7-470b-9914-27c486d463d3)
4. `ch7suarez@gmail.com` (ID: f045c8c1-2c21-4b5e-b890-6f2910450120)

**Opción A: Usar Supabase Dashboard**
1. Ir a Authentication > Users en el dashboard
2. Crear usuarios manualmente con los mismos emails
3. Nota: Los UUIDs serán diferentes, necesitarás actualizar las referencias

**Opción B: Usar Admin API (Recomendado para preservar UUIDs)**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://uoqwgzhbsryopotxxohy.supabase.co',
  'SERVICE_ROLE_KEY'
);

// Crear usuario con ID específico
await supabase.auth.admin.createUser({
  id: '28a3682f-b7eb-44d9-8be0-4e51a9263f77',
  email: 'chvpa.contacto@gmail.com',
  email_confirm: true,
  // ... otros campos
});
```

### 2. Importar Tabla users (pública)

Una vez que los usuarios existan en auth.users, ejecutar:
```sql
-- Ver scripts/migrate-db/import-sql/users.sql
```

### 3. Importar Tablas Restantes

En orden:
1. `user_profiles` - Ver `scripts/migrate-db/import-sql/user_profiles.sql`
2. `wishlists` - Ver `scripts/migrate-db/import-sql/wishlists.sql`
3. `orders` - Ver `scripts/migrate-db/import-sql/orders.sql`
4. `order_items` - Ver `scripts/migrate-db/import-sql/order_items.sql`
5. `product_matches` - Ver `scripts/migrate-db/import-sql/product_matches.sql`
6. `ai_search_history` - Ver `scripts/migrate-db/import-sql/ai_search_history.sql`
7. `saved_addresses` - Ver `scripts/migrate-db/import-sql/saved_addresses.sql`

### 4. Migración de Storage

Los archivos de Storage (imágenes de productos) están en la BD antigua:
- Bucket: `product-images`
- Bucket: `brand-logos`

**Pasos:**
1. Listar archivos en buckets antiguos
2. Descargar archivos
3. Subir a buckets en nueva BD
4. Actualizar URLs si cambian

### 5. Actualizar Variables de Entorno

Actualizar `.env.local` y Vercel con:
- `NEXT_PUBLIC_SUPABASE_URL` = nueva URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = nueva anon key
- `SUPABASE_SERVICE_ROLE_KEY` = nueva service role key

### 6. Regenerar Tipos TypeScript

```bash
npx supabase gen types typescript --project-id <nuevo-project-id> > src/types/database.types.ts
```

## Notas Importantes

1. **UUIDs Preservados**: Los productos, brands y families mantienen sus UUIDs originales donde fue posible
2. **Product IDs Cambiaron**: Los productos se importaron con nuevos UUIDs (mapeados por SKU)
3. **Users Requieren Re-autenticación**: Los usuarios necesitarán iniciar sesión nuevamente
4. **Storage URLs**: Las URLs de Storage cambiarán, pero los paths pueden mantenerse

## Archivos Generados

- `scripts/migrate-db/import-sql/*.sql` - Archivos SQL listos para importar
- `scripts/migrate-db/exported-data/*.json` - Datos exportados de BD antigua
- `scripts/migrate-db/migration-summary.json` - Resumen de la migración
