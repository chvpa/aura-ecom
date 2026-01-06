# AURA PERFUMES - DOCUMENTACIÓN COMPLETA DEL PROYECTO

## 📋 DESCRIPCIÓN DEL PROYECTO

**Aura Perfumes** es un ecommerce innovador de perfumes para el mercado paraguayo que utiliza inteligencia artificial para personalizar la experiencia de compra. El sistema analiza las preferencias olfativas de cada usuario y recomienda fragancias basadas en sus gustos, ocasiones y contexto local.

### Propuesta de Valor Única
- **AI Matcher**: Búsqueda de perfumes por descripción en lenguaje natural con contexto paraguayo
- **Perfil Olfativo Personalizado**: Onboarding interactivo que aprende las preferencias del usuario
- **Match Inteligente**: Porcentaje de compatibilidad entre perfil de usuario y productos
- **Comparador de Fragancias**: Comparación detallada entre productos con IA
- **Productos Similares**: Sistema "Huele similar a..." con alternativas económicas

---

## 🛠 STACK TECNOLÓGICO

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Lenguaje**: TypeScript 5+
- **Estilos**: Tailwind CSS 4
- **Componentes UI**: shadcn/ui
- **Gestión de Estado**: Zustand
- **Validación**: Zod
- **Formularios**: React Hook Form
- **Iconos**: Lucide React
- **Fuente**: Manrope (Google Fonts)

### Backend/Database
- **BaaS**: Supabase
  - PostgreSQL Database
  - Authentication
  - Storage (imágenes de productos)
  - Real-time subscriptions
  - Row Level Security (RLS)

### IA/ML
- **Modelo**: Claude (Anthropic API)
- **Integración**: MCP (Model Context Protocol)
- **Uso**: 
  - AI Matcher (búsqueda semántica)
  - Generación de perfiles olfativos
  - Comparación de productos
  - Recomendaciones personalizadas

### DevOps/Deployment
- **Hosting**: Vercel
- **CI/CD**: Vercel Git Integration
- **Analytics**: Vercel Analytics

### Herramientas de Desarrollo
- **IDE**: Cursor
- **Control de Versiones**: Git + GitHub
- **Package Manager**: bun
- **Linting**: ESLint + Prettier
- **Testing**: Vitest + React Testing Library (Fase 2)

---

## 🗄 ESTRUCTURA DE BASE DE DATOS (SUPABASE)

### Tablas Principales

#### `users` (extends Supabase Auth)
```sql
- id (uuid, PK)
- email (text)
- full_name (text)
- phone (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `user_profiles`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> users.id)
- onboarding_completed (boolean, default: false)
- preferences (jsonb)
  {
    "familias_favoritas": ["Floral", "Cítrico"],
    "intensidad_preferida": "Moderado",
    "ocasiones": ["Casual", "Formal"],
    "clima_preferido": ["Calor", "Templado"]
  }
- created_at (timestamp)
- updated_at (timestamp)
```

#### `brands`
```sql
- id (uuid, PK)
- name (text, unique)
- slug (text, unique)
- description (text, nullable)
- logo_url (text, nullable)
- is_active (boolean, default: true)
- created_at (timestamp)
```

#### `olfactory_families`
```sql
- id (uuid, PK)
- name (text, unique) // "Floral", "Cítrico", "Amaderado", etc.
- slug (text, unique)
- description (text)
- color (text) // Para UI
- icon (text, nullable)
- created_at (timestamp)
```

#### `products`
```sql
- id (uuid, PK)
- sku (text, unique) // "AU-2023-001"
- name (text) // "Midnight Orchid"
- slug (text, unique) // "midnight-orchid-eau-de-parfum-100ml"
- brand_id (uuid, FK -> brands.id)
- description_short (text) // Descripción corta para cards
- description_long (text) // Descripción completa del producto
- price_pyg (integer) // 850000
- original_price_pyg (integer, nullable) // 980000 (para mostrar descuento)
- discount_percentage (integer, nullable) // calculado: ((original - actual) / original) * 100
- stock (integer)
- is_active (boolean, default: true)
- is_featured (boolean, default: false) // Para destacados
- gender (text) // "Hombre", "Mujer", "Unisex"
- size_ml (integer) // 100
- concentration (text) // "Eau de Parfum", "Eau de Toilette", "Parfum"
- main_image_url (text)
- images (jsonb) // Array de URLs adicionales
- notes (jsonb) // Notas individuales por fase
  {
    "top": ["Orquídea negra", "Pimienta rosa"],
    "heart": ["Maderas ahumadas", "Rosa"],
    "base": ["Ámbar", "Vainilla"]
  }
- main_accords (jsonb) // Acordes principales con intensidad (0-100%)
  {
    "Cálido Especiado": 85,
    "Avainillado": 70,
    "Lavanda": 45,
    "Aromático": 35,
    "Atalcado": 25
  }
- longevity_hours (integer, nullable) // Duración en horas (número para búsquedas)
  // Ejemplo: 8 (horas de duración)
- sillage_category (text, nullable) // Categoría de proyección
  // CHECK: "Ligera", "Moderada", "Fuerte", "Muy Fuerte"
- time_of_day (jsonb) // Recomendación diurno/nocturno con porcentajes
  {
    "day": 50,
    "night": 50
  }
- season_recommendations (jsonb) // Niveles de recomendación por estación (0-100%)
  {
    "invierno": 30,
    "primavera": 40,
    "verano": 20,
    "otono": 90
  }
- characteristics (jsonb) // Características adicionales (legacy, mantener compatibilidad)
  {
    "duracion": "8-10 hrs",
    "estela": "Moderada", // Proyección
    "intensidad": "Alta",
    "temporada": ["Invierno", "Noche"],
    "ocasion": ["Nocturno", "Sofisticado"]
  }
- family_percentages (jsonb) // Para el ADN Olfativo
  {
    "Floral": 85,
    "Amaderado": 60,
    "Especiado": 40
  }
- ai_analysis (text, nullable) // "Basado en tus preferencias por notas amaderadas..."
- meta_title (text, nullable) // SEO
- meta_description (text, nullable) // SEO
- created_at (timestamp)
- updated_at (timestamp)
```

#### `product_families` (relación many-to-many)
```sql
- product_id (uuid, FK -> products.id)
- family_id (uuid, FK -> olfactory_families.id)
- is_primary (boolean, default: false)
- PRIMARY KEY (product_id, family_id)
```

#### `wishlists`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> users.id)
- product_id (uuid, FK -> products.id)
- created_at (timestamp)
- UNIQUE (user_id, product_id)
```

#### `orders`
```sql
- id (uuid, PK)
- order_number (text, unique) // "AU-9281"
- user_id (uuid, FK -> users.id)
- status (text) // "pending", "processing", "shipped", "delivered", "cancelled"
- subtotal_pyg (integer)
- shipping_cost_pyg (integer)
- total_pyg (integer)
- payment_method (text)
- payment_status (text)
- shipping_address (jsonb)
  {
    "full_name": "María González",
    "phone": "0981234567",
    "street": "Av. España 123",
    "city": "Asunción",
    "department": "Central",
    "reference": "Cerca del supermercado"
  }
- tracking_number (text, nullable)
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `order_items`
```sql
- id (uuid, PK)
- order_id (uuid, FK -> orders.id)
- product_id (uuid, FK -> products.id)
- quantity (integer)
- unit_price_pyg (integer)
- subtotal_pyg (integer)
- created_at (timestamp)
```

#### `product_matches` (cache de matches calculados)
```sql
- id (uuid, PK)
- user_id (uuid, FK -> users.id)
- product_id (uuid, FK -> products.id)
- match_percentage (integer) // 0-100
- match_reasons (jsonb)
  {
    "familia_match": true,
    "ocasion_match": true,
    "intensidad_match": false
  }
- calculated_at (timestamp)
- expires_at (timestamp) // Para invalidar cache
```

#### `ai_search_history`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> users.id, nullable)
- search_query (text)
- context (jsonb)
  {
    "ocasion": "Cita romántica de noche",
    "clima": "Caluroso",
    "genero": "Hombre"
  }
- results (jsonb) // IDs de productos retornados
- created_at (timestamp)
```

#### `product_comparisons`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> users.id, nullable)
- product_1_id (uuid, FK -> products.id)
- product_2_id (uuid, FK -> products.id)
- ai_comparison (jsonb) // Resultado de la comparación con IA
- created_at (timestamp)
```

#### `notifications`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> users.id)
- type (text) // "restock", "price_drop", "new_match", "general"
- title (text)
- message (text)
- data (jsonb, nullable) // Info adicional (product_id, etc)
- is_read (boolean, default: false)
- created_at (timestamp)
```

### Índices Importantes
```sql
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_product_matches_user ON product_matches(user_id, expires_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

### Row Level Security (RLS) Policies

```sql
-- Users pueden ver solo su propio perfil
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Productos son públicos
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (is_active = true);

-- Wishlists privadas
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own wishlist" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

-- Orders privadas
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Notifications privadas
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);
```

---

## 🏗 ARQUITECTURA DEL PROYECTO (SCREAMING ARCHITECTURE)

```
aura-perfumes/
│
├── public/
│   ├── fonts/
│   ├── images/
│   └── icons/
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── onboarding/           # Perfil olfativo inicial
│   │   │
│   │   ├── (shop)/
│   │   │   ├── page.tsx              # Home
│   │   │   ├── perfumes/
│   │   │   │   ├── page.tsx          # Catálogo
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Detalle de producto
│   │   │   ├── busqueda-ia/
│   │   │   │   └── page.tsx          # Resultados AI Matcher
│   │   │   ├── comparar/
│   │   │   │   └── page.tsx          # Comparador
│   │   │   ├── marcas/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   └── categorias/
│   │   │       └── [mood]/
│   │   │
│   │   ├── (account)/
│   │   │   └── cuenta/
│   │   │       ├── page.tsx          # Resumen
│   │   │       ├── perfil/
│   │   │       ├── pedidos/
│   │   │       ├── wishlist/
│   │   │       └── perfil-olfativo/
│   │   │
│   │   ├── (checkout)/
│   │   │   ├── carrito/
│   │   │   ├── checkout/
│   │   │   └── confirmacion/
│   │   │
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── productos/
│   │   │   ├── pedidos/
│   │   │   └── configuracion/
│   │   │
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   │   ├── match/            # Calcular match %
│   │   │   │   ├── search/           # AI Matcher
│   │   │   │   ├── compare/          # Comparador
│   │   │   │   └── profile/          # Generar perfil olfativo
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   └── webhooks/
│   │   │
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── features/                     # Feature-based organization
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── OnboardingWizard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useOnboarding.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   ├── products/
│   │   │   ├── components/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductGrid.tsx
│   │   │   │   ├── ProductDetails.tsx
│   │   │   │   ├── ProductFilters.tsx
│   │   │   │   ├── MatchBadge.tsx
│   │   │   │   └── SimilarProducts.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProducts.ts
│   │   │   │   ├── useProductMatch.ts
│   │   │   │   └── useProductFilters.ts
│   │   │   ├── services/
│   │   │   │   └── productService.ts
│   │   │   └── types/
│   │   │       └── product.types.ts
│   │   │
│   │   ├── ai/
│   │   │   ├── components/
│   │   │   │   ├── AISearchBar.tsx
│   │   │   │   ├── AISearchResults.tsx
│   │   │   │   ├── ProductComparator.tsx
│   │   │   │   └── OlfactoryProfileDisplay.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAISearch.ts
│   │   │   │   ├── useAIComparison.ts
│   │   │   │   └── useOlfactoryProfile.ts
│   │   │   ├── services/
│   │   │   │   ├── aiMatcherService.ts
│   │   │   │   ├── aiComparisonService.ts
│   │   │   │   └── profileGeneratorService.ts
│   │   │   └── types/
│   │   │       └── ai.types.ts
│   │   │
│   │   ├── cart/
│   │   │   ├── components/
│   │   │   │   ├── CartDrawer.tsx
│   │   │   │   ├── CartItem.tsx
│   │   │   │   └── CartSummary.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useCart.ts
│   │   │   ├── store/
│   │   │   │   └── cartStore.ts       # Zustand store
│   │   │   └── types/
│   │   │       └── cart.types.ts
│   │   │
│   │   ├── wishlist/
│   │   │   ├── components/
│   │   │   │   ├── WishlistButton.tsx
│   │   │   │   └── WishlistGrid.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useWishlist.ts
│   │   │   ├── services/
│   │   │   │   └── wishlistService.ts
│   │   │   └── types/
│   │   │       └── wishlist.types.ts
│   │   │
│   │   ├── orders/
│   │   │   ├── components/
│   │   │   │   ├── OrderCard.tsx
│   │   │   │   ├── OrderDetails.tsx
│   │   │   │   └── OrderTracking.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useOrders.ts
│   │   │   ├── services/
│   │   │   │   └── orderService.ts
│   │   │   └── types/
│   │   │       └── order.types.ts
│   │   │
│   │   ├── checkout/
│   │   │   ├── components/
│   │   │   │   ├── CheckoutForm.tsx
│   │   │   │   ├── ShippingForm.tsx
│   │   │   │   ├── PaymentMethodSelector.tsx
│   │   │   │   └── OrderSummary.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useCheckout.ts
│   │   │   ├── services/
│   │   │   │   └── checkoutService.ts
│   │   │   └── types/
│   │   │       └── checkout.types.ts
│   │   │
│   │   └── notifications/
│   │       ├── components/
│   │       │   ├── NotificationBell.tsx
│   │       │   └── NotificationItem.tsx
│   │       ├── hooks/
│   │       │   └── useNotifications.ts
│   │       └── services/
│   │           └── notificationService.ts
│   │
│   ├── components/                   # Componentes compartidos
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── MobileMenu.tsx
│   │   │
│   │   └── shared/
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── SearchBar.tsx
│   │
│   ├── lib/                          # Utilidades y configuración
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   │
│   │   ├── anthropic/
│   │   │   ├── client.ts
│   │   │   └── prompts.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts                 # clsx + tailwind-merge
│   │   │   ├── formatters.ts         # Formato de precios, fechas
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   │
│   │   └── config/
│   │       ├── site.ts               # Metadata del sitio
│   │       └── navigation.ts
│   │
│   ├── hooks/                        # Hooks globales
│   │   ├── useMediaQuery.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useClickOutside.ts
│   │
│   ├── types/                        # Tipos globales
│   │   ├── database.types.ts         # Generados por Supabase
│   │   └── global.types.ts
│   │
│   └── styles/
│       └── globals.css               # Tailwind + custom styles
│
├── .cursorrules                      # Reglas para Cursor AI
├── .env.local.example
├── .env.local
├── .eslintrc.json
├── .gitignore
├── components.json                   # shadcn config
├── next.config.js
├── package.json
├── bun.lockb
├── postcss.config.js
├── tailwind.config.ts (opcional en v4, pero necesario para shadcn/ui)
├── tsconfig.json
└── README.md
```

---

## 🎨 DESIGN SYSTEM

### Paleta de Colores (Tailwind CSS v4)

**Nota**: Tailwind CSS v4 soporta tanto configuración tradicional (tailwind.config.ts) como nueva sintaxis CSS (@theme inline). Para compatibilidad con shadcn/ui, usaremos la configuración tradicional.

```typescript
// tailwind.config.ts (opcional en v4, pero necesario para shadcn/ui)
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        // Violeta principal
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',  // Main violet
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        // Acento para badges/descuentos
        accent: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',  // Main yellow/gold
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        // Grises para texto y fondos
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'semi': '12px',  // Semi-rounded default
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(168, 85, 247, 0.1), 0 2px 4px -1px rgba(168, 85, 247, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(168, 85, 247, 0.2), 0 4px 6px -2px rgba(168, 85, 247, 0.1)',
      },
    },
  },
}
```

**Alternativa con CSS nativo (Tailwind v4):**
```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-primary-50: #faf5ff;
  --color-primary-500: #a855f7;
  /* ... más colores ... */
  --font-sans: 'Manrope', system-ui, sans-serif;
  --radius-semi: 12px;
}
```

### Componentes Base (shadcn/ui)

**Componentes a instalar:**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add sheet
```

### Componentes Customizados

#### MatchBadge
```typescript
// src/features/products/components/MatchBadge.tsx
interface MatchBadgeProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
}

// Muestra el % de match con gradiente según el valor
// 0-50%: neutral/gris
// 51-75%: accent/amarillo
// 76-100%: primary/violeta
```

#### ProductCard
```typescript
// src/features/products/components/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  matchPercentage?: number;
  showWishlist?: boolean;
  onQuickView?: () => void;
}

// Card de producto con:
// - Imagen
// - Badge de match %
// - Botón wishlist
// - Precio (con descuento si aplica)
// - Botón de agregar al carrito
```

#### AISearchBar
```typescript
// src/features/ai/components/AISearchBar.tsx
interface AISearchBarProps {
  placeholder?: string;
  onSearch: (query: string, context: SearchContext) => void;
  suggestions?: string[];
}

// Barra de búsqueda con:
// - Input principal
// - Badges de contexto (ocasión, género, intensidad)
// - Sugerencias de búsqueda
```

### Tipografía

```css
/* globals.css */
h1 {
  @apply text-4xl font-bold tracking-tight;
}

h2 {
  @apply text-3xl font-bold tracking-tight;
}

h3 {
  @apply text-2xl font-semibold;
}

h4 {
  @apply text-xl font-semibold;
}

p {
  @apply text-base leading-7;
}

.text-small {
  @apply text-sm leading-6;
}

.text-tiny {
  @apply text-xs leading-5;
}
```

---

## 🔌 LIBRERÍAS Y DEPENDENCIAS

### Producción
```json
{
  "dependencies": {
    "next": "^16.1.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "typescript": "^5.7.0",
    
    // UI
    "@radix-ui/react-accordion": "^1.2.1",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-checkbox": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-popover": "^1.1.2",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.1",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.1",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "tailwindcss": "^4.0.0",
    "tailwind-merge": "^2.5.4",
    "clsx": "^2.1.1",
    "class-variance-authority": "^0.7.0",
    "lucide-react": "^0.468.0",
    "framer-motion": "^11.15.0",
    
    // State Management
    "zustand": "^5.0.2",
    
    // Forms & Validation
    "react-hook-form": "^7.54.2",
    "zod": "^3.24.1",
    "@hookform/resolvers": "^3.9.1",
    
    // Database & Auth
    "@supabase/supabase-js": "^2.47.10",
    "@supabase/ssr": "^0.5.2",
    
    // AI
    "@anthropic-ai/sdk": "^0.32.1",
    
    // Utils
    "date-fns": "^4.1.0",
    "nanoid": "^5.0.9",
    "sonner": "^1.7.1",
    "resend": "^4.0.1"
  }
}
```

### Desarrollo
```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@types/node": "^22.10.5",
    "@types/react": "^19.0.6",
    "@types/react-dom": "^19.0.2",
    "eslint": "^9.17.0",
    "eslint-config-next": "^16.1.0",
    "prettier": "^3.4.2",
    "prettier-plugin-tailwindcss": "^0.6.9",
    "typescript": "^5.7.2"
  }
}
```

---

## 🤖 MCP (MODEL CONTEXT PROTOCOL)

### Configuración MCP para Supabase

```json
// .mcp/config.json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
```

### Uso de MCP en el Proyecto

**Para qué usaremos MCP:**
1. **Gestión de Base de Datos**: Crear/modificar tablas, queries complejas
2. **Generación de Tipos**: Auto-generar tipos TypeScript desde Supabase
3. **Debugging**: Consultar datos directamente desde Cursor
4. **Migraciones**: Gestionar cambios de schema

**Comandos útiles:**
```typescript
// En Cursor, con MCP activo:
// "Create a migration to add ai_embeddings column to products table"
// "Generate TypeScript types from current database schema"
// "Show me all products with stock less than 10"
```

---

## ⚙️ CURSOR RULES

Las reglas completas de Cursor están en el archivo `.cursorrules` en la raíz del proyecto.

**Principios fundamentales:**
1. Código de producción siempre - No placeholders, no TODOs
2. Build al final de cada sprint - Fix todos los errores
3. shadcn/ui obligatorio - No crear componentes UI desde cero
4. Optimizar queries siempre - Select específico, paginación, caché
5. TypeScript estricto - Sin any, todo tipado
6. Performance first - Next/image, lazy loading, memoization apropiado
7. Error handling completo - Try/catch, validación, mensajes claros

Ver archivo `.cursorrules` para detalles completos y ejemplos de código.

---

## 📊 ROADMAP DE DESARROLLO

## 📋 Project Overview
**Aura Perfumes** - Ecommerce de perfumes con IA para el mercado paraguayo

**Current Phase**: Sprint 2 Completado - Database & Schema  
**Next Sprint**: Sprint 3 - Autenticación & Onboarding  
**Target Launch**: TBD  
**Team Size**: 1 developer

---

## 🎯 FASE 1: MVP - FUNDACIÓN
**Objetivo**: Ecommerce funcional con AI Matcher y perfil olfativo

### ✅ Completado
- [x] Documentación del proyecto
- [x] Sprint 1: Setup & Infraestructura
- [x] Sprint 2: Database & Schema
- [x] Sprint 3: Autenticación & Onboarding
- [x] Sprint 4: Catálogo de Productos
- [x] Sprint 5: AI Matcher - Match %
- [x] Sprint 7: Carrito & Wishlist
- [x] Sprint 8: Checkout
- [x] Sprint 9: Gestión de Pedidos (Usuario)

### 🚧 En Progreso
- [ ] Sprint 10: Panel Admin Básico (próximo)

### 📋 Por Hacer

#### SPRINT 1: Setup & Infraestructura (1 semana) ✅ COMPLETADO
- [x] Inicializar proyecto Next.js 16 con TypeScript
- [x] Configurar Tailwind CSS + shadcn/ui
- [x] Setup de Supabase (proyecto + local)
- [x] Configurar variables de entorno (.env.local.example)
- [x] Setup Git + GitHub (repositorio inicializado)
- [x] Instalar dependencias base (zustand, react-hook-form, zod)
- [x] Configurar paleta de colores violeta + acento
- [x] Instalar componentes shadcn necesarios
- [x] Crear componentes de layout (Header, Footer, Navigation)
- [x] Configurar fuente Manrope
- [x] Crear design tokens en Tailwind
- [x] Crear estructura de carpetas (Screaming Architecture)
- [x] Crear utilidades básicas (cn, formatters, constants)
- [x] Configurar Prettier
- [x] Build exitoso sin errores

**Entregables**: ✅ Proyecto base configurado, design system listo

---

#### SPRINT 2: Database & Schema (1 semana) ✅ COMPLETADO
- [x] Crear tabla `users` (extends Supabase Auth)
- [x] Crear tabla `user_profiles` con preferencias olfativas
- [x] Crear tabla `brands`
- [x] Crear tabla `olfactory_families`
- [x] Crear tabla `products` completa con todos los campos
- [x] Agregar campos avanzados: `main_accords`, `longevity_hours`, `sillage_category`, `time_of_day`, `season_recommendations`
- [x] Crear tabla `product_families` (many-to-many)
- [x] Crear tabla `wishlists`
- [x] Crear tabla `orders`
- [x] Crear tabla `order_items`
- [x] Crear tabla `product_matches` (cache)
- [x] Crear tabla `ai_search_history`
- [x] Crear tabla `product_comparisons`
- [x] Crear tabla `notifications`
- [x] Configurar todos los índices (incluyendo nuevos índices para longevidad y estela)
- [x] Configurar RLS policies para todas las tablas
- [x] Generar tipos TypeScript desde Supabase
- [x] Seed inicial: 8 familias olfativas
- [x] Seed inicial: 8 marcas populares
- [x] Seed de 8 productos de ejemplo con datos completos y descripciones

**Entregables**: Base de datos completa con RLS, tipos generados, data seed, campos avanzados para IA ✅

---

#### SPRINT 3: Autenticación & Onboarding (1.5 semanas) ✅ COMPLETADO
- [ ] Implementar login con Supabase Auth (`/login`)
- [ ] Implementar registro de usuarios (`/register`)
- [ ] Implementar reset de password (`/reset-password`)
- [ ] Protección de rutas privadas (HOC/hook)
- [ ] Session management (hook `useAuth`)
- [ ] Crear OnboardingWizard component (multi-step)
- [ ] Step 1: Selección de familias favoritas (visual grid)
- [ ] Step 2: Intensidad preferida (slider)
- [ ] Step 3: Ocasiones de uso (checkboxes)
- [ ] Step 4: Preferencias de clima (cards visuales)
- [ ] Guardar perfil en `user_profiles.preferences` (JSONB)
- [ ] Animaciones entre pasos (Framer Motion)
- [ ] Página de perfil de usuario (`/cuenta/perfil`)
- [ ] Editar información personal
- [ ] Visualizar perfil olfativo
- [ ] Opción de re-hacer onboarding
- [ ] Validaciones con Zod schemas
- [ ] Manejo de errores y loading states

**Entregables**: Auth completo, onboarding funcional con 4 pasos, página de perfil

**Ver plan detallado**: `docs/SPRINT3_PLAN.md`

---

#### SPRINT 4: Catálogo de Productos (2 semanas) ✅ COMPLETADO
- [ ] Crear ProductCard component con match %
- [ ] Crear ProductGrid component responsivo
- [ ] Implementar paginación
- [ ] Loading states (skeletons)
- [ ] Empty states
- [ ] Página de listado de productos
- [ ] Filtro por marca
- [ ] Filtro por familia olfativa
- [ ] Filtro por rango de precio (slider)
- [ ] Filtro por género
- [ ] Búsqueda por texto (nombre, marca)
- [ ] URL params para filtros compartibles
- [ ] Página de detalle de producto
- [ ] Galería de imágenes del producto
- [ ] Información completa (descripción, precio, stock)
- [ ] Notas olfativas (top, heart, base)
- [ ] Características (longevidad, proyección)
- [ ] Match % destacado visualmente
- [ ] Botón agregar al carrito
- [ ] Botón de wishlist
- [ ] Página por marca
- [ ] Página por mood/ocasión
- [ ] Página por género

**Entregables**: Catálogo completo con filtros, detalle de producto

---

#### SPRINT 5: AI Matcher - Match % (2 semanas) ✅ COMPLETADO
- [x] Setup de Anthropic API client
- [x] Crear API route `/api/ai/match`
- [x] Diseñar prompt para cálculo de match
- [x] Implementar lógica de puntuación (0-100%)
- [x] Guardar resultado en `product_matches`
- [x] Sistema de caché (7 días de validez)
- [x] Invalidación de caché
- [x] Calcular match para todos los productos (batch)
- [x] Mostrar match % en ProductCard
- [x] Explicar por qué el match (tooltip o modal)
- [ ] Ordenar productos por match en listado (opcional, puede agregarse después)
- [ ] Testing de precisión del match

**Entregables**: Sistema de match funcionando, visible en catálogo ✅

---

#### SPRINT 6: AI Matcher - Búsqueda Semántica (2 semanas)
- [ ] Crear AISearchBar component
- [ ] Input de búsqueda en lenguaje natural
- [ ] Context badges (ocasión, género, intensidad)
- [ ] Crear API route `/api/ai/search`
- [ ] Diseñar prompt estructurado para búsqueda
- [ ] Parsing de contexto paraguayo (clima, eventos)
- [ ] Integración con catálogo de productos
- [ ] Aplicación de filtros post-IA
- [ ] Página de resultados `/busqueda-ia`
- [ ] Grid de productos recomendados
- [ ] Explicación de recomendaciones
- [ ] Filtros inteligentes aplicados automáticamente
- [ ] Opción de refinar búsqueda
- [ ] Guardar búsqueda en `ai_search_history`
- [ ] Sugerencias de búsqueda populares

**Entregables**: AI Matcher completo y funcional

---

#### SPRINT 7: Carrito & Wishlist (1 semana)
- [ ] Crear Zustand store para carrito
- [ ] Persistencia en localStorage
- [ ] CartDrawer component (sheet lateral)
- [ ] CartItem component
- [ ] Agregar producto al carrito
- [ ] Quitar producto del carrito
- [ ] Modificar cantidades
- [ ] Cálculo de subtotal
- [ ] Validación de stock disponible
- [ ] Contador en header
- [ ] WishlistButton component (corazón)
- [ ] Toggle wishlist en ProductCard
- [ ] Guardar wishlist en BD (usuario autenticado)
- [ ] Página `/cuenta/wishlist`
- [ ] Agregar al carrito desde wishlist
- [ ] Remover de wishlist
- [ ] Contador de wishlist en header
- [ ] Sincronización con BD

**Entregables**: Carrito y wishlist completamente funcionales

---

#### SPRINT 8: Checkout (2 semanas)
- [ ] Página `/carrito` con resumen completo
- [ ] Página `/checkout`
- [ ] Formulario de datos de envío
- [ ] Validación con Zod
- [ ] Departamentos y ciudades de Paraguay
- [ ] Campo de referencia de ubicación
- [ ] Selección de método de pago
- [ ] Opciones: transferencia, giro, tarjeta
- [ ] Resumen de orden (sidebar)
- [ ] Cálculo de costo de envío
- [ ] Total final en Guaraníes
- [ ] Botón de confirmar orden
- [ ] Crear orden en `orders` table
- [ ] Crear items en `order_items`
- [ ] Generar número de orden único (#AU-XXXX)
- [ ] Reducir stock de productos
- [ ] Limpiar carrito después de compra
- [ ] Página de confirmación `/confirmacion/[orderId]`
- [ ] Email de confirmación (básico)

**Entregables**: Checkout completo end-to-end

---

#### SPRINT 9: Gestión de Pedidos (Usuario) (1 semana) ✅ COMPLETADO
- [x] Página `/cuenta/pedidos`
- [x] Listado de pedidos del usuario
- [x] OrderCard component con estado
- [x] Filtros por estado
- [x] Página de detalle `/cuenta/pedidos/[orderId]`
- [x] Información completa del pedido
- [x] Productos ordenados
- [x] Dirección de envío
- [x] Estado actual y timeline
- [x] Número de tracking (si existe)
- [x] Opción de re-ordenar
- [ ] Descargar factura (futuro)

**Entregables**: ✅ Usuario puede ver y gestionar sus pedidos

---

#### SPRINT 10: Panel Admin Básico (1.5 semanas)
- [ ] Protección de rutas admin (role check)
- [ ] Layout de admin con sidebar
- [ ] Dashboard `/admin/dashboard`
- [ ] KPIs: Total ventas, Pedidos, Ticket promedio
- [ ] Gráfico simple de ventas (últimos 30 días)
- [ ] Últimos pedidos
- [ ] Productos con stock bajo (<10)
- [ ] Página `/admin/productos`
- [ ] Listado de productos con búsqueda
- [ ] Filtros básicos
- [ ] Crear nuevo producto (formulario completo)
- [ ] Upload de imágenes a Supabase Storage
- [ ] Editar producto existente
- [ ] Activar/desactivar producto
- [ ] Gestión de stock
- [ ] Página `/admin/pedidos`
- [ ] Listado completo de pedidos
- [ ] Filtros por estado y fecha
- [ ] Cambiar estado de pedido
- [ ] Ver detalle completo
- [ ] Agregar número de tracking

**Entregables**: Admin funcional para operaciones básicas

---

#### SPRINT 11: Testing & Optimización MVP (1 semana)
- [ ] Testing manual de flujo completo
- [ ] Compra end-to-end
- [ ] AI Matcher con 20+ queries diferentes
- [ ] Todos los filtros de catálogo
- [ ] Wishlist y carrito
- [ ] Checkout en desktop y mobile
- [ ] Testing responsive en dispositivos reales
- [ ] Optimización de imágenes (next/image)
- [ ] Lazy loading de componentes pesados
- [ ] Code splitting de rutas
- [ ] Optimización de Core Web Vitals
- [ ] Caché de búsquedas de IA
- [ ] Error boundaries en rutas críticas
- [ ] Loading states mejorados
- [ ] Toast notifications para acciones
- [ ] Fix de bugs encontrados

**Entregables**: MVP testeado y optimizado

---

#### SPRINT 12: Deploy MVP (0.5 semanas)
- [ ] Deploy a Vercel (production)
- [ ] Configurar variables de entorno en Vercel
- [ ] Conectar con dominio custom
- [ ] Configurar Supabase production
- [ ] Migración de datos de dev a prod
- [ ] Seed de productos iniciales en prod
- [ ] Vercel Analytics setup
- [ ] Monitoring de errores básico
- [ ] Testing en producción
- [ ] README actualizado
- [ ] Documentación de deployment

**Entregables**: MVP en producción funcionando

---

## 🎯 FASE 2: DIFERENCIACIÓN
**Objetivo**: Features únicas que distingan a Aura en Paraguay

### 📋 Por Hacer

#### SPRINT 13: Comparador de Productos (1.5 semanas)
- [ ] Crear página `/comparar`
- [ ] UI de selección de productos (máx 2)
- [ ] ProductComparator component
- [ ] Tabla comparativa side-by-side responsive
- [ ] Comparación de notas olfativas
- [ ] Comparación de características
- [ ] Comparación de precios
- [ ] Crear API route `/api/ai/compare`
- [ ] Prompt estructurado para comparación con IA
- [ ] Explicación de diferencias clave
- [ ] Recomendación basada en perfil usuario
- [ ] Guardar en `product_comparisons` (caché)
- [ ] Botón "Comparar" en ProductCard
- [ ] Modal de comparación rápida
- [ ] Compartir comparación (URL)

**Entregables**: Comparador con IA completamente funcional

---

#### SPRINT 14: "Huele Similar a..." (1 semana)
- [ ] Algoritmo de productos similares por familias
- [ ] Similitud por notas olfativas
- [ ] Integración con IA para mejores sugerencias
- [ ] SimilarProducts component
- [ ] Sección en página de detalle de producto
- [ ] Carrusel de productos similares
- [ ] Indicador de % de similitud
- [ ] Filtro de rango de precio
- [ ] Botón "Ver alternativas económicas"
- [ ] Modal con alternativas más baratas
- [ ] Explicación de similitudes y diferencias
- [ ] Ordenar por precio o similitud

**Entregables**: Sistema de productos similares operativo

---

#### SPRINT 15: Notificaciones Inteligentes (1.5 semanas)
- [ ] Sistema backend de notificaciones
- [ ] NotificationBell component en header
- [ ] Dropdown de notificaciones
- [ ] Marcar como leída
- [ ] Marcar todas como leídas
- [ ] Notificaciones de restock
- [ ] Suscripción a producto sin stock
- [ ] Notificar cuando vuelva disponible
- [ ] Notificaciones de precio
- [ ] Alertar descuentos en wishlist
- [ ] Alertar bajadas de precio
- [ ] Notificaciones de match
- [ ] Nuevos productos con match >80%
- [ ] Recomendaciones semanales personalizadas
- [ ] Email notifications (Resend)
- [ ] In-app notifications

**Entregables**: Sistema de notificaciones completo

---

#### SPRINT 16: Mejoras de UX & Performance (1 semana)
- [ ] Implementar Framer Motion
- [ ] Micro-interacciones en botones
- [ ] Transiciones suaves entre páginas
- [ ] Animación de agregar al carrito
- [ ] Loading states animados
- [ ] Audit completo de accesibilidad
- [ ] Keyboard navigation en toda la app
- [ ] ARIA labels correctos
- [ ] Contrast ratios verificados
- [ ] Focus states visibles
- [ ] Optimización SEO completa
- [ ] Metadata por página
- [ ] Open Graph tags
- [ ] Sitemap.xml dinámico
- [ ] robots.txt configurado
- [ ] Schema markup para productos
- [ ] Performance audit con Lighthouse
- [ ] Alcanzar >90 en todos los scores

**Entregables**: UX pulida, accesible, SEO optimizado

---

## 🎯 FASE 3: ANALYTICS & CONTENIDO
**Objetivo**: Insights de negocio y contenido educativo

### 📋 Por Hacer

#### SPRINT 17: Analytics & Insights (2 semanas)
- [ ] Google Analytics 4 setup
- [ ] Custom events para IA usage
- [ ] Track de búsquedas AI
- [ ] Track de comparaciones
- [ ] Track de add to cart
- [ ] Funnel de conversión completo
- [ ] Dashboard de analytics en admin
- [ ] Métricas de uso de IA
- [ ] Queries más buscadas (top 10)
- [ ] Familias olfativas más populares
- [ ] Productos más vistos
- [ ] Tasa de conversión por fuente
- [ ] Insights automáticos con IA
- [ ] IA genera reporte semanal
- [ ] Tendencias de búsqueda
- [ ] Productos a re-stockear
- [ ] Oportunidades de negocio

**Entregables**: Analytics completo con insights automáticos

---

---

## 📊 Progress Tracking

### Overall Progress
- **FASE 1 (MVP)**: 66.7% (8/12 sprints completados)
- **FASE 2 (Diferenciación)**: 0% (0/4 sprints)
- **FASE 3 (Analytics)**: 0% (0/1 sprints)

### Total Sprints: 17
### Completed: 8 (Sprint 1, Sprint 2, Sprint 3, Sprint 4, Sprint 5, Sprint 7, Sprint 8, Sprint 9)
### In Progress: 0
### Next: Sprint 10 (Panel Admin Básico)
### Remaining: 9

---

## 🎯 Métricas de Éxito

### MVP (Fin de Fase 1)
- [ ] 100+ productos en catálogo
- [ ] AI Matcher funcional con <3s de respuesta
- [ ] >90% satisfacción con recomendaciones IA
- [ ] Checkout completo sin errores
- [ ] Admin puede gestionar productos y pedidos
- [ ] Tasa de conversión >2%

### Post-Launch (Fin de Fase 2)
- [ ] 50+ órdenes completadas
- [ ] 500+ usuarios registrados
- [ ] 1000+ búsquedas con IA realizadas
- [ ] 200+ perfiles olfativos completados
- [ ] Comparador usado en 30%+ de decisiones de compra
- [ ] Tasa de retención >40%

### Escalamiento (Fin de Fase 3)
- [ ] 1000+ órdenes mensuales
- [ ] 5000+ usuarios activos mensuales
- [ ] NPS >60
- [ ] Tasa de crecimiento orgánico >20% mensual
- [ ] Sistema de analytics generando insights semanales

---

## 🚀 Next Steps
1. ✅ Revisar y aprobar documentación completa
2. ✅ Sprint 1: Setup & Infraestructura - COMPLETADO
3. ✅ Configurar repositorio Git
4. ✅ Setup inicial de Next.js + Supabase
5. ✅ Sprint 2: Database & Schema - COMPLETADO
6. ✅ Configurar RLS policies - COMPLETADO
7. ✅ Generar tipos TypeScript desde Supabase - COMPLETADO
8. ✅ Agregar campos avanzados para segmentación con IA - COMPLETADO
9. ✅ Seed de productos con descripciones completas - COMPLETADO
10. ✅ **Sprint 3: Autenticación & Onboarding** - COMPLETADO
11. ✅ **Sprint 4: Catálogo de Productos** - COMPLETADO
12. ✅ **Sprint 5: AI Matcher - Match %** - COMPLETADO
13. ⏳ **Sprint 6: AI Matcher - Búsqueda Semántica** - Próximo sprint

---

## 🔐 CONSIDERACIONES DE SEGURIDAD

### Supabase RLS
- ✅ Todas las tablas con RLS habilitado
- ✅ Policies específicas por operación
- ✅ Nunca usar service role en cliente

### API Keys
- ✅ Claude API key solo en server-side
- ✅ Variables de entorno nunca en repo
- ✅ Diferentes keys para dev/prod

### Validación
- ✅ Zod en formularios y API routes
- ✅ Sanitización de inputs
- ✅ Rate limiting en APIs críticas

### Payments (Futuro)
- ✅ Nunca guardar datos de tarjetas
- ✅ Usar procesador PCI-compliant
- ✅ Webhooks validados

---

## 🚀 COMANDOS ÚTILES

```bash
# Desarrollo
bun dev                               # Iniciar desarrollo
bun run build                         # Build producción
bun start                             # Iniciar producción local

# Supabase
bunx supabase start                   # Iniciar Supabase local
bunx supabase db reset                # Reset BD local
bunx supabase gen types typescript    # Generar tipos

# Linting
bun lint                              # ESLint
bun format                            # Prettier

# Componentes
bunx shadcn-ui@latest add [component] # Agregar componente shadcn
```

---

## 📝 NOTAS FINALES

### Prioridades para MVP
1. **AI Matcher funcionando bien** - Es el diferenciador #1
2. **UX fluida** - Competir con tiendas establecidas
3. **Performance** - Velocidad de carga <2 segundos
4. **Mobile-first** - Paraguay es mobile-heavy

### Tech Debt Aceptable en MVP
- Testing automatizado (agregar en Fase 2)
- Optimizaciones avanzadas de IA
- Admin super completo
- Analytics detallados

### No Negociables
- Seguridad (RLS, validación)
- Responsive design
- AI Matcher funcional
- Checkout completo

---

**Última actualización**: Enero 2025 
**Versión del documento**: 2.4  
**Estado**: Sprint 5 completado - AI Matcher Match % implementado
**Próxima revisión**: Después de Sprint 6