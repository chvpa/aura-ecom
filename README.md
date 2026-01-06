# Aura Perfumes - Ecommerce de Perfumes con IA

Ecommerce innovador de perfumes para el mercado paraguayo que utiliza inteligencia artificial para personalizar la experiencia de compra.

## 🚀 Características Principales

- **AI Matcher**: Sistema de match inteligente que calcula compatibilidad entre perfil de usuario y productos
- **Perfil Olfativo Personalizado**: Onboarding interactivo que aprende las preferencias del usuario
- **Catálogo Completo**: Filtros avanzados por marca, familia olfativa, precio, género y más
- **Carrito y Wishlist**: Gestión completa de carrito de compras y lista de deseos
- **Checkout Optimizado**: Flujo de compra completo con cálculo de envío por departamento
- **Panel Admin**: Gestión completa de productos, pedidos y dashboard con KPIs
- **UI/UX Profesional**: Diseño moderno siguiendo mejores prácticas de ecommerce

## 🛠 Stack Tecnológico

- **Framework**: Next.js 16+ (App Router)
- **Lenguaje**: TypeScript 5+
- **Estilos**: Tailwind CSS 4
- **Componentes UI**: shadcn/ui
- **Estado**: Zustand
- **Validación**: Zod + React Hook Form
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **IA**: Claude (Anthropic API)
- **Email**: Resend
- **Deployment**: Vercel

## 📋 Requisitos Previos

- Node.js 18+ o Bun
- Cuenta de Supabase
- Cuenta de Anthropic (para IA)
- Cuenta de Resend (para emails)

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd aura-ecom
```

2. **Instalar dependencias**
```bash
bun install
# o
npm install
```

3. **Configurar variables de entorno**

Copia `.env.local.example` a `.env.local` y completa las variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic (IA)
ANTHROPIC_API_KEY=your_anthropic_key

# Resend (Emails)
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=onboarding@resend.dev

# Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **Configurar Supabase**

- Crea un proyecto en Supabase
- Ejecuta las migraciones SQL necesarias (ver `supabase/migrations/`)
- Configura RLS policies según la documentación
- Configura Storage buckets para imágenes de productos

5. **Iniciar servidor de desarrollo**
```bash
bun dev
# o
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
aura-ecom/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (shop)/            # Rutas de tienda
│   ├── (account)/         # Rutas de cuenta de usuario
│   ├── (admin)/           # Rutas de administración
│   └── api/               # API routes
├── src/
│   ├── components/       # Componentes compartidos
│   ├── features/          # Features organizados por dominio
│   ├── lib/               # Utilidades y servicios
│   └── hooks/             # Hooks globales
└── public/                # Archivos estáticos
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
bun dev                    # Iniciar servidor de desarrollo
bun run build              # Build para producción
bun start                  # Iniciar servidor de producción

# Linting
bun lint                   # Ejecutar ESLint
bun format                 # Formatear código con Prettier

# Componentes
bunx shadcn-ui@latest add [component]  # Agregar componente shadcn
```

## 🗄 Base de Datos

El proyecto usa Supabase (PostgreSQL) con las siguientes tablas principales:

- `users` - Usuarios (extiende Supabase Auth)
- `user_profiles` - Perfiles de usuario con preferencias olfativas
- `products` - Productos con información completa
- `brands` - Marcas de perfumes
- `olfactory_families` - Familias olfativas
- `orders` - Pedidos
- `order_items` - Items de pedidos
- `wishlists` - Listas de deseos

Ver `roadmap.md` para el esquema completo.

## 🎨 Design System

El proyecto usa Tailwind CSS v4 con un sistema de diseño basado en:

- **Colores**: Paleta violeta como primario, con acentos dorados
- **Tipografía**: Manrope (Google Fonts)
- **Componentes**: shadcn/ui para componentes base
- **Espaciado**: Sistema consistente de spacing

## 🧪 Testing

El proyecto incluye:

- Validación con Zod en formularios y API routes
- Error boundaries para manejo de errores
- Loading states en todas las operaciones async
- Toast notifications para feedback al usuario

## 📦 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Deploy automático en cada push a main

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables de `.env.local` en tu plataforma de deployment.

## 📚 Documentación Adicional

- **Roadmap**: Ver `roadmap.md` para el plan completo de desarrollo
- **Arquitectura**: Ver `roadmap.md` sección "ARQUITECTURA DEL PROYECTO"
- **Base de Datos**: Ver `roadmap.md` sección "ESTRUCTURA DE BASE DE DATOS"

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y propietario.

## 👥 Autor

Desarrollado para Aura Perfumes

---

**Última actualización**: Enero 2025
