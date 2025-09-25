import React from "react";
//import "./AddPlaylist.css";
import "../../assets/Dialog.css"

export default function PlaylistNameDialog({ title, onClose, onConfirm, confirmLabel = "Add", cancelLabel = "Cancel", children }) {
  return (
     <div className="modal-backdrop">
      <div className="modal">
        <h2>{title}</h2>

        <div className="Modal-content">
          {children}
        </div>

        <div className="modal-actions">
          <button className="AuthButton" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className="AuthButton" onClick={onClose}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
