// File: src/pages/Dashboard.jsx (Hệ thống lớn của bạn)
import React, { Suspense, lazy } from "react";

// Import động (Dynamic Import)
const GameCanvas = lazy(() => import("../components/GameCanvas"));

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <h2>Khu vực Giải trí</h2>
      {/* Hiển thị Loading UI trong lúc tải file JS của Game */}
      <Suspense
        fallback={<div className="spinner">Đang tải Game Engine...</div>}
      >
        <GameCanvas />
      </Suspense>
    </div>
  );
};
