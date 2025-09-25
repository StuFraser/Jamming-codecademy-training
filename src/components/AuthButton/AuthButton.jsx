import React from "react";
import { Lock, Unlock } from "lucide-react"; // simple padlock icons
import "./AuthButton.css"

export default function AuthButton({ isAuthenticated, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`auth-button ${isAuthenticated ? "auth-button-unlock" : "auth-button-lock"}`}
    >
      {isAuthenticated ? (
        <Unlock  />
      ) : (
        <Lock />
      )}
    </button>
  );
}