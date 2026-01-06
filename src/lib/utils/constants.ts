/**
 * Constantes del proyecto Odora Perfumes
 */

// Configuración del sitio
export const SITE_NAME = "Odora Perfumes";
export const SITE_DESCRIPTION =
  "Ecommerce innovador de perfumes para el mercado paraguayo con inteligencia artificial para personalizar tu experiencia de compra";

// URLs
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Paginación
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Productos
export const LOW_STOCK_THRESHOLD = 10;
export const FEATURED_PRODUCTS_LIMIT = 8;

// Carrito
export const CART_STORAGE_KEY = "odora-cart";

// Wishlist
export const WISHLIST_STORAGE_KEY = "odora-wishlist";

// Match percentages
export const MATCH_THRESHOLDS = {
  LOW: 0,
  MEDIUM: 50,
  HIGH: 75,
  EXCELLENT: 90,
} as const;

// Cache durations (en días)
export const CACHE_DURATIONS = {
  PRODUCT_MATCH: 7,
  AI_SEARCH: 1,
  PRODUCT_COMPARISON: 7,
} as const;

// Departamentos de Paraguay
export const PARAGUAY_DEPARTMENTS = [
  "Alto Paraguay",
  "Alto Paraná",
  "Amambay",
  "Asunción",
  "Boquerón",
  "Caaguazú",
  "Caazapá",
  "Canindeyú",
  "Central",
  "Concepción",
  "Cordillera",
  "Guairá",
  "Itapúa",
  "Misiones",
  "Ñeembucú",
  "Paraguarí",
  "Presidente Hayes",
  "San Pedro",
] as const;

// Géneros de perfumes
export const PERFUME_GENDERS = ["Hombre", "Mujer", "Unisex"] as const;

// Concentraciones
export const PERFUME_CONCENTRATIONS = [
  "Eau de Parfum",
  "Eau de Toilette",
  "Parfum",
  "Eau de Cologne",
] as const;

// Intensidades
export const PERFUME_INTENSITIES = ["Baja", "Moderada", "Alta"] as const;

// Ocasiones
export const PERFUME_OCCASIONS = [
  "Casual",
  "Formal",
  "Nocturno",
  "Diurno",
  "Deportivo",
  "Romántico",
  "Sofisticado",
] as const;

// Temporadas
export const PERFUME_SEASONS = [
  "Primavera",
  "Verano",
  "Otoño",
  "Invierno",
  "Todo el año",
] as const;

