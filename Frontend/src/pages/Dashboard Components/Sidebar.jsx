// Sidebar.jsx
import React from "react";
import "./styles/Dashboard_Styles/Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li className="active">Dashboard</li>
        <li>Home</li>
      </ul>
    </div>
  );
};

export default Sidebar;
