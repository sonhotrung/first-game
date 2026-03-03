// File: src/entities/GameEntities.js

export class Player {
  // Thêm tham số imgSrc vào cuối
  constructor(startX, startY, color, name, difficultyConfig, imgSrc) {
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

    // --- CƠ CHẾ TẢI ẢNH PHI THUYỀN ---
    this.image = null;
    if (imgSrc) {
      this.image = new Image();
      this.image.src = imgSrc;
    }

    this.equipWeapon("DEFAULT");
  }

  equipWeapon(weaponKey) {
    this.weapon = GAME_CONFIG.WEAPONS[weaponKey];
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
    if (this.burstsRemaining > 0) {
      if (this.burstIntervalTimer <= 0) {
        this.burstsRemaining--;
        this.burstIntervalTimer = this.weapon.burstInterval || 5;
        this.ammo--;
        return 1;
      } else {
        this.burstIntervalTimer--;
        return 0;
      }
    }

    if (
      inputs.shoot &&
      this.shootCooldown <= 0 &&
      this.ammo > 0 &&
      this.hp > 0 &&
      !this.isReloading
    ) {
      if (this.weapon.burstCount > 1) {
        let actualBurst = this.weapon.burstCount;
        if (this.ammo < actualBurst) actualBurst = this.ammo;

        this.burstsRemaining = actualBurst - 1;
        this.burstIntervalTimer = this.weapon.burstInterval || 5;
        this.shootCooldown = this.weapon.cooldown;
        this.ammo--;
        return 1;
      } else {
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

    // --- VẼ ẢNH THAY VÌ VẼ KHỐI VUÔNG ---
    if (this.image && this.image.complete) {
      ctx.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height,
      );
    } else {
      // Nếu ảnh bị lỗi hoặc chưa load kịp, tự động vẽ lại hình vuông dự phòng
      ctx.fillStyle = this.color;
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

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
