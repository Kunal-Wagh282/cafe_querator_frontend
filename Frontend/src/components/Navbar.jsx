import React from 'react';
import '../styles/Navbar.css'; // Import your CSS for the navbar

const Navbar = ({cafeName}) => {
  return (
    <div className="navbar">
      <div className="title">Welcome to Cafe {cafeName}</div>
    </div>
  );
};

export default Navbar;
