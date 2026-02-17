// File: src/entities/GameEntities.js
import { GAME_CONFIG } from "../constants/GameConfig";

// Lớp Giao diện cơ sở
class IGameObject {
  update(deltaTime) {}
  draw(ctx) {}
}

// Class Người chơi (Phi thuyền)
export class Player extends IGameObject {
  constructor() {
    super();
    this.width = 40;
    this.height = 40;
    // Đặt phi thuyền ở giữa màn hình, sát đáy
    this.position = {
      x: GAME_CONFIG.CANVAS_WIDTH / 2 - this.width / 2,
      y: GAME_CONFIG.CANVAS_HEIGHT - this.height - 20,
    };
    this.speed = GAME_CONFIG.PLAYER_SPEED;
  }

  update(deltaTime, inputs) {
    // Logic di chuyển sẽ viết ở đây
  }

  draw(ctx) {
    // Tạm thời vẽ phi thuyền là một khối màu xanh lá
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

// Class Viên đạn
export class Bullet extends IGameObject {
  constructor(startX, startY) {
    super();
    this.position = { x: startX, y: startY };
    this.radius = 5;
    this.speed = GAME_CONFIG.BULLET_SPEED;
    this.markedForDeletion = false;
  }

  update(deltaTime) {}
  draw(ctx) {}
}

// Class Kẻ địch (Con Gà)
export class Enemy extends IGameObject {
  constructor(startX, startY) {
    super();
    this.position = { x: startX, y: startY };
    this.width = 30;
    this.height = 30;
    this.markedForDeletion = false;
  }

  update(deltaTime) {}
  draw(ctx) {}
}
