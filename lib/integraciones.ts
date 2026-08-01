/**
 * Este archivo centraliza las integraciones con terceros.
 * Todas están MOCKEADAS (simuladas). Para producción real necesitas:
 *
 * 1. PAC (timbrado CFDI 4.0 ante el SAT): ej. Facturama, SW Sapien, Finkok.
 *    Requiere: certificado .cer/.key del emisor, RFC, contraseña de la FIEL/CSD.
 *
 * 2. Procesador de pagos (tarjeta/SPEI): ej. Stripe, Conekta, Openpay.
 *    Requiere: llaves pública/privada del procesador.
 *
 * 3. WhatsApp Business API: ej. Twilio, Meta Cloud API, o 360dialog.
 *    Requiere: número verificado de WhatsApp Business + token.
 *
 * Cada función de abajo simula la respuesta real para que puedas
 * desarrollar el flujo completo sin tener aún las credenciales.
 */

interface TimbradoResult {
  uuid: string;
  xmlUrl: string;
  pdfUrl: string;
}

export async function timbrarFactura(facturaId: string): Promise<TimbradoResult> {
  // TODO: reemplazar con llamada real al PAC, ej:
  // const res = await fetch("https://api.facturama.mx/api/cfdi", { ... })
  await new Promise((r) => setTimeout(r, 300)); // simula latencia de red
  return {
    uuid: crypto.randomUUID(),
    xmlUrl: `https://mock-pac.local/xml/${facturaId}.xml`,
    pdfUrl: `https://mock-pac.local/pdf/${facturaId}.pdf`,
  };
}

interface LigaPagoResult {
  url: string;
  referencia: string;
}

export async function generarLigaDePago(facturaId: string, monto: number): Promise<LigaPagoResult> {
  // TODO: reemplazar con llamada real al procesador, ej:
  // const res = await fetch("https://api.stripe.com/v1/payment_links", { ... })
  await new Promise((r) => setTimeout(r, 200));
  return {
    url: `https://mock-pagos.local/pagar/${facturaId}`,
    referencia: `ref_${Math.random().toString(36).slice(2, 10)}`,
  };
}

export async function enviarRecordatorioWhatsApp(telefono: string, mensaje: string): Promise<{ ok: boolean }> {
  // TODO: reemplazar con llamada real, ej. Meta Cloud API:
  // const res = await fetch(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, { ... })
  console.log(`[MOCK WHATSAPP] -> ${telefono}: ${mensaje}`);
  await new Promise((r) => setTimeout(r, 150));
  return { ok: true };
}
