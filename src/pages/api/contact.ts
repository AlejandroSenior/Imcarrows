import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const name = String(formData.get('name') ?? '');
    const email = String(formData.get('email') ?? '');
    const phone = String(formData.get('phone') ?? '');
        const carPurpose = String(formData.get('carPurpose') ?? formData.get('vehicleStyle') ?? '');
        const priceRange = String(formData.get('priceRange') ?? formData.get('budget') ?? '');
        const deliveryTime = String(formData.get('deliveryTime') ?? formData.get('timeframe') ?? '');
    const carModel = String(formData.get('carModel') ?? '');
        const deliveryLocation = String(formData.get('city') ?? formData.get('deliveryLocation') ?? '');
    const extraDetails = String(formData.get('extraDetails') ?? '');

    if (!name || !email) {
      return Response.json({ ok: false, error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    const resend = new Resend(env.RESEND_API_KEY);

    const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #080808 0%, #1a1a1a 100%); color: white; padding: 30px; text-align: center; border-bottom: 3px solid #d9b565; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.05em; }
        .header p { margin: 8px 0 0 0; font-size: 13px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.1em; }
        .content { padding: 30px; }
        .section { margin-bottom: 28px; }
        .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #d9b565; margin-bottom: 12px; border-bottom: 1px solid #e5e5e5; padding-bottom: 8px; }
        .question-row { margin-bottom: 16px; }
        .question-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #666; margin-bottom: 4px; }
        .question-answer { font-size: 14px; color: #1a1a1a; padding: 8px 12px; background: #f9f9f9; border-left: 3px solid #d9b565; }
        .contact-info { background: #f5f5f5; padding: 16px; border-radius: 6px; margin-bottom: 20px; }
        .contact-info-row { margin-bottom: 10px; font-size: 13px; }
        .contact-info-row strong { color: #080808; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #e5e5e5; }
        .footer-brand { font-weight: 700; color: #333; margin-bottom: 6px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>IMCARROWS</h1>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="contact-info">
                    <div class="contact-info-row"><strong><u>Nombre:</u></strong> ${escapeHtml(name)}</div>
                    <div class="contact-info-row"><strong><u>Email:</u></strong> ${escapeHtml(email)}</div>
                    <div class="contact-info-row"><strong><u>Teléfono:</u></strong> ${escapeHtml(phone || 'No proporcionado')}</div> <br />
                </div>
            </div>

            <div class="section">
                <div class="section-title">Detalles de la Solicitud:</div> <br />
                
                <div class="question-row">
                    <div class="question-label"><strong><u>¿Para qué se utilizará el vehículo?</u></strong></div>
                    <div class="question-answer">${escapeHtml(carPurpose || '—')}</div>
                </div>

                <div class="question-row">
                    <div class="question-label"><strong><u>¿Qué rango de precios estás considerando?</u></strong></div>
                    <div class="question-answer">${escapeHtml(priceRange || '—')}</div>
                </div>

                <div class="question-row">
                    <div class="question-label"><strong><u>¿Cuándo te gustaría recibir el vehículo?</u></strong></div>
                    <div class="question-answer">${escapeHtml(deliveryTime || '—')}</div>
                </div>

                <div class="question-row">
                    <div class="question-label"><strong><u>Marca y modelo</u></strong></div>
                    <div class="question-answer">${escapeHtml(carModel || '—')}</div>
                </div>

                <div class="question-row">
                    <div class="question-label"><strong><u>¿En que ciudad de la península te encuentras?</u></strong></div>
                    <div class="question-answer">${escapeHtml(deliveryLocation || '—')}</div>
                </div>

                <div class="question-row">
                    <div class="question-label"><strong><u>¿Tienes alguna duda o preocupación antes de dar el paso de importar el coche?</u></strong></div>
                    <div class="question-answer">${escapeHtml(extraDetails || '—')}</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    await resend.emails.send({
      from: env.CONTACT_FROM_EMAIL,
      to: env.CONTACT_TO_EMAIL,
      subject: `Nueva solicitud de contacto - ${name}`,
      html: emailHtml
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: 'No se pudo enviar la solicitud.' }, { status: 500 });
  }
};
