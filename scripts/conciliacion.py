"""
Script de conciliación bancaria.

Vercel no ejecuta procesos Python de larga duración como parte de un
Next.js app, así que este script está pensado para correr aparte:
- como cron job en tu propio servidor / GitHub Actions, o
- portado a una función serverless de Python si usas Vercel Functions (runtime python3.9+)
  ver: https://vercel.com/docs/functions/runtimes/python

Uso:
    python scripts/conciliacion.py estado_cuenta.csv

Compara los movimientos del estado de cuenta bancario (CSV exportado
del banco) contra las facturas pendientes en la base de datos, y marca
coincidencias por monto + referencia.
"""

import csv
import sys
import os
import requests  # pip install requests

API_URL = os.environ.get("COBRANZA_API_URL", "http://localhost:3000")


def cargar_movimientos(csv_path: str) -> list[dict]:
    """Lee el CSV del banco. Columnas esperadas: fecha, monto, referencia, descripcion"""
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [row for row in reader]


def obtener_facturas_pendientes() -> list[dict]:
    resp = requests.get(f"{API_URL}/api/facturas")
    resp.raise_for_status()
    facturas = resp.json()
    return [f for f in facturas if f["estatus"] in ("PENDIENTE", "VENCIDA")]


def conciliar(movimientos: list[dict], facturas: list[dict]) -> list[dict]:
    """Empareja movimientos bancarios con facturas por monto exacto.
    En un caso real, aquí también compararías por referencia/RFC/fecha
    con cierta tolerancia, y usarías fuzzy matching para descripciones.
    """
    coincidencias = []
    for mov in movimientos:
        monto_mov = float(mov["monto"])
        for factura in facturas:
            if abs(factura["monto"] - monto_mov) < 0.01:
                coincidencias.append(
                    {
                        "facturaId": factura["id"],
                        "cliente": factura["cliente"]["nombre"],
                        "monto": monto_mov,
                        "referencia_bancaria": mov.get("referencia", ""),
                    }
                )
                break
    return coincidencias


def marcar_como_pagada(factura_id: str, monto: float, referencia: str):
    resp = requests.patch(
        f"{API_URL}/api/pagos",
        json={
            "facturaId": factura_id,
            "monto": monto,
            "metodo": "SPEI",
            "referencia": referencia,
        },
    )
    resp.raise_for_status()


def main():
    if len(sys.argv) < 2:
        print("Uso: python scripts/conciliacion.py <estado_cuenta.csv>")
        sys.exit(1)

    movimientos = cargar_movimientos(sys.argv[1])
    facturas = obtener_facturas_pendientes()
    coincidencias = conciliar(movimientos, facturas)

    print(f"Se encontraron {len(coincidencias)} coincidencias de {len(movimientos)} movimientos.")

    for c in coincidencias:
        print(f"  -> Factura {c['facturaId']} ({c['cliente']}): ${c['monto']} conciliado")
        marcar_como_pagada(c["facturaId"], c["monto"], c["referencia_bancaria"])


if __name__ == "__main__":
    main()
