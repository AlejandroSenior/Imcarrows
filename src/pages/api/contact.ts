import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const name = formData.get('name');
  const email = formData.get('email');
  const carModel = formData.get('carModel');
  const message = formData.get('message');

  try {
    await resend.emails.send({
      from: import.meta.env.CONTACT_FROM_EMAIL,
      to: import.meta.env.CONTACT_TO_EMAIL,
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
