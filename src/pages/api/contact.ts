import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { Resend } from 'resend';

const jsonHeaders = {
  'Content-Type': 'application/json'
};

function getField(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const apiKey = env.RESEND_API_KEY;
    const fromEmail = env.CONTACT_FROM_EMAIL;
    const toEmail = env.CONTACT_TO_EMAIL;

    if (!apiKey || !fromEmail || !toEmail) {
      return new Response(JSON.stringify({ ok: false, error: 'Falta configurar el envio del formulario en el servidor.' }), {
        status: 500,
        headers: jsonHeaders
      });
    }

    const resend = new Resend(apiKey);
    const formData = await request.formData();
    const name = getField(formData, 'name');
    const email = getField(formData, 'email');
    const carModel = getField(formData, 'carModel');
    const message = getField(formData, 'message');
    const company = getField(formData, 'company');

    if (company) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: jsonHeaders
      });
    }

    if (!name || !email || !carModel || !message) {
      return new Response(JSON.stringify({ ok: false, error: 'Completa todos los campos obligatorios.' }), {
        status: 400,
        headers: jsonHeaders
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return new Response(JSON.stringify({ ok: false, error: 'Introduce un email valido.' }), {
        status: 400,
        headers: jsonHeaders
      });
    }

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: 'Nuevo contacto IMC Arrows',
      text: [`name=${name}`, `email=${email}`, `carModel=${carModel}`, `message=${message}`].join('\n')
    });

    if (error) {
      return new Response(JSON.stringify({
        ok: false,
        error: error.message || 'No se pudo enviar la solicitud.',
        provider: 'resend'
      }), {
        status: 502,
        headers: jsonHeaders
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: jsonHeaders
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Ocurrio un error inesperado al enviar el formulario.' }), {
      status: 500,
      headers: jsonHeaders
    });
  }
};
