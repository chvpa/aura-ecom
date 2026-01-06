import * as XLSX from 'xlsx';
import type { ProductFormData } from '@/lib/validations/product';

export interface ExcelRowError {
  row: number;
  field: string;
  message: string;
}

export interface ParsedProduct {
  data: Partial<ProductFormData>;
  errors: ExcelRowError[];
  rowNumber: number;
}

export interface ParseResult {
  products: ParsedProduct[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

/**
 * Mapeo de columnas Excel a campos del producto
 */
const COLUMN_MAPPING: Record<string, keyof ProductFormData | 'custom'> = {
  'nombre': 'name',
  'sku': 'sku',
  'slug': 'slug',
  'brand_id': 'brand_id',
  'descripción_corta': 'description_short',
  'descripción_larga': 'description_long',
  'precio_pyg': 'price_pyg',
  'precio_original_pyg': 'original_price_pyg',
  'stock': 'stock',
  'género': 'gender',
  'concentración': 'concentration',
  'tamaño_ml': 'size_ml',
  'duración_horas': 'longevity_hours',
  'estela': 'sillage_category',
  'notas_salida': 'custom',
  'notas_corazón': 'custom',
  'notas_fondo': 'custom',
  'acordes': 'custom',
  'intensidad': 'custom',
  'temporadas': 'custom',
  'momento_día': 'custom',
  'activo': 'is_active',
  'destacado': 'is_featured',
  'meta_título': 'meta_title',
  'meta_descripción': 'meta_description',
};

/**
 * Convierte string separado por comas a array
 */
function parseCommaSeparated(value: string | number | undefined | null): string[] {
  if (!value) return [];
  const str = String(value).trim();
  if (!str) return [];
  return str.split(',').map(item => item.trim()).filter(Boolean);
}

/**
 * Convierte string de acordes con porcentajes a objeto
 * Formato: "Amaderado:85, Especiado:70"
 */
function parseAccords(value: string | number | undefined | null): Record<string, number> | null {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;

  const accords: Record<string, number> = {};
  const pairs = str.split(',').map(item => item.trim());

  for (const pair of pairs) {
    const [name, percentage] = pair.split(':').map(item => item.trim());
    if (name && percentage) {
      const num = Number(percentage);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        accords[name] = num;
      }
    }
  }

  return Object.keys(accords).length > 0 ? accords : null;
}

/**
 * Convierte string a boolean
 */
function parseBoolean(value: string | number | boolean | undefined | null): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (!value) return false;
  const str = String(value).toLowerCase().trim();
  return str === 'true' || str === '1' || str === 'sí' || str === 'si' || str === 'yes';
}

/**
 * Convierte string a número
 */
function parseNumber(value: string | number | undefined | null): number | null {
  if (typeof value === 'number') return isNaN(value) ? null : value;
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;
  const num = Number(str);
  return isNaN(num) ? null : num;
}

/**
 * Valida y convierte género
 */
function parseGender(value: string | number | undefined | null): 'Hombre' | 'Mujer' | 'Unisex' | null {
  if (!value) return null;
  const str = String(value).trim();
  const validGenders = ['Hombre', 'Mujer', 'Unisex'];
  if (validGenders.includes(str)) {
    return str as 'Hombre' | 'Mujer' | 'Unisex';
  }
  return null;
}

/**
 * Valida y convierte estela
 */
function parseSillage(value: string | number | undefined | null): 'Suave' | 'Moderada' | 'Fuerte' | null {
  if (!value) return null;
  const str = String(value).trim();
  const validSillage = ['Suave', 'Moderada', 'Fuerte'];
  if (validSillage.includes(str)) {
    return str as 'Suave' | 'Moderada' | 'Fuerte';
  }
  return null;
}

/**
 * Valida y convierte intensidad
 */
function parseIntensity(value: string | number | undefined | null): 'Baja' | 'Media' | 'Alta' | null {
  if (!value) return null;
  const str = String(value).trim();
  const validIntensity = ['Baja', 'Media', 'Alta'];
  if (validIntensity.includes(str)) {
    return str as 'Baja' | 'Media' | 'Alta';
  }
  return null;
}

/**
 * Valida y convierte temporadas
 */
function parseSeasons(value: string | number | undefined | null): ('Primavera' | 'Verano' | 'Otoño' | 'Invierno')[] | null {
  if (!value) return null;
  const arr = parseCommaSeparated(value);
  const validSeasons = ['Primavera', 'Verano', 'Otoño', 'Invierno'];
  const filtered = arr.filter(s => validSeasons.includes(s)) as ('Primavera' | 'Verano' | 'Otoño' | 'Invierno')[];
  return filtered.length > 0 ? filtered : null;
}

/**
 * Valida y convierte momento del día
 */
function parseTimeOfDay(value: string | number | undefined | null): ('Día' | 'Noche' | 'Versátil')[] | null {
  if (!value) return null;
  const arr = parseCommaSeparated(value);
  const validTimes = ['Día', 'Noche', 'Versátil'];
  const filtered = arr.filter(t => validTimes.includes(t)) as ('Día' | 'Noche' | 'Versátil')[];
  return filtered.length > 0 ? filtered : null;
}

/**
 * Parsea un archivo Excel y retorna productos con validaciones
 */
export async function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('No se pudo leer el archivo'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          reject(new Error('El archivo debe tener al menos una fila de encabezados y una fila de datos'));
          return;
        }

        // Primera fila son los encabezados
        const headers = (jsonData[0] as string[]).map(h => String(h).toLowerCase().trim());
        const rows = jsonData.slice(1) as unknown[][];

        const products: ParsedProduct[] = [];
        let validRows = 0;
        let invalidRows = 0;

        rows.forEach((row, index) => {
          const rowNumber = index + 2; // +2 porque index es 0-based y hay header
          const errors: ExcelRowError[] = [];
          const productData: Partial<ProductFormData> = {};

          // Crear objeto con valores por columna
          const rowData: Record<string, unknown> = {};
          headers.forEach((header, colIndex) => {
            rowData[header] = row[colIndex];
          });

          // Procesar cada campo según el mapeo
          Object.entries(COLUMN_MAPPING).forEach(([excelCol, productField]) => {
            const value = rowData[excelCol];

            if (productField === 'custom') {
              // Manejar campos custom
              if (excelCol === 'notas_salida') {
                const notes = parseCommaSeparated(value as string | number | undefined | null);
                if (!productData.notes) {
                  productData.notes = { top: [], heart: [], base: [] };
                }
                productData.notes.top = notes;
              } else if (excelCol === 'notas_corazón') {
                const notes = parseCommaSeparated(value as string | number | undefined | null);
                if (!productData.notes) {
                  productData.notes = { top: [], heart: [], base: [] };
                }
                productData.notes.heart = notes;
              } else if (excelCol === 'notas_fondo') {
                const notes = parseCommaSeparated(value as string | number | undefined | null);
                if (!productData.notes) {
                  productData.notes = { top: [], heart: [], base: [] };
                }
                productData.notes.base = notes;
              } else if (excelCol === 'acordes') {
                const accords = parseAccords(value as string | number | undefined | null);
                if (accords) {
                  productData.main_accords = accords;
                }
              } else if (excelCol === 'intensidad') {
                const intensity = parseIntensity(value as string | number | undefined | null);
                if (intensity) {
                  productData.characteristics = {
                    ...productData.characteristics,
                    intensity,
                  };
                }
              } else if (excelCol === 'temporadas') {
                const seasons = parseSeasons(value as string | number | undefined | null);
                if (seasons) {
                  productData.season_recommendations = seasons;
                }
              } else if (excelCol === 'momento_día') {
                const times = parseTimeOfDay(value as string | number | undefined | null);
                if (times) {
                  productData.time_of_day = times;
                }
              }
            } else {
              // Campos normales
              if (value === undefined || value === null || value === '') {
                // Campos opcionales pueden estar vacíos
                if (['name', 'sku', 'slug', 'brand_id', 'price_pyg', 'gender', 'concentration', 'size_ml'].includes(productField)) {
                  errors.push({
                    row: rowNumber,
                    field: productField,
                    message: `Campo requerido "${excelCol}" está vacío`,
                  });
                }
                return;
              }

              switch (productField) {
                case 'name':
                case 'sku':
                case 'slug':
                case 'brand_id':
                case 'description_short':
                case 'description_long':
                case 'concentration':
                case 'meta_title':
                case 'meta_description':
                  productData[productField] = String(value).trim();
                  break;

                case 'price_pyg':
                case 'original_price_pyg':
                case 'stock':
                case 'size_ml':
                case 'longevity_hours':
                  const num = parseNumber(value as string | number | null | undefined);
                  if (num === null) {
                    errors.push({
                      row: rowNumber,
                      field: productField,
                      message: `Valor inválido para "${excelCol}": debe ser un número`,
                    });
                  } else {
                    productData[productField] = num;
                  }
                  break;

                case 'gender':
                  const gender = parseGender(value as string | number | null | undefined);
                  if (!gender) {
                    errors.push({
                      row: rowNumber,
                      field: productField,
                      message: `Valor inválido para "${excelCol}": debe ser "Hombre", "Mujer" o "Unisex"`,
                    });
                  } else {
                    productData.gender = gender;
                  }
                  break;

                case 'sillage_category':
                  const sillage = parseSillage(value as string | number | null | undefined);
                  if (value && !sillage) {
                    errors.push({
                      row: rowNumber,
                      field: productField,
                      message: `Valor inválido para "${excelCol}": debe ser "Suave", "Moderada" o "Fuerte"`,
                    });
                  } else if (sillage) {
                    productData.sillage_category = sillage;
                  }
                  break;

                case 'is_active':
                case 'is_featured':
                  productData[productField] = parseBoolean(value as string | number | boolean | null | undefined);
                  break;
              }
            }
          });

          // Validaciones adicionales
          if (!productData.name) {
            errors.push({ row: rowNumber, field: 'name', message: 'El nombre es requerido' });
          }
          if (!productData.sku) {
            errors.push({ row: rowNumber, field: 'sku', message: 'El SKU es requerido' });
          }
          if (!productData.slug) {
            errors.push({ row: rowNumber, field: 'slug', message: 'El slug es requerido' });
          }
          if (!productData.brand_id) {
            errors.push({ row: rowNumber, field: 'brand_id', message: 'La marca (brand_id) es requerida' });
          }
          if (productData.price_pyg === undefined || productData.price_pyg === null) {
            errors.push({ row: rowNumber, field: 'price_pyg', message: 'El precio es requerido' });
          }
          if (!productData.gender) {
            errors.push({ row: rowNumber, field: 'gender', message: 'El género es requerido' });
          }
          if (!productData.concentration) {
            errors.push({ row: rowNumber, field: 'concentration', message: 'La concentración es requerida' });
          }
          if (productData.size_ml === undefined || productData.size_ml === null) {
            errors.push({ row: rowNumber, field: 'size_ml', message: 'El tamaño (ml) es requerido' });
          }

          // Imágenes y main_image_url son requeridas pero no vienen del Excel
          // Se deben agregar manualmente después
          productData.images = [];
          productData.main_image_url = '';

          // Valores por defecto
          if (productData.stock === undefined || productData.stock === null) {
            productData.stock = 0;
          }
          if (productData.is_active === undefined) {
            productData.is_active = true;
          }
          if (productData.is_featured === undefined) {
            productData.is_featured = false;
          }

          products.push({
            data: productData,
            errors,
            rowNumber,
          });

          if (errors.length === 0) {
            validRows++;
          } else {
            invalidRows++;
          }
        });

        resolve({
          products,
          totalRows: rows.length,
          validRows,
          invalidRows,
        });
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Error al parsear el archivo Excel'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsBinaryString(file);
  });
}

