// File: jest.setup.js
// Giả lập Canvas API tĩnh để chạy độc lập trên Node
global.HTMLCanvasElement.prototype.getContext = () => {
  return {
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    drawImage: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
  };
};

// Giả lập Web Audio API (Nếu sau này dùng tới)
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn(),
  createGain: jest.fn(),
  decodeAudioData: jest.fn(),
}));
