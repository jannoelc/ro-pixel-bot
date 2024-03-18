const struct = require("python-struct");

const sp = require("./serial-port");
const { Device } = require("./constants");

const MouseAction = {
  CLICK: 0,
  MOVE: 1,
  PRESS: 2,
  RELEASE: 3,
  RELEASE_ALL: 4,
};

class Mouse {
  _deviceType = Device.MOUSE;

  LEFT_BUTTON = 1;
  RIGHT_BUTTON = 2;
  MIDDLE_BUTTON = 4;

  async leftClick() {
    return this.click(this.LEFT_BUTTON);
  }

  async rightClick() {
    return this.click(this.RIGHT_BUTTON);
  }

  async middleClick() {
    return this.click(this.MIDDLE_BUTTON);
  }

  async click(...mouseCodes) {
    const buttons = mouseCodes.reduce((acc, val) => acc | val, 0);
    const payloadFormat = ">BBBBBBBB";
    const payload = struct.pack(payloadFormat, [
      Device.MOUSE,
      MouseAction.CLICK,
      buttons,
    ]);
    await sp.send(payload);
  }

  async move({ x = 0, y = 0, wheel = 0 }) {
    const payloadFormat = ">BBhhh";
    const payload = struct.pack(payloadFormat, [
      Device.MOUSE,
      MouseAction.MOVE,
      x,
      y,
      wheel,
    ]);
    await sp.send(payload);
  }

  async press(...mouseCodes) {
    const buttons = mouseCodes.reduce((acc, val) => acc | val, 0);
    const payloadFormat = ">BBBBBBBB";
    const payload = struct.pack(payloadFormat, [
      Device.MOUSE,
      MouseAction.PRESS,
      buttons,
    ]);
    await sp.send(payload);
  }

  async release(...mouseCodes) {
    const buttons = mouseCodes.reduce((acc, val) => acc | val, 0);
    const payloadFormat = ">BBBBBBBB";
    const payload = struct.pack(payloadFormat, [
      Device.MOUSE,
      MouseAction.RELEASE,
      buttons,
    ]);
    await sp.send(payload);
  }

  async releaseAll() {
    const payloadFormat = ">BBBBBBBB";
    const payload = struct.pack(payloadFormat, [
      Device.MOUSE,
      MouseAction.RELEASE_ALL,
    ]);
    await sp.send(payload);
  }
}

module.exports = new Mouse();
