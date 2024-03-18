const SerialPortManager = require("../lib/serial-port");
const Keyboard = require("../lib/keyboard");
const Mouse = require("../lib/mouse");
const KeyCode = require("../lib/key-code");
const { sleep } = require("../lib/utils");
const ahk = require("../lib/autohotkey");

const { performance } = require("perf_hooks");

let windowPos;
let scanArea = {};

async function MoveCursor(x, y) {
  while (true) {
    const current = await ahk.mouseGetPos();
    deltaX = getDirection(current.x, x);
    deltaY = getDirection(current.y, y);
    if (deltaX === 0 && deltaY === 0) {
      break;
    }
    await Mouse.move({ x: deltaX, y: deltaY });
  }
}

function getDirection(current, destination) {
  const delta = destination - current;
  const d = Math.max(Math.ceil(Math.sqrt(Math.abs(delta) * 2)), 1);

  if (delta > 0) return d;
  if (delta < 0) return -d;
  return 0;
}

async function hasPixelInArea([color, variation = 1], x, y, size = 20) {
  const x1 = windowPos.x + x;
  const y1 = windowPos.y + y;
  const x2 = x1 + size;
  const y2 = y1 + size;

  return !!(await ahk.pixelSearch(x1, y1, x2, y2, color, variation));
}

function hasGiftBox() {
  return hasPixelInArea([0xbda59c], 250, 30);
}

function hasAloeVera() {
  return hasPixelInArea([0xffdead], 105, 30);
}

function hasHoneyHerbalTea() {
  return hasPixelInArea([0xf0c942], 220, 30);
}

async function doWhileConditionIsTrue({
  condition,
  action,
  postAction = () => null,
  delay = 0,
}) {
  let numberOfIterations = 0;
  while (await condition()) {
    numberOfIterations++;
    await action();
    if (delay) {
      await sleep(delay);
    }
  }

  if (numberOfIterations > 0) {
    postAction();
  }

  return true;
}

async function sell() {
  await Keyboard.send(KeyCode.ALT, KeyCode.FOUR);
  await Keyboard.send(KeyCode.ALT, KeyCode.FOUR);
  await Keyboard.send(KeyCode.ALT, KeyCode.FOUR);
  await Keyboard.send(KeyCode.ALT, KeyCode.FOUR);
  await Keyboard.send(KeyCode.ALT, KeyCode.FOUR);
  await Keyboard.send(KeyCode.ALT, KeyCode.FOUR);
}

async function teleport() {
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
}

async function warp() {
  await Keyboard.send(KeyCode.ALT, KeyCode.NINE);
  await Keyboard.send(KeyCode.ALT, KeyCode.NINE);
  await Keyboard.send(KeyCode.ALT, KeyCode.NINE);
  await Keyboard.send(KeyCode.ALT, KeyCode.NINE);
  await Keyboard.send(KeyCode.ALT, KeyCode.NINE);
}

async function searchAndDestroy(count, foundAnything = false) {
  if (count <= 0) return foundAnything;

  const coordinates = await searchPixel(0xa095ad, 2);
  if (coordinates) {
    const { x, y } = coordinates;

    await Keyboard.send(KeyCode.F1);
    await Keyboard.send(KeyCode.F1);
    await Keyboard.send(KeyCode.F1);
    await sleep(10);
    await MoveCursor(x, y);
    await sleep(10);
    await Mouse.leftClick();
    await Mouse.leftClick();
    await Mouse.leftClick();

    return searchAndDestroy(count - 1, true);
  }

  return searchAndDestroy(count - 4, foundAnything);
}

async function searchPixel(color, count) {
  const result = await ahk.pixelSearch(
    scanArea.x1,
    scanArea.y1,
    scanArea.x2,
    scanArea.y2,
    color,
    10
  );
  if (result) {
    return result;
  } else {
    return count > 0 ? await searchPixel(color, count - 1) : false;
  }
}

async function focusWindow() {
  await ahk.winActivate("MindRO | Gepard Shield 3.0 (^-_-^)");
}

function log(...message) {
  console.log(`[${new Date().toLocaleString()}]`, ...message);
}

async function improveConcentration() {
  await Keyboard.send(KeyCode.F2);
  await Keyboard.send(KeyCode.F2);
  await Keyboard.send(KeyCode.F2);
  await Keyboard.send(KeyCode.F2);
  await Keyboard.send(KeyCode.F2);
  await Keyboard.send(KeyCode.F2);
}

async function trueSight() {
  await Keyboard.send(KeyCode.F3);
  await Keyboard.send(KeyCode.F3);
  await Keyboard.send(KeyCode.F3);
  await Keyboard.send(KeyCode.F3);
  await Keyboard.send(KeyCode.F3);
  await Keyboard.send(KeyCode.F3);
}

function useAloeVera() {
  return Keyboard.send(KeyCode.F4);
}

function openGiftBox() {
  return Keyboard.send(KeyCode.F9);
}

function useHoneyHerbalTea() {
  return Keyboard.send(KeyCode.F8);
}

function useGreenPotions() {
  return Keyboard.send(KeyCode.F5);
}

function useWhitePotions() {
  return Keyboard.send(KeyCode.F6);
}

function useBluePotions() {
  return Keyboard.send(KeyCode.F7);
}

async function doStuffForXMs(actions, duration) {
  const start = performance.now();
  let i = 0;
  while (performance.now() - start < duration) {
    await actions[i % actions.length]();
    i++;
  }
  return i;
}

async function main() {
  await SerialPortManager.initialize();

  windowPos = await ahk.winGetPos("MindRO | Gepard Shield 3.0 (^-_-^)");

  scanArea = {
    x1: Math.floor(windowPos.x + 0.05 * windowPos.width),
    y1: Math.floor(windowPos.y + 0.15 * windowPos.height),
    x2: Math.ceil(windowPos.x + 0.95 * windowPos.width),
    y2: Math.ceil(windowPos.y + 0.95 * windowPos.height),
  };

  await focusWindow();

  await warp();
  await sleep(1000);

  const LOOP_SIZE = Number.MAX_SAFE_INTEGER;
  let x = 0;
  let lastImprovedConcentration = 0;
  let lastTrueSight = 0;

  while (x < LOOP_SIZE) {
    log("LOOP:", x);

    if (Date.now() - lastImprovedConcentration > 240000) {
      await improveConcentration();
      lastImprovedConcentration = Date.now();
      await sleep(20);
    }

    if (Date.now() - lastTrueSight > 30000) {
      await trueSight();
      lastTrueSight = Date.now();
      await sleep(20);
    }

    if (await searchAndDestroy(20)) {
      log("Found at least one target...");
      const start = performance.now();

      await doWhileConditionIsTrue({
        condition: hasHoneyHerbalTea,
        action: useHoneyHerbalTea,
        postAction() {
          log("Used all honey herbal tea");
        },
        delay: 30,
      });

      await doWhileConditionIsTrue({
        condition: hasAloeVera,
        action: useAloeVera,
        postAction() {
          log("Used all aloe vera");
        },
        delay: 30,
      });

      await doWhileConditionIsTrue({
        condition: hasGiftBox,
        action: openGiftBox,
        postAction() {
          log("Used Bulksell");
        },
        delay: 30,
      });

      await sell();
      await sleep(40);

      console.log(`DOWNTIME ${(performance.now() - start).toFixed(2)}ms`);
    }

    if (x % 3 === 0) {
      log("Warping...");
      await warp();
    } else {
      log("Teleporting...");
      await teleport();
    }

    await doStuffForXMs(
      [useGreenPotions, useWhitePotions, useBluePotions],
      100
    );
    await sleep(40);
    x++;
  }

  log("END");
}

main();
