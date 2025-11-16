import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardPage.css"; // optional, for styles

const DashboardPage = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";

  const handleLogout = () => {
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Welcome, {userName}! 🎉</h1>
        <p>You’ve successfully logged in using facial recognition.</p>

        <div className="dashboard-actions">
          <button onClick={() => alert("Profile section coming soon!")}>
            View Profile
          </button>
          <button onClick={() => alert("Settings coming soon!")}>
            Settings
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
