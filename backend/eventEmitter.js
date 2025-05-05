export class EventEmiter {
  constructor() {
    /** @type {Map<string, Map<WebSocket, function(data)>>} */
    this.listeners = new Map();
  }

  on(eventName, webSocket, func) {
    if (!this.listeners.has(eventName))
      this.listeners.set(eventName, new Map());
    const sockets = this.listeners.get(eventName);
    if (!sockets.has(webSocket)) sockets.set(webSocket, func);
  }

  emit(eventName, webSocket, data) {
    console.log(eventName);
    if (!this.listeners.has(eventName)) throw new Error("event doesnt exists");
    const sockets = this.listeners.get(eventName);
    if (!sockets.has(webSocket)) throw new Error("socket doesnt exists");
    const callBack = sockets.get(webSocket);
    callBack(data);
  }

  delete(eventName, webSocket) {
    if (!this.listeners.has(eventName)) return;
    const sockets = this.listeners.get(eventName);
    if (!sockets.has(webSocket)) return;
    sockets.delete(webSocket);
  }

  cleanAll(webSocket) {
    this.listeners.forEach((value, key) => {
      if (value.has(webSocket)) {
        value.delete(webSocket);
      }
    });
  }
}
