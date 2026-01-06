'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseExcelFile, type ParseResult, type ParsedProduct } from '../services/excelParser';
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ExcelImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ExcelImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: ExcelImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParseResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    successful: number;
    failed: number;
    errors: Array<{ row: number; errors: string[] }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar extensión
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = selectedFile.name
      .toLowerCase()
      .substring(selectedFile.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      toast.error('Formato inválido. Por favor seleccione un archivo Excel (.xlsx o .xls)');
      return;
    }

    setFile(selectedFile);
    setParsedData(null);
    setImportResults(null);

    try {
      const result = await parseExcelFile(selectedFile);
      setParsedData(result);
      
      if (result.invalidRows > 0) {
        toast.warning(
          `${result.invalidRows} fila(s) tienen errores de validación. Revise la vista previa antes de importar.`
        );
      } else {
        toast.success(`Archivo parseado correctamente. ${result.validRows} producto(s) listo(s) para importar.`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al parsear el archivo Excel'
      );
      setFile(null);
    }
  };

  const handleDownloadTemplate = () => {
    // Crear un archivo Excel básico con las columnas
    const templateData = [
      [
        'nombre',
        'sku',
        'slug',
        'brand_id',
        'descripción_corta',
        'descripción_larga',
        'precio_pyg',
        'precio_original_pyg',
        'stock',
        'género',
        'concentración',
        'tamaño_ml',
        'duración_horas',
        'estela',
        'notas_salida',
        'notas_corazón',
        'notas_fondo',
        'acordes',
        'intensidad',
        'temporadas',
        'momento_día',
        'activo',
        'destacado',
        'meta_título',
        'meta_descripción',
      ],
      [
        'Ejemplo Perfume',
        'PERF-001',
        'ejemplo-perfume',
        'uuid-de-marca-aqui',
        'Descripción corta del perfume',
        'Descripción larga y detallada del perfume',
        150000,
        180000,
        50,
        'Unisex',
        'Eau de Parfum',
        100,
        8,
        'Moderada',
        'Bergamota, Limón',
        'Rosa, Jazmín',
        'Vainilla, Ámbar',
        'Amaderado:85, Especiado:70',
        'Media',
        'Primavera, Verano',
        'Día, Versátil',
        true,
        false,
        'Meta título SEO',
        'Meta descripción SEO',
      ],
    ];

    // Convertir a CSV para descarga simple (más fácil que generar Excel real)
    const csvContent = templateData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'productos-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Template descargado. Puede abrirlo en Excel y guardarlo como .xlsx');
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.validRows === 0) {
      toast.error('No hay productos válidos para importar');
      return;
    }

    setImporting(true);
    setImportProgress(0);

    try {
      // Filtrar solo productos válidos
      const validProducts = parsedData.products
        .filter((p) => p.errors.length === 0)
        .map((p) => p.data);

      // Enviar a la API
      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: validProducts }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al importar productos');
      }

      // Procesar resultados
      const successful = result.successful || 0;
      const failed = result.failed || 0;
      const errors: Array<{ row: number; errors: string[] }> = [];

      result.results?.forEach((r: { success: boolean; rowNumber: number; errors?: string[] }) => {
        if (!r.success && r.errors) {
          errors.push({ row: r.rowNumber, errors: r.errors });
        }
      });

      setImportResults({
        successful,
        failed,
        errors,
      });

      if (successful > 0) {
        toast.success(`${successful} producto(s) importado(s) exitosamente`);
        if (onSuccess) {
          onSuccess();
        }
      }

      if (failed > 0) {
        toast.error(`${failed} producto(s) fallaron al importar`);
      }

      setImportProgress(100);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al importar productos'
      );
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (!importing) {
      setFile(null);
      setParsedData(null);
      setImportResults(null);
      setImportProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Productos desde Excel</DialogTitle>
          <DialogDescription>
            Seleccione un archivo Excel con los productos a importar. Las imágenes deben agregarse manualmente después de la importación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Descargar template */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Template de Excel</p>
                <p className="text-xs text-muted-foreground">
                  Descargue el template con el formato correcto
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Template
            </Button>
          </div>

          {/* Seleccionar archivo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Seleccionar archivo Excel</label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="excel-file-input"
              />
              <label
                htmlFor="excel-file-input"
                className="flex-1 cursor-pointer"
              >
                <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-accent transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {file ? file.name : 'Haga clic para seleccionar archivo'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Vista previa */}
          {parsedData && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Vista Previa</label>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {parsedData.validRows} válidos
                  </span>
                  <span className="text-red-600 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {parsedData.invalidRows} con errores
                  </span>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Fila</th>
                      <th className="px-3 py-2 text-left">Nombre</th>
                      <th className="px-3 py-2 text-left">SKU</th>
                      <th className="px-3 py-2 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.products.slice(0, 20).map((product) => (
                      <tr
                        key={product.rowNumber}
                        className="border-t hover:bg-muted/50"
                      >
                        <td className="px-3 py-2">{product.rowNumber}</td>
                        <td className="px-3 py-2">
                          {product.data.name || '-'}
                        </td>
                        <td className="px-3 py-2">
                          {product.data.sku || '-'}
                        </td>
                        <td className="px-3 py-2">
                          {product.errors.length === 0 ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Válido
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              {product.errors.length} error(es)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.products.length > 20 && (
                  <div className="p-2 text-xs text-muted-foreground text-center">
                    Mostrando 20 de {parsedData.products.length} productos
                  </div>
                )}
              </div>

              {/* Errores detallados */}
              {parsedData.products.some((p) => p.errors.length > 0) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-red-600">
                    Errores de Validación
                  </label>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
                    {parsedData.products
                      .filter((p) => p.errors.length > 0)
                      .slice(0, 10)
                      .map((product) => (
                        <Alert key={product.rowNumber} variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Fila {product.rowNumber}:</strong>{' '}
                            {product.errors.map((e) => e.message).join(', ')}
                          </AlertDescription>
                        </Alert>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progreso de importación */}
          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importando productos...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} />
            </div>
          )}

          {/* Resultados de importación */}
          {importResults && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p>
                    <strong>Importación completada:</strong>
                  </p>
                  <p className="text-green-600">
                    {importResults.successful} producto(s) importado(s) exitosamente
                  </p>
                  {importResults.failed > 0 && (
                    <p className="text-red-600">
                      {importResults.failed} producto(s) fallaron
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={importing}
          >
            {importResults ? 'Cerrar' : 'Cancelar'}
          </Button>
          {parsedData && parsedData.validRows > 0 && !importResults && (
            <Button
              type="button"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? 'Importando...' : `Importar ${parsedData.validRows} Producto(s)`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

