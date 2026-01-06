# Sprint 3: Autenticación & Onboarding

## Objetivo
Implementar sistema completo de autenticación con Supabase Auth y crear un wizard de onboarding interactivo para capturar el perfil olfativo inicial del usuario.

## Duración Estimada
1.5 semanas

---

## 📋 Tareas Detalladas

### 1. Autenticación con Supabase Auth

#### 1.1 Setup de Auth
- [ ] Verificar configuración de Supabase Auth en proyecto
- [ ] Configurar redirect URLs en Supabase Dashboard
- [ ] Crear middleware para manejo de sesiones
- [ ] Configurar email templates (opcional, usar defaults)

#### 1.2 Página de Login (`/login`)
- [ ] Crear página de login con shadcn/ui components
- [ ] Formulario con email y password
- [ ] Validación con Zod schema
- [ ] Manejo de errores (usuario no encontrado, password incorrecto)
- [ ] Loading state durante autenticación
- [ ] Link a registro y reset de password
- [ ] Integración con Supabase `signInWithPassword`
- [ ] Redirect después de login exitoso

#### 1.3 Página de Registro (`/register`)
- [ ] Crear página de registro
- [ ] Formulario con email, password, confirm password, nombre completo
- [ ] Validación con Zod (email válido, password mínimo 8 caracteres, passwords coinciden)
- [ ] Manejo de errores (email ya registrado, password débil)
- [ ] Loading state durante registro
- [ ] Link a login
- [ ] Integración con Supabase `signUp`
- [ ] Crear registro en tabla `users` después de registro exitoso
- [ ] Enviar email de confirmación (si está habilitado)
- [ ] Redirect a onboarding después de registro

#### 1.4 Reset de Password (`/reset-password`)
- [ ] Crear página de reset de password
- [ ] Formulario con email
- [ ] Validación de email
- [ ] Integración con Supabase `resetPasswordForEmail`
- [ ] Mensaje de confirmación (email enviado)
- [ ] Link de vuelta a login

#### 1.5 Protección de Rutas
- [ ] Crear HOC `withAuth` o hook `useRequireAuth`
- [ ] Proteger rutas `/cuenta/**`
- [ ] Redirect a login si no autenticado
- [ ] Guardar URL de destino para redirect después de login

#### 1.6 Session Management
- [ ] Crear hook `useAuth` para acceso a sesión
- [ ] Obtener usuario actual con `getUser()`
- [ ] Manejo de refresh de sesión automático
- [ ] Logout function
- [ ] Actualizar estado global (Zustand) con sesión

---

### 2. Onboarding Wizard

#### 2.1 Componente Base
- [ ] Crear `OnboardingWizard` component
- [ ] Multi-step form con shadcn/ui Stepper
- [ ] Navegación entre pasos (siguiente/anterior)
- [ ] Progress indicator visual
- [ ] Animaciones entre pasos (Framer Motion)
- [ ] Validación por paso
- [ ] Guardar progreso en localStorage (opcional)

#### 2.2 Step 1: Familias Olfativas Favoritas
- [ ] Grid visual de familias olfativas
- [ ] Cards con icono, nombre, color, descripción
- [ ] Selección múltiple (mínimo 1, máximo 5)
- [ ] Visual feedback al seleccionar
- [ ] Mostrar familias desde BD (`olfactory_families`)
- [ ] Guardar selección en estado

#### 2.3 Step 2: Intensidad Preferida
- [ ] Slider component (shadcn/ui)
- [ ] Rango: Baja (1) - Moderada (2) - Alta (3)
- [ ] Labels descriptivos
- [ ] Visual feedback del valor seleccionado
- [ ] Guardar valor en estado

#### 2.4 Step 3: Ocasiones de Uso
- [ ] Checkboxes con iconos
- [ ] Opciones: Casual, Formal, Nocturno, Deportivo, Romántico, Profesional
- [ ] Selección múltiple
- [ ] Visual feedback
- [ ] Guardar selección en estado

#### 2.5 Step 4: Preferencias de Clima
- [ ] Cards visuales para climas
- [ ] Opciones: Caluroso, Templado, Frío
- [ ] Selección múltiple
- [ ] Iconos representativos
- [ ] Guardar selección en estado

#### 2.6 Finalización del Onboarding
- [ ] Botón "Completar" en último paso
- [ ] Validación final de todos los pasos
- [ ] Crear/actualizar `user_profiles` en BD
- [ ] Estructura de `preferences` JSONB:
  ```json
  {
    "familias_favoritas": ["Floral", "Cítrico"],
    "intensidad_preferida": "Moderada",
    "ocasiones": ["Casual", "Formal"],
    "clima_preferido": ["Caluroso", "Templado"]
  }
  ```
- [ ] Marcar `onboarding_completed = true`
- [ ] Loading state durante guardado
- [ ] Redirect a página principal o catálogo
- [ ] Toast de confirmación

---

### 3. Página de Perfil de Usuario

#### 3.1 Layout de Cuenta (`/cuenta`)
- [ ] Crear layout con sidebar de navegación
- [ ] Links: Perfil, Pedidos, Wishlist, Configuración
- [ ] Mostrar nombre y email del usuario
- [ ] Botón de logout

#### 3.2 Página de Perfil (`/cuenta/perfil`)
- [ ] Mostrar información personal (nombre, email, teléfono)
- [ ] Formulario editable para actualizar datos
- [ ] Validación con Zod
- [ ] Guardar cambios en tabla `users`
- [ ] Toast de confirmación

#### 3.3 Visualización de Perfil Olfativo
- [ ] Sección "Mi Perfil Olfativo"
- [ ] Mostrar familias favoritas seleccionadas (cards visuales)
- [ ] Mostrar intensidad preferida (badge o indicador)
- [ ] Mostrar ocasiones de uso (chips/badges)
- [ ] Mostrar preferencias de clima
- [ ] Botón "Re-hacer Onboarding"
- [ ] Confirmación antes de resetear perfil

---

### 4. Utilidades y Hooks

#### 4.1 Hook `useAuth`
- [ ] Obtener usuario actual
- [ ] Estado de loading
- [ ] Estado de autenticación (isAuthenticated)
- [ ] Función de logout
- [ ] Función de refresh session

#### 4.2 Hook `useUserProfile`
- [ ] Obtener perfil de usuario desde BD
- [ ] Estado de loading
- [ ] Estado de onboarding completado
- [ ] Función para actualizar perfil
- [ ] Cache con React Query o SWR

#### 4.3 Store de Zustand (opcional)
- [ ] Crear `authStore` para estado global
- [ ] Usuario actual
- [ ] Estado de autenticación
- [ ] Acciones: login, logout, updateUser

---

### 5. Componentes UI Necesarios

#### 5.1 Componentes shadcn/ui a usar
- [ ] `Button` - Botones de acción
- [ ] `Input` - Campos de formulario
- [ ] `Label` - Labels de formulario
- [ ] `Card` - Cards para familias olfativas
- [ ] `Checkbox` - Selección múltiple
- [ ] `Slider` - Intensidad preferida
- [ ] `Stepper` o `Tabs` - Navegación entre pasos
- [ ] `Toast` (Sonner) - Notificaciones
- [ ] `Dialog` - Modales de confirmación
- [ ] `Badge` - Chips/badges para ocasiones

#### 5.2 Componentes Custom
- [ ] `OlfactoryFamilyCard` - Card para familia olfativa
- [ ] `OnboardingStep` - Wrapper para cada paso
- [ ] `ProfileSection` - Sección del perfil

---

### 6. Validaciones y Schemas Zod

#### 6.1 Login Schema
```typescript
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Password requerido")
});
```

#### 6.2 Register Schema
```typescript
const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Password mínimo 8 caracteres"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Nombre requerido")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords no coinciden",
  path: ["confirmPassword"]
});
```

#### 6.3 Onboarding Schema
```typescript
const onboardingSchema = z.object({
  familias_favoritas: z.array(z.string()).min(1).max(5),
  intensidad_preferida: z.enum(["Baja", "Moderada", "Alta"]),
  ocasiones: z.array(z.string()).min(1),
  clima_preferido: z.array(z.string()).min(1)
});
```

---

### 7. Testing y Validación

#### 7.1 Flujos a probar
- [ ] Registro completo → Onboarding → Perfil
- [ ] Login con credenciales válidas
- [ ] Login con credenciales inválidas
- [ ] Reset de password
- [ ] Acceso a rutas protegidas sin autenticación
- [ ] Logout y redirect
- [ ] Actualización de perfil
- [ ] Re-hacer onboarding

#### 7.2 Validaciones de UI
- [ ] Formularios muestran errores correctamente
- [ ] Loading states funcionan
- [ ] Redirects funcionan correctamente
- [ ] Toast notifications aparecen
- [ ] Animaciones suaves entre pasos

---

## 🎯 Entregables

1. ✅ Sistema de autenticación completo (login, registro, reset password)
2. ✅ Protección de rutas privadas
3. ✅ Onboarding wizard de 4 pasos funcional
4. ✅ Página de perfil de usuario
5. ✅ Visualización de perfil olfativo
6. ✅ Hooks y utilidades reutilizables

---

## 📝 Notas Técnicas

### Supabase Auth
- Usar `@supabase/ssr` para manejo de sesiones en Next.js
- Middleware para refresh automático de sesión
- Manejar errores de autenticación apropiadamente

### Onboarding
- Guardar datos en `user_profiles.preferences` como JSONB
- Validar que usuario tenga perfil antes de mostrar catálogo
- Opción de skip onboarding (marcar como completado con valores por defecto)

### Performance
- Lazy load componentes pesados del onboarding
- Cache de perfil de usuario con React Query
- Optimistic updates en formularios

### UX
- Animaciones suaves entre pasos
- Feedback visual claro en cada paso
- Mensajes de error descriptivos
- Loading states apropiados

---

## 🔗 Dependencias

- Supabase Auth configurado
- Tabla `users` creada
- Tabla `user_profiles` creada
- Tabla `olfactory_families` con datos seed
- shadcn/ui components instalados
- Framer Motion para animaciones

---

## ✅ Criterios de Aceptación

- [ ] Usuario puede registrarse y hacer login
- [ ] Usuario puede resetear su password
- [ ] Rutas protegidas redirigen a login si no autenticado
- [ ] Onboarding wizard funciona completamente
- [ ] Perfil olfativo se guarda correctamente en BD
- [ ] Usuario puede ver y editar su perfil
- [ ] Usuario puede re-hacer onboarding
- [ ] Todas las validaciones funcionan
- [ ] UI es responsive y accesible
- [ ] No hay errores en consola
- [ ] Build de producción funciona sin errores

