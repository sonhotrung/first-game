// File: src/constants/GameConfig.js
export const GAME_CONFIG = {
  STATES: {
    MENU: "MENU",
    PLAYING: "PLAYING",
    PAUSED: "PAUSED",
    GAMEOVER: "GAMEOVER",
    VICTORY: "VICTORY",
    INSTRUCTIONS: "INSTRUCTIONS",
  },

  KEYS: {
    P1: {
      LEFT: "ArrowLeft",
      RIGHT: "ArrowRight",
      SHOOT: "ArrowUp",
      RELOAD: "ArrowDown",
    },
    P2: { LEFT: "KeyA", RIGHT: "KeyD", SHOOT: "KeyW", RELOAD: "KeyS" },
    PAUSE: "Escape",
  },

  PLAYER_SPEED: 5,
  BULLET_SPEED: -10,
  ENEMY_BASE_SPEED: 2,
  MAX_HP: 3,
  SCORE_TO_BOSS: 10000,
  BOSS_HP: 90,
  BOSS_BULLET_SPEED: 6,

  // --- THÊM MỚI: CẤU HÌNH ĐỘ KHÓ ---
  DIFFICULTY: {
    EASY: { maxAmmo: 10, reloadFrames: 0 }, // Tức thời
    HARD: { maxAmmo: 5, reloadFrames: 180 }, // 3 giây (60fps * 3)
    TROLL: { maxAmmo: 1, reloadFrames: 600 }, // 10 giây (60fps * 10)
  },
};
