const SerialPortManager = require("../lib/serial-port");
const Keyboard = require("../lib/keyboard");
const Mouse = require("../lib/mouse");
const KeyCode = require("../lib/key-code");
const { sleep } = require("../lib/utils");
const ahk = require("../lib/autohotkey");

const { performance } = require("perf_hooks");
const autohotkey = require("../lib/autohotkey");

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

function hasOldBlueBox() {
  return hasPixelInArea([0xd69c4a], 980, 30);
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
    await postAction();
  }

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

  if (numberOfIterations > 0) {
    postAction();
  }

  return true;
}

async function sell() {
  // try and use items
  await Keyboard.send(KeyCode.ALT, KeyCode.F9);
  await Keyboard.send(KeyCode.ALT, KeyCode.F9);
  await Keyboard.send(KeyCode.ALT, KeyCode.F9);
  await Keyboard.send(KeyCode.ALT, KeyCode.F9);
  await Keyboard.send(KeyCode.ALT, KeyCode.F9);
  await sleep(10);
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
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
  await Keyboard.send(KeyCode.ALT, KeyCode.THREE);
}

async function warp() {
  await Keyboard.send(KeyCode.ALT, KeyCode.EIGHT);
  await Keyboard.send(KeyCode.ALT, KeyCode.EIGHT);
  await Keyboard.send(KeyCode.ALT, KeyCode.EIGHT);
  await Keyboard.send(KeyCode.ALT, KeyCode.EIGHT);
  await Keyboard.send(KeyCode.ALT, KeyCode.EIGHT);
  await Keyboard.send(KeyCode.ALT, KeyCode.EIGHT);
  await Keyboard.send(KeyCode.ALT, KeyCode.EIGHT);
  await Keyboard.send(KeyCode.ALT, KeyCode.EIGHT);
}

async function searchAndDestroy(count, foundAnything = false) {
  if (count <= 0) return foundAnything;
  const coordinates = await searchPixel(0x00ff80, 8);
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
    5
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

function useOrange() {
  return Keyboard.send(KeyCode.F3);
}

function bulkSell() {
  return Keyboard.send(KeyCode.ALT, KeyCode.FOUR);
}

async function isInventoryEmpty() {
  const color = await autohotkey.pixelGetColor(
    windowPos.x + 60,
    windowPos.y + 90
  );
  return color === 0xd6deef;
}

async function isInventoryOpen() {
  const color = await autohotkey.pixelGetColor(
    windowPos.x + 30,
    windowPos.y + 105
  );
  return color === 0xffffff;
}

async function isStorageOpen() {
  const color = await autohotkey.pixelGetColor(
    windowPos.x + 273,
    windowPos.y + 72
  );
  return color === 0xffffff;
}

async function storeETCs() {
  await Mouse.rightClick();
  await Mouse.rightClick();
  await Mouse.rightClick();
  await Mouse.rightClick();
  await Mouse.rightClick();

  await doWhileConditionIsTrue({
    condition: hasOldBlueBox,
    action: bulkSell,
    postAction() {
      log("Used Bulksell");
    },
  });

  await doUntilConditionIsTrue({
    condition: isInventoryOpen,
    action: () => Keyboard.send(KeyCode.ALT, KeyCode.E),
    postAction() {
      log("Open Inventory");
    },
    delay: 50,
  });

  await doUntilConditionIsTrue({
    condition: isStorageOpen,
    action: () => Keyboard.send(KeyCode.ALT, KeyCode.ONE),
    postAction() {
      log("open storage");
    },
    delay: 50,
  });

  await MoveCursor(windowPos.x + 60, windowPos.y + 90);

  await sleep(300);

  try {
    await doUntilConditionIsTrue({
      condition: isInventoryEmpty,
      action: async () => {
        await Keyboard.press(KeyCode.ALT);
        await Mouse.rightClick();
      },
      postAction: async () => {
        log("Storing items");
        await Keyboard.releaseAll();
      },
      delay: 20,
      maxTimeout: 2000,
    });
  } catch (error) {
    console.warn("fail to empty inventory");
    await Keyboard.releaseAll();
  }

  await sleep(100);

  await Keyboard.releaseAll();
  await Keyboard.releaseAll();
  await Keyboard.releaseAll();

  await doWhileConditionIsTrue({
    condition: isInventoryOpen,
    action: () => Keyboard.send(KeyCode.ALT, KeyCode.E),
    postAction() {
      log("Close Inventory");
    },
    delay: 50,
  });

  await sleep(200);
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
  await Keyboard.releaseAll();
  windowPos = await ahk.winGetPos("MindRO | Gepard Shield 3.0 (^-_-^)");

  scanArea = {
    x1: Math.floor(windowPos.x + 0.1 * windowPos.width),
    y1: Math.floor(windowPos.y + 0.2 * windowPos.height),
    x2: Math.ceil(windowPos.x + 1 * windowPos.width),
    y2: Math.ceil(windowPos.y + 1 * windowPos.height),
  };

  await focusWindow();

  await warp();
  await sleep(1000);
  const LOOP_SIZE = Number.MAX_SAFE_INTEGER;
  let x = 0;
  let mobFindCount = 0;
  const ETC_INTERVAL = 150;

  while (x < LOOP_SIZE) {
    log("LOOP:", x);

    if (await searchAndDestroy(18)) {
      mobFindCount++;
      log("Found at least one target...");

      if (mobFindCount >= 10) {
        await doStuffForXMs([bulkSell], 600);
        mobFindCount = 0;
      } else {
        if (mobFindCount % 3 === 0) {
          log("Trying to open gifts then bulk sell...");
          await doStuffForXMs([useOrange, useOrange, bulkSell], 600);
        } else {
          log("Trying to open gifts...");
          await doStuffForXMs(
            [useOrange, () => Keyboard.send(KeyCode.ALT, KeyCode.FIVE)],
            600
          );
        }
      }
      await sleep(200);
    }

    if (ETC_INTERVAL && x % ETC_INTERVAL === ETC_INTERVAL - 1) {
      log("Storing ETCs");
      await storeETCs();
    }

    log("Warping...");
    await warp();

    await sleep(200);
    x++;
  }

  log("END");
}

main();
