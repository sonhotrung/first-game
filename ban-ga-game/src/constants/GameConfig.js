// File: src/constants/GameConfig.js
export const GAME_CONFIG = {
  STATES: {
    MENU: "MENU",
    PLAYING: "PLAYING",
    PAUSED: "PAUSED",
    GAMEOVER: "GAMEOVER",
    VICTORY: "VICTORY",
    INSTRUCTIONS: "INSTRUCTIONS",
    WEAPON_SELECT: "WEAPON_SELECT",
    TEST_WEAPONS: "TEST_WEAPONS",
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
  ENEMY_BASE_SPEED: 1.5,
  MAX_HP: 3,
  SCORE_TO_BOSS: 10000,
  BOSS_HP: 100,
  BOSS_BULLET_SPEED: 6,

  DIFFICULTY: {
    EASY: { baseAmmo: 20, reloadFrames: 180 },
    HARD: { baseAmmo: 10, reloadFrames: 180 },
    // Đã x2 đạn gốc cho chế độ TROLL theo yêu cầu của bạn
    TROLL: { baseAmmo: 2, reloadFrames: 600 },
  },

  // KHO VŨ KHÍ CỦA BẠN ĐÃ ĐƯỢC LƯU
  WEAPONS: {
    DEFAULT: {
      name: "Pistol",
      damage: 1,
      cooldown: 12,
      ammoMultiplier: 1,
      spreadAngle: 0,
      color: "#ffff00",
      bulletsPerShot: 1,
      reloadMultiplier: 1,
      maxPierce: 1,
    },
    SNIPER: {
      name: "Sniper",
      damage: 8,
      cooldown: 40,
      ammoMultiplier: 0.5,
      spreadAngle: 0,
      color: "#ff4444",
      bulletsPerShot: 1,
      reloadMultiplier: 4,
      maxPierce: 3,
    },
    SMG: {
      name: "Dual SMG",
      damage: 0.5,
      cooldown: 5,
      ammoMultiplier: 9, // Hệ số x9 (Mức Easy 20 đạn gốc -> 180 viên)
      spreadAngle: 10, // Góc lệch 10 độ tạo thành hình chữ V hẹp cho 2 nòng súng
      color: "#00ffff",
      bulletsPerShot: 2, // CƠ CHẾ: Bắn 2 viên mỗi lần bóp cò
      reloadMultiplier: 0.8,
      maxPierce: 1,
    },
    MACHINE_GUN: {
      name: "Machine Gun",
      damage: 0.4,
      cooldown: 3,
      ammoMultiplier: 20,
      spreadAngle: 30,
      color: "#ffaa00",
      bulletsPerShot: 1,
      reloadMultiplier: 8,
      maxPierce: 1,
    },
    SHOTGUN: {
      name: "Shotgun",
      damage: 2,
      cooldown: 35,
      ammoMultiplier: 1,
      spreadAngle: 45,
      color: "#ffffff",
      bulletsPerShot: 10,
      reloadMultiplier: 0.8,
      maxPierce: 1,
    },
    RIFLE: {
      name: "Assault Rifle",
      damage: 1.5,
      cooldown: 25,
      ammoMultiplier: 3,
      spreadAngle: 5,
      color: "#ffbb00",
      bulletsPerShot: 1,
      reloadMultiplier: 1.5,
      maxPierce: 1,
      burstCount: 3,
      burstInterval: 4,
    },
  },
};
