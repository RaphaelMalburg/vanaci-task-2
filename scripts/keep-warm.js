// Script para manter a aplicação Vercel aquecida e evitar cold starts
const https = require("https");

const VERCEL_URL = "https://farmacia-vanaci.vercel.app";
const WARMUP_INTERVAL = 10 * 60 * 1000; // 5 minutos
const ENDPOINTS_TO_WARM = ["/api/warmup", "/api/products", "/api/cart", "/api/navigation"];

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${VERCEL_URL}${endpoint}`;
    const startTime = Date.now();

    https
      .get(url, (res) => {
        const duration = Date.now() - startTime;
        console.log(`✅ ${endpoint} - Status: ${res.statusCode} - Duration: ${duration}ms`);
        resolve({ endpoint, status: res.statusCode, duration });
      })
      .on("error", (err) => {
        console.log(`❌ ${endpoint} - Error: ${err.message}`);
        reject({ endpoint, error: err.message });
      });
  });
}

async function warmupApplication() {
  console.log(`🔥 Warming up application at ${new Date().toISOString()}`);

  const promises = ENDPOINTS_TO_WARM.map((endpoint) => makeRequest(endpoint).catch((err) => err));

  try {
    const results = await Promise.all(promises);
    const successful = results.filter((r) => r.status && r.status < 400).length;
    console.log(`📊 Warmup completed: ${successful}/${ENDPOINTS_TO_WARM.length} endpoints successful\n`);
  } catch (error) {
    console.error("❌ Warmup failed:", error);
  }
}

// Executa warmup imediatamente
warmupApplication();

// Agenda warmup periódico
setInterval(warmupApplication, WARMUP_INTERVAL);

console.log(`🚀 Keep-warm script started. Warming up every ${WARMUP_INTERVAL / 1000 / 60} minutes.`);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Keep-warm script stopped.");
  process.exit(0);
});
