import React from 'react';
import './Connect.css';

function Connect({ onClick }) {
  return (
    <div className="connect-container">
      <h2>Connect Your Vehicle</h2>
      <p>Click the button below to connect your vehicle to the application.</p>
      <button className="connect-button" onClick={onClick}>
        Connect My Vehicle
      </button>
    </div>
  );
}

export default Connect; 