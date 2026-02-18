import React, { useRef, useEffect, useState } from "react";
import { GAME_CONFIG } from "../constants/GameConfig";
import {
  Player,
  Bullet,
  Enemy,
  Boss,
  BossBullet,
} from "../entities/GameEntities";

const getRandomFloat = (min, max) => Math.random() * (max - min) + min;
const checkAabbCollision = (rect1, rect2) => {
  return (
    rect1.position.x < rect2.position.x + rect2.width &&
    rect1.position.x + rect1.width > rect2.position.x &&
    rect1.position.y < rect2.position.y + rect2.height &&
    rect1.position.y + rect1.height > rect2.position.y
  );
};

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState(GAME_CONFIG.STATES.MENU);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState("EASY");
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [p1Weapon, setP1Weapon] = useState("DEFAULT");
  const [p2Weapon, setP2Weapon] = useState("DEFAULT");
  const [activeMode, setActiveMode] = useState("SINGLE");

  // --- CÁC STATE CHO MOBILE CONTROLS ---
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [swapControls, setSwapControls] = useState(false); // false: Bắn Trái/Di chuyển Phải | true: Ngược lại

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

  useEffect(() => {
    // Nhận diện thiết bị cảm ứng
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);

    const handleResize = () =>
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (
      gameState !== GAME_CONFIG.STATES.PLAYING &&
      gameState !== GAME_CONFIG.STATES.TEST_WEAPONS
    )
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    const engine = engineState.current;
    const isTestMode = gameState === GAME_CONFIG.STATES.TEST_WEAPONS;

    // Lắng nghe Bàn phím máy tính
    const handleKeyEvent = (e, isKeyDown) => {
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

    // VÒNG LẶP GAME VẬT LÝ (Giữ nguyên như cũ)
    const updatePhysics = () => {
      engine.players.forEach((p, idx) => {
        if (!p || p.markedForDeletion) return;
        const inputStr = idx === 0 ? "p1" : "p2";
        p.update(engine.inputs[inputStr], screenSize.width);

        const firedBulletsCount = p.canShoot(engine.inputs[inputStr]);
        if (firedBulletsCount > 0) {
          const weaponInfo = p.weapon;
          for (let i = 0; i < firedBulletsCount; i++) {
            let angleDeg = 0;
            if (weaponInfo.spreadAngle > 0) {
              if (firedBulletsCount > 1) {
                const step = weaponInfo.spreadAngle / (firedBulletsCount - 1);
                angleDeg = -weaponInfo.spreadAngle / 2 + step * i;
              } else {
                angleDeg = (Math.random() - 0.5) * weaponInfo.spreadAngle;
              }
            }
            const angleRad = angleDeg * (Math.PI / 180);
            const speed = Math.abs(GAME_CONFIG.BULLET_SPEED);
            const vx = Math.sin(angleRad) * speed;
            const vy = -Math.cos(angleRad) * speed;
            engine.bullets.push(
              new Bullet(
                p.position.x + p.width / 2 - 3,
                p.position.y,
                weaponInfo.damage,
                vx,
                vy,
                weaponInfo.color,
                weaponInfo.maxPierce,
              ),
            );
          }
        }
      });

      if (
        !isTestMode &&
        engine.players.filter((p) => p && !p.markedForDeletion).length === 0
      ) {
        setGameState(GAME_CONFIG.STATES.GAMEOVER);
        return;
      }

      if (!isTestMode) {
        setScore((currentScore) => {
          if (currentScore >= GAME_CONFIG.SCORE_TO_BOSS && !engine.boss) {
            engine.boss = new Boss(screenSize.width);
            engine.enemies = [];
            engine.bullets = [];
          }
          if (!engine.boss) {
            engine.enemySpawnTimer++;
            if (engine.enemySpawnTimer > 60) {
              let spawnHp = 3;
              let spawnColor = "#ff4444";
              if (currentScore >= 6000 && currentScore < 8000) {
                spawnHp = 5;
                spawnColor = "#ffaa00";
              } else if (currentScore >= 8000) {
                spawnHp = 8;
                spawnColor = "#aa00ff";
              }
              engine.enemies.push(
                new Enemy(
                  getRandomFloat(0, Math.max(0, screenSize.width - 30)),
                  -30,
                  spawnHp,
                  spawnColor,
                ),
              );
              engine.enemySpawnTimer = 0;
            }
          }
          return currentScore;
        });

        if (engine.boss) {
          engine.boss.update(screenSize.width, engine.enemies);
          if (engine.boss.canShoot())
            engine.bossBullets.push(
              new BossBullet(
                engine.boss.position.x + engine.boss.width / 2 - 4,
                engine.boss.position.y + engine.boss.height,
              ),
            );
          engine.bossBullets.forEach((bb) => bb.update(screenSize.height));
          if (engine.boss.hp <= 0) {
            setGameState(GAME_CONFIG.STATES.VICTORY);
            return;
          }
        }
      } else {
        engine.enemySpawnTimer++;
        if (engine.enemySpawnTimer > 40) {
          engine.enemies.push(
            new Enemy(
              getRandomFloat(0, Math.max(0, screenSize.width - 30)),
              -30,
              8,
              "#aa00ff",
            ),
          );
          engine.enemySpawnTimer = 0;
        }
      }

      engine.bullets.forEach((b) => b.update());
      engine.enemies.forEach((e) => e.update(screenSize.height));

      engine.bullets.forEach((bullet) => {
        if (bullet.markedForDeletion) return;
        engine.enemies.forEach((enemy) => {
          if (
            !enemy.markedForDeletion &&
            !bullet.hitEntities.has(enemy) &&
            checkAabbCollision(bullet, enemy)
          ) {
            bullet.hitEntities.add(enemy);
            bullet.hitCount++;
            let actualDamage = bullet.damage;
            if (bullet.maxPierce > 1)
              actualDamage = bullet.damage / Math.pow(2, bullet.hitCount - 1);
            enemy.hp -= actualDamage;
            if (enemy.hp <= 0) {
              enemy.markedForDeletion = true;
              if (!engine.boss && !isTestMode) setScore((prev) => prev + 100);
            }
            if (bullet.hitCount >= bullet.maxPierce)
              bullet.markedForDeletion = true;
          }
        });

        if (
          engine.boss &&
          !bullet.hitEntities.has(engine.boss) &&
          checkAabbCollision(bullet, engine.boss)
        ) {
          bullet.hitEntities.add(engine.boss);
          bullet.hitCount++;
          let actualDamage = bullet.damage;
          if (bullet.maxPierce > 1)
            actualDamage = bullet.damage / Math.pow(2, bullet.hitCount - 1);
          engine.boss.takeDamage(actualDamage);
          if (bullet.hitCount >= bullet.maxPierce)
            bullet.markedForDeletion = true;
        }
      });

      if (!isTestMode) {
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
      }

      engine.bullets = engine.bullets.filter((b) => !b.markedForDeletion);
      engine.enemies = engine.enemies.filter((e) => !e.markedForDeletion);
      engine.bossBullets = engine.bossBullets.filter(
        (bb) => !bb.markedForDeletion,
      );
    };

    const drawScreen = () => {
      ctx.fillStyle = isTestMode ? "#001100" : "#0a0a2a";
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
  }, [gameState, screenSize]);

  const prepareGame = (mode) => {
    setActiveMode(mode);
    setP1Weapon("DEFAULT");
    setP2Weapon("DEFAULT");

    if (mode === "TEST") {
      const diffConfig = GAME_CONFIG.DIFFICULTY[difficulty];
      const p1 = new Player(
        screenSize.width / 2,
        screenSize.height,
        "#00ff00",
        "P1",
        diffConfig,
      );
      engineState.current = {
        players: [p1],
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
      setGameState(GAME_CONFIG.STATES.TEST_WEAPONS);
    } else {
      setGameState(GAME_CONFIG.STATES.WEAPON_SELECT);
    }
  };

  const startGame = () => {
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
    const activePlayers = activeMode === "SINGLE" ? [p1] : [p1, p2];

    activePlayers[0].equipWeapon(p1Weapon);
    if (activePlayers[1]) activePlayers[1].equipWeapon(p2Weapon);

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

  const testEquipWeapon = (weaponKey) => {
    if (engineState.current.players[0])
      engineState.current.players[0].equipWeapon(weaponKey);
  };

  // Hàm xử lý tương tác Cảm ứng (Touch) bơm thẳng vào engine
  const handleTouch = (player, action, isDown) => (e) => {
    e.preventDefault(); // Ngăn zoom/scroll web
    if (engineState.current.inputs[player] !== undefined) {
      engineState.current.inputs[player][action] = isDown;
    }
  };

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
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* UI LÚC CHƠI BÌNH THƯỜNG */}
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
              pointerEvents: "none",
            }}
          >
            SCORE:{" "}
            {score >= GAME_CONFIG.SCORE_TO_BOSS
              ? "BOSS FIGHT!"
              : `${score} / ${GAME_CONFIG.SCORE_TO_BOSS}`}
          </div>
          {/* Nút Pause cho PC (Chỉ hiện khi ko có touch) */}
          {gameState === GAME_CONFIG.STATES.PLAYING && !isTouchDevice && (
            <button
              onPointerDown={() => setGameState(GAME_CONFIG.STATES.PAUSED)}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                zIndex: 15,
                padding: isTouchDevice ? "10px 15px" : "10px 15px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "2px solid white",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: isTouchDevice ? "24px" : "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "auto",
              }}
            >
              {isTouchDevice ? "⏸" : "⏸ PAUSE (ESC)"}
            </button>
          )}
        </>
      )}

      {/* --- MOBILE: JOYPAD CẢM ỨNG TRÊN MÀN HÌNH --- */}
      {isTouchDevice && gameState === GAME_CONFIG.STATES.PLAYING && (
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            padding: "0 20px",
            boxSizing: "border-box",
            zIndex: 15,
            pointerEvents: "none",
          }}
        >
          {/* Nút VUÔNG PAUSE Ở GIỮA */}
          <div
            style={{
              position: "absolute",
              top: "-100px",
              left: "50%",
              transform: "translateX(-50%)",
              pointerEvents: "auto",
            }}
          >
            <button
              onPointerDown={() => setGameState(GAME_CONFIG.STATES.PAUSED)}
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                border: "2px solid white",
                fontSize: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              ⏸
            </button>
          </div>

          {activeMode === "SINGLE" ? (
            <>
              {/* CHƠI ĐƠN: Group Bắn/Nạp (Mặc định bên Trái) */}
              <div
                style={{
                  pointerEvents: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                  order: swapControls ? 2 : 1,
                }}
              >
                <button
                  onPointerDown={handleTouch("p1", "shoot", true)}
                  onPointerUp={handleTouch("p1", "shoot", false)}
                  onPointerLeave={handleTouch("p1", "shoot", false)}
                  style={touchBtnStyle}
                >
                  🔫
                </button>
                <button
                  onPointerDown={handleTouch("p1", "reload", true)}
                  onPointerUp={handleTouch("p1", "reload", false)}
                  onPointerLeave={handleTouch("p1", "reload", false)}
                  style={touchBtnStyle}
                >
                  🔄
                </button>
              </div>

              {/* CHƠI ĐƠN: Group Di Chuyển (Mặc định bên Phải) */}
              <div
                style={{
                  pointerEvents: "auto",
                  display: "flex",
                  gap: "15px",
                  alignItems: "flex-end",
                  order: swapControls ? 1 : 2,
                }}
              >
                <button
                  onPointerDown={handleTouch("p1", "left", true)}
                  onPointerUp={handleTouch("p1", "left", false)}
                  onPointerLeave={handleTouch("p1", "left", false)}
                  style={touchBtnStyle}
                >
                  ⬅️
                </button>
                <button
                  onPointerDown={handleTouch("p1", "right", true)}
                  onPointerUp={handleTouch("p1", "right", false)}
                  onPointerLeave={handleTouch("p1", "right", false)}
                  style={touchBtnStyle}
                >
                  ➡️
                </button>
              </div>
            </>
          ) : (
            <>
              {/* CO-OP: Nửa trái cho P1 (Xanh lá) */}
              <div
                style={{
                  pointerEvents: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onPointerDown={handleTouch("p1", "left", true)}
                    onPointerUp={handleTouch("p1", "left", false)}
                    onPointerLeave={handleTouch("p1", "left", false)}
                    style={{
                      ...touchBtnStyle,
                      borderColor: "#00ff00",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    ⬅️
                  </button>
                  <button
                    onPointerDown={handleTouch("p1", "right", true)}
                    onPointerUp={handleTouch("p1", "right", false)}
                    onPointerLeave={handleTouch("p1", "right", false)}
                    style={{
                      ...touchBtnStyle,
                      borderColor: "#00ff00",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    ➡️
                  </button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onPointerDown={handleTouch("p1", "shoot", true)}
                    onPointerUp={handleTouch("p1", "shoot", false)}
                    onPointerLeave={handleTouch("p1", "shoot", false)}
                    style={{
                      ...touchBtnStyle,
                      borderColor: "#00ff00",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    🔫
                  </button>
                  <button
                    onPointerDown={handleTouch("p1", "reload", true)}
                    onPointerUp={handleTouch("p1", "reload", false)}
                    onPointerLeave={handleTouch("p1", "reload", false)}
                    style={{
                      ...touchBtnStyle,
                      borderColor: "#00ff00",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    🔄
                  </button>
                </div>
              </div>

              {/* CO-OP: Nửa phải cho P2 (Xanh biển) */}
              <div
                style={{
                  pointerEvents: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  alignItems: "flex-end",
                }}
              >
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onPointerDown={handleTouch("p2", "left", true)}
                    onPointerUp={handleTouch("p2", "left", false)}
                    onPointerLeave={handleTouch("p2", "left", false)}
                    style={{
                      ...touchBtnStyle,
                      borderColor: "#00aaff",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    ⬅️
                  </button>
                  <button
                    onPointerDown={handleTouch("p2", "right", true)}
                    onPointerUp={handleTouch("p2", "right", false)}
                    onPointerLeave={handleTouch("p2", "right", false)}
                    style={{
                      ...touchBtnStyle,
                      borderColor: "#00aaff",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    ➡️
                  </button>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onPointerDown={handleTouch("p2", "shoot", true)}
                    onPointerUp={handleTouch("p2", "shoot", false)}
                    onPointerLeave={handleTouch("p2", "shoot", false)}
                    style={{
                      ...touchBtnStyle,
                      borderColor: "#00aaff",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    🔫
                  </button>
                  <button
                    onPointerDown={handleTouch("p2", "reload", true)}
                    onPointerUp={handleTouch("p2", "reload", false)}
                    onPointerLeave={handleTouch("p2", "reload", false)}
                    style={{
                      ...touchBtnStyle,
                      borderColor: "#00aaff",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    🔄
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* CÁC GIAO DIỆN KHÁC */}
      <canvas
        ref={canvasRef}
        width={screenSize.width}
        height={screenSize.height}
        style={{ display: "block" }}
      />

      {gameState === GAME_CONFIG.STATES.TEST_WEAPONS && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            padding: "0 20px",
            boxSizing: "border-box",
            zIndex: 10,
          }}
        >
          <h2 style={{ color: "lime", marginRight: "20px", margin: "5px 0" }}>
            SHOOTING RANGE
          </h2>
          {Object.keys(GAME_CONFIG.WEAPONS).map((wKey) => (
            <button
              key={wKey}
              onClick={() => testEquipWeapon(wKey)}
              style={{
                padding: "8px 15px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {GAME_CONFIG.WEAPONS[wKey].name}
            </button>
          ))}
          <button
            onClick={() => setGameState(GAME_CONFIG.STATES.MENU)}
            style={{
              padding: "8px 15px",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              marginLeft: "20px",
            }}
          >
            EXIT
          </button>
        </div>
      )}

      {gameState === GAME_CONFIG.STATES.MENU && (
        <div style={overlayStyle}>
          <h1
            style={{
              color: "white",
              fontSize: "40px",
              marginBottom: "20px",
              textShadow: "0 0 10px #00ff00",
              textAlign: "center",
            }}
          >
            SPACE SHOOTER
          </h1>

          <h3 style={{ color: "white", marginBottom: "10px" }}>DIFFICULTY:</h3>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "30px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
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

          <button onClick={() => prepareGame("SINGLE")} style={buttonStyle}>
            1 PLAYER
          </button>
          <button onClick={() => prepareGame("COOP")} style={buttonStyle}>
            2 PLAYERS CO-OP
          </button>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            <button
              onClick={() => setGameState(GAME_CONFIG.STATES.INSTRUCTIONS)}
              style={{
                ...buttonStyle,
                width: "150px",
                backgroundColor: "#555",
              }}
            >
              HOW TO PLAY
            </button>
            <button
              onClick={() => prepareGame("TEST")}
              style={{
                ...buttonStyle,
                width: "150px",
                backgroundColor: "#8e44ad",
              }}
            >
              TEST WEAPONS
            </button>
          </div>
        </div>
      )}

      {gameState === GAME_CONFIG.STATES.INSTRUCTIONS && (
        <div style={overlayStyle}>
          <h1 style={{ color: "yellow", fontSize: "30px" }}>INSTRUCTIONS</h1>
          <div
            style={{
              color: "white",
              fontSize: "16px",
              lineHeight: "1.8",
              textAlign: "left",
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: "20px",
              borderRadius: "10px",
              maxWidth: "90%",
            }}
          >
            <p>
              <b>PC Player 1:</b> [⬅️ ➡️] | Shoot: [⬆️] | Reload: [⬇️]
            </p>
            <p>
              <b>PC Player 2:</b> [A D] | Shoot: [W] | Reload: [S]
            </p>
            <p>
              <b>Mobile:</b> Use On-screen touch buttons.
            </p>
            <hr style={{ borderColor: "#555" }} />
            <p>
              💀 Reach <b>{GAME_CONFIG.SCORE_TO_BOSS} points</b> to summon the
              Boss.
            </p>
          </div>
          <button
            onClick={() => setGameState(GAME_CONFIG.STATES.MENU)}
            style={{
              ...buttonStyle,
              marginTop: "20px",
              backgroundColor: "#e74c3c",
            }}
          >
            BACK
          </button>
        </div>
      )}

      {gameState === GAME_CONFIG.STATES.WEAPON_SELECT && (
        <div style={overlayStyle}>
          <h1
            style={{
              color: "gold",
              fontSize: "30px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            CHOOSE WEAPONS
          </h1>

          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                border: "2px solid #00ff00",
                padding: "15px",
                borderRadius: "10px",
                backgroundColor: "rgba(0,255,0,0.1)",
                minWidth: "150px",
              }}
            >
              <h3
                style={{
                  color: "#00ff00",
                  textAlign: "center",
                  margin: "0 0 10px 0",
                }}
              >
                PLAYER 1
              </h3>
              {Object.keys(GAME_CONFIG.WEAPONS).map((w) => (
                <div key={w}>
                  <label
                    style={{
                      color: "white",
                      fontSize: "14px",
                      display: "block",
                      margin: "8px 0",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="p1Weapon"
                      value={w}
                      checked={p1Weapon === w}
                      onChange={(e) => setP1Weapon(e.target.value)}
                      style={{ transform: "scale(1.2)", marginRight: "10px" }}
                    />
                    {GAME_CONFIG.WEAPONS[w].name}
                  </label>
                </div>
              ))}
            </div>

            {activeMode === "COOP" && (
              <div
                style={{
                  border: "2px solid #00aaff",
                  padding: "15px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(0,170,255,0.1)",
                  minWidth: "150px",
                }}
              >
                <h3
                  style={{
                    color: "#00aaff",
                    textAlign: "center",
                    margin: "0 0 10px 0",
                  }}
                >
                  PLAYER 2
                </h3>
                {Object.keys(GAME_CONFIG.WEAPONS).map((w) => (
                  <div key={w}>
                    <label
                      style={{
                        color: "white",
                        fontSize: "14px",
                        display: "block",
                        margin: "8px 0",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="p2Weapon"
                        value={w}
                        checked={p2Weapon === w}
                        onChange={(e) => setP2Weapon(e.target.value)}
                        style={{ transform: "scale(1.2)", marginRight: "10px" }}
                      />
                      {GAME_CONFIG.WEAPONS[w].name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "30px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => setGameState(GAME_CONFIG.STATES.MENU)}
              style={{
                ...buttonStyle,
                backgroundColor: "#555",
                width: "120px",
              }}
            >
              BACK
            </button>
            <button
              onClick={startGame}
              style={{
                ...buttonStyle,
                backgroundColor: "#4CAF50",
                width: "200px",
              }}
            >
              START MISSION
            </button>
          </div>
        </div>
      )}

      {/* MÀN HÌNH PAUSE: CÓ THÊM NÚT ĐỔI BÊN TAY CẦM CHO MOBILE */}
      {gameState === GAME_CONFIG.STATES.PAUSED && (
        <div style={overlayStyle}>
          <h1
            style={{ color: "yellow", fontSize: "50px", marginBottom: "20px" }}
          >
            PAUSED
          </h1>
          <button
            onClick={() => setGameState(GAME_CONFIG.STATES.PLAYING)}
            style={{ ...buttonStyle, marginBottom: "20px" }}
          >
            RESUME
          </button>

          {/* Nút SWAP CONTROLS chỉ hiện trên điện thoại ở chế độ 1 Người */}
          {isTouchDevice && activeMode === "SINGLE" && (
            <button
              onClick={() => setSwapControls(!swapControls)}
              style={{
                ...buttonStyle,
                backgroundColor: "#3498db",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              {swapControls ? "🔄 L: MOVE | R: SHOOT" : "🔄 L: SHOOT | R: MOVE"}
            </button>
          )}

          <button
            onClick={() => setGameState(GAME_CONFIG.STATES.MENU)}
            style={{ ...buttonStyle, backgroundColor: "#e74c3c" }}
          >
            QUIT
          </button>
        </div>
      )}

      {gameState === GAME_CONFIG.STATES.GAMEOVER && (
        <div style={overlayStyle}>
          <h1 style={{ color: "red", fontSize: "50px" }}>GAME OVER</h1>
          <button
            onClick={() => setGameState(GAME_CONFIG.STATES.MENU)}
            style={{ ...buttonStyle, backgroundColor: "#555" }}
          >
            MENU
          </button>
        </div>
      )}
      {gameState === GAME_CONFIG.STATES.VICTORY && (
        <div style={overlayStyle}>
          <h1 style={{ color: "gold", fontSize: "50px" }}>VICTORY!</h1>
          <button
            onClick={() => setGameState(GAME_CONFIG.STATES.MENU)}
            style={buttonStyle}
          >
            MENU
          </button>
        </div>
      )}
    </div>
  );
};

// CÁC STYLE CSS MẶC ĐỊNH
const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,10,0.95)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 20,
  overflowY: "auto",
  padding: "20px",
  boxSizing: "border-box",
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
  margin: "5px",
  touchAction: "manipulation",
};
const diffBtnStyle = {
  padding: "10px 15px",
  cursor: "pointer",
  fontWeight: "bold",
  borderRadius: "5px",
  color: "white",
  borderStyle: "solid",
  borderWidth: "2px",
  touchAction: "manipulation",
};

// STYLE RIÊNG CHO CÁC NÚT BẤM TRÊN MÀN HÌNH CẢM ỨNG
const touchBtnStyle = {
  width: "65px",
  height: "65px",
  borderRadius: "50%", // Làm tròn thành hình tròn hoàn hảo
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  border: "2px solid rgba(255,255,255,0.5)",
  color: "white",
  fontSize: "24px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  userSelect: "none", // Chống highlight đen màn hình khi bấm nhanh
};

export default GameCanvas;
