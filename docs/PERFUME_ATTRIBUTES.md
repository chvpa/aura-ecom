# Atributos Detallados de Perfumes para IA y Segmentación

Este documento explica cómo usar los campos detallados de perfumes para búsquedas con IA y segmentación avanzada, basado en el análisis de páginas de productos tipo Fragrantica.

## 📊 Campos Agregados para Segmentación Avanzada

### 1. **Acordes Principales** (`main_accords`)

Los acordes principales representan las características olfativas dominantes del perfume con su intensidad (0-100%).

**Estructura JSON:**
```json
{
  "Cálido Especiado": 85,
  "Avainillado": 70,
  "Lavanda": 45,
  "Aromático": 35,
  "Atalcado": 25
}
```

**Uso para IA:**
- Búsquedas por acorde: "quiero algo cálido y especiado"
- Comparación de perfumes similares
- Recomendaciones basadas en acordes preferidos

**Ejemplos de acordes comunes:**
- Cálido Especiado
- Avainillado
- Lavanda
- Aromático
- Atalcado (Polvoso)
- Cítrico
- Amaderado
- Floral
- Acuático
- Gourmand
- Oriental
- Frutal

---

### 2. **Longevidad** (`longevity_hours`)

Duración del perfume en horas (número entero). Permite búsquedas numéricas precisas.

**Ejemplos:**
- `4` - Duración corta (Eau de Cologne)
- `6` - Duración moderada (Eau de Toilette)
- `8` - Duración larga (Eau de Parfum)
- `12` - Duración muy larga (Parfum)

**Uso para IA:**
- Búsquedas: "perfumes que duren más de 8 horas"
- Filtros por rango: `longevity_hours >= 8`
- Comparación de duración entre productos

---

### 3. **Estela** (`sillage_category`)

Categoría de proyección del perfume (qué tan lejos se percibe el aroma).

**Valores permitidos:**
- `"Ligera"` - Proyección cercana al cuerpo
- `"Moderada"` - Proyección media
- `"Fuerte"` - Proyección notable
- `"Muy Fuerte"` - Proyección muy intensa

**Uso para IA:**
- Búsquedas: "perfumes con estela fuerte"
- Filtros por ocasión: perfumes discretos vs. llamativos
- Recomendaciones según preferencias del usuario

---

### 4. **Diurno/Nocturno** (`time_of_day`)

Recomendación de uso por momento del día con porcentajes (0-100%).

**Estructura JSON:**
```json
{
  "day": 50,
  "night": 50
}
```

**Ejemplos:**
- `{"day": 90, "night": 10}` - Principalmente diurno
- `{"day": 50, "night": 50}` - Versátil (día y noche)
- `{"day": 10, "night": 90}` - Principalmente nocturno

**Uso para IA:**
- Búsquedas: "perfumes para la noche"
- Contexto de uso: "cita romántica de noche"
- Recomendaciones según hora del día

---

### 5. **Recomendaciones por Estación** (`season_recommendations`)

Niveles de recomendación por estación del año (0-100%).

**Estructura JSON:**
```json
{
  "invierno": 30,
  "primavera": 40,
  "verano": 20,
  "otono": 90
}
```

**Uso para IA:**
- Búsquedas: "perfumes para verano"
- Contexto climático: "clima caluroso"
- Recomendaciones según temporada actual
- Filtros por estación preferida

---

## 🔍 Uso en Búsquedas con IA

### Ejemplo de Query para IA

```typescript
// Búsqueda: "perfume cálido para la noche en invierno"

const searchCriteria = {
  main_accords: {
    "Cálido Especiado": { min: 70 } // Al menos 70% de acorde cálido
  },
  time_of_day: {
    night: { min: 60 } // Al menos 60% recomendado para noche
  },
  season_recommendations: {
    invierno: { min: 50 } // Al menos 50% recomendado para invierno
  },
  longevity_hours: { min: 6 }, // Mínimo 6 horas de duración
  sillage_category: ["Moderada", "Fuerte"] // Estela moderada o fuerte
};
```

### Prompts para Claude AI

```typescript
const AI_SEARCH_PROMPT = `
Analiza la siguiente búsqueda del usuario y proporciona recomendaciones de perfumes.

Búsqueda: "${query}"
Contexto: ${JSON.stringify(context)}

Considera los siguientes atributos del perfume:
- Acordes principales (main_accords): Intensidad de cada acorde (0-100%)
- Longevidad (longevity_hours): Duración en horas
- Estela (sillage_category): Ligera, Moderada, Fuerte, Muy Fuerte
- Diurno/Nocturno (time_of_day): Porcentajes de recomendación
- Estaciones (season_recommendations): Niveles por estación (0-100%)

Responde en formato JSON con:
{
  "productIds": ["id1", "id2", ...],
  "explanation": "explicación breve",
  "matchedAttributes": {
    "main_accords": ["Cálido Especiado", "Avainillado"],
    "time_of_day": "night",
    "season": "invierno"
  }
}
`;
```

---

## 🏷️ Estructura del Slug del Producto

El slug debe incluir información clave para SEO y búsquedas:

**Formato recomendado:**
```
{nombre-perfume}-{concentracion}-{tamaño}ml
```

**Ejemplos:**
- `midnight-orchid-eau-de-parfum-100ml`
- `citrus-breeze-eau-de-toilette-100ml`
- `wooden-elegance-eau-de-parfum-50ml`

**Información adicional en el slug (opcional):**
- Acorde principal: `midnight-orchid-cálido-especiado-eau-de-parfum-100ml`
- Género: `midnight-orchid-unisex-eau-de-parfum-100ml`

**Nota:** El slug debe ser único y descriptivo, pero no demasiado largo.

---

## 📈 Índices para Optimización

Se han creado índices para optimizar búsquedas:

```sql
-- Búsquedas por longevidad
CREATE INDEX idx_products_longevity ON products(longevity_hours);

-- Búsquedas por estela
CREATE INDEX idx_products_sillage ON products(sillage_category);
```

---

## 🎯 Casos de Uso

### 1. Búsqueda por Acorde
```sql
SELECT * FROM products
WHERE main_accords->>'Cálido Especiado'::int >= 70
AND is_active = true;
```

### 2. Búsqueda por Longevidad
```sql
SELECT * FROM products
WHERE longevity_hours >= 8
AND longevity_hours <= 12
AND is_active = true;
```

### 3. Búsqueda por Estela
```sql
SELECT * FROM products
WHERE sillage_category IN ('Fuerte', 'Muy Fuerte')
AND is_active = true;
```

### 4. Búsqueda por Diurno/Nocturno
```sql
SELECT * FROM products
WHERE (time_of_day->>'night')::int >= 70
AND is_active = true;
```

### 5. Búsqueda por Estación
```sql
SELECT * FROM products
WHERE (season_recommendations->>'verano')::int >= 70
AND is_active = true;
```

### 6. Búsqueda Combinada (IA)
```sql
SELECT * FROM products
WHERE 
  (main_accords->>'Cálido Especiado')::int >= 70
  AND longevity_hours >= 6
  AND sillage_category = 'Fuerte'
  AND (time_of_day->>'night')::int >= 60
  AND (season_recommendations->>'invierno')::int >= 50
  AND is_active = true
ORDER BY 
  (main_accords->>'Cálido Especiado')::int DESC,
  longevity_hours DESC;
```

---

## 🔄 Migración de Datos Existentes

Los campos `characteristics` (legacy) se mantienen para compatibilidad, pero se recomienda migrar a los nuevos campos estructurados:

```sql
-- Migrar duracion a longevity_hours
UPDATE products
SET longevity_hours = CASE
  WHEN characteristics->>'duracion' LIKE '%12%' THEN 12
  WHEN characteristics->>'duracion' LIKE '%10%' THEN 10
  WHEN characteristics->>'duracion' LIKE '%8%' THEN 8
  WHEN characteristics->>'duracion' LIKE '%6%' THEN 6
  WHEN characteristics->>'duracion' LIKE '%4%' THEN 4
  ELSE 6
END
WHERE longevity_hours IS NULL;

-- Migrar estela a sillage_category
UPDATE products
SET sillage_category = CASE
  WHEN characteristics->>'estela' = 'Ligera' THEN 'Ligera'
  WHEN characteristics->>'estela' = 'Moderada' THEN 'Moderada'
  WHEN characteristics->>'estela' = 'Fuerte' THEN 'Fuerte'
  WHEN characteristics->>'estela' = 'Muy Fuerte' THEN 'Muy Fuerte'
  ELSE 'Moderada'
END
WHERE sillage_category IS NULL;
```

---

## 📝 Notas Importantes

1. **Compatibilidad:** Los campos `characteristics` se mantienen para compatibilidad con datos existentes.

2. **Validación:** El campo `sillage_category` tiene un CHECK constraint para asegurar valores válidos.

3. **Búsquedas JSONB:** Usar operadores JSONB de PostgreSQL para búsquedas eficientes en campos JSON.

4. **IA Context:** Estos campos proporcionan contexto rico para prompts de IA, mejorando la precisión de recomendaciones.

5. **SEO:** El slug debe ser descriptivo pero conciso, incluyendo información clave del producto.

