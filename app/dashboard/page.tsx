"use client";

import { useEffect, useState } from "react";

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
}

interface Factura {
  id: string;
  monto: number;
  concepto: string;
  estatus: string;
  fechaVencimiento: string;
  cliente: Cliente;
}

export default function Dashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  async function cargarDatos() {
    setLoading(true);
    const [resClientes, resFacturas] = await Promise.all([
      fetch("/api/clientes"),
      fetch("/api/facturas"),
    ]);
    setClientes(await resClientes.json());
    setFacturas(await resFacturas.json());
    setLoading(false);
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function crearCliente(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, telefono }),
    });
    setNombre("");
    setEmail("");
    setTelefono("");
    cargarDatos();
  }

  async function enviarRecordatorios() {
    const res = await fetch("/api/recordatorios", { method: "POST" });
    const data = await res.json();
    alert(`Recordatorios enviados: ${data.total}`);
  }

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={enviarRecordatorios}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
        >
          Enviar recordatorios pendientes
        </button>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="font-semibold mb-4">Nuevo cliente</h2>
        <form onSubmit={crearCliente} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Teléfono (WhatsApp)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <button
            type="submit"
            className="sm:col-span-3 bg-slate-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-700 transition"
          >
            Agregar cliente
          </button>
        </form>
      </section>

      {loading ? (
        <p className="text-slate-500">Cargando...</p>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="font-semibold mb-3">Clientes ({clientes.length})</h2>
            <div className="bg-white rounded-xl border border-slate-200 divide-y">
              {clientes.map((c) => (
                <div key={c.id} className="p-4 flex justify-between text-sm">
                  <span>{c.nombre}</span>
                  <span className="text-slate-500">{c.email}</span>
                </div>
              ))}
              {clientes.length === 0 && (
                <p className="p-4 text-slate-400 text-sm">Aún no hay clientes.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="font-semibold mb-3">Facturas ({facturas.length})</h2>
            <div className="bg-white rounded-xl border border-slate-200 divide-y">
              {facturas.map((f) => (
                <div key={f.id} className="p-4 flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{f.cliente?.nombre}</p>
                    <p className="text-slate-500">{f.concepto}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${f.monto.toLocaleString("es-MX")}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        f.estatus === "PAGADA"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {f.estatus}
                    </span>
                  </div>
                </div>
              ))}
              {facturas.length === 0 && (
                <p className="p-4 text-slate-400 text-sm">Aún no hay facturas.</p>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
