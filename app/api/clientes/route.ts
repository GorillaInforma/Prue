import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ClienteSchema = z.object({
  nombre: z.string().min(1),
  rfc: z.string().optional(),
  email: z.string().email(),
  telefono: z.string().optional(),
});

export async function GET() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { createdAt: "desc" },
    include: { facturas: true },
  });
  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ClienteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cliente = await prisma.cliente.create({ data: parsed.data });
  return NextResponse.json(cliente, { status: 201 });
}
