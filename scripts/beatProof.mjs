import { access, mkdir, readFile, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import puppeteer from "puppeteer-core";

const ROOT = process.cwd();
const PORT = Number(process.env.BEAT_PROOF_PORT ?? 4177);
const BASE_URL = process.env.BEAT_PROOF_BASE_URL ?? `http://127.0.0.1:${PORT}/?debug=1`;
const STEP_TIMEOUT_MS = 45_000;
const MOVE_TICK_MS = 62;
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium"
].filter(Boolean);

const [bootState, scriptPath] = process.argv.slice(2);
if (!bootState || !scriptPath) {
  console.error("Usage: node scripts/beatProof.mjs <boot-state> <proof-script.json>");
  process.exit(2);
}

const proof = JSON.parse(await readFile(path.resolve(ROOT, scriptPath), "utf8"));
const safeName = String(proof.name ?? bootState).replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
const outputDir = path.join(ROOT, "tmp", "beat-proof", safeName);
let server;
let browser;
let page;
let browserError;
let activeStep = "boot";
const startedAt = Date.now();

try {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  if (!process.env.BEAT_PROOF_BASE_URL) {
    server = startServer();
    await waitForServer(BASE_URL);
  }

  browser = await puppeteer.launch({
    executablePath: await findChrome(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-background-timer-throttling"]
  });
  page = await browser.newPage();
  await page.setViewport({
    width: proof.viewport?.width ?? 1280,
    height: proof.viewport?.height ?? 800,
    deviceScaleFactor: proof.viewport?.deviceScaleFactor ?? 1,
    isMobile: proof.viewport?.isMobile ?? false,
    hasTouch: proof.viewport?.hasTouch ?? false
  });
  page.on("pageerror", (error) => {
    browserError ??= error;
    console.error(`[browser] ${error.stack ?? error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") console.error(`[console] ${message.text()}`);
  });

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await waitForProofApi();
  const navigation = page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10_000 });
  const boot = await page.evaluate((name) => window.__BALI_LIFE_DEV_PROOF__?.bootState(name), bootState);
  if (!boot?.ok) throw new Error(boot?.message ?? "Dev proof API was not installed");
  await navigation;
  await waitForProofApi();
  const initial = await waitForDebug((state) => state.mode === "world", `${bootState} world boot`, 10_000);
  console.log(
    `[BOOT] ${bootState} act=${initial.currentAct} deliveries=${initial.completedDeliveryCount} ` +
      `rating=${initial.driverRating} wallet=${initial.money}`
  );

  for (const [index, step] of (proof.steps ?? []).entries()) {
    activeStep = `${index + 1}-${step.action}`;
    await runStep(step, index + 1);
  }

  const elapsedSeconds = (Date.now() - startedAt) / 1_000;
  console.log(`[PASS] ${proof.name ?? scriptPath} completed in ${elapsedSeconds.toFixed(2)}s; screenshots=${outputDir}`);
} catch (error) {
  console.error(`[FAIL] ${activeStep}: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
  if (page) await capture("failure").catch(() => undefined);
  process.exitCode = 1;
} finally {
  await browser?.close().catch(() => undefined);
  if (server && server.exitCode == null) {
    if (process.platform === "win32") server.kill();
    else process.kill(-server.pid, "SIGTERM");
  }
}

async function runStep(step, index) {
  switch (step.action) {
    case "assertOffer": {
      const offers = await page.evaluate(() => window.__BALI_LIFE_DEV_PROOF__?.getBoardOffers() ?? []);
      const offer = offers.find((candidate) => candidate.id === step.id);
      if (!offer) throw new Error(`Offer ${step.id} is not listed`);
      if (step.available != null && offer.available !== step.available) {
        throw new Error(`Offer ${step.id} availability=${offer.available}; expected ${step.available}; reason=${offer.reason}`);
      }
      console.log(`[STEP ${index}] ${step.id}: ${offer.available ? "available" : offer.reason}`);
      return;
    }
    case "openPhoneTab":
      await requireApiResult("openPhoneTab", step.tab);
      return;
    case "openVenuePanel":
      await requireApiResult("openVenuePanel", step.venueId);
      return;
    case "inviteCrew":
      await requireApiResult("inviteCrew", step.crewId);
      return;
    case "joinCrew":
      await requireApiResult("joinCrew", step.crewId);
      return;
    case "setClock":
      await requireApiResult("setClock", { day: step.day, minuteOfDay: step.minuteOfDay });
      return;
    case "enterInterior":
      await requireApiResult("enterInterior", step.interiorId);
      await waitForDebug(
        (state) => state.activeInteriorId === step.interiorId && state.mode === "interior" && !state.interiorTransitioning,
        `${step.interiorId} interior transition`,
        4_000
      );
      return;
    case "interactNpc":
      await requireApiResult("interactNpc", step.npcId);
      return;
    case "setViewport":
      await page.setViewport({
        width: step.width,
        height: step.height,
        deviceScaleFactor: step.deviceScaleFactor ?? 1,
        isMobile: step.isMobile ?? false,
        hasTouch: step.hasTouch ?? false
      });
      await delay(240);
      console.log(`[STEP ${index}] viewport ${step.width}x${step.height}`);
      return;
    case "measureFps": {
      const fps = await page.evaluate(
        (durationMs) =>
          new Promise((resolve) => {
            let frames = 0;
            let started = 0;
            const tick = (now) => {
              if (!started) started = now;
              frames += 1;
              if (now - started >= durationMs) {
                resolve((frames * 1000) / Math.max(1, now - started));
                return;
              }
              requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }),
        step.durationMs ?? 2200
      );
      console.log(`[STEP ${index}] FPS ${step.name ?? "sample"}: ${Number(fps).toFixed(2)}`);
      return;
    }
    case "acceptDeliveryById": {
      const result = await page.evaluate((id) => window.__BALI_LIFE_DEV_PROOF__?.acceptDeliveryById(id), step.id);
      if (!result?.ok) throw new Error(result?.message ?? `Could not accept ${step.id}`);
      console.log(`[STEP ${index}] accepted ${step.id}`);
      return;
    }
    case "payRent": {
      const result = await page.evaluate(() => window.__BALI_LIFE_DEV_PROOF__?.payRent());
      if (!result?.ok) throw new Error(result?.message ?? "Could not pay rent");
      return;
    }
    case "clickDialogueOption":
      await requireApiResult("clickDialogueOption", step.index);
      return;
    case "clickButton": {
      const clicked = await page.evaluate((label) => {
        const button = [...document.querySelectorAll("button")].find(
          (candidate) => candidate.textContent?.trim() === label
        );
        if (!(button instanceof HTMLButtonElement)) return false;
        button.click();
        return true;
      }, step.text);
      if (!clicked) throw new Error(`Button not found: ${step.text}`);
      await delay(180);
      console.log(`[STEP ${index}] button ${step.text}; mode=${(await getDebug()).mode}`);
      return;
    }
    case "closeOverlay":
      await press("Escape");
      await waitForDebug((state) => state.mode === "world" || state.mode === "interior", "overlay closed", 4_000);
      return;
    case "teleport":
      await page.evaluate(
        (point) => window.__BALI_LIFE_DEV_SENSATION__?.teleport(point.x, point.y),
        { x: step.x, y: step.y }
      );
      await delay(180);
      return;
    case "ensureOnFoot":
      await ensureOnFoot();
      return;
    case "pressKey":
      await press(step.key);
      return;
    case "moveTo":
      await moveToPoint({ x: step.x, y: step.y });
      return;
    case "interactObjective":
      await interactWithObjective();
      return;
    case "waitMs":
      await delay(step.ms);
      return;
    case "leaveInterior": {
      const state = await getDebug();
      if (!state.interiorExit) throw new Error("Cannot leave: no active interior exit.");
      await moveToPoint(state.interiorExit, "interior");
      await waitForDebug(
        (next) => next.mode === "world" && next.activeInteriorId == null && !next.interiorTransitioning,
        "interior exit transition",
        4_000
      );
      return;
    }
    case "completeActiveDelivery":
      await completeActiveDelivery();
      return;
    case "pickupActiveDelivery":
      await pickupActiveDelivery();
      return;
    case "rideUntilBreakdown":
      await rideUntilBreakdown();
      return;
    case "waitForSelector":
      await page.waitForSelector(step.selector, { visible: true, timeout: step.timeoutMs ?? 8_000 });
      return;
    case "waitForState":
      await waitForDebug((state) => matchesPartial(state, step.state), JSON.stringify(step.state), step.timeoutMs ?? 8_000);
      return;
    case "screenshot":
      await capture(step.name ?? `${String(index).padStart(2, "0")}-${step.action}`);
      return;
    default:
      throw new Error(`Unknown proof action: ${step.action}`);
  }
}

async function requireApiResult(method, argument) {
  const result = await page.evaluate(
    ({ methodName, value }) => window.__BALI_LIFE_DEV_PROOF__?.[methodName](value),
    { methodName: method, value: argument }
  );
  if (!result?.ok) throw new Error(result?.message ?? `${method} failed`);
}

async function completeActiveDelivery() {
  const deadline = Date.now() + STEP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const state = await getDebug();
    if (!state.activeDelivery) {
      await page.waitForSelector(".bali-life-dialogue", { visible: true, timeout: 5_000 }).catch(() => undefined);
      return;
    }
    if (state.interiorTransitioning) {
      await delay(90);
      continue;
    }
    if (state.mode !== "world" && state.mode !== "interior") {
      if (state.mode === "dialogue") return;
      await press("Escape");
      continue;
    }

    const target = state.objectiveTargets[0];
    if (!target) throw new Error(`No objective target for ${state.fieldObjectiveLine}`);
    const distance = pointDistance(state.player, target);
    const threshold = state.mode === "interior" ? 18 : 32;
    if (distance > threshold) {
      if (state.mode === "world") {
        await page.evaluate(
          (point) => window.__BALI_LIFE_DEV_SENSATION__?.teleport(point.x, point.y),
          target
        );
        await delay(180);
        continue;
      }
      await moveToward(state.player, target, distance);
      continue;
    }
    if (state.mode === "world" && state.player.onBike) await ensureOnFoot();
    await press("e");
    await delay(420);
  }
  throw new Error(`Timed out completing active delivery; last=${JSON.stringify(await getDebug())}`);
}

async function interactWithObjective() {
  const deadline = Date.now() + STEP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const state = await getDebug();
    if (state.interiorTransitioning) {
      await delay(90);
      continue;
    }
    if (state.mode !== "world" && state.mode !== "interior") {
      throw new Error(`Cannot interact with objective while mode=${state.mode}`);
    }
    const target = state.objectiveTargets[0];
    if (!target) throw new Error(`No objective target for ${state.fieldObjectiveLine}`);
    const distance = pointDistance(state.player, target);
    if (distance > (state.mode === "interior" ? 18 : 32)) {
      if (state.mode === "world") {
        await page.evaluate((point) => window.__BALI_LIFE_DEV_SENSATION__?.teleport(point.x, point.y), target);
        await delay(180);
      } else {
        await moveToward(state.player, target, distance);
      }
      continue;
    }
    if (state.mode === "world" && state.player.onBike) await ensureOnFoot();
    await press("e");
    await delay(260);
    return;
  }
  throw new Error(`Timed out interacting with objective; last=${JSON.stringify(await getDebug())}`);
}

async function pickupActiveDelivery() {
  const deadline = Date.now() + STEP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const state = await getDebug();
    if (state.activeDeliveryStage === "picked_up") {
      if (state.mode === "interior") {
        if (!state.interiorExit) throw new Error("Picked up delivery but interior exit is missing.");
        await moveToPoint(state.interiorExit, "interior");
        await waitForDebug((next) => next.mode === "world", "return to street after pickup", 5_000);
      }
      return;
    }
    if (state.interiorTransitioning) {
      await delay(90);
      continue;
    }
    const target = state.objectiveTargets[0];
    if (!target) throw new Error(`No pickup target for ${state.fieldObjectiveLine}`);
    const distance = pointDistance(state.player, target);
    if (distance > (state.mode === "interior" ? 18 : 32)) {
      if (state.mode === "world") {
        await page.evaluate(
          (point) => window.__BALI_LIFE_DEV_SENSATION__?.teleport(point.x, point.y),
          target
        );
        await delay(180);
      } else {
        await moveToward(state.player, target, distance);
      }
      continue;
    }
    if (state.mode === "world" && state.player.onBike) await ensureOnFoot();
    await press("e");
    await delay(320);
  }
  throw new Error(`Timed out picking up active delivery; last=${JSON.stringify(await getDebug())}`);
}

async function rideUntilBreakdown() {
  const deadline = Date.now() + STEP_TIMEOUT_MS;
  const initial = await getDebug();
  if (initial.breakdownPushActive) return;
  await ensureMounted();
  while (Date.now() < deadline) {
    const state = await getDebug();
    if (state.breakdownPushActive) return;
    if (state.mode !== "world" || state.activeDeliveryStage !== "picked_up") {
      throw new Error(`Breakdown ride is not active; state=${JSON.stringify(state)}`);
    }
    const target = state.objectiveTargets[0];
    if (!target) throw new Error(`No breakdown dropoff target for ${state.fieldObjectiveLine}`);
    await moveToward(state.player, target, pointDistance(state.player, target));
  }
  throw new Error(`Timed out waiting for transmission breakdown; last=${JSON.stringify(await getDebug())}`);
}

async function ensureMounted() {
  const state = await getDebug();
  if (state.player.onBike || state.mode !== "world" || !state.player.hasBike) return;
  await press("b");
  await waitForDebug((next) => next.player.onBike, "scooter mounted", 1_500);
}

async function ensureOnFoot() {
  const state = await getDebug();
  if (!state.player.onBike || state.mode !== "world") return;
  await press("b");
  await waitForDebug((next) => !next.player.onBike, "scooter parked", 1_500);
}

async function moveToward(player, target, distance) {
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const tolerance = distance < 90 ? 8 : 18;
  const keys = [];
  if (Math.abs(dx) > tolerance) keys.push(dx > 0 ? "d" : "a");
  if (Math.abs(dy) > tolerance) keys.push(dy > 0 ? "s" : "w");
  if (keys.length === 0) return;
  const duration = distance > 420 ? 150 : distance > 180 ? 100 : distance > 70 ? 58 : 34;
  for (const key of keys) await page.keyboard.down(key);
  try {
    await delay(Math.max(MOVE_TICK_MS / 2, duration));
  } finally {
    for (const key of [...keys].reverse()) await page.keyboard.up(key);
  }
  await delay(16);
}

async function moveToPoint(target, expectedMode) {
  const deadline = Date.now() + STEP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const state = await getDebug();
    if (expectedMode && state.mode !== expectedMode) return;
    const distance = pointDistance(state.player, target);
    if (distance <= 18) return;
    await moveToward(state.player, target, distance);
  }
  throw new Error(`Timed out moving to ${JSON.stringify(target)}; last=${JSON.stringify(await getDebug())}`);
}

async function press(key) {
  await page.keyboard.press(key);
  await delay(90);
}

async function waitForProofApi() {
  await page.waitForFunction(() => Boolean(window.__BALI_LIFE_DEV_PROOF__), { timeout: 10_000 });
}

async function getDebug() {
  if (browserError) throw new Error(`Browser runtime error: ${browserError.stack ?? browserError.message}`);
  await page.waitForSelector("#bali-life-debug", { timeout: 8_000 });
  return page.$eval("#bali-life-debug", (element) => JSON.parse(element.textContent ?? "{}"));
}

async function waitForDebug(predicate, label, timeoutMs = STEP_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs;
  let latest;
  while (Date.now() < deadline) {
    latest = await getDebug();
    if (predicate(latest)) return latest;
    await delay(80);
  }
  throw new Error(`Timed out waiting for ${label}; last=${JSON.stringify(latest)}`);
}

async function capture(name) {
  const elapsed = ((Date.now() - startedAt) / 1_000).toFixed(1).padStart(5, "0");
  await page.screenshot({ path: path.join(outputDir, `${name}-t+${elapsed}s.png`) });
}

function matchesPartial(value, expected) {
  return Object.entries(expected ?? {}).every(([key, expectedValue]) => {
    const actualValue = value?.[key];
    return expectedValue && typeof expectedValue === "object" && !Array.isArray(expectedValue)
      ? matchesPartial(actualValue, expectedValue)
      : actualValue === expectedValue;
  });
}

function pointDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function startServer() {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(npm, ["run", "dev", "--", "--port", String(PORT), "--strictPort"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    detached: process.platform !== "win32"
  });
  child.stdout.on("data", (chunk) => process.stdout.write(`[vite] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[vite] ${chunk}`));
  return child;
}

async function waitForServer(url) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (server?.exitCode != null) throw new Error(`Vite exited with code ${server.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await delay(120);
  }
  throw new Error(`Timed out starting Vite at ${url}`);
}

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next system Chrome path.
    }
  }
  throw new Error("System Chrome not found. Set CHROME_PATH to a Chrome/Chromium executable.");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
