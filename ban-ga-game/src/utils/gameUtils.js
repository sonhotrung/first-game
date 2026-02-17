// File: src/utils/gameUtils.js

/**
 * Thuật toán AABB kiểm tra va chạm giữa 2 hình chữ nhật
 * @param {Object} rect1 - Object có cấu trúc { position: {x, y}, width, height }
 * @param {Object} rect2 - Object có cấu trúc { position: {x, y}, width, height }
 * @returns {boolean}
 */
export const checkAabbCollision = (rect1, rect2) => {
  return (
    rect1.position.x < rect2.position.x + rect2.width &&
    rect1.position.x + rect1.width > rect2.position.x &&
    rect1.position.y < rect2.position.y + rect2.height &&
    rect1.position.y + rect1.height > rect2.position.y
  );
};

/**
 * Sinh số thực ngẫu nhiên trong một khoảng
 */
export const getRandomFloat = (min, max) => {
  return Math.random() * (max - min) + min;
};
