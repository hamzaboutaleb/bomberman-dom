export const MAX_ROOM_PLAYERS = 4;
export const PLAYER_START_LIFES = 3;
export const PLAYER_START_SPEED = 10;
export const GAME_INITIAL_WAITING_TIME = 1;
export const GAME_INITIAL_COUNTDOWN_TIME = 1;

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
  PLACE_BOMB: "game:place_bomb",
  EXPLODE: "game:explode",
};