#!/usr/bin/env node
// Cross-platform seed script (Windows / macOS / Linux). Node 18+ (built-in fetch).
// Usage:  node scripts/seed.mjs            (defaults to http://localhost:8000/api/v1)
//         BASE_URL=http://host/api/v1 node scripts/seed.mjs

const BASE = process.env.BASE_URL || "http://localhost:8000/api/v1";
const PASS = "Secret@123";

const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const say = (s) => console.log(cyan(s));
const ok = (s) => console.log(`  ${green("✓")} ${s}`);

async function req(method, token, path, body) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

async function waitForApi() {
  const health = BASE.replace(/\/api\/v1$/, "") + "/health";
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(health);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
}

async function main() {
  say(`Waiting for API at ${BASE} ...`);
  await waitForApi();

  say("1. AUTH — register + login 4 roles");
  const users = [
    ["Fleet Manager", "fleet@transitops.com", "fleet_manager"],
    ["Dispatcher", "dp@transitops.com", "dispatcher"],
    ["Safety Officer", "so@transitops.com", "safety_officer"],
    ["Financial Analyst", "fa@transitops.com", "financial_analyst"],
  ];
  for (const [name, email, role] of users) {
    await req("POST", null, "/auth/register", { name, email, password: PASS, role });
  }
  const login = async (email) =>
    (await req("POST", null, "/auth/login", { email, password: PASS })).json?.data?.access_token;
  const FM = await login("fleet@transitops.com");
  const DP = await login("dp@transitops.com");
  const SO = await login("so@transitops.com");
  const FA = await login("fa@transitops.com");
  if (!FM || !DP || !SO || !FA) throw new Error("login failed — is the DB seeded/migrated?");
  ok("logged in fleet_manager / dispatcher / safety_officer / financial_analyst");

  const N = 10;
  const idx = [...Array(N).keys()];

  say("2. VEHICLES — POST /vehicles x10");
  const TYPES = ["truck", "van", "mini_truck", "trailer", "other", "truck", "van", "mini_truck", "trailer", "truck"];
  const REGIONS = ["Vadodara", "Surat", "Rajkot", "Ahmedabad", "Bhavnagar", "Vadodara", "Surat", "Rajkot", "Ahmedabad", "Surat"];
  const vehicleIds = [];
  for (const i of idx) {
    const r = await req("POST", FM, "/vehicles", {
      registration_number: `GJ-06-VH-${String(1000 + i).padStart(4, "0")}`,
      name: `Fleet Vehicle ${i + 1}`,
      type: TYPES[i],
      max_load_capacity_kg: (i + 1) * 500,
      odometer_km: (i + 1) * 1000,
      acquisition_cost: (i + 1) * 100000,
      region: REGIONS[i],
    });
    vehicleIds.push(r.json?.data?.vehicle?.id);
  }
  ok(`created ${vehicleIds.filter(Boolean).length} vehicles`);

  say("3. DRIVERS — POST /drivers x10");
  const NAMES = ["Alex", "Meena", "Ravi", "Priya", "Sam", "Neha", "Vijay", "Anita", "Rahul", "Kiran"];
  const driverIds = [];
  for (const i of idx) {
    const yr = 2027 + (i % 4);
    const mo = String((i % 9) + 1).padStart(2, "0");
    const r = await req("POST", FM, "/drivers", {
      name: `${NAMES[i]} Kumar`,
      license_number: `GJ06-2021-${String(100000 + i).padStart(7, "0")}`,
      license_category: i % 2 ? "HMV" : "LMV",
      license_expiry_date: `${yr}-${mo}-15`,
      contact_number: `+91-98765${String(i).padStart(5, "0")}`,
      safety_score: 100 - i * 3,
    });
    driverIds.push(r.json?.data?.driver?.id);
  }
  ok(`created ${driverIds.filter(Boolean).length} drivers`);

  say("4. TRIPS — POST /trips x10 (1 vehicle + 1 driver each)");
  const SRC = ["Vadodara", "Surat", "Rajkot", "Ahmedabad", "Bhavnagar", "Vadodara", "Surat", "Rajkot", "Ahmedabad", "Surat"];
  const DST = ["Surat", "Rajkot", "Ahmedabad", "Bhavnagar", "Vadodara", "Rajkot", "Vadodara", "Surat", "Bhavnagar", "Ahmedabad"];
  const tripIds = [];
  for (const i of idx) {
    const r = await req("POST", DP, "/trips", {
      source: SRC[i],
      destination: DST[i],
      vehicle_id: vehicleIds[i],
      driver_id: driverIds[i],
      cargo_weight_kg: (i + 1) * 100,
      planned_distance_km: (i + 1) * 50,
      revenue: (i + 1) * 1000,
    });
    tripIds.push(r.json?.data?.trip?.id);
  }
  ok(`created ${tripIds.filter(Boolean).length} trips (draft)`);

  say("   lifecycle: dispatch 0-7, complete 0-5, cancel 6-7 (8-9 stay draft)");
  for (const i of [0, 1, 2, 3, 4, 5, 6, 7]) {
    await req("POST", DP, `/trips/${tripIds[i]}/dispatch`, {});
  }
  for (const i of [0, 1, 2, 3, 4, 5]) {
    await req("POST", DP, `/trips/${tripIds[i]}/complete`, {
      end_odometer_km: (i + 1) * 1000 + (i + 1) * 50,
      fuel_consumed: { liters: (i + 1) * 10, cost: (i + 1) * 1000 },
      revenue: (i + 1) * 1000,
    });
  }
  await req("POST", DP, `/trips/${tripIds[6]}/cancel`, { reason: "client cancelled" });
  await req("POST", DP, `/trips/${tripIds[7]}/cancel`, { reason: "vehicle issue" });
  ok("6 completed, 2 dispatched-cancelled, 2 draft (all resources back to available)");

  say("5. MAINTENANCE — POST /maintenance x10");
  const TITLES = ["Oil Change", "Brake Service", "Tyre Rotation", "Engine Tune", "AC Repair", "Clutch Fix", "Battery Swap", "Suspension", "Filter Change", "General Service"];
  const maintIds = [];
  for (const i of idx) {
    const r = await req("POST", FM, "/maintenance", {
      vehicle_id: vehicleIds[i],
      title: TITLES[i],
      description: `Scheduled ${TITLES[i]} for vehicle ${i + 1}`,
      cost: (i + 1) * 1500,
    });
    maintIds.push(r.json?.data?.maintenance?.id);
  }
  ok(`opened ${maintIds.filter(Boolean).length} maintenance records (vehicles -> in_shop)`);
  say("   close 0-6, leave 7-9 open");
  for (const i of [0, 1, 2, 3, 4, 5, 6]) {
    await req("POST", FM, `/maintenance/${maintIds[i]}/close`, { cost: (i + 1) * 1600 });
  }
  ok("7 closed, 3 open");

  say("6. FUEL LOGS — POST /fuel-logs x10");
  for (const i of idx) {
    await req("POST", FA, "/fuel-logs", {
      vehicle_id: vehicleIds[i],
      liters: (i + 1) * 8,
      cost: (i + 1) * 800,
      odometer_km: (i + 1) * 1200,
    });
  }
  ok("created 10 fuel logs");

  say("7. EXPENSES — POST /expenses x10");
  const ETYPES = ["toll", "parking", "fine", "misc", "toll", "parking", "fine", "misc", "toll", "parking"];
  for (const i of idx) {
    await req("POST", FA, "/expenses", {
      vehicle_id: vehicleIds[i],
      type: ETYPES[i],
      amount: (i + 1) * 120,
      note: `${ETYPES[i]} charge ${i + 1}`,
    });
  }
  ok("created 10 expenses");

  say("8. ANALYTICS — verify read-only endpoints against seeded data");
  const total = async (path) => (await req("GET", FM, path)).json?.data?.pagination?.total ?? "?";
  const status = async (path) => (await req("GET", FM, path)).status;
  ok(`GET /dashboard -> ${await status("/dashboard")}`);
  ok(`GET /reports/fuel-efficiency -> ${await status("/reports/fuel-efficiency")}`);
  ok(`GET /reports/operational-costs -> ${await status("/reports/operational-costs")}`);
  ok(`GET /reports/vehicle-roi -> ${await status("/reports/vehicle-roi")}`);
  ok(`GET /reports/utilization-trend -> ${await status("/reports/utilization-trend?days=14")}`);
  ok(`GET /reports/cost-trend -> ${await status("/reports/cost-trend?months=6")}`);
  ok(`GET /reports/export?report=vehicles&format=csv -> ${await status("/reports/export?report=vehicles&format=csv")}`);
  ok(`GET /vehicles/:id/costs -> ${await status(`/vehicles/${vehicleIds[0]}/costs`)}`);
  ok(`GET /vehicles/:id/maintenance -> ${await status(`/vehicles/${vehicleIds[0]}/maintenance`)}`);

  say("DONE — totals via list endpoints");
  console.log(
    `  vehicles=${await total("/vehicles?limit=100")} ` +
      `drivers=${await total("/drivers?limit=100")} ` +
      `trips=${await total("/trips?limit=100")} ` +
      `maintenance=${await total("/maintenance?limit=100")} ` +
      `fuel_logs=${await total("/fuel-logs?limit=100")} ` +
      `expenses=${await total("/expenses?limit=100")}`,
  );
}

main().catch((err) => {
  console.error(red(`SEED FAILED: ${err.message}`));
  process.exit(1);
});
