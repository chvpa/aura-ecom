import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formatea un precio en Guaraníes (PYG)
 * @param price Precio en guaraníes
 * @returns String formateado con símbolo ₲
 */
export function formatPrice(price: number): string {
  return `₲ ${price.toLocaleString("es-PY")}`;
}

/**
 * Formatea un precio con descuento
 * @param original Precio original
 * @param discounted Precio con descuento
 * @returns Objeto con ambos precios formateados
 */
export function formatPriceWithDiscount(
  original: number,
  discounted: number
) {
  return {
    original: formatPrice(original),
    discounted: formatPrice(discounted),
    discountPercentage: Math.round(((original - discounted) / original) * 100),
  };
}

/**
 * Formatea una fecha en formato español
 * @param date Fecha a formatear
 * @param formatStr Formato deseado (default: "dd 'de' MMMM, yyyy")
 * @returns Fecha formateada
 */
export function formatDate(
  date: Date | string,
  formatStr: string = "dd 'de' MMMM, yyyy"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: es });
}

/**
 * Formatea una fecha relativa (hace X días, etc.)
 * @param date Fecha a formatear
 * @returns Fecha relativa formateada
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Hoy";
  if (diffInDays === 1) return "Ayer";
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
  if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
  return `Hace ${Math.floor(diffInDays / 365)} años`;
}

