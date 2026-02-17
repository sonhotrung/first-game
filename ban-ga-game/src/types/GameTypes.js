/**
 * @typedef {Object} Vector2D
 * @property {number} x - Tọa độ trục X
 * @property {number} y - Tọa độ trục Y
 */

/**
 * @typedef {Object} InputState
 * @property {boolean} left - Trạng thái phím mũi tên trái
 * @property {boolean} right - Trạng thái phím mũi tên phải
 * @property {boolean} shoot - Trạng thái phím bắn

/**
 * @typedef {Object} GlobalGameState
 * @property {string} current - Trạng thái hiện tại (MENU, PLAYING...)
 * @property {number} score - Điểm số của người chơi
 * @property {number} lives - Số mạng còn lại của Player
 * @property {InputState} inputs - Trạng thái bàn phím realtime
 */
