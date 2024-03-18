const SerialPortManager = require("../lib/serial-port");
const Keyboard = require("../lib/keyboard");
const KeyCode = require("../lib/key-code");
const { sleep } = require("../lib/utils");
const ahk = require("../lib/autohotkey");

const { performance } = require("perf_hooks");

let windowPos;

async function hasPixelInArea([color, variation = 1], x, y, size = 20) {
  const x1 = windowPos.x + x;
  const y1 = windowPos.y + y;
  const x2 = x1 + size;
  const y2 = y1 + size;

  return !!(await ahk.pixelSearch(x1, y1, x2, y2, color, variation));
}

async function doWhileConditionIsTrue({
  condition,
  action,
  postAction = () => null,
  delay = 0,
  maxTimeout,
}) {
  let numberOfIterations = 0;
  let start = performance.now();

  while (await condition()) {
    if (maxTimeout && maxTimeout <= performance.now() - start) {
      throw new Error("Action Timeout");
    }

    numberOfIterations++;
    await action();
    if (delay) {
      await sleep(delay);
    }
  }

  if (!numberOfIterations) {
    return false;
  }

  await postAction();
  return true;
}

async function focusWindow() {
  await ahk.winActivate("MindRO | Gepard Shield 3.0 (^-_-^)");
}

function log(...message) {
  console.log(`[${new Date().toLocaleString()}]`, ...message);
}

async function pressWithConfidence(key) {
  await Keyboard.send(key);
  await Keyboard.send(key);
  await Keyboard.send(key);
  await sleep(10);
  await Keyboard.send(key);
  await Keyboard.send(key);
  await Keyboard.send(key);
}

function improveConcentration() {
  return pressWithConfidence(KeyCode.F3);
}

function switchWeapon() {
  return pressWithConfidence(KeyCode.F4);
}

function poemOfBragi() {
  return pressWithConfidence(KeyCode.F5);
}

function appleOfIdun() {
  return pressWithConfidence(KeyCode.F6);
}

function bluePots() {
  return pressWithConfidence(KeyCode.F9);
}

function hasLowSp() {
  return hasPixelInArea([0xff0000, 2], 400, 60, 100, 20);
}

async function main() {
  await SerialPortManager.initialize();
  await Keyboard.releaseAll();
  windowPos = await ahk.winGetPos("MindRO | Gepard Shield 3.0 (^-_-^)");

  await focusWindow();

  await sleep(1000);
  const LOOP_SIZE = Number.MAX_SAFE_INTEGER;
  let x = 0;
  let lastImprovedConcentration = 0;
  let lastApple = 0;

  while (x < LOOP_SIZE) {
    try {
      await doWhileConditionIsTrue({
        condition: hasLowSp,
        action: bluePots,
        postAction: async () => {
          log("Used blue potions");
          await bluePots();
        },
        maxTimeout: 2000,
      });
      sleep(200);
    } catch (error) {
      log("Error on checking SP");
    }

    if (Date.now() - lastImprovedConcentration > 240000) {
      await sleep(200);
      await improveConcentration();
      lastImprovedConcentration = Date.now();
      log("Used Improved Concentration");
    }

    if (Date.now() - lastApple > 18000) {
      await sleep(200);
      await switchWeapon();
      await sleep(300);
      await appleOfIdun();
      await sleep(300);
      await switchWeapon();
      await sleep(300);
      await poemOfBragi();
      lastApple = Date.now();
      log("Switch Weapoon > Apple > Switch Weapon > Bragi");
    }

    await sleep(200);

    x++;
  }

  log("END");
}

main();
