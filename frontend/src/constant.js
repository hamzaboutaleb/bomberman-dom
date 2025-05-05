export const WS_URL = "ws://localhost:8080";

export const PLAYER_EVENTS = {
  ENTRY: "player:entry",
  QUEUE: "player:queue",
  GAME: "player:game",
  END: "player:end",
  MESSAGE: "player:message",
};

export const WS_EVENETS = {
  ERROR: "event:error",
  SET_NAME: "event:set_name",
  CHANGE_STATE: "event:change_state",
  PLAYER_JOIN_ROOM: "event:player_join_room",
  PLAYER_LEAVE_ROOM: "event:player_leave_room",
};

export const ROOM_EVENTS = {
  IDLE: "room:idle",
  WAIT: "room:wait",
  COUNTDOWN: "room:countdown",
};

export const SWITCH_EVENTS = {
  ROOM_IDLE: "switch:room_idle",
  ROOM_WAIT: "switch:room_wait",
  ROOM_COUNTDOWN: "switch:room_countdown",
  GAME: "switch:game",
};

export const GAME_EVENTS = {
  LEFT: "game:left",
  RIGHT: "game:right",
  TOP: "game:top",
  BOTTOM: "game:bottom",
  BOMB: "game:bomb",
  PLACE_BOMB: "game:place_bomb",
  EXPLODE: "game:explode",
  BLOCK_DESTROYED: "game:block_destroyed",
  PLAYER_DIE: "game:player_die",
  PLAYER_HIT: "game:player_hit",
  DELETE_OBJECT: "game:delete_object",
  ADD_OBJECT: "game:add_object",
  PLAYER_STATE: "game:player_state",
};
