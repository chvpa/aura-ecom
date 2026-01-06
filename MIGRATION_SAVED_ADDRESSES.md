# Migración: Crear tabla saved_addresses

## Instrucciones

Ejecuta este SQL en el **Supabase SQL Editor** (Dashboard > SQL Editor):

El archivo SQL está en: `supabase/migrations/create_saved_addresses_table.sql`

O copia y pega el siguiente SQL:

```sql
-- Crear tabla para direcciones guardadas de usuarios
CREATE TABLE IF NOT EXISTS saved_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- "Casa", "Trabajo", "Oficina", etc.
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  department TEXT NOT NULL,
  city TEXT NOT NULL,
  street TEXT NOT NULL,
  reference TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_label UNIQUE (user_id, label)
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id ON saved_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_addresses_is_default ON saved_addresses(user_id, is_default) WHERE is_default = TRUE;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_saved_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_saved_addresses_updated_at
  BEFORE UPDATE ON saved_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_addresses_updated_at();

-- Función para asegurar que solo haya una dirección por defecto por usuario
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    -- Desmarcar otras direcciones por defecto del mismo usuario
    UPDATE saved_addresses
    SET is_default = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asegurar una sola dirección por defecto
CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON saved_addresses
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_address();

-- Habilitar RLS (Row Level Security)
ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias direcciones
CREATE POLICY "Users can view their own saved addresses"
  ON saved_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propias direcciones
CREATE POLICY "Users can insert their own saved addresses"
  ON saved_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias direcciones
CREATE POLICY "Users can update their own saved addresses"
  ON saved_addresses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias direcciones
CREATE POLICY "Users can delete their own saved addresses"
  ON saved_addresses
  FOR DELETE
  USING (auth.uid() = user_id);
```

## Después de ejecutar la migración

1. Verifica que la tabla se creó correctamente:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'saved_addresses';
```

2. Verifica que las políticas RLS están activas:
```sql
SELECT * FROM pg_policies WHERE tablename = 'saved_addresses';
```

3. Regenera los tipos TypeScript (si usas Supabase CLI):
```bash
npx supabase gen types typescript --project-id <tu-project-id> > src/types/database.types.ts
```

## Funcionalidad

Una vez ejecutada la migración, los usuarios podrán:
- Guardar direcciones de envío con etiquetas personalizadas (Casa, Trabajo, etc.)
- Seleccionar direcciones guardadas en el checkout
- Marcar una dirección como predeterminada
- La primera dirección guardada se marca automáticamente como predeterminada

