// src/components/AuthModal/AuthModal.jsx
import React from "react";
import "./AuthModal.css";
import "../../assets/Dialog.css"

export default function AuthModal({ open, onLogin, onCancel }) {
    
    if (!open) return null;

    const handleLogin =() => {
        onLogin();
    }
        const handleCancel =() => {
        onCancel();
    }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Spotify Access Required</h2>
        <p>You need to log in with Spotify to use this app.</p>
        <div className="modal-actions">
          <button className="AuthButton" onClick={handleLogin}>Log In</button>
          <button className="AuthButton" onClick={handleCancel}>Cancel</button>
        </div>
        <p>To use this app you will need to add it to your Spotify Developer dashboard</p>
        <a className="Spotify-Link" href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer">Spotify Dashboard</a>
      </div>
    </div>
  );
}
