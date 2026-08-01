import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { timbrarFactura } from "@/lib/integraciones";
import { z } from "zod";

const FacturaSchema = z.object({
  clienteId: z.string(),
  monto: z.number().positive(),
  concepto: z.string().min(1),
  fechaVencimiento: z.string(), // ISO date
});

export async function GET() {
  const facturas = await prisma.factura.findMany({
    orderBy: { fechaEmision: "desc" },
    include: { cliente: true, pagos: true },
  });
  return NextResponse.json(facturas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = FacturaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const factura = await prisma.factura.create({
    data: {
      clienteId: parsed.data.clienteId,
      monto: parsed.data.monto,
      concepto: parsed.data.concepto,
      fechaVencimiento: new Date(parsed.data.fechaVencimiento),
    },
  });

  // Timbrado ante el SAT (mock, ver lib/integraciones.ts)
  const timbrado = await timbrarFactura(factura.id);
  const facturaActualizada = await prisma.factura.update({
    where: { id: factura.id },
    data: { uuidCfdi: timbrado.uuid },
  });

  return NextResponse.json(facturaActualizada, { status: 201 });
}
