import React from "react";
import "./LoadingDialog.css";
import "../../assets/Dialog.css"

export default function LoadingDialog({ message }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="spinner"></div>
        <p>{message}</p>
      </div>
    </div>
  );
}
