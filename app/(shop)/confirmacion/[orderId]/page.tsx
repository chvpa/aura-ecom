import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';
import { formatPrice } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, MapPin, CreditCard, ArrowLeft, ShoppingBag, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { OrderConfetti } from '@/components/checkout/OrderConfetti';
import { OrderItemImage } from '@/components/orders/OrderItemImage';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

interface OrderWithItems extends Order {
  items: Array<OrderItem & { product: Product | null }>;
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener orden
  const { data: order, error: orderError } = await (supabase
    .from('orders') as any)
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single() as { data: Order | null; error: any };

  if (orderError || !order) {
    redirect('/cuenta/pedidos');
  }

  // Obtener items de la orden con productos
  const { data: orderItems, error: orderItemsError } = await supabase
    .from('order_items')
    .select(`
      *,
      products (
        id,
        name,
        main_image_url,
        slug,
        description_short,
        price_pyg
      )
    `)
    .eq('order_id', orderId);

  if (orderItemsError) {
    console.error('Error fetching order items:', orderItemsError);
  }

  // Mapear los items para asegurar que el producto esté en el formato correcto
  // En Supabase, cuando es una relación many-to-one, el producto puede venir como objeto o array
  const itemsWithProducts = (orderItems || []).map((item: { product: Product | Product[] | null }) => {
    let product: Product | null = null;
    
    // Verificar diferentes estructuras posibles
    if (item.product) {
      if (Array.isArray(item.product)) {
        product = item.product[0] || null;
      } else if (typeof item.product === 'object') {
        product = item.product;
      }
    }
    
    return {
      ...item,
      product: product as Product | null,
    };
  });

  const orderWithItems: OrderWithItems = {
    ...order,
    items: itemsWithProducts as Array<OrderItem & { product: Product | null }>,
  };

  const shippingAddress = order.shipping_address as {
    full_name: string;
    phone: string;
    department: string;
    city: string;
    street: string;
    reference?: string;
  };

  const paymentInstructions = {
    transferencia: {
      title: 'Datos para Transferencia Bancaria',
      steps: [
        'Banco Itaú - Cuenta: 720101231 - CI: 5312014 - Christian Chaparro',
        'Ueno Bank - Cuenta: 619463266 - Alias: 5312014',
        'Envía el comprobante por WhatsApp',
      ],
    },
    giro: {
      title: 'Instrucciones para Giro',
      steps: [
        'A nombre de: Christian Chaparro - CI: 5312014',
        'Envía el comprobante por WhatsApp',
      ],
    },
    tarjeta: {
      title: 'Pago con Tarjeta',
      steps: ['El pago con tarjeta será procesado automáticamente'],
    },
  };

  const instructions = paymentInstructions[order.payment_method as keyof typeof paymentInstructions] || paymentInstructions.transferencia;

  // Construir mensaje de WhatsApp simplificado
  const whatsappMessage = encodeURIComponent(
    `Hola! Realicé el pedido *${order.order_number}* por ${formatPrice(order.total_pyg)}. Adjunto comprobante.`
  );
  const whatsappUrl = `https://wa.me/595972137968?text=${whatsappMessage}`;

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      {/* Confetti effect */}
      <OrderConfetti />
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header de confirmación */}
        <div className="text-center space-y-6 py-8">
          <div className="flex justify-center">
            <div className="rounded-full bg-gradient-to-br from-green-100 to-emerald-100 p-6 shadow-lg">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              ¡Gracias por tu compra!
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Tu orden ha sido recibida y está siendo procesada. Te notificaremos cuando sea enviada.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full font-semibold text-lg">
            <Package className="h-5 w-5" />
            Orden: {order.order_number}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumen de productos */}
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {orderWithItems.items.map((item) => {
                  // Validar que el producto existe
                  if (!item.product) {
                    return (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">Producto no disponible</p>
                          <p className="text-sm text-muted-foreground">
                            Cantidad: {item.quantity} × {formatPrice(item.unit_price_pyg)}
                          </p>
                        </div>
                        <div className="font-semibold text-primary">
                          {formatPrice(item.subtotal_pyg)}
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <OrderItemImage
                        src={item.product.main_image_url}
                        alt={item.product.name || 'Producto'}
                        fallback={false}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product.name || 'Producto sin nombre'}</p>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item.quantity} × {formatPrice(item.unit_price_pyg)}
                        </p>
                      </div>
                      <div className="font-semibold text-primary">
                        {formatPrice(item.subtotal_pyg)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal_pyg)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span>
                    {order.shipping_cost_pyg === 0 ? (
                      <span className="text-green-600 font-medium">Gratis</span>
                    ) : (
                      formatPrice(order.shipping_cost_pyg)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(order.total_pyg)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de envío y pago */}
          <div className="space-y-6">
            {/* Dirección de envío */}
            <Card className="shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-2">
                <p className="font-semibold text-lg">{shippingAddress.full_name}</p>
                <p className="text-muted-foreground">{shippingAddress.phone}</p>
                <p className="text-sm leading-relaxed">
                  {shippingAddress.street}
                  <br />
                  {shippingAddress.city}, {shippingAddress.department}
                  {shippingAddress.reference && (
                    <>
                      <br />
                      <span className="text-muted-foreground">
                        Referencia: {shippingAddress.reference}
                      </span>
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Método de pago */}
            <Card className="shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="font-semibold text-lg capitalize mb-4">
                  {order.payment_method === 'transferencia'
                    ? 'Transferencia Bancaria'
                    : order.payment_method === 'giro'
                    ? 'Giro'
                    : 'Tarjeta de Crédito/Débito'}
                </p>
                <div className="space-y-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-800">{instructions.title}</p>
                  <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                    {instructions.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/cuenta/pedidos">
              <ArrowLeft className="h-4 w-4" />
              Ver mis pedidos
            </Link>
          </Button>
          <Button asChild size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              Enviar comprobante por WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" className="gap-2">
            <Link href="/perfumes">
              <ShoppingBag className="h-4 w-4" />
              Seguir comprando
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

