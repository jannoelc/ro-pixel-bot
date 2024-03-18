const SerialPortManager = require("../lib/serial-port");
const Keyboard = require("../lib/keyboard");
const Mouse = require("../lib/mouse");
const KeyCode = require("../lib/key-code");
const { sleep } = require("../lib/utils");
const ahk = require("../lib/autohotkey");

const { performance } = require("perf_hooks");

let windowPos;
let scanArea = {};
let scanArea2 = {};

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

async function hasPixelInArea(
  [color, variation = 1],
  x,
  y,
  widthOrSize = 20,
  height
) {
  const x1 = windowPos.x + x;
  const y1 = windowPos.y + y;
  const x2 = x1 + widthOrSize;
  const y2 = y1 + (height ?? widthOrSize);

  return !!(await ahk.pixelSearch(x1, y1, x2, y2, color, variation));
}

function hasOldBlueBox() {
  return hasPixelInArea([0xd69c4a], 980, 30);
}

function hasNoSp() {
  return hasPixelInArea([0xff0000, 2], 293, 44, 200, 30);
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

  postAction();
  return true;
}

async function doUntilConditionIsTrue({
  condition,
  action,
  postAction = () => null,
  delay = 0,
  maxTimeout,
}) {
  let numberOfIterations = 0;
  let start = performance.now();

  while (!(await condition())) {
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

  postAction();
  return true;
}

async function teleport() {
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
  await sleep(10);
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
  await sleep(10);
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
}

async function warp() {
  await Keyboard.send(KeyCode.ALT, KeyCode.NINE);
  await Keyboard.send(KeyCode.ALT, KeyCode.NINE);
  await Keyboard.send(KeyCode.ALT, KeyCode.NINE);
  await sleep(10);
  await Keyboard.send(KeyCode.ALT, KeyCode.NINE);
  await Keyboard.send(KeyCode.ALT, KeyCode.NINE);
  await Keyboard.send(KeyCode.ALT, KeyCode.NINE);
  await sleep(10);
  await Keyboard.send(KeyCode.ALT, KeyCode.NINE);
  await Keyboard.send(KeyCode.ALT, KeyCode.NINE);
  await Keyboard.send(KeyCode.ALT, KeyCode.NINE);
}

async function warpToTown() {
  await Keyboard.send(KeyCode.ALT, KeyCode.TWO);
  await Keyboard.send(KeyCode.ALT, KeyCode.TWO);
  await Keyboard.send(KeyCode.ALT, KeyCode.TWO);
  await sleep(10);
  await Keyboard.send(KeyCode.ALT, KeyCode.TWO);
  await Keyboard.send(KeyCode.ALT, KeyCode.TWO);
  await Keyboard.send(KeyCode.ALT, KeyCode.TWO);
  await sleep(10);
  await Keyboard.send(KeyCode.ALT, KeyCode.TWO);
  await Keyboard.send(KeyCode.ALT, KeyCode.TWO);
}

async function heal() {
  const coordinates = await searchPixel(0xffff00, 1);
  if (coordinates) {
    const { x, y } = coordinates;
    await MoveCursor(x, y);
    await sleep(10);
    await Mouse.leftClick();
  }
}

async function searchAndDestroy(count, foundAnything = false) {
  if (count <= 0) return foundAnything;
  // const coordinates = await searchPixel(0xeebb87, 1);
  const coordinates = await searchPixel2(0x7a733f, 10);
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
    await sleep(100);

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
    5
  );
  if (result) {
    return result;
  } else {
    return count > 0 ? await searchPixel(color, count - 1) : false;
  }
}

async function searchPixel2(color, count) {
  const result = await ahk.pixelSearch(
    scanArea2.x1,
    scanArea2.y1,
    scanArea2.x2,
    scanArea2.y2,
    color,
    5
  );
  if (result) {
    return result;
  } else {
    return count > 0 ? await searchPixel2(color, count - 1) : false;
  }
}

async function focusWindow() {
  await ahk.winActivate("MindRO | Gepard Shield 3.0 (^-_-^)");
}

function log(...message) {
  console.log(`[${new Date().toLocaleString()}]`, ...message);
}

async function dangerousSoulCollect() {
  await Keyboard.send(KeyCode.F3);
  await Keyboard.send(KeyCode.F3);
  await Keyboard.send(KeyCode.F3);
  await sleep(10);
  await Keyboard.send(KeyCode.F3);
  await Keyboard.send(KeyCode.F3);
  await Keyboard.send(KeyCode.F3);
}

async function criticalExplosion() {
  await Keyboard.send(KeyCode.F4);
  await Keyboard.send(KeyCode.F4);
  await Keyboard.send(KeyCode.F4);
  await sleep(10);
  await Keyboard.send(KeyCode.F4);
  await Keyboard.send(KeyCode.F4);
  await Keyboard.send(KeyCode.F4);
}

function openGiftBox() {
  return Keyboard.send(KeyCode.F9);
}

function bulkSell() {
  return Keyboard.send(KeyCode.ALT, KeyCode.FOUR);
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

async function hunt() {
  let failureCount = 0;

  while (failureCount < 30) {
    if (await searchAndDestroy(2)) {
      await searchAndDestroy(7);

      if (await hasNoSp()) {
        break;
      }
    }

    failureCount++;
    await sleep(200);
    await teleport();
    await sleep(400);
    continue;
  }
}

async function main() {
  await SerialPortManager.initialize();

  windowPos = await ahk.winGetPos("MindRO | Gepard Shield 3.0 (^-_-^)");

  scanArea = {
    x1: Math.floor(windowPos.x + 0.05 * windowPos.width),
    y1: Math.floor(windowPos.y + 0.2 * windowPos.height),
    x2: Math.ceil(windowPos.x + 0.8 * windowPos.width),
    y2: Math.ceil(windowPos.y + 0.8 * windowPos.height),
  };

  scanArea2 = {
    x1: Math.floor(windowPos.x + 0.4 * windowPos.width),
    y1: Math.floor(windowPos.y + 0.4 * windowPos.height),
    x2: Math.ceil(windowPos.x + 0.6 * windowPos.width),
    y2: Math.ceil(windowPos.y + 0.6 * windowPos.height),
  };

  await focusWindow();

  const LOOP_SIZE = Number.MAX_SAFE_INTEGER;
  let x = 0;

  while (x < LOOP_SIZE) {
    log("LOOP:", x);

    await warpToTown();
    await sleep(1000);

    try {
      const hasHealed = await doWhileConditionIsTrue({
        condition: hasNoSp,
        action: heal,
        postAction() {
          log("Talked to NPC Healer");
        },
        maxTimeout: 3000,
      });

      if (!hasHealed) {
        await heal();
        await sleep(400);
      }
    } catch (error) {
      continue;
    }

    await dangerousSoulCollect();
    await sleep(1100);
    await criticalExplosion();
    await sleep(700);
    await dangerousSoulCollect();

    if (x % 50 === 49) {
      try {
        await doWhileConditionIsTrue({
          condition: hasOldBlueBox,
          action: bulkSell,
          postAction() {
            log("Used Bulksell");
          },
        });
      } catch (error) {
        console.warn("fail to bulksell");
      }
    } else if (x % 4 === 3) {
      doStuffForXMs([openGiftBox, bulkSell], 700);
    } else {
      doStuffForXMs([openGiftBox], 700);
    }
    await sleep(700);

    await warp();
    await sleep(500);

    await hunt();
    await sleep(500);

    x++;
  }

  return;
}

process.on("SIGINT", async () => {
  await Keyboard.releaseAll();
  process.exit(0);
});

main();
