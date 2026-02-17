import React, { useRef, useEffect, useState } from "react";
import { GAME_CONFIG } from "../constants/GameConfig";
import {
  Player,
  Bullet,
  Enemy,
  Boss,
  BossBullet,
} from "../entities/GameEntities";

// --- HÀM TIỆN ÍCH (UTILS) ---
const getRandomFloat = (min, max) => Math.random() * (max - min) + min;
const checkAabbCollision = (rect1, rect2) => {
  return (
    rect1.position.x < rect2.position.x + rect2.width &&
    rect1.position.x + rect1.width > rect2.position.x &&
    rect1.position.y < rect2.position.y + rect2.height &&
    rect1.position.y + rect1.height > rect2.position.y
  );
};

// --- COMPONENT CHÍNH ---
const GameCanvas = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState(GAME_CONFIG.STATES.MENU);
  const [score, setScore] = useState(0);

  // State lưu trữ Độ khó và Kích thước màn hình
  const [difficulty, setDifficulty] = useState("EASY");
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const engineState = useRef({
    players: [],
    bullets: [],
    enemies: [],
    boss: null,
    bossBullets: [],
    inputs: {
      p1: { left: false, right: false, shoot: false, reload: false },
      p2: { left: false, right: false, shoot: false, reload: false },
    },
    enemySpawnTimer: 0,
  });

  // Lắng nghe sự kiện kéo giãn cửa sổ
  useEffect(() => {
    const handleResize = () =>
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // VÒNG LẶP GAME CHÍNH
  useEffect(() => {
    if (gameState !== GAME_CONFIG.STATES.PLAYING) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    const engine = engineState.current;

    const handleKeyEvent = (e, isKeyDown) => {
      // Nhấn ESC để Tạm dừng
      if (e.code === GAME_CONFIG.KEYS.PAUSE && isKeyDown) {
        setGameState(GAME_CONFIG.STATES.PAUSED);
        return;
      }

      if (e.code === GAME_CONFIG.KEYS.P1.LEFT)
        engine.inputs.p1.left = isKeyDown;
      if (e.code === GAME_CONFIG.KEYS.P1.RIGHT)
        engine.inputs.p1.right = isKeyDown;
      if (e.code === GAME_CONFIG.KEYS.P1.SHOOT)
        engine.inputs.p1.shoot = isKeyDown;
      if (e.code === GAME_CONFIG.KEYS.P1.RELOAD)
        engine.inputs.p1.reload = isKeyDown;

      if (e.code === GAME_CONFIG.KEYS.P2.LEFT)
        engine.inputs.p2.left = isKeyDown;
      if (e.code === GAME_CONFIG.KEYS.P2.RIGHT)
        engine.inputs.p2.right = isKeyDown;
      if (e.code === GAME_CONFIG.KEYS.P2.SHOOT)
        engine.inputs.p2.shoot = isKeyDown;
      if (e.code === GAME_CONFIG.KEYS.P2.RELOAD)
        engine.inputs.p2.reload = isKeyDown;
    };

    const onKeyDown = (e) => handleKeyEvent(e, true);
    const onKeyUp = (e) => handleKeyEvent(e, false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // LOGIC VẬT LÝ
    const updatePhysics = () => {
      // 1. Cập nhật Player
      engine.players.forEach((p, idx) => {
        if (!p || p.markedForDeletion) return;
        const inputStr = idx === 0 ? "p1" : "p2";
        p.update(engine.inputs[inputStr], screenSize.width);

        if (p.canShoot(engine.inputs[inputStr])) {
          engine.bullets.push(
            new Bullet(p.position.x + p.width / 2 - 3, p.position.y),
          );
        }
      });

      // Kiểm tra Game Over
      if (
        engine.players.filter((p) => p && !p.markedForDeletion).length === 0
      ) {
        setGameState(GAME_CONFIG.STATES.GAMEOVER);
        return;
      }

      // 2. Score & Quái/Boss
      setScore((currentScore) => {
        if (currentScore >= GAME_CONFIG.SCORE_TO_BOSS && !engine.boss) {
          engine.boss = new Boss(screenSize.width);
        }
        if (!engine.boss) {
          engine.enemySpawnTimer++;
          if (engine.enemySpawnTimer > 60) {
            const maxSpawnX = Math.max(0, screenSize.width - 30);
            engine.enemies.push(new Enemy(getRandomFloat(0, maxSpawnX), -30));
            engine.enemySpawnTimer = 0;
          }
        }
        return currentScore;
      });

      // 3. Boss Logic
      if (engine.boss) {
        engine.boss.update(screenSize.width);
        if (engine.boss.canShoot()) {
          engine.bossBullets.push(
            new BossBullet(
              engine.boss.position.x + engine.boss.width / 2 - 4,
              engine.boss.position.y + engine.boss.height,
            ),
          );
        }
        engine.bossBullets.forEach((bb) => bb.update(screenSize.height));

        if (engine.boss.hp <= 0) {
          setGameState(GAME_CONFIG.STATES.VICTORY);
          return;
        }
      }

      engine.bullets.forEach((b) => b.update());
      engine.enemies.forEach((e) => e.update(screenSize.height));

      // 4. Va chạm
      engine.bullets.forEach((bullet) => {
        if (bullet.markedForDeletion) return;
        engine.enemies.forEach((enemy) => {
          if (!enemy.markedForDeletion && checkAabbCollision(bullet, enemy)) {
            bullet.markedForDeletion = true;
            enemy.markedForDeletion = true;
            if (!engine.boss) setScore((prev) => prev + 100);
          }
        });
        if (engine.boss && checkAabbCollision(bullet, engine.boss)) {
          bullet.markedForDeletion = true;
          engine.boss.takeDamage();
        }
      });

      engine.players.forEach((p) => {
        if (p.markedForDeletion) return;
        engine.enemies.forEach((enemy) => {
          if (!enemy.markedForDeletion && checkAabbCollision(enemy, p)) {
            enemy.markedForDeletion = true;
            p.takeDamage();
          }
        });
        engine.bossBullets.forEach((bb) => {
          if (!bb.markedForDeletion && checkAabbCollision(bb, p)) {
            bb.markedForDeletion = true;
            p.takeDamage();
          }
        });
        if (engine.boss && checkAabbCollision(engine.boss, p)) p.takeDamage();
      });

      // 5. Dọn rác
      engine.bullets = engine.bullets.filter((b) => !b.markedForDeletion);
      engine.enemies = engine.enemies.filter((e) => !e.markedForDeletion);
      engine.bossBullets = engine.bossBullets.filter(
        (bb) => !bb.markedForDeletion,
      );
    };

    // VẼ LÊN MÀN HÌNH
    const drawScreen = () => {
      ctx.fillStyle = "#0a0a2a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      engine.players.forEach((p) => p && !p.markedForDeletion && p.draw(ctx));
      engine.bullets.forEach((b) => b.draw(ctx));
      engine.enemies.forEach((e) => e.draw(ctx));

      if (engine.boss) engine.boss.draw(ctx);
      engine.bossBullets.forEach((bb) => bb.draw(ctx));
    };

    const gameLoop = () => {
      updatePhysics();
      drawScreen();
      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [gameState, screenSize, difficulty]);

  // --- LOGIC KHỞI TẠO GAME ---
  const startGame = (mode) => {
    // Lấy cấu hình dựa vào độ khó đã chọn trên UI
    const diffConfig = GAME_CONFIG.DIFFICULTY[difficulty];

    const p1 = new Player(
      screenSize.width / 2 + 50,
      screenSize.height,
      "#00ff00",
      "P1",
      diffConfig,
    );
    const p2 = new Player(
      screenSize.width / 2 - 90,
      screenSize.height,
      "#00aaff",
      "P2",
      diffConfig,
    );
    const activePlayers = mode === "SINGLE" ? [p1] : [p1, p2];

    engineState.current = {
      players: activePlayers,
      bullets: [],
      enemies: [],
      bossBullets: [],
      boss: null,
      inputs: {
        p1: { left: false, right: false, shoot: false, reload: false },
        p2: { left: false, right: false, shoot: false, reload: false },
      },
      enemySpawnTimer: 0,
    };
    setScore(0);
    setGameState(GAME_CONFIG.STATES.PLAYING);
  };

  const backToMenu = () => setGameState(GAME_CONFIG.STATES.MENU);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      {/* UI KHI ĐANG CHƠI (SCORE & NÚT PAUSE) */}
      {(gameState === GAME_CONFIG.STATES.PLAYING ||
        gameState === GAME_CONFIG.STATES.PAUSED) && (
        <>
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              color: "white",
              zIndex: 10,
              fontFamily: "monospace",
              fontSize: "24px",
              textShadow: "2px 2px 2px black",
            }}
          >
            SCORE:{" "}
            {score >= GAME_CONFIG.SCORE_TO_BOSS
              ? "BOSS FIGHT!"
              : `${score} / ${GAME_CONFIG.SCORE_TO_BOSS}`}
          </div>

          {gameState === GAME_CONFIG.STATES.PLAYING && (
            <button
              onClick={() => setGameState(GAME_CONFIG.STATES.PAUSED)}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                zIndex: 10,
                padding: "10px 15px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "1px solid white",
                borderRadius: "5px",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: "18px",
              }}
            >
              ⏸ PAUSE (ESC)
            </button>
          )}
        </>
      )}

      <canvas
        ref={canvasRef}
        width={screenSize.width}
        height={screenSize.height}
        style={{ display: "block" }}
      />

      {/* MÀN HÌNH MENU & CHỌN ĐỘ KHÓ */}
      {gameState === GAME_CONFIG.STATES.MENU && (
        <div style={overlayStyle}>
          <h1
            style={{
              color: "white",
              fontSize: "60px",
              marginBottom: "20px",
              textShadow: "0 0 10px #00ff00",
            }}
          >
            SPACE SHOOTER
          </h1>

          {/* VÙNG CHỌN ĐỘ KHÓ */}
          <h3 style={{ color: "white", marginBottom: "10px" }}>
            SELECT DIFFICULTY:
          </h3>
          <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
            <button
              onClick={() => setDifficulty("EASY")}
              style={{
                ...diffBtnStyle,
                backgroundColor: difficulty === "EASY" ? "#4CAF50" : "#222",
                borderColor: difficulty === "EASY" ? "white" : "#555",
              }}
            >
              EASY
            </button>
            <button
              onClick={() => setDifficulty("HARD")}
              style={{
                ...diffBtnStyle,
                backgroundColor: difficulty === "HARD" ? "#f39c12" : "#222",
                borderColor: difficulty === "HARD" ? "white" : "#555",
              }}
            >
              HARD
            </button>
            <button
              onClick={() => setDifficulty("TROLL")}
              style={{
                ...diffBtnStyle,
                backgroundColor: difficulty === "TROLL" ? "#e74c3c" : "#222",
                borderColor: difficulty === "TROLL" ? "white" : "#555",
              }}
            >
              TROLL
            </button>
          </div>

          <button onClick={() => startGame("SINGLE")} style={buttonStyle}>
            1 PLAYER
          </button>
          <button onClick={() => startGame("COOP")} style={buttonStyle}>
            2 PLAYERS CO-OP
          </button>
          <button
            onClick={() => setGameState(GAME_CONFIG.STATES.INSTRUCTIONS)}
            style={{ ...buttonStyle, backgroundColor: "#555" }}
          >
            HOW TO PLAY
          </button>
        </div>
      )}

      {/* MÀN HÌNH HƯỚNG DẪN */}
      {gameState === GAME_CONFIG.STATES.INSTRUCTIONS && (
        <div style={overlayStyle}>
          <h1 style={{ color: "yellow", fontSize: "40px" }}>INSTRUCTIONS</h1>
          <div
            style={{
              color: "white",
              fontSize: "20px",
              lineHeight: "1.8",
              textAlign: "left",
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: "30px",
              borderRadius: "10px",
            }}
          >
            <p>
              <b>Player 1 (Green):</b> Move: [⬅️ ➡️] | Shoot: [⬆️] | Reload:
              [⬇️]
            </p>
            <p>
              <b>Player 2 (Blue):</b> Move: [A D] | Shoot: [W] | Reload: [S]
            </p>
            <hr style={{ borderColor: "#555" }} />
            <p>
              💀 Reach <b>{GAME_CONFIG.SCORE_TO_BOSS} points</b> to summon the
              Boss.
            </p>
            <p>⏱️ Change Difficulty to test your reload speed limit.</p>
            <p>
              ⏸ Press <b>ESC</b> anytime to Pause the game.
            </p>
          </div>
          <button
            onClick={backToMenu}
            style={{
              ...buttonStyle,
              marginTop: "40px",
              backgroundColor: "#e74c3c",
            }}
          >
            BACK TO MENU
          </button>
        </div>
      )}

      {/* MÀN HÌNH PAUSE */}
      {gameState === GAME_CONFIG.STATES.PAUSED && (
        <div style={overlayStyle}>
          <h1 style={{ color: "yellow", fontSize: "50px" }}>PAUSED</h1>
          <button
            onClick={() => setGameState(GAME_CONFIG.STATES.PLAYING)}
            style={buttonStyle}
          >
            RESUME
          </button>
          <button
            onClick={backToMenu}
            style={{ ...buttonStyle, backgroundColor: "#e74c3c" }}
          >
            QUIT TO MENU
          </button>
        </div>
      )}

      {/* MÀN HÌNH GAME OVER */}
      {gameState === GAME_CONFIG.STATES.GAMEOVER && (
        <div style={overlayStyle}>
          <h1 style={{ color: "red", fontSize: "60px" }}>GAME OVER</h1>
          <h2 style={{ color: "white", marginBottom: "30px" }}>
            FINAL SCORE: {score}
          </h2>
          <button onClick={() => startGame("SINGLE")} style={buttonStyle}>
            RETRY (1P)
          </button>
          <button onClick={() => startGame("COOP")} style={buttonStyle}>
            RETRY (2P)
          </button>
          <button
            onClick={backToMenu}
            style={{ ...buttonStyle, backgroundColor: "#555" }}
          >
            MENU
          </button>
        </div>
      )}

      {/* MÀN HÌNH CHIẾN THẮNG */}
      {gameState === GAME_CONFIG.STATES.VICTORY && (
        <div style={overlayStyle}>
          <h1 style={{ color: "gold", fontSize: "60px" }}>VICTORY!</h1>
          <h2 style={{ color: "white", marginBottom: "30px" }}>
            Galaxy is safe again!
          </h2>
          <button onClick={backToMenu} style={buttonStyle}>
            BACK TO MENU
          </button>
        </div>
      )}
    </div>
  );
};

// Các style UI
const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,10,0.9)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 20,
};
const buttonStyle = {
  width: "250px",
  padding: "15px 24px",
  fontSize: "18px",
  fontWeight: "bold",
  cursor: "pointer",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "8px",
  margin: "10px",
};
const diffBtnStyle = {
  padding: "10px 20px",
  cursor: "pointer",
  fontWeight: "bold",
  borderRadius: "5px",
  color: "white",
  borderStyle: "solid",
  borderWidth: "2px",
};

export default GameCanvas;
