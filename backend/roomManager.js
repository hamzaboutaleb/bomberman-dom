import { Room } from "./room.js";

export class RoomManager {
  constructor() {
    /** @type {Map<string, Room>} */
    this.rooms = new Map();
  }

  createNewRoom() {
    const room = new Room();
    this.rooms.set(room.id, room);
    return room;
  }

  getRoom(id) {
    if (!this.rooms.has(id)) throw new Error("room  is not available");
    return this.rooms.get(id);
  }

  findOpenRoom() {
    for (let [id, room] of this.rooms) {
      if (!room.isFull() && room.isOpen) return room;
    }
    return null;
  }

  deleteRoom(id) {
    this.rooms.delete(id);
  }

  update(dt) {
    for (let [id, room] of this.rooms) {
      room.update(dt);
    }
  }
}
