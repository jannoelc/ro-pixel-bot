const SerialPortManager = require("../lib/serial-port");
const Keyboard = require("../lib/keyboard");
const Mouse = require("../lib/mouse");
const KeyCode = require("../lib/key-code");
const { sleep } = require("../lib/utils");
const ahk = require("../lib/autohotkey");

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

async function focusWindow(pid) {
  await ahk.winActivate(`ahk_pid ${pid}`);
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

async function clickWithConfidence(key) {
  await Mouse.leftClick();
  await Mouse.leftClick();
  await Mouse.leftClick();
  await sleep(10);
  await Mouse.leftClick();
  await Mouse.leftClick();
  await Mouse.leftClick();
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

function sunset() {
  return pressWithConfidence(KeyCode.F7);
}

function whistle() {
  return pressWithConfidence(KeyCode.F8);
}

function serviceForYou() {
  return pressWithConfidence(KeyCode.F1);
}

function fortuneKiss() {
  return pressWithConfidence(KeyCode.F2);
}

function adaptation() {
  return pressWithConfidence(KeyCode.F9);
}

async function doDaDeed(deed) {
  await sleep(200);
  await switchWeapon();
  await sleep(300);
  await deed();
}

async function heal() {
  const coordinates = await searchPixel(0xffff00, 1);
  if (coordinates) {
    const { x, y } = coordinates;
    await MoveCursor(x, y);
    await sleep(10);
    await clickWithConfidence();
  }
}

async function main() {
  await SerialPortManager.initialize();
  await Keyboard.releaseAll();
  windowPos = await ahk.winGetPos("MindRO | Gepard Shield 3.0 (^-_-^)");

  scanArea = {
    x1: Math.floor(windowPos.x + 0.05 * windowPos.width),
    y1: Math.floor(windowPos.y + 0.2 * windowPos.height),
    x2: Math.ceil(windowPos.x + 0.8 * windowPos.width),
    y2: Math.ceil(windowPos.y + 0.8 * windowPos.height),
  };

  await focusWindow();

  await sleep(1000);
  const LOOP_SIZE = Number.MAX_SAFE_INTEGER;
  let x = 0;
  let lastImprovedConcentration = 0;
  let lastSoulLink = 0;

  while (x < LOOP_SIZE) {
    if (Date.now() - lastSoulLink > 60000) {
      await focusWindow(6688);
      await sleep(1000);
      await MoveCursor(514, 541);
      await sleep(200);
      await serviceForYou();
      await sleep(200);
      await clickWithConfidence();
      await sleep(200);
      await pressWithConfidence(KeyCode.F2);
      await sleep(1000);
      lastSoulLink = Date.now();
    }

    await focusWindow(6408);
    await sleep(1000);

    if (Date.now() - lastImprovedConcentration > 240000) {
      await sleep(200);
      await improveConcentration();
      lastImprovedConcentration = Date.now();
      log("Used Improved Concentration");
    }

    await doDaDeed(whistle);
    await doDaDeed(sunset);
    await doDaDeed(fortuneKiss);
    await doDaDeed(serviceForYou);
    await doDaDeed(appleOfIdun);
    await doDaDeed(poemOfBragi);

    await sleep(4000);
    await adaptation();
    await sleep(300);
    await heal();

    await sleep(1000);

    x++;
  }

  log("END");
}

main();
