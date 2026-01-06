import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { formatPrice } from '@/lib/utils/formatters';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface OrderEmailData {
  order_number: string;
  total_pyg: number;
  subtotal_pyg: number;
  shipping_cost_pyg: number;
  payment_method: string;
  shipping_address: {
    full_name: string;
    phone: string;
    department: string;
    city: string;
    street: string;
    reference?: string;
  };
  items: Array<{
    quantity: number;
    unit_price_pyg: number;
    subtotal_pyg: number;
    product_name: string;
  }>;
  user_email: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY no configurada, omitiendo envío de email');
      return NextResponse.json({ success: true, skipped: true });
    }

    const data: OrderEmailData = await request.json();
    const { shipping_address, items, user_email, order_number, subtotal_pyg, shipping_cost_pyg, total_pyg, payment_method } = data;

    const paymentMethodLabels: Record<string, string> = {
      transferencia: 'Transferencia Bancaria',
      giro: 'Giro',
      tarjeta: 'Tarjeta de Crédito/Débito',
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Orden - Odora Perfumes</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">¡Orden Confirmada!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hola ${shipping_address.full_name},</p>
            
            <p>Gracias por tu compra. Tu orden ha sido recibida y está siendo procesada.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #a855f7;">
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #a855f7;">
                Número de Orden: ${order_number}
              </p>
            </div>
            
            <h2 style="color: #9333ea; margin-top: 30px; margin-bottom: 15px;">Productos</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              ${items.map((item) => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0;">
                    <strong>${item.product_name}</strong><br>
                    <span style="color: #6b7280; font-size: 14px;">
                      Cantidad: ${item.quantity} × ${formatPrice(item.unit_price_pyg)}
                    </span>
                  </td>
                  <td style="text-align: right; padding: 10px 0; font-weight: bold;">
                    ${formatPrice(item.subtotal_pyg)}
                  </td>
                </tr>
              `).join('')}
            </table>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Subtotal:</span>
                <span>${formatPrice(subtotal_pyg)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Envío:</span>
                <span>${shipping_cost_pyg === 0 ? 'Gratis' : formatPrice(shipping_cost_pyg)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; padding-top: 10px; border-top: 2px solid #d1d5db;">
                <span>Total:</span>
                <span style="color: #a855f7;">${formatPrice(total_pyg)}</span>
              </div>
            </div>
            
            <h2 style="color: #9333ea; margin-top: 30px; margin-bottom: 15px;">Dirección de Envío</h2>
            <p style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              ${shipping_address.full_name}<br>
              ${shipping_address.phone}<br>
              ${shipping_address.street}<br>
              ${shipping_address.city}, ${shipping_address.department}
              ${shipping_address.reference ? `<br><br>Referencia: ${shipping_address.reference}` : ''}
            </p>
            
            <h2 style="color: #9333ea; margin-top: 30px; margin-bottom: 15px;">Método de Pago</h2>
            <p style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              ${paymentMethodLabels[payment_method] || payment_method}
            </p>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Te notificaremos cuando tu orden sea enviada. Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
            
            <p style="margin-top: 20px;">
              Saludos,<br>
              <strong>Equipo Odora Perfumes</strong>
            </p>
          </div>
        </body>
      </html>
    `;

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    console.log('Attempting to send email:', {
      from: fromEmail,
      to: user_email,
      order_number,
    });

    const result = await resend.emails.send({
      from: fromEmail,
      to: user_email,
      subject: `Confirmación de Orden ${order_number} - Odora Perfumes`,
      html,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
    }

    console.log('Order confirmation email sent successfully:', {
      to: user_email,
      email_id: result.data?.id,
    });
    
    return NextResponse.json({ success: true, email_id: result.data?.id });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    
    // Log detallado del error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Si es un error de Resend, incluir más detalles
    if (error && typeof error === 'object' && 'message' in error) {
      console.error('Full error object:', JSON.stringify(error, null, 2));
    }
    
    // No fallar - el email es opcional, pero loguear el error
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Email send failed',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 200 });
  }
}

