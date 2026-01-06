-- Agregar campo role a user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' NOT NULL;

-- Crear índice para búsquedas rápidas de admins
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Comentario sobre el campo
COMMENT ON COLUMN user_profiles.role IS 'Role del usuario: user o admin';

