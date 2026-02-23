# Resumen de Migración de Supabase

## Estado Actual

### ✅ Completado

1. **Esquema completo creado** en nueva BD
   - Todas las tablas creadas
   - Índices configurados
   - Triggers y funciones creadas
   - RLS policies configuradas

2. **Datos importados:**
   - ✅ Brands: 8 registros
   - ✅ Olfactory families: 8 registros
   - ✅ Products: 8 registros
   - ✅ Product families: 24 registros

### ⚠️ Pendiente (Requiere usuarios en auth.users)

Las siguientes tablas no se pueden importar hasta que los usuarios existan en `auth.users`:

- `users` (tabla pública) - 4 registros
- `user_profiles` - 1 registro
- `wishlists` - 2 registros
- `orders` - 19 registros
- `order_items` - 24 registros
- `product_matches` - 8 registros
- `ai_search_history` - 31 registros
- `saved_addresses` - 1 registro

**Total pendiente: 90 registros**

## Nuevas Credenciales de Supabase

```
NEXT_PUBLIC_SUPABASE_URL=https://uoqwgzhbsryopotxxohy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcXdnemhic3J5b3BvdHh4b2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4ODE2MDgsImV4cCI6MjA4NzQ1NzYwOH0.5xnycuNu2zNqHpn8HvukNhYHMhDV_2scaF2IoA5WWKo
```

**IMPORTANTE:** Necesitas obtener el `SUPABASE_SERVICE_ROLE_KEY` desde el dashboard de Supabase:
1. Ir a Project Settings > API
2. Copiar el "service_role" key (secreto)

## Próximos Pasos

### 1. Recrear Usuarios en auth.users

Usar Supabase Admin API o Dashboard para crear los 4 usuarios. Ver `MIGRATION_NOTES.md` para detalles.

### 2. Importar Tablas Restantes

Una vez que los usuarios existan, ejecutar los SQL files en `scripts/migrate-db/import-sql/` en este orden:

1. `users.sql`
2. `user_profiles.sql`
3. `wishlists.sql`
4. `orders.sql`
5. `order_items.sql`
6. `product_matches.sql`
7. `ai_search_history.sql`
8. `saved_addresses.sql`

### 3. Configurar Storage

1. Crear buckets en nueva BD:
   - `product-images` (público)
   - `brand-logos` (público)
2. Migrar archivos desde BD antigua (si es necesario)

### 4. Actualizar Variables de Entorno

Actualizar `.env.local` con las nuevas credenciales (ver arriba).

Actualizar en Vercel:
- Production environment
- Preview environment

### 5. Regenerar Tipos TypeScript

```bash
npx supabase gen types typescript --project-id uoqwgzhbsryopotxxohy > src/types/database.types.ts
```

## Archivos de Referencia

- `scripts/migrate-db/MIGRATION_NOTES.md` - Notas detalladas
- `scripts/migrate-db/import-sql/*.sql` - Archivos SQL listos para importar
- `scripts/migrate-db/exported-data/*.json` - Datos exportados

## Verificación

Después de completar la migración, verificar:

```sql
-- Verificar conteos
SELECT 'brands' as table_name, COUNT(*) as count FROM brands
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'users', COUNT(*) FROM users;
```
