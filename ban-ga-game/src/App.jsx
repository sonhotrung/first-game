import GameCanvas from "./components/GameCanvas";

function App() {
  return (
    <div style={{ backgroundColor: "#222", height: "100vh", padding: "20px" }}>
      <h1 style={{ color: "white", textAlign: "center" }}>
        Game Bắn Gà Cơ Bản
      </h1>
      <GameCanvas />
    </div>
  );
}

export default App;
