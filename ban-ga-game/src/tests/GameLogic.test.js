// File: src/tests/GameLogic.test.js
import { checkCollision } from "../entities/GameEntities";
import { ObjectPool } from "../entities/ObjectPool";

// --- MOCK CLASSES ĐỂ TEST LOGIC ---
class MockBullet {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 5;
    this.height = 10;
    this.damage = 10;
    this.active = false;
  }
}

class MockEnemy {
  constructor(x, y, hp) {
    this.position = { x, y };
    this.width = 30;
    this.height = 30;
    this.health = hp;
    this.isDead = false;
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }
  }
}

// ==========================================
// TEST SUITE 1: Thuật toán va chạm (AABB Box)
// ==========================================
describe("AABB Collision Algorithm", () => {
  it("phải trả về TRUE khi hai vật thể đè lên nhau (Giao nhau)", () => {
    const bullet = { position: { x: 10, y: 10 }, width: 10, height: 10 };
    const enemy = { position: { x: 15, y: 15 }, width: 20, height: 20 };
    expect(checkCollision(bullet, enemy)).toBe(true);
  });

  it("phải trả về FALSE khi hai vật thể nằm tách biệt hoàn toàn", () => {
    const bullet = { position: { x: 10, y: 10 }, width: 10, height: 10 };
    const enemy = { position: { x: 50, y: 50 }, width: 20, height: 20 };
    expect(checkCollision(bullet, enemy)).toBe(false);
  });

  it("phải trả về FALSE khi hai vật thể chỉ chạm sát mép biên (Không đâm xuyên)", () => {
    const bullet = { position: { x: 10, y: 10 }, width: 10, height: 10 };
    const enemy = { position: { x: 20, y: 10 }, width: 20, height: 20 };
    // bullet cạnh phải là x=20, enemy cạnh trái là x=20 -> X=20 chạm nhau nhưng ko giao nhau
    expect(checkCollision(bullet, enemy)).toBe(false);
  });
});

// ==========================================
// TEST SUITE 2: Cơ chế cấp phát Object Pool
// ==========================================
describe("Object Pool Memory Management", () => {
  let bulletPool;

  beforeEach(() => {
    // Khởi tạo pool với kích thước tối đa là 2 viên đạn
    bulletPool = new ObjectPool(() => new MockBullet(), 2);
  });

  it("phải tái sử dụng object thay vì tạo mới (Zero Allocation)", () => {
    const b1 = bulletPool.get(100, 200);
    expect(b1.active).toBe(true);
    expect(bulletPool.getActiveObjects().length).toBe(1);

    // Bắn viên thứ 2
    const b2 = bulletPool.get(150, 200);
    expect(bulletPool.getActiveObjects().length).toBe(2);

    // Bắn viên thứ 3 (Sẽ thất bại vì Pool size = 2)
    const b3 = bulletPool.get(200, 200);
    expect(b3).toBeNull(); // Xử lý tràn băng đạn (Exhaustion) an toàn
  });

  it("phải cấp phát lại được object sau khi nó được trả về Pool (Recycle)", () => {
    const b1 = bulletPool.get(100, 200);
    const b2 = bulletPool.get(150, 200);

    // Giả lập viên b1 trúng đích, trả về Pool
    b1.active = false;

    // Bắn viên tiếp theo, phải lấy được lại object cũ
    const b3 = bulletPool.get(300, 300);
    expect(b3).not.toBeNull();
    expect(b3.x).toBe(300); // Đã update tọa độ mới
    expect(bulletPool.getActiveObjects().length).toBe(2);
  });
});

// ==========================================
// TEST SUITE 3: Xử lý sát thương & Sinh tử
// ==========================================
describe("Entity Lifecycle: Health & Damage", () => {
  it("phải trừ đúng máu và đổi trạng thái isDead khi HP <= 0", () => {
    const bossEnemy = new MockEnemy(0, 0, 25); // Boss có 25 máu

    bossEnemy.takeDamage(10);
    expect(bossEnemy.health).toBe(15);
    expect(bossEnemy.isDead).toBe(false);

    bossEnemy.takeDamage(20); // Gây over-damage
    expect(bossEnemy.health).toBe(0); // Không bị âm máu
    expect(bossEnemy.isDead).toBe(true);
  });
});
