/**
 * Servicio de cron para recordatorios de pago.
 *
 * Pensado para desplegarse como un SEGUNDO servicio en Railway
 * (independiente del servicio Next.js), con "Cron Schedule" activado
 * en Settings del servicio (ej. "0 15 * * *" = todos los días 15:00 UTC).
 *
 * Railway ejecuta el Start Command una vez por cada disparo del cron,
 * así que este script solo hace la petición y termina (exit).
 *
 * Variables de entorno requeridas en este servicio:
 *   COBRANZA_API_URL = https://tu-servicio-nextjs.up.railway.app
 */

async function main() {
  const apiUrl = process.env.COBRANZA_API_URL;

  if (!apiUrl) {
    console.error("Falta la variable de entorno COBRANZA_API_URL");
    process.exit(1);
  }

  console.log(`[cron] Disparando recordatorios en ${apiUrl}/api/recordatorios ...`);

  const res = await fetch(`${apiUrl}/api/recordatorios`, { method: "POST" });

  if (!res.ok) {
    console.error(`[cron] Error: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`[cron] Recordatorios enviados: ${data.total}`);
}

main().catch((err) => {
  console.error("[cron] Falló la ejecución:", err);
  process.exit(1);
});
