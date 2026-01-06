# Migración: Agregar campo role a user_profiles

## Instrucciones

Ejecuta este SQL en el **Supabase SQL Editor** (Dashboard > SQL Editor):

```sql
-- Agregar campo role a user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' NOT NULL;

-- Crear índice para búsquedas rápidas de admins
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Comentario sobre el campo
COMMENT ON COLUMN user_profiles.role IS 'Role del usuario: user o admin';
```

## Después de ejecutar la migración

Para asignar el rol de administrador a un usuario, ejecuta:

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE user_id = '<user-id-aqui>';
```

Para encontrar el user_id, puedes consultar:

```sql
SELECT id, email FROM auth.users;
```

O desde la tabla users:

```sql
SELECT u.id, u.email, up.role 
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id;
```

## Verificación

Verifica que la migración se aplicó correctamente:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'role';
```

Deberías ver:
- column_name: role
- data_type: text
- column_default: 'user'::text

