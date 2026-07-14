import { access, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import puppeteer from "puppeteer-core";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "tmp", "smoke");
const PORT = Number(process.env.SMOKE_PORT ?? 4176);
const BASE_URL = process.env.SMOKE_BASE_URL ?? `http://127.0.0.1:${PORT}/?debug=1`;
const STEP_TIMEOUT_MS = 55_000;
const MOVE_TICK_MS = 72;
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
let activeBeat = "boot";
let browserError;
const rideSamples = [];
const capturedRideFrames = new Set();
let capturedStormFrame = false;
let rideStartedAt = 0;
let openingStartedAt = 0;

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
  if (!process.env.SMOKE_BASE_URL) {
    server = startServer();
    await waitForServer(BASE_URL);
  }

  const executablePath = await findChrome();
  browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-background-timer-throttling"]
  });
  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  page.on("pageerror", (error) => {
    browserError ??= error;
    console.error(`[browser] ${error.stack ?? error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") console.error(`[console] ${message.text()}`);
  });

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-ui-surface="title-screen"]', { timeout: 10_000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-ui-surface="title-screen"]', { timeout: 10_000 });
  openingStartedAt = Date.now();
  await clickButton("New Game");
  await captureOpeningStep("00-bus-departure", "bus_pulls_away");
  await captureOpeningStep("01-kos-scam-message", "kos_scam_message");
  await captureOpeningStep("02-ibu-crosses-street", "ibu_crosses_street");
  await captureOpeningStep("03-scooter-offer", "ibu_offer_line");
  await waitForSelector(".bali-life-dialogue", 20_000);
  await capture("04-first-choice");
  const saveKeysBeforeChoice = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith("bali-life-rpg.")));
  if (saveKeysBeforeChoice.length > 0) {
    throw new Error(`Opening wrote a save before choice resolution: ${saveKeysBeforeChoice.join(", ")}`);
  }
  console.log(`[SAVE ${new Date().toISOString()}] no durable save before first-choice resolution`);
  await clickButton("Take the keys. ‘I won’t forget this.’");
  const hookLive = await waitForDebug(
    (state) => state.act0Step === "dropoff_first_delivery" && state.activeDelivery === "act0_ibu_milk_madu_catering",
    "live-steering catering hook active",
    8_000
  );
  const hookElapsedMs = Date.now() - openingStartedAt;
  if (hookElapsedMs >= 180_000) {
    throw new Error(`New Game -> live delivery took ${(hookElapsedMs / 1_000).toFixed(2)}s (budget <180s)`);
  }
  console.log(
    `[HOOK ${new Date().toISOString()}] New Game -> live countdown ${(hookElapsedMs / 1_000).toFixed(2)}s; ` +
      `delivery=${hookLive.activeDelivery} dueAt=${hookLive.activeDeliveryDueAt}`
  );
  const saveKeysAfterChoice = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith("bali-life-rpg.")));
  if (saveKeysAfterChoice.length === 0) {
    throw new Error("Choice resolved and delivery went live without a durable save");
  }
  await capture("05-steering-delivery-live");
  await closeDialogueIfPresent();
  await ensureMounted();
  rideStartedAt = Date.now();

  await runBeat("06-milk-madu-catering-dropoff", "buy_meal_and_coffee", async () => {
    await moveToObjective({ collectRide: true });
    await press("e");
  }, STEP_TIMEOUT_MS, 1_500);
  printRideSummary();
  const cafe = await waitForDebug(
    (state) => state.cutscene?.id === "act0_milk_madu_scene" && state.cutscene.stepId === "vance_parking_one",
    "Milk & Madu scene with Julian Vance",
    20_000
  );
  console.log(`[BEAT ${new Date().toISOString()}] cafe/Vance t+${elapsedSeconds()}s mode=${cafe.mode}`);
  await capture("07-cafe-scene-vance");

  await waitForDebug((state) => state.phoneStoryMoment === "nusadrop_signup", "NusaDrop signup phone", 35_000);
  await clickPhoneStoryAction();
  await waitForDebug((state) => state.phoneStoryStep === 1, "NusaDrop driver ID step", 4_000);
  await clickPhoneStoryAction();
  await waitForDebug((state) => state.phoneStoryStep === 2, "LEO leaderboard", 4_000);
  console.log(`[BEAT ${new Date().toISOString()}] signup/LEO t+${elapsedSeconds()}s`);
  await capture("08-signup-leo-leaderboard");
  await clickPhoneStoryAction();
  await waitForDebug(
    (state) => state.act0Step === "dropoff_storm_delivery" && state.mode === "world" && !state.interiorTransitioning,
    "first NusaDrop run outside",
    8_000
  );
  await ensureMounted();
  activeBeat = "09-storm-run";
  await moveToObjective({ collectRide: true, captureStorm: true });
  const stormMidRide = await getDebug();
  if (stormMidRide.act0StormTriggerCount !== 1 || stormMidRide.weather.kind !== "storm") {
    throw new Error(`Storm did not trigger exactly once mid-run: ${JSON.stringify(stormMidRide.weather)}`);
  }
  await press("e");
  await waitForDebug(
    (state) => state.cutscene?.id === "act0_landlord_ultimatum" && state.cutscene.stepId === "landlord_alert",
    "landlord ultimatum alert",
    8_000
  );
  console.log(`[BEAT ${new Date().toISOString()}] ultimatum t+${elapsedSeconds()}s`);
  await capture("10-landlord-ultimatum");

  const villaPing = await waitForDebug((state) => state.phoneStoryMoment === "villa_order_ping", "villa surge phone", 22_000);
  if (!villaPing.deposit?.visible || villaPing.deposit.gap <= 0) throw new Error("Deposit HUD pressure was not visible at the villa ping");
  await capture("11-villa-surge-phone");
  await clickPhoneStoryAction();
  await waitForDebug((state) => state.act0Step === "pickup_villa_delivery", "villa order accepted", 5_000);
  // The proof harness uses the existing dev teleport only for the offscreen pickup approach; both authored ride legs remain live-steered.
  await page.evaluate(() => window.__BALI_LIFE_DEV_SENSATION__?.teleport(1670, 104));
  await delay(250);
  await followObjectiveIntoInterior();
  await moveToObjective();
  await press("e");
  await waitForDebug((state) => state.act0Step === "dropoff_villa_delivery", "villa cargo picked up", 6_000);
  await leaveInteriorByObjective();
  await ensureMounted();
  activeBeat = "12-night-villa-run";
  await moveToObjective({ collectRide: true });
  await press("e");
  const villaComplete = await waitForDebug(
    (state) => state.act0Step === "pay_kos_deposit" && state.activeDelivery === null,
    "five-star villa payout",
    8_000
  );
  if (villaComplete.timePhase !== "night") throw new Error(`Villa finale was not at night: ${villaComplete.timePhase}`);
  await capture("12-night-villa-celebration");

  await followObjectiveIntoInterior();
  await waitForDebug(
    (state) => state.cutscene?.id === "act0_kos_deposit_resolve" && state.cutscene.stepId === "landlord_count",
    "kos landlord resolve",
    8_000
  );
  await capture("13-landlord-resolve");
  await waitForDebug(
    (state) => state.cutscene?.id === "act0_kos_collapse" && state.cutscene.stepId === "bleak_room",
    "bleak kos collapse",
    22_000
  );
  await capture("14-bleak-kos-collapse");

  const rateCutState = await waitForDebug(
    (state) => state.cutscene?.id === "act1_intro_card" && state.cutscene.stepId === "nusadrop_rate_cut",
    "NusaDrop rate-cut card",
    22_000
  );
  if (rateCutState.act0CriticalPathMenuOpens !== 0) {
    throw new Error(`Act 0 opened ${rateCutState.act0CriticalPathMenuOpens} activity menus on its critical path`);
  }
  console.log(`[PASS ${new Date().toISOString()}] Act 0 unskipped runtime ${elapsedSeconds()}s; stormCount=1 menuOpens=0`);
  await capture("15-act1-rate-cut-seam");
  await waitForSelector("#bali-life-activity-menu", 22_000);
  const morningPanelTitle = await page.$eval(".bali-life-activity-menu-title", (element) => element.textContent?.trim() ?? "");
  if (morningPanelTitle.includes("Ledger")) {
    await clickButton("See Today's Hand");
    await waitForSelector("#bali-life-activity-menu", 8_000);
  }
  await capture("16-act1-morning-hand");
  await verifyMobileTouchSurface();
}

async function captureOpeningStep(name, stepId) {
  activeBeat = name;
  const state = await waitForDebug(
    (next) => next.cutscene?.id === "act0_v4_bus_arrival" && next.cutscene.stepId === stepId,
    `opening step ${stepId}`,
    60_000
  );
  console.log(
    `[OPEN ${new Date().toISOString()}] ${stepId} at ${((Date.now() - openingStartedAt) / 1_000).toFixed(2)}s ` +
      `script=${(state.cutscene.elapsedMs / 1_000).toFixed(2)}s`
  );
  await capture(name);
}

async function runBeat(name, expectedStep, action, timeoutMs = STEP_TIMEOUT_MS, settleBeforeCaptureMs = 0) {
  activeBeat = name;
  const before = await getDebug();
  console.log(`[BEAT] ${name}: ${before.act0Step} | ${before.fieldObjectiveLine}`);
  await action();
  const after = await waitForDebug((state) => state.act0Step === expectedStep, `${name} -> ${expectedStep}`, timeoutMs);
  if (settleBeforeCaptureMs > 0) await delay(settleBeforeCaptureMs);
  await capture(name);
  console.log(`[OK]   ${name}: ${after.act0Step} | mode=${after.mode}`);
}

async function followObjectiveIntoInterior() {
  const before = await getDebug();
  if (before.mode === "interior") return;
  await moveToObjective();
  if ((await getDebug()).player.onBike) await ensureOnFoot();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const beforeAction = await getDebug();
    console.log(
      `[DOOR] attempt=${attempt + 1} mode=${beforeAction.mode} nearest=${beforeAction.nearestInteraction ?? "none"} ` +
        `player=${beforeAction.player.x},${beforeAction.player.y}`
    );
    await press("e");
    try {
      await waitForDebug(
        (state) => (state.mode === "interior" || state.mode === "cutscene") && !state.interiorTransitioning,
        "interior entry",
        2_800
      );
      return;
    } catch {
      const afterAction = await getDebug();
      if (afterAction.mode === "activity" || afterAction.mode === "dialogue") {
        await press("Escape");
        await waitForDebug((state) => state.mode === "world", "wrong doorway panel closed", 1_200);
        await holdKeys([attempt % 2 === 0 ? "w" : "s"], 90);
      }
      const target = afterAction.objectiveTargets[0];
      if (target && afterAction.mode === "world") {
        await moveToward(afterAction.player, target, pointDistance(afterAction.player, target));
      }
      await delay(120);
    }
  }
  const latest = await getDebug();
  throw new Error(`Doorway did not open after six E presses; prompt='${latest.prompt}'`);
}

async function leaveInteriorByObjective() {
  let state = await getDebug();
  if (state.mode !== "interior") return;
  const deadline = Date.now() + 12_000;
  while (Date.now() < deadline) {
    state = await getDebug();
    if (state.mode === "world" && !state.interiorTransitioning) return;
    if (state.interiorTransitioning || state.mode === "committedActivity") {
      await delay(90);
      continue;
    }
    const exit = state.interiorExit;
    if (!exit) throw new Error("Interior exit missing from debug contract");
    const distance = pointDistance(state.player, exit);
    if (distance < 16) {
      await holdKeys(["s"], 110);
    } else {
      await moveToward(state.player, exit, distance);
    }
  }
  throw new Error("Timed out following the interior exit cue");
}

async function moveToObjective({ collectRide = false, captureStorm = false } = {}) {
  const deadline = Date.now() + STEP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const state = await getDebug();
    if (state.interiorTransitioning) {
      await delay(90);
      continue;
    }
    if (state.mode === "committedActivity") {
      await delay(120);
      continue;
    }
    if (state.mode !== "world" && state.mode !== "interior") {
      throw new Error(`Cannot navigate while mode=${state.mode}`);
    }
    const target = state.objectiveTargets[0];
    if (!target) throw new Error(`No objective target for ${state.fieldObjectiveLine}`);
    const distance = pointDistance(state.player, target);
    const threshold = state.mode === "interior" ? 18 : 34;
    if (distance <= threshold) return state;
    const movingState = await moveToward(
      state.player,
      target,
      distance,
      collectRide ? () => getDebug() : undefined
    );
    if (movingState?.ride) {
      rideSamples.push({ at: Date.now(), ...movingState.ride, rideRun: movingState.deliveryRideRun });
      if ([2, 4, 6].includes(rideSamples.length) && !capturedRideFrames.has(rideSamples.length)) {
        capturedRideFrames.add(rideSamples.length);
        await capture(`06-ride-live-${rideSamples.length}`);
      }
    }
    if (captureStorm && !capturedStormFrame) {
      const stormState = movingState ?? (await getDebug());
      if (stormState.weather?.kind === "storm" && stormState.activeDelivery === "act0_nusadrop_storm_run") {
        capturedStormFrame = true;
        console.log(`[BEAT ${new Date().toISOString()}] storm-mid-ride t+${elapsedSeconds()}s`);
        await capture("09-storm-mid-ride");
      }
    }
  }
  const latest = await getDebug();
  throw new Error(
    `Timed out walking to objective for ${activeBeat}; player=${latest.player.x},${latest.player.y} ` +
      `target=${JSON.stringify(latest.objectiveTargets[0])} mode=${latest.mode}`
  );
}

async function moveToPoint(target) {
  const deadline = Date.now() + STEP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const state = await getDebug();
    if (state.mode !== "world") {
      await delay(90);
      continue;
    }
    const distance = pointDistance(state.player, target);
    if (distance < 28) return;
    await moveToward(state.player, target, distance);
  }
  const latest = await getDebug();
  throw new Error(
    `Timed out moving to map-proof point ${JSON.stringify(target)}; player=${latest.player.x},${latest.player.y} ` +
      `onBike=${latest.player.onBike} stuck=${latest.player.bikeStuck} prompt='${latest.prompt}'`
  );
}

async function moveToInteriorPoint(target) {
  const deadline = Date.now() + STEP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const state = await getDebug();
    if (state.mode !== "interior" || state.interiorTransitioning) {
      await delay(90);
      continue;
    }
    const distance = pointDistance(state.player, target);
    if (distance < 18) return;
    await moveToward(state.player, target, distance);
  }
  throw new Error(`Timed out moving to interior proof point ${JSON.stringify(target)}`);
}

async function ensureWorldForProof() {
  const deadline = Date.now() + 25_000;
  while (Date.now() < deadline) {
    const state = await getDebug();
    if (state.mode === "world" && !state.cutscene) return;
    if (state.cutscene || state.interiorTransitioning || state.mode === "committedActivity") {
      await delay(120);
      continue;
    }
    if (state.mode === "interior") {
      await leaveInteriorByObjective();
      continue;
    }
    await press("Escape");
  }
  throw new Error(`Could not return to world for proof capture; last=${JSON.stringify(await getDebug())}`);
}

async function verifyMobileTouchSurface() {
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const mobileUrl = BASE_URL.includes("?") ? `${BASE_URL}&touch=1` : `${BASE_URL}?touch=1`;
  await page.goto(mobileUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-ui-surface="title-screen"]', { timeout: 10_000 });
  await clickButton("Continue");
  const state = await waitForDebug((next) => next.mode === "world" && next.touchControlsVisible, "390x844 touch world", 8_000);
  const bounds = await page.evaluate(() =>
    [...document.querySelectorAll("button")].map((button) => {
      const rect = button.getBoundingClientRect();
      return { label: button.textContent?.trim() ?? "", left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
    })
  );
  const outOfBounds = bounds.filter((rect) => rect.left < 0 || rect.top < 0 || rect.right > 390 || rect.bottom > 844);
  if (outOfBounds.length > 0) throw new Error(`390x844 controls out of bounds: ${JSON.stringify(outOfBounds)}`);
  console.log(`[TOUCH] 390x844 joystickVisible=${state.touchControlsVisible} buttons=${bounds.length} allInBounds=true`);
  await capture("14-touch-390x844");
}

async function moveToward(player, target, distance, sampleWhileMoving) {
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const axisTolerance = distance < 90 ? 8 : 18;
  const keys = [];
  if (Math.abs(dx) > axisTolerance) keys.push(dx > 0 ? "d" : "a");
  if (Math.abs(dy) > axisTolerance) keys.push(dy > 0 ? "s" : "w");
  if (keys.length === 0) return;
  const duration = distance > 420 ? 155 : distance > 180 ? 105 : distance > 70 ? 62 : 36;
  return holdKeys(keys, duration, sampleWhileMoving);
}

async function holdKeys(keys, durationMs, sampleWhileMoving) {
  for (const key of keys) await page.keyboard.down(key);
  const heldDuration = Math.max(MOVE_TICK_MS / 2, durationMs);
  let sample;
  try {
    if (sampleWhileMoving) {
      await delay(Math.max(20, heldDuration / 2));
      sample = await sampleWhileMoving();
      await delay(Math.max(0, heldDuration / 2));
    } else {
      await delay(heldDuration);
    }
  } finally {
    for (const key of [...keys].reverse()) await page.keyboard.up(key);
  }
  await delay(18);
  return sample;
}

async function ensureMounted() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const state = await getDebug();
    if (state.player.onBike) return;
    if (state.mode !== "world" || !state.player.hasBike) return;
    await press("b");
    try {
      await waitForDebug((next) => next.player.onBike, "scooter mounted", 1_200);
      return;
    } catch {
      await delay(250);
    }
  }
  throw new Error("Scooter did not mount after three verified attempts");
}

async function ensureOnFoot() {
  await delay(1_300);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const state = await getDebug();
    if (!state.player.onBike) return;
    if (state.mode !== "world") return;
    await press("b");
    try {
      await waitForDebug((next) => !next.player.onBike && next.ride === null, "scooter dismounted", 1_200);
      return;
    } catch {
      await delay(250);
    }
  }
  throw new Error("Scooter did not dismount after three verified attempts");
}

async function closeDialogueIfPresent() {
  if (await page.$(".bali-life-dialogue")) {
    await press("e");
    await waitForSelectorGone(".bali-life-dialogue");
  }
}

async function clickActivity(title) {
  await waitForSelector("#bali-life-activity-menu");
  const rows = await page.$$("#bali-life-activity-menu .bali-life-activity-menu-row");
  for (const row of rows) {
    const rowTitle = await row.$eval(".bali-life-activity-menu-row-title", (element) => element.textContent?.trim());
    if (rowTitle !== title) continue;
    const button = await row.$("button");
    if (!button) throw new Error(`Activity '${title}' has no button`);
    const disabled = await button.evaluate((element) => element.getAttribute("aria-disabled"));
    if (disabled === "true") throw new Error(`Activity '${title}' is blocked`);
    await button.click();
    return;
  }
  throw new Error(`Activity '${title}' was not present`);
}

async function clickButton(label) {
  const buttons = await page.$$("button");
  for (const button of buttons) {
    const text = await button.evaluate((element) => element.textContent?.trim());
    if (text === label) {
      await button.click();
      return;
    }
  }
  throw new Error(`Button '${label}' was not present`);
}

async function clickPhoneStoryAction() {
  const state = await getDebug();
  if (!state.phoneStoryMoment) throw new Error("No authored phone action is open");
  // Desktop smoke viewport: the authored phone action sits at bodyX, panel bottom - 104.
  const beforeMoment = state.phoneStoryMoment;
  const beforeStep = state.phoneStoryStep;
  for (const point of [{ x: 300, y: 650 }, { x: 420, y: 650 }, { x: 300, y: 665 }]) {
    await page.mouse.click(point.x, point.y);
    await delay(180);
    const after = await getDebug();
    if (after.phoneStoryMoment !== beforeMoment || after.phoneStoryStep !== beforeStep) return;
  }
  throw new Error(`Authored phone action did not respond for ${beforeMoment} step ${beforeStep}`);
}

async function press(key) {
  await page.keyboard.press(key);
  await delay(90);
}

async function getDebug() {
  if (browserError) {
    throw new Error(`Browser runtime error: ${browserError.stack ?? browserError.message}`);
  }
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
  throw new Error(`Timed out waiting for ${label}; last state=${JSON.stringify(latest)}`);
}

async function waitForSelector(selector, timeout = 8_000) {
  await page.waitForSelector(selector, { visible: true, timeout });
}

async function waitForSelectorGone(selector, timeout = 8_000) {
  await page.waitForFunction((value) => !document.querySelector(value), { timeout }, selector);
}

async function capture(name) {
  const elapsed = openingStartedAt ? ((Date.now() - openingStartedAt) / 1_000).toFixed(1).padStart(5, "0") : "boot";
  await page.screenshot({ path: path.join(OUTPUT_DIR, `${name}-t+${elapsed}s.png`) });
}

function printRideSummary() {
  const elapsedSeconds = (Date.now() - rideStartedAt) / 1_000;
  const speeds = rideSamples.map((sample) => sample.speed);
  if (speeds.length === 0) {
    console.log(`[RIDE] no samples; time-to-dropoff=${elapsedSeconds.toFixed(2)}s`);
    return;
  }
  const average = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
  if (Math.max(...speeds) <= 0) {
    throw new Error("Ride telemetry never reported movement during the Canggu-Station-to-Milk-&-Madu leg");
  }
  const maxDrift = Math.max(...rideSamples.map((sample) => sample.drift));
  const finalRun = [...rideSamples].reverse().find((sample) => sample.rideRun)?.rideRun;
  console.log(
    `[RIDE] samples=${speeds.length} speed min/avg/max=${Math.min(...speeds).toFixed(2)}/${average.toFixed(2)}/${Math.max(...speeds).toFixed(2)} ` +
      `driftEngaged=${maxDrift > 0.01} maxDrift=${maxDrift.toFixed(3)} time-to-dropoff=${elapsedSeconds.toFixed(2)}s ` +
      `hazards=${finalRun?.hazardsSpawned ?? 0} avoided=${finalRun?.hazardsAvoided ?? 0} ` +
      `nearMisses=${finalRun?.nearMisses ?? 0} contacts=${finalRun?.contacts ?? 0}`
  );
}

function pointDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function elapsedSeconds() {
  return ((Date.now() - openingStartedAt) / 1_000).toFixed(1);
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
      // Server is still starting.
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
      // Try the next common system Chrome path.
    }
  }
  throw new Error("System Chrome not found. Set CHROME_PATH to a Chrome/Chromium executable.");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cleanup() {
  await browser?.close().catch(() => undefined);
  if (server && server.exitCode == null) {
    if (process.platform !== "win32" && server.pid) {
      try {
        process.kill(-server.pid, "SIGTERM");
      } catch {
        server.kill("SIGTERM");
      }
    } else {
      server.kill("SIGTERM");
    }
  }
}

main()
  .catch(async (error) => {
    console.error(`[FAIL] ${activeBeat}: ${error instanceof Error ? error.message : error}`);
    if (page) {
      await page.screenshot({ path: path.join(OUTPUT_DIR, `FAIL-${activeBeat}.png`) }).catch(() => undefined);
    }
    process.exitCode = 1;
  })
  .finally(cleanup);
