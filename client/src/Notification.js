import React from "react";
import "./App.css"; // Use the same CSS file for simplicity

const Notification = ({ message, type, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`notification-container ${type}`}>
      <p className="notification-message">{message}</p>
    </div>
  );
};

export default Notification;
