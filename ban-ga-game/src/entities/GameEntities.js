// File: src/entities/GameEntities.js
import { GAME_CONFIG } from "../constants/GameConfig";

export class Player {
  constructor(startX, startY, color, name, difficultyConfig) {
    this.name = name;
    this.width = 40;
    this.height = 40;
    this.position = { x: startX, y: startY - this.height - 20 };
    this.speed = GAME_CONFIG.PLAYER_SPEED;
    this.color = color;

    this.baseAmmo = difficultyConfig.baseAmmo;
    this.baseReloadFrames = difficultyConfig.reloadFrames;

    this.hp = GAME_CONFIG.MAX_HP;
    this.invulnerableTimer = 0;
    this.markedForDeletion = false;

    this.isReloading = false;
    this.currentReloadTimer = 0;
    this.totalReloadTimer = 0;
    this.shootCooldown = 0;

    this.burstsRemaining = 0;
    this.burstIntervalTimer = 0;

    this.equipWeapon("DEFAULT");
  }

  equipWeapon(weaponKey) {
    this.weapon = GAME_CONFIG.WEAPONS[weaponKey];
    // SỬ DỤNG MATH.CEIL ĐỂ LÀM TRÒN LÊN NẾU SỐ ĐẠN BỊ LẺ
    this.maxAmmo = Math.ceil(this.baseAmmo * this.weapon.ammoMultiplier);
    this.ammo = this.maxAmmo;
    this.isReloading = false;
    this.burstsRemaining = 0;
  }

  update(inputs, canvasWidth) {
    if (this.hp <= 0) return;

    if (inputs.left) this.position.x -= this.speed;
    if (inputs.right) this.position.x += this.speed;

    if (this.position.x < 0) this.position.x = 0;
    if (this.position.x + this.width > canvasWidth)
      this.position.x = canvasWidth - this.width;

    if (inputs.reload && !this.isReloading && this.ammo < this.maxAmmo) {
      const finalReloadFrames =
        this.baseReloadFrames * this.weapon.reloadMultiplier;
      if (finalReloadFrames === 0) {
        this.ammo = this.maxAmmo;
      } else {
        this.isReloading = true;
        this.currentReloadTimer = finalReloadFrames;
        this.totalReloadTimer = finalReloadFrames;
      }
    }

    if (this.isReloading) {
      this.currentReloadTimer--;
      if (this.currentReloadTimer <= 0) {
        this.ammo = this.maxAmmo;
        this.isReloading = false;
      }
    }

    if (this.shootCooldown > 0) this.shootCooldown--;
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;
  }

  canShoot(inputs) {
    // 1. Ưu tiên xử lý loạt đạn liên thanh đang bắn dở (Kể cả khi người chơi không bấm nút Shoot nữa)
    if (this.burstsRemaining > 0) {
      if (this.burstIntervalTimer <= 0) {
        this.burstsRemaining--;
        this.burstIntervalTimer = this.weapon.burstInterval || 5;
        this.ammo--;
        return 1; // Bắn ra 1 viên
      } else {
        this.burstIntervalTimer--;
        return 0; // Đang chờ vài khung hình để bắn viên tiếp theo
      }
    }

    // 2. Xử lý bóp cò mới
    if (
      inputs.shoot &&
      this.shootCooldown <= 0 &&
      this.ammo > 0 &&
      this.hp > 0 &&
      !this.isReloading
    ) {
      // Nếu là súng trường (Có cấu hình burstCount > 1)
      if (this.weapon.burstCount > 1) {
        // Tránh lỗi: Còn 2 viên đạn nhưng súng đòi bắn 3 viên
        let actualBurst = this.weapon.burstCount;
        if (this.ammo < actualBurst) actualBurst = this.ammo;

        this.burstsRemaining = actualBurst - 1; // 1 viên bắn ngay, các viên kia vào hàng đợi
        this.burstIntervalTimer = this.weapon.burstInterval || 5;
        this.shootCooldown = this.weapon.cooldown; // Ngắt nghỉ cooldown dài bắt đầu tính
        this.ammo--;
        return 1;
      } else {
        // Các súng bình thường / Shotgun
        let bulletsFired = this.weapon.bulletsPerShot || 1;
        if (this.ammo < bulletsFired) bulletsFired = this.ammo;
        this.ammo -= bulletsFired;
        this.shootCooldown = this.weapon.cooldown;
        return bulletsFired;
      }
    }
    return 0;
  }

  takeDamage() {
    if (this.invulnerableTimer === 0) {
      this.hp -= 1;
      this.invulnerableTimer = 90;
      if (this.hp <= 0) this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    if (this.hp <= 0) return;
    if (this.invulnerableTimer > 0 && this.invulnerableTimer % 10 > 5) return;

    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    ctx.font = "12px Arial";
    if (this.isReloading) {
      ctx.fillStyle = "yellow";
      const percent = Math.floor(
        ((this.totalReloadTimer - this.currentReloadTimer) /
          this.totalReloadTimer) *
          100,
      );
      ctx.fillText(
        `LOAD ${percent}%`,
        this.position.x - 10,
        this.position.y - 10,
      );
    } else {
      ctx.fillStyle = "white";
      ctx.fillText(
        `HP:${this.hp} | 🔫:${this.ammo}`,
        this.position.x - 15,
        this.position.y - 10,
      );
    }
  }
}
export class Bullet {
  // Thêm tham số maxPierce
  constructor(startX, startY, damage, vx, vy, color, maxPierce = 1) {
    this.width = 6;
    this.height = 15;
    this.position = { x: startX, y: startY };
    this.damage = damage;
    this.vx = vx;
    this.vy = vy;
    this.color = color;

    // CƠ CHẾ XUYÊN THẤU (PIERCING)
    this.maxPierce = maxPierce;
    this.hitCount = 0; // Đếm số quái đã xuyên qua
    this.hitEntities = new Set(); // Nhớ những quái đã chạm để không trừ máu 2 lần trên 1 con
    this.markedForDeletion = false;
  }

  update() {
    this.position.x += this.vx;
    this.position.y += this.vy;
    if (
      this.position.y + this.height < 0 ||
      this.position.x < 0 ||
      this.position.x > window.innerWidth
    ) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

// ... (Các class Enemy, Boss, BossBullet cứ giữ nguyên nhé) ...
export class Enemy {
  // Nhận thêm tham số máu và màu sắc để phân biệt độ khó
  constructor(startX, startY, maxHp, color) {
    this.width = 30;
    this.height = 30;
    this.position = { x: startX, y: startY };
    this.speed = GAME_CONFIG.ENEMY_BASE_SPEED;

    this.maxHp = maxHp;
    this.hp = maxHp;
    this.color = color || "#ff4444"; // Mặc định Đỏ (3 máu), Cam (5 máu), Tím (8 máu)
    this.markedForDeletion = false;
  }

  update(canvasHeight) {
    this.position.y += this.speed;
    if (this.position.y > canvasHeight) this.markedForDeletion = true;
  }

  draw(ctx) {
    // Vẽ thân quái
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    // Vẽ thanh máu (Health Bar) cho quái nhỏ
    ctx.fillStyle = "red";
    ctx.fillRect(this.position.x, this.position.y - 8, this.width, 4);
    ctx.fillStyle = "lime";
    ctx.fillRect(
      this.position.x,
      this.position.y - 8,
      (this.hp / this.maxHp) * this.width,
      4,
    );
  }
}

export class BossBullet {
  constructor(startX, startY) {
    this.width = 8;
    this.height = 16;
    this.position = { x: startX, y: startY };
    this.speed = GAME_CONFIG.BOSS_BULLET_SPEED;
    this.markedForDeletion = false;
  }
  update(canvasHeight) {
    this.position.y += this.speed;
    if (this.position.y > canvasHeight) this.markedForDeletion = true;
  }
  draw(ctx) {
    ctx.fillStyle = "#ff00ff";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

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

    // Bộ đếm thời gian thả quái (120 frames = 2 giây)
    this.summonTimer = 0;
  }

  update(canvasWidth, enemiesArray) {
    this.timer++;
    this.position.x += this.speedX;
    if (this.position.x <= 0 || this.position.x + this.width >= canvasWidth)
      this.speedX *= -1;
    if (this.timer % 120 === 0 && Math.random() > 0.5) this.speedX *= -1;
    this.isShieldActive = this.timer % (60 * 30) < 60 * 5;
    if (this.shootCooldown > 0) this.shootCooldown--;

    // --- CƠ CHẾ TRIỆU HỒI ĐỆ TỬ MỖI 2 GIÂY ---
    this.summonTimer++;
    if (this.summonTimer >= 120) {
      this.summonTimer = 0; // Reset đồng hồ

      let minionHp = 3;
      let minionColor = "#ff4444"; // Đỏ (Boss 80 - 100 HP)

      if (this.hp <= 80 && this.hp > 40) {
        minionHp = 5;
        minionColor = "#ffaa00"; // Cam
      } else if (this.hp <= 40) {
        minionHp = 8;
        minionColor = "#aa00ff"; // Tím
      }

      // Đẻ đệ tử ngay dưới bụng Boss
      enemiesArray.push(
        new Enemy(
          this.position.x + this.width / 2 - 15,
          this.position.y + this.height + 10,
          minionHp,
          minionColor,
        ),
      );
    }
  }

  canShoot() {
    if (this.shootCooldown <= 0) {
      this.shootCooldown = 30;
      return true;
    }
    return false;
  }

  takeDamage(amount) {
    if (!this.isShieldActive) this.hp -= amount;
  }

  draw(ctx) {
    ctx.fillStyle = this.isShieldActive ? "#aaaaaa" : "#ff4444";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    ctx.fillStyle = "red";
    ctx.fillRect(this.position.x, this.position.y - 15, this.width, 10);
    ctx.fillStyle = "lime";
    ctx.fillRect(
      this.position.x,
      this.position.y - 15,
      (this.hp / GAME_CONFIG.BOSS_HP) * this.width,
      10,
    );
    if (this.isShieldActive) {
      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.fillText("SHIELD UP!", this.position.x + 10, this.position.y + 35);
    }
  }
}
