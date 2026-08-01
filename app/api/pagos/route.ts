import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generarLigaDePago } from "@/lib/integraciones";
import { z } from "zod";

const LigaPagoSchema = z.object({
  facturaId: z.string(),
});

// Genera una liga de pago para que el cliente pague (tarjeta/SPEI)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = LigaPagoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const factura = await prisma.factura.findUnique({ where: { id: parsed.data.facturaId } });
  if (!factura) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }

  const liga = await generarLigaDePago(factura.id, factura.monto);
  return NextResponse.json(liga);
}

// Webhook simulado: el procesador de pagos notifica que se pagó
export async function PATCH(req: NextRequest) {
  const { facturaId, monto, metodo, referencia } = await req.json();

  const pago = await prisma.pago.create({
    data: { facturaId, monto, metodo, referencia, conciliado: true },
  });

  await prisma.factura.update({
    where: { id: facturaId },
    data: { estatus: "PAGADA" },
  });

  return NextResponse.json(pago, { status: 201 });
}
