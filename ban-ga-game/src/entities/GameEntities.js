// File: src/entities/GameEntities.js
import { GAME_CONFIG } from "../constants/GameConfig";

// --- THỰC THỂ: NGƯỜI CHƠI (PLAYER) ---
export class Player {
  constructor(startX, startY, color, name, difficultyConfig) {
    this.name = name;
    this.width = 40;
    this.height = 40;
    // Đặt tàu luôn nằm sát đáy màn hình
    this.position = { x: startX, y: startY - this.height - 20 };
    this.speed = GAME_CONFIG.PLAYER_SPEED;
    this.color = color;

    // Nạp cấu hình độ khó (đạn & thời gian nạp)
    this.maxAmmo = difficultyConfig.maxAmmo;
    this.reloadFrames = difficultyConfig.reloadFrames;

    this.ammo = this.maxAmmo;
    this.shootCooldown = 0;
    this.hp = GAME_CONFIG.MAX_HP;
    this.invulnerableTimer = 0; // Đếm ngược thời gian bất tử
    this.markedForDeletion = false;

    // Quản lý cơ chế Delay Thay Đạn
    this.isReloading = false;
    this.currentReloadTimer = 0;
  }

  update(inputs, canvasWidth) {
    if (this.hp <= 0) return;

    // Di chuyển
    if (inputs.left) this.position.x -= this.speed;
    if (inputs.right) this.position.x += this.speed;

    // Giới hạn màn hình (Không cho bay ra ngoài viền)
    if (this.position.x < 0) this.position.x = 0;
    if (this.position.x + this.width > canvasWidth) {
      this.position.x = canvasWidth - this.width;
    }

    // --- LOGIC THAY ĐẠN ---
    // Bắt đầu quá trình nạp đạn nếu bấm phím, chưa nạp, và đạn chưa đầy
    if (inputs.reload && !this.isReloading && this.ammo < this.maxAmmo) {
      if (this.reloadFrames === 0) {
        this.ammo = this.maxAmmo; // Easy: Nạp xong ngay lập tức
      } else {
        this.isReloading = true;
        this.currentReloadTimer = this.reloadFrames; // Hard/Troll: Bắt đầu đếm ngược khung hình
      }
    }

    // Đếm ngược thời gian nạp đạn
    if (this.isReloading) {
      this.currentReloadTimer--;
      if (this.currentReloadTimer <= 0) {
        this.ammo = this.maxAmmo;
        this.isReloading = false; // Nạp xong
      }
    }

    // Giảm thời gian chờ bắn và thời gian bất tử
    if (this.shootCooldown > 0) this.shootCooldown--;
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;
  }

  canShoot(inputs) {
    // Không cho bắn nếu đang thay đạn (isReloading)
    if (
      inputs.shoot &&
      this.shootCooldown === 0 &&
      this.ammo > 0 &&
      this.hp > 0 &&
      !this.isReloading
    ) {
      this.ammo--;
      this.shootCooldown = 15; // Chống spam phím bắn
      return true;
    }
    return false;
  }

  takeDamage() {
    // Chỉ nhận sát thương khi không có khiên bất tử
    if (this.invulnerableTimer === 0) {
      this.hp -= 1;
      this.invulnerableTimer = 90; // Bất tử trong 1.5 giây sau khi trúng đạn
      if (this.hp <= 0) this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    if (this.hp <= 0) return;

    // Hiệu ứng nhấp nháy khi đang bất tử (I-frames)
    if (this.invulnerableTimer > 0 && this.invulnerableTimer % 10 > 5) return;

    // Vẽ phi thuyền
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    // --- VẼ UI THÔNG SỐ (MÁU & ĐẠN) TRÊN ĐẦU TÀU ---
    ctx.font = "12px Arial";
    if (this.isReloading) {
      // Đang thay đạn -> Hiện phần trăm màu vàng
      ctx.fillStyle = "yellow";
      const percent = Math.floor(
        ((this.reloadFrames - this.currentReloadTimer) / this.reloadFrames) *
          100,
      );
      ctx.fillText(
        `LOAD ${percent}%`,
        this.position.x - 10,
        this.position.y - 10,
      );
    } else {
      // Bình thường -> Hiện Máu và Số đạn
      ctx.fillStyle = "white";
      ctx.fillText(
        `HP: ${this.hp} | 🔫: ${this.ammo}`,
        this.position.x - 10,
        this.position.y - 10,
      );
    }
  }
}

// --- THỰC THỂ: ĐẠN CỦA NGƯỜI CHƠI ---
export class Bullet {
  constructor(startX, startY) {
    this.width = 6;
    this.height = 15;
    this.position = { x: startX, y: startY };
    this.speed = GAME_CONFIG.BULLET_SPEED;
    this.markedForDeletion = false;
  }

  update() {
    this.position.y += this.speed;
    // Xóa khi bay khỏi cạnh trên màn hình
    if (this.position.y + this.height < 0) this.markedForDeletion = true;
  }

  draw(ctx) {
    ctx.fillStyle = "#ffff00"; // Đạn màu vàng
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

// --- THỰC THỂ: KẺ ĐỊCH THƯỜNG ---
export class Enemy {
  constructor(startX, startY) {
    this.width = 30;
    this.height = 30;
    this.position = { x: startX, y: startY };
    this.speed = GAME_CONFIG.ENEMY_BASE_SPEED;
    this.markedForDeletion = false;
  }

  update(canvasHeight) {
    this.position.y += this.speed;
    // Xóa khi lọt qua cạnh dưới màn hình
    if (this.position.y > canvasHeight) this.markedForDeletion = true;
  }

  draw(ctx) {
    ctx.fillStyle = "#ff0000"; // Địch màu đỏ
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

// --- THỰC THỂ: ĐẠN CỦA BOSS ---
export class BossBullet {
  constructor(startX, startY) {
    this.width = 8;
    this.height = 16;
    this.position = { x: startX, y: startY };
    this.speed = GAME_CONFIG.BOSS_BULLET_SPEED;
    this.markedForDeletion = false;
  }

  update(canvasHeight) {
    this.position.y += this.speed; // Rơi từ trên xuống
    if (this.position.y > canvasHeight) this.markedForDeletion = true;
  }

  draw(ctx) {
    ctx.fillStyle = "#ff00ff"; // Đạn boss màu tím
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

// --- THỰC THỂ: TRÙM CUỐI (BOSS) ---
export class Boss {
  constructor(canvasWidth) {
    this.width = 100;
    this.height = 60;
    this.position = { x: canvasWidth / 2 - 50, y: 20 };
    this.hp = GAME_CONFIG.BOSS_HP;
    this.speedX = 3;
    this.timer = 0;
    this.isShieldActive = false;
    this.shootCooldown = 0;
  }

  update(canvasWidth) {
    this.timer++;

    // Di chuyển lượn lách ngang màn hình
    this.position.x += this.speedX;

    // Chạm viền thực tế thì nảy lại
    if (this.position.x <= 0 || this.position.x + this.width >= canvasWidth) {
      this.speedX *= -1;
    }
    // Lâu lâu đổi hướng ngẫu nhiên để lừa người chơi
    if (this.timer % 120 === 0 && Math.random() > 0.5) this.speedX *= -1;

    // Cơ chế Khiên (Shield): Cứ 30 giây (1800 frames) sẽ bật khiên trong 5 giây (300 frames)
    if (this.timer % (60 * 30) < 60 * 5) {
      this.isShieldActive = true;
    } else {
      this.isShieldActive = false;
    }

    if (this.shootCooldown > 0) this.shootCooldown--;
  }

  canShoot() {
    // Boss nhả đạn mỗi 0.5 giây (30 frames)
    if (this.shootCooldown === 0) {
      this.shootCooldown = 30;
      return true;
    }
    return false;
  }

  takeDamage() {
    // Boss không mất máu nếu đang có khiên
    if (!this.isShieldActive) {
      this.hp -= 1;
    }
  }

  draw(ctx) {
    // Vẽ Boss
    ctx.fillStyle = this.isShieldActive ? "#aaaaaa" : "#ff4444"; // Xám khi có khiên, Đỏ khi bình thường
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    // Vẽ thanh máu (Health Bar)
    ctx.fillStyle = "red";
    ctx.fillRect(this.position.x, this.position.y - 15, this.width, 10);
    ctx.fillStyle = "lime";
    ctx.fillRect(
      this.position.x,
      this.position.y - 15,
      (this.hp / GAME_CONFIG.BOSS_HP) * this.width,
      10,
    );

    // Báo hiệu chữ khi bật khiên
    if (this.isShieldActive) {
      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.fillText("SHIELD UP!", this.position.x + 10, this.position.y + 35);
    }
  }
}
