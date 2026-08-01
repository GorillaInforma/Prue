import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto py-24 px-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Sistema de Cobranza</h1>
      <p className="text-slate-600 mb-8">
        Facturación CFDI, recordatorios de pago y conciliación en un solo lugar.
      </p>
      <Link
        href="/dashboard"
        className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition"
      >
        Ir al Dashboard
      </Link>
    </main>
  );
}
