import { WS_URL } from "../constant.js";

export class WS {
  constructor() {
    /** @type {WebSocket} */
    this.ws = null;
    this.listeners = new Map();
    this.onOpen = (ev) => {};
    this.onClose = (ev) => {};
  }

  on(eventName, callback) {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, []);
    this.listeners.get(eventName).push(callback);
  }

  emit(eventName, data) {
    this.ws.send(
      JSON.stringify({
        type: eventName,
        ...data,
      })
    );
  }

  connect() {
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = (ev) => {
      this.onOpen(ev);
    };

    this.ws.onmessage = (ev) => {
      try {
        const { type, ...data } = JSON.parse(ev.data);
        console.log("type", type);
        if (type) {
          const listeners = this.listeners.get(type);
          if (!listeners) throw new Error("event handle doesnt exist");
          listeners.forEach((listener) => {
            listener(data);
          });
        }
      } catch (error) {
        console.error(`Socket Error`, error);
      }
    };
    this.ws.onClose = (ev) => {
      this.onClose(ev);
    };
  }
}
