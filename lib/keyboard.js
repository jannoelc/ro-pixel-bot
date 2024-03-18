const struct = require("python-struct");

const sp = require("./serial-port");
const { Device } = require("./constants");

const KeyboardAction = {
  TYPE: 0,
  PRESS: 1,
  RELEASE: 2,
  RELEASE_ALL: 3,
  SEND: 4,
};

class Keyboard {
  _deviceType = Device.KEYBOARD;

  async type(message) {
    const maxCharactersPerPayload = 7;
    const headerPayloadFormat = ">BBB5s";
    const tailPayloadFormat = `>B${maxCharactersPerPayload}s`;
    const headMessage = message.slice(0, 5);
    const restOfMessage = message.slice(5);
    const pageCount = Math.ceil(restOfMessage.length / maxCharactersPerPayload);

    const headPayload = struct.pack(headerPayloadFormat, [
      Device.KEYBOARD,
      KeyboardAction.TYPE,
      pageCount,
      headMessage,
    ]);
    const restOfPayload = Array.from({
      length: pageCount > 100 ? 100 : pageCount,
    }).map((_, index) => {
      const partialMessage = restOfMessage.slice(
        maxCharactersPerPayload * index,
        maxCharactersPerPayload * index + maxCharactersPerPayload
      );
      return struct.pack(tailPayloadFormat, [index, partialMessage]);
    });

    // Send the payload
    await sp.send(headPayload);
    for (const payload of restOfPayload) {
      await sp.send(payload);
    }
  }

  async press(...keycodes) {
    const payloadFormat = ">BBBBBBBB";
    const payload = struct.pack(payloadFormat, [
      Device.KEYBOARD,
      KeyboardAction.PRESS,
      ...keycodes,
    ]);
    await sp.send(payload);
  }

  async release(...keycodes) {
    const payloadFormat = ">BBBBBBBB";
    const payload = struct.pack(payloadFormat, [
      Device.KEYBOARD,
      KeyboardAction.RELEASE,
      ...keycodes,
    ]);
    await sp.send(payload);
  }

  async releaseAll() {
    const payloadFormat = ">BBBBBBBB";
    const payload = struct.pack(payloadFormat, [
      Device.KEYBOARD,
      KeyboardAction.RELEASE_ALL,
    ]);
    await sp.send(payload);
  }

  async send(...keycodes) {
    const payloadFormat = ">BBBBBBBB";
    const payload = struct.pack(payloadFormat, [
      Device.KEYBOARD,
      KeyboardAction.SEND,
      ...keycodes,
    ]);
    await sp.send(payload);
  }
}

module.exports = new Keyboard();
