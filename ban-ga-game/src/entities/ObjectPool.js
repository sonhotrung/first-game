// File: src/entities/ObjectPool.js
export class ObjectPool {
  constructor(createFn, maxSize) {
    this.pool = Array.from({ length: maxSize }, createFn);
  }

  // Lấy một object từ Pool
  get(x, y) {
    const obj = this.pool.find((item) => !item.active);
    if (obj) {
      obj.active = true;
      obj.x = x;
      obj.y = y;
      return obj;
    }
    return null; // Băng đạn đã cạn (Pool exhaustion)
  }

  // Lấy danh sách các object đang hoạt động để Render/Update
  getActiveObjects() {
    return this.pool.filter((item) => item.active);
  }
}
