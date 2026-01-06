import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrder } from '@/features/checkout/services/checkoutService';
import { checkoutSchema } from '@/lib/validations/checkout';
import type { CartItem } from '@/features/cart/types/cart.types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Asegurar que siempre devolvemos JSON, incluso si hay un error no capturado
  try {
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('Error creating Supabase client:', clientError);
      return NextResponse.json(
        { error: 'Error de conexión con el servidor' },
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verificar usuario autenticado
    let user;
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return NextResponse.json(
          { error: 'Debes estar autenticado para realizar una compra' },
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      user = authUser;
    } catch (authErr) {
      console.error('Error authenticating user:', authErr);
      return NextResponse.json(
        { error: 'Error al verificar autenticación' },
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parsear y validar body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Error al parsear el cuerpo de la solicitud' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { formData, cartItems } = body;

    if (!formData || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Datos de checkout y items del carrito requeridos' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validar con Zod
    const validationResult = checkoutSchema.safeParse(formData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validationResult.error.issues,
        },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Crear orden (el email se envía dentro de createOrder)
    let order;
    try {
      order = await createOrder(user.id, validationResult.data, cartItems as CartItem[]);
    } catch (orderError) {
      console.error('Error creating order:', orderError);
      
      // Log detallado del error para debugging
      if (orderError instanceof Error) {
        console.error('Error message:', orderError.message);
        console.error('Error stack:', orderError.stack);
      }
      
      return NextResponse.json(
        {
          error:
            orderError instanceof Error
              ? orderError.message
              : 'Error al crear la orden',
        },
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Enviar email de confirmación de forma asíncrona (no bloquear respuesta)
    // Usamos fetch para evitar problemas de importación con Turbopack
    const emailData = {
      order_number: order.order_number,
      total_pyg: order.total_pyg,
      subtotal_pyg: order.subtotal_pyg,
      shipping_cost_pyg: order.shipping_cost_pyg,
      payment_method: order.payment_method,
      shipping_address: validationResult.data.shipping,
      items: cartItems.map((item: CartItem) => ({
        quantity: item.quantity,
        unit_price_pyg: item.price,
        subtotal_pyg: item.price * item.quantity,
        product_name: item.name,
      })),
      user_email: user.email,
    };

    // Enviar email en background (no esperar respuesta)
    fetch(`${request.nextUrl.origin}/api/email/order-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    }).catch((err) => console.error('Error sending email request:', err));

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          order_number: order.order_number,
          total_pyg: order.total_pyg,
        },
      },
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Unexpected error in checkout API:', error);
    
    // Asegurar que siempre devolvemos JSON
    return NextResponse.json(
      {
        error: 'Error inesperado al procesar la orden. Por favor intenta de nuevo.',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : undefined,
      },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

