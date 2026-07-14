import { access, cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import puppeteer from "puppeteer-core";

const ROOT = process.cwd();
const PORT = Number(process.env.LAUNCH_ASSET_PORT ?? 4178);
const BASE_URL = process.env.LAUNCH_ASSET_BASE_URL ?? `http://127.0.0.1:${PORT}/?debug=1`;
const OUTPUT_DIR = path.join(ROOT, "tmp", "launch-assets");
const STILLS_DIR = path.join(OUTPUT_DIR, "stills");
const CLIPS_DIR = path.join(OUTPUT_DIR, "clips");
const FRAME_RATE = 12;
const STEP_TIMEOUT_MS = 45_000;
const MOVE_TICK_MS = 62;
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium"
].filter(Boolean);

let server;
let browser;
let page;
let browserError;

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
} finally {
  await browser?.close().catch(() => undefined);
  stopServer();
}

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(STILLS_DIR, { recursive: true });
  await mkdir(CLIPS_DIR, { recursive: true });

  // The smoke is the canonical authored journey for the cold-open, storm,
  // night-villa, and kos moments. Running it here keeps those captures tied
  // to the existing proof harness instead of a second hand-authored path.
  if (process.env.SKIP_LAUNCH_SMOKE !== "1") await runSmokeHarness();
  await copySmokeStill("12-night-villa-celebration", "night-villa-celebration.png");

  if (!process.env.LAUNCH_ASSET_BASE_URL) {
    server = startServer();
    await waitForServer(BASE_URL);
  }

  browser = await puppeteer.launch({
    executablePath: await findChrome(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-background-timer-throttling"]
  });
  page = await browser.newPage();
  page.on("pageerror", (error) => {
    browserError ??= error;
    console.error(`[browser] ${error.stack ?? error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") console.error(`[console] ${message.text()}`);
  });

  await captureTitleAndColdOpen();
  await captureStreetStill();
  await capturePhoneFeed();
  await captureBleakKos();
  await captureKadekScene();
  await capturePayoutClip();
  await captureStormClip();
  await captureRaceClip();

  await writeAssemblyFallback();
  console.log(`[PASS] launch assets regenerated at ${OUTPUT_DIR}`);
} 

async function runSmokeHarness() {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const smokePort = String(PORT + 1);
  console.log(`[CAPTURE] running canonical smoke harness on ${smokePort}`);
  await new Promise((resolve, reject) => {
    const child = spawn(npm, ["run", "smoke"], {
      cwd: ROOT,
      env: { ...process.env, SMOKE_PORT: smokePort },
      stdio: "inherit"
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`Smoke harness exited with ${signal ?? code}`));
    });
  });
}

async function captureTitleAndColdOpen() {
  await setViewport(1280, 800);
  await freshTitle();
  await screenshot("title-screen");
  await clickText("New Game");
  await waitForDebug(
    (state) => state.cutscene?.id === "act0_v4_bus_arrival" && state.cutscene.stepId === "bus_pulls_away",
    "cold-open bus moment",
    20_000
  );
  await screenshot("cold-open-bus");
}

async function captureStreetStill() {
  await bootState("act1_steady_runner");
  await teleport(2128, 96);
  await screenshot("street-station");

  await setViewport(390, 844);
  await bootState("act1_steady_runner");
  await teleport(2128, 96);
  await screenshot("street-station-mobile");
}

async function capturePhoneFeed() {
  await setViewport(1280, 800);
  await bootState("act1_steady_runner");
  await requireApi("openPhoneTab", "Feed");
  await delay(280);
  await screenshot("phone-feed");
}

async function captureBleakKos() {
  await setViewport(1280, 800);
  await bootState("act0_complete");
  await page.evaluate(() => window.__BALI_LIFE_DEV_SENSATION__?.enterKos());
  await waitForDebug((state) => state.mode === "interior" && state.interiorExit, "bleak kos interior");
  await screenshot("bleak-kos");
}

async function captureKadekScene() {
  await setViewport(1280, 800);
  await bootState("act1_leo_resolved");
  await requireApi("acceptDeliveryById", "act1_kadek_rush_ingredients");
  await press("Escape");
  await completeActiveDelivery();
  await waitForSelector(".bali-life-dialogue", "Kadek priority scene");
  await screenshot("kadek-scene");
}

async function capturePayoutClip() {
  await setViewport(1280, 800);
  await bootState("act1_steady_runner");
  await requireApi("acceptDeliveryById", "milk_madu_brunch_bag");
  await press("Escape");
  await completeActiveDelivery();
  await captureFrames("payout-celebration", 5_500);
}

async function captureStormClip() {
  await setViewport(1280, 800);
  await bootState("act1_steady_runner");
  await page.evaluate(() => window.__BALI_LIFE_DEV_SENSATION__?.startWeather("storm"));
  await teleport(2112, 624);
  await ensureMounted();
  await captureFrames("storm-traffic", 6_500, ["d", "s"]);
  const firstStormFrame = path.join(CLIPS_DIR, "storm-traffic", "00000.png");
  await cp(firstStormFrame, path.join(STILLS_DIR, "storm-ride.png"));

  await setViewport(390, 844);
  await bootState("act1_steady_runner");
  await page.evaluate(() => window.__BALI_LIFE_DEV_SENSATION__?.startWeather("storm"));
  await teleport(2112, 624);
  await ensureMounted();
  await delay(340);
  await screenshot("storm-ride-mobile");
}

async function captureRaceClip() {
  await setViewport(1280, 800);
  await bootState("act1_steady_runner");
  await requireApi("openVenuePanel", "bali_family_rental_scooter");
  await waitForSelector("#bali-life-activity-menu", "rental panel");
  const clicked = await page.evaluate(() => {
    const button = [...document.querySelectorAll("#bali-life-activity-menu button")]
      .find((candidate) => candidate.textContent?.trim() === "Hear him out");
    button?.click();
    return Boolean(button);
  });
  if (!clicked) throw new Error("Leo race action was not visible in the rental panel");
  // The rental row opens Leo's existing relationship-choice scene first;
  // selecting its first option is the normal player path into the countdown.
  if (await page.$(".bali-life-dialogue")) {
    const started = await page.evaluate(() => {
      const choice = document.querySelector(".bali-life-dialogue-choice");
      choice?.click();
      return Boolean(choice);
    });
    if (!started) throw new Error("Leo race choice did not render");
  }
  await waitForDebug((state) => state.cutscene?.id === "rio_streak_duel_countdown", "Leo race countdown", 8_000);
  await waitForDebug((state) => state.cutscene === null && state.mode === "world", "Leo race start", 8_000);
  await captureFrames("leo-race", 6_500, ["d", "s"]);
}

async function completeActiveDelivery() {
  const deadline = Date.now() + STEP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const state = await getDebug();
    if (!state.activeDelivery) return;
    if (state.interiorTransitioning || state.mode === "committedActivity") {
      await delay(90);
      continue;
    }
    if (state.mode !== "world" && state.mode !== "interior") {
      await press("Escape");
      continue;
    }
    const target = state.objectiveTargets[0];
    if (!target) throw new Error(`No objective target for ${state.fieldObjectiveLine}`);
    const distance = pointDistance(state.player, target);
    const threshold = state.mode === "interior" ? 18 : 32;
    if (distance > threshold) {
      if (state.mode === "world") {
        await teleport(target.x, target.y);
      } else {
        await moveToward(state.player, target, distance);
      }
      continue;
    }
    if (state.mode === "world" && state.player.onBike) await ensureOnFoot();
    await press("e");
    await delay(360);
  }
  throw new Error(`Timed out completing active delivery; last=${JSON.stringify(await getDebug())}`);
}

async function captureFrames(name, durationMs, keys = []) {
  const frameDir = path.join(CLIPS_DIR, name);
  await rm(frameDir, { recursive: true, force: true });
  await mkdir(frameDir, { recursive: true });
  const frameCount = Math.max(1, Math.ceil(durationMs / (1000 / FRAME_RATE)));
  for (const key of keys) await page.keyboard.down(key);
  try {
    for (let index = 0; index < frameCount; index += 1) {
      await page.screenshot({ path: path.join(frameDir, `${String(index).padStart(5, "0")}.png`) });
      await delay(1000 / FRAME_RATE);
    }
  } finally {
    for (const key of [...keys].reverse()) await page.keyboard.up(key);
  }
  await assembleClip(name, frameDir);
}

async function assembleClip(name, frameDir) {
  const input = path.join(frameDir, "%05d.png");
  const gif = path.join(CLIPS_DIR, `${name}.gif`);
  const webm = path.join(CLIPS_DIR, `${name}.webm`);
  if (await hasCommand("ffmpeg")) {
    await run("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FRAME_RATE), "-i", input, "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", gif]);
    await run("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FRAME_RATE), "-i", input, "-c:v", "libvpx-vp9", "-pix_fmt", "yuv420p", webm]);
  } else {
    await writeFile(path.join(frameDir, "ASSEMBLE.txt"), `ffmpeg -framerate ${FRAME_RATE} -i %05d.png ${name}.gif\nffmpeg -framerate ${FRAME_RATE} -i %05d.png -c:v libvpx-vp9 ${name}.webm\n`);
  }
}

async function copySmokeStill(source, target) {
  const smokeDir = path.join(ROOT, "tmp", "smoke");
  const candidates = (await readdir(smokeDir)).filter((name) => name.startsWith(source) && name.endsWith(".png"));
  if (candidates.length === 0) throw new Error(`No smoke capture found with prefix ${source}`);
  await cp(path.join(smokeDir, candidates.sort()[0]), path.join(STILLS_DIR, target));
}

async function writeAssemblyFallback() {
  await writeFile(path.join(OUTPUT_DIR, "README.txt"), [
    "Generated by: npm run capture:launch",
    "",
    "Each clips/<name>/ directory is a deterministic frame sequence.",
    "If ffmpeg is unavailable, run the commands in clips/<name>/ASSEMBLE.txt.",
    "Outputs are intentionally under tmp/ and are not committed."
  ].join("\n"));
}

async function freshTitle() {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForSelector('[data-ui-surface="title-screen"]', "title screen");
}

async function bootState(name) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await waitForProofApi();
  const navigation = page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10_000 }).catch(() => undefined);
  const result = await page.evaluate((bootName) => window.__BALI_LIFE_DEV_PROOF__?.bootState(bootName), name);
  if (!result?.ok) throw new Error(result?.message ?? `Could not boot ${name}`);
  await navigation;
  await waitForProofApi();
  await waitForDebug((state) => state.mode === "world" && !state.cutscene, `${name} world boot`, 10_000);
}

async function requireApi(method, value) {
  const result = await page.evaluate(({ methodName, argument }) => window.__BALI_LIFE_DEV_PROOF__?.[methodName](argument), { methodName: method, argument: value });
  if (!result?.ok) throw new Error(result?.message ?? `${method} failed`);
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
  const keys = [];
  if (Math.abs(target.x - player.x) > 12) keys.push(target.x > player.x ? "d" : "a");
  if (Math.abs(target.y - player.y) > 12) keys.push(target.y > player.y ? "s" : "w");
  if (keys.length === 0) return;
  const duration = distance > 420 ? 150 : distance > 180 ? 100 : distance > 70 ? 60 : 36;
  for (const key of keys) await page.keyboard.down(key);
  try {
    await delay(Math.max(MOVE_TICK_MS / 2, duration));
  } finally {
    for (const key of [...keys].reverse()) await page.keyboard.up(key);
  }
  await delay(18);
}

async function teleport(x, y) {
  await page.evaluate((point) => window.__BALI_LIFE_DEV_SENSATION__?.teleport(point.x, point.y), { x, y });
  await delay(180);
}

async function setViewport(width, height) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await delay(160);
}

async function clickText(text) {
  const clicked = await page.evaluate((label) => {
    const element = [...document.querySelectorAll("button")].find((candidate) => candidate.textContent?.trim() === label);
    element?.click();
    return Boolean(element);
  }, text);
  if (!clicked) throw new Error(`Could not click '${text}'`);
}

async function press(key) {
  await page.keyboard.press(key);
  await delay(90);
}

async function screenshot(name) {
  await page.screenshot({ path: path.join(STILLS_DIR, `${name}.png`) });
}

async function waitForProofApi() {
  await page.waitForFunction(() => Boolean(window.__BALI_LIFE_DEV_PROOF__), { timeout: 10_000 });
}

async function waitForSelector(selector, label, timeout = 10_000) {
  await page.waitForSelector(selector, { visible: true, timeout }).catch((error) => {
    throw new Error(`Timed out waiting for ${label}: ${error.message}`);
  });
}

async function getDebug() {
  if (browserError) throw new Error(`Browser runtime error: ${browserError.stack ?? browserError.message}`);
  await page.waitForSelector("#bali-life-debug", { timeout: 8_000 });
  return page.$eval("#bali-life-debug", (element) => JSON.parse(element.textContent ?? "{}"));
}

async function waitForDebug(predicate, label, timeout = STEP_TIMEOUT_MS) {
  const deadline = Date.now() + timeout;
  let latest;
  while (Date.now() < deadline) {
    latest = await getDebug();
    if (predicate(latest)) return latest;
    await delay(80);
  }
  throw new Error(`Timed out waiting for ${label}; last=${JSON.stringify(latest)}`);
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

function stopServer() {
  if (!server || server.exitCode != null) return;
  if (process.platform === "win32") server.kill();
  else process.kill(-server.pid, "SIGTERM");
}

async function waitForServer(url) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (server?.exitCode != null) throw new Error(`Vite exited with code ${server.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Still starting.
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
      // Try the next candidate.
    }
  }
  throw new Error("System Chrome not found. Set CHROME_PATH to a Chrome/Chromium executable.");
}

async function hasCommand(command) {
  return new Promise((resolve) => {
    const child = spawn(command, ["-version"], { stdio: "ignore" });
    child.once("error", () => resolve(false));
    child.once("exit", (code) => resolve(code === 0));
  });
}

async function run(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: "ignore" });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${signal ?? code}`));
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

process.on("exit", () => {
  stopServer();
});
