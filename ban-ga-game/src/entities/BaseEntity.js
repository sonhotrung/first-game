// File: src/entities/BaseEntity.js (Khái niệm DRY)
export class Entity {
  constructor(x, y, width, height, speedY = 0, speedX = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedX = speedX;
    this.speedY = speedY;
    this.active = false; // Cờ quản lý vòng đời (dùng cho Object Pool)
  }

  // Logic tịnh tiến chung cho mọi vật thể
  update() {
    if (!this.active) return;
    this.x += this.speedX;
    this.y += this.speedY;
  }
}
