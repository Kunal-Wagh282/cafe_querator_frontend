// TableStatus.jsx
import React from "react";
import "./styles/Dashboard_Styles/TableStatus.css";

const TableStatus = () => {
  return (
    <div className="table-status">
      <h2>Online Tables:</h2>
      <div className="table-grid">
        {[1, 2, 3, 4].map((tableNumber) => (
          <div key={tableNumber} className="table-item">
            <span>{tableNumber}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableStatus;
