const SerialPortManager = require("./lib/serial-port");
const Keyboard = require("./lib/keyboard");

async function main() {
  await SerialPortManager.initialize();
  await Keyboard.releaseAll();
  process.exit(0);
}

main();
