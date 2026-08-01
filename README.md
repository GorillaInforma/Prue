# Cobranza App

Sistema de facturación y cobranza (inspirado en el tipo de producto de Savio),
armado con:

- **TypeScript + Next.js 14** (App Router) — frontend (React) y backend (API routes), un solo servicio.
- **Prisma + PostgreSQL** — modelo de datos (clientes, facturas, pagos, recordatorios).
- **Python** (`scripts/conciliacion.py`) — utilidad standalone de conciliación bancaria.
- **Node.js** (`cron/recordatorios.js`) — servicio ligero de cron para Railway.
- **Tailwind CSS** — estilos.

Todas las integraciones con terceros (timbrado CFDI, procesador de pagos, WhatsApp) están **mockeadas** en `lib/integraciones.ts`, con comentarios de qué necesitarías (API keys, proveedor) para conectarlas de verdad.

## 1. Instalación local

```bash
npm install
cp .env.example .env
# edita .env con tu DATABASE_URL (puedes usar Railway ya desde local, o una Postgres local)
npx prisma migrate dev --name init
npm run dev
```

Abre http://localhost:3000

## 2. Subir a tu repo de GitHub

```bash
git init
git add .
git commit -m "Sistema de cobranza inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

## 3. Desplegar en Railway

### a) Base de datos
1. En Railway: **New Project** → **Provision PostgreSQL**.
2. Railway genera automáticamente `DATABASE_URL` dentro de ese plugin.

### b) Servicio principal (Next.js)
1. En el mismo proyecto: **New Service** → **Deploy from GitHub repo**.
2. En **Settings → Root Directory**, deja la raíz del repo (donde está `package.json`).
3. En **Variables**, agrega una referencia a la base de datos: `DATABASE_URL = ${{Postgres.DATABASE_URL}}` (Railway te sugiere esto automáticamente si están en el mismo proyecto).
4. Railway detecta Next.js con Nixpacks solo; `railway.json` ya trae el build/start command correctos (`prisma generate && next build` / `next start`).
5. En **Settings → Networking**, genera un dominio público (`Generate Domain`).
6. Corre las migraciones una vez desplegado:
   ```bash
   railway link          # conecta tu CLI local al proyecto
   railway run npx prisma migrate deploy
   ```

### c) Servicio de recordatorios (cron)
Railway no lee `vercel.json` — los cron jobs se configuran nativamente por servicio:

1. **New Service** → **Deploy from GitHub repo** (mismo repo).
2. En **Settings → Root Directory**, pon `cron` (para que solo tome esa carpeta).
3. En **Settings → Cron Schedule**, activa y pon algo como `0 15 * * *` (todos los días 15:00 UTC).
4. En **Variables**, agrega `COBRANZA_API_URL` con el dominio público del servicio principal (paso b.5).

Así el servicio de cron se despierta según el schedule, pega un solo POST a `/api/recordatorios`, y se apaga.

## 4. Conectar integraciones reales (cuando estés listo)

Edita `lib/integraciones.ts`:
- **CFDI/timbrado**: contrata un PAC (Facturama, SW Sapien, Finkok) y reemplaza `timbrarFactura`.
- **Pagos**: Stripe, Conekta u Openpay — reemplaza `generarLigaDePago`.
- **WhatsApp**: Meta Cloud API o Twilio — reemplaza `enviarRecordatorioWhatsApp`.

## 5. Script de conciliación (Python)

Puedes correrlo local/manual, o como tercer servicio de Railway con su propio cron:

```bash
cd scripts
pip install -r requirements.txt
COBRANZA_API_URL=https://tu-servicio.up.railway.app python conciliacion.py estado_cuenta.csv
```

Espera un CSV con columnas `fecha,monto,referencia,descripcion` (exportado de tu banco) y lo compara contra las facturas pendientes vía la API.

## Estructura

```
app/
  api/clientes/        # CRUD clientes
  api/facturas/         # crear factura + timbrado mock
  api/pagos/              # generar liga de pago + webhook de pago
  api/recordatorios/       # envío masivo de recordatorios (GET y POST)
  dashboard/                # UI principal (React)
lib/
  prisma.ts                # cliente de base de datos
  integraciones.ts          # mocks de PAC / pagos / WhatsApp
prisma/
  schema.prisma               # modelo de datos
scripts/
  conciliacion.py               # utilidad Python de conciliación bancaria
cron/
  recordatorios.js                # servicio de cron nativo de Railway
railway.json                        # build/start command del servicio principal
```

## Lo que NO incluye (y por qué)

No incluí autenticación, multi-tenant real, ni las integraciones reales de pago/CFDI, porque requieren credenciales propias tuyas (contratos con PAC, cuenta de procesador de pagos, número de WhatsApp Business verificado) que no puedo generar por ti. La arquitectura ya está lista para que las conectes cuando las tengas.
