/// <reference types="astro/client" />

interface Env {
  RESEND_API_KEY: string;
  CONTACT_FROM_EMAIL: string;
  CONTACT_TO_EMAIL: string;
}

declare module 'cloudflare:workers' {
  export const env: Env;
}
