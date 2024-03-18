const { SerialPort } = require("serialport");
const { sleep } = require("./utils");

const BAUD_RATE = 9600;
const DEFAULT_DELAY = 10;

class SerialPortManager {
  async initialize() {
    this.serialPort = new SerialPort({ path: "COM4", baudRate: BAUD_RATE });

    if (!this.serialPort) {
      this.error = true;
      throw new Error("No hardware detected");
    }
  }

  async send(message) {
    if (!this.serialPort) return;

    this.serialPort.write(message);
    await new Promise((resolve) => {
      this.serialPort.drain(() => {
        resolve();
      });
    });
    await sleep(DEFAULT_DELAY);
  }

  close() {
    if (!this.serialPort) return;
    this.serialPort.close();
  }
}

module.exports = new SerialPortManager();
