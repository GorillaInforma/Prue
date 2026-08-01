import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarRecordatorioWhatsApp } from "@/lib/integraciones";

// Busca facturas pendientes/vencidas y les manda recordatorio.
// Puedes conectar esto a un Vercel Cron Job (ver vercel.json) para que
// corra automáticamente todos los días.
// Nota: los Cron Jobs de Vercel solo hacen peticiones GET, por eso
// exponemos la misma lógica en GET y POST.
export async function GET() {
  return enviarRecordatoriosPendientes();
}

export async function POST() {
  return enviarRecordatoriosPendientes();
}

async function enviarRecordatoriosPendientes() {
  const facturasPendientes = await prisma.factura.findMany({
    where: { estatus: { in: ["PENDIENTE", "VENCIDA"] } },
    include: { cliente: true },
  });

  const resultados = [];

  for (const factura of facturasPendientes) {
    if (!factura.cliente.telefono) continue;

    const mensaje = `Hola ${factura.cliente.nombre}, tienes un pago pendiente de $${factura.monto} MXN por "${factura.concepto}". Vence el ${factura.fechaVencimiento.toLocaleDateString("es-MX")}.`;

    const envio = await enviarRecordatorioWhatsApp(factura.cliente.telefono, mensaje);

    await prisma.recordatorio.create({
      data: { facturaId: factura.id, canal: "WHATSAPP", estatus: envio.ok ? "enviado" : "fallido" },
    });

    resultados.push({ facturaId: factura.id, enviado: envio.ok });
  }

  return NextResponse.json({ total: resultados.length, resultados });
}
