import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const name = String(formData.get('name') ?? '');
    const email = String(formData.get('email') ?? '');
    const carModel = String(formData.get('carModel') ?? '');
    const message = String(formData.get('message') ?? '');

    if (!name || !email || !carModel || !message) {
      return Response.json({ ok: false, error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    const resend = new Resend(env.RESEND_API_KEY);

    await resend.emails.send({
      from: env.CONTACT_FROM_EMAIL,
      to: env.CONTACT_TO_EMAIL,
      subject: 'Nuevo contacto desde IMC Arrows',
      html: `
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Modelo deseado:</strong> ${carModel}</p>
        <p><strong>Mensaje:</strong> ${message}</p>
      `
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: 'No se pudo enviar la solicitud.' }, { status: 500 });
  }
};
