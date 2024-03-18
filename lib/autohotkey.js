const path = require("path");
const { spawn } = require("child_process");

const AHKCommand = {
  MouseGetPos: "MouseGetPos",
  PixelSearch: "PixelSearch",
  PixelGetColor: "PixelGetColor",
  WinActivate: "WinActivate",
  WinGetPos: "WinGetPos",
};

class AHK {
  process = spawn(path.resolve(process.cwd(), "AutoHotkey.exe"), [
    "autohotkey.ahk",
  ]);

  pendingCommands = {};

  constructor() {
    this.process.stdout.on("data", (buf) => {
      const data = buf.toString();
      const [status, timestamp, command, result] = data.split("\t");

      if (status === "OK") {
        const key = `${timestamp}:${command}`;
        const resolver = this.pendingCommands[key];
        if (resolver) resolver(result);
        delete this.pendingCommands[key];
      }
    });
  }

  async _sendCommand(command, ...args) {
    const timestamp = Date.now();
    this.process.stdin.write(
      [timestamp, command, ...args].map(String).join("\t") + "\r\n"
    );
    return new Promise((resolve) => {
      this.pendingCommands[`${timestamp}:${command}`] = resolve;
    });
  }

  /**
   * Public Methods
   */
  async mouseGetPos() {
    const [x, y] = (await this._sendCommand(AHKCommand.MouseGetPos)).split("|");
    return { x: Number(x), y: Number(y) };
  }

  async pixelSearch(x1, y1, x2, y2, colorId, variation = 0) {
    const result = await this._sendCommand(
      AHKCommand.PixelSearch,
      x1,
      y1,
      x2,
      y2,
      colorId,
      variation
    );
    if (result === "0") return false;
    const [x, y] = result.split("|");
    return { x: Number(x), y: Number(y) };
  }

  async pixelGetColor(x, y) {
    const result = await this._sendCommand(AHKCommand.PixelGetColor, x, y);
    return Number(result);
  }

  async winActivate(windowTitle) {
    return (
      (await this._sendCommand(AHKCommand.WinActivate, windowTitle)) === "1"
    );
  }

  async winGetPos(windowTitle) {
    const result = await this._sendCommand(AHKCommand.WinGetPos, windowTitle);
    if (result === "0") return false;
    const [x, y, width, height] = result.split("|");
    return {
      x: Number(x),
      y: Number(y),
      width: Number(width),
      height: Number(height),
    };
  }
}

module.exports = new AHK();
