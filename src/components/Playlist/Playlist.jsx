import React, { useState } from "react";
import Select from "react-select";
import "./Playlist.css";
import TrackList from "../TrackList/TrackList";
import PlaylistNameDialog from "../PlaylistNameDialog/PlaylistNameDialog";

export default function Playlist({playList, onRemove, onNameChange, clearPlayList, savePlaylist, existingPlaylists, onSelectPlaylist, onAddPlaylist,}) {

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editNameInput, setEditNameInput] = useState(playList.name);

  // Handlers
  const handleSave = () => {
    savePlaylist();
  }
  const handleClear = () => {
    clearPlayList();
  }

  // Add Playlist
  const handleAddClick = () => {
    setShowAddModal(true);
  }
  const handleAddCancel = () => {
    setShowAddModal(false);
    setNewPlaylistName("");
  };
  const handleAddConfirm = () => {
    if (newPlaylistName.trim()) {
      onAddPlaylist({ id: null, name: newPlaylistName, tracks: [] });
      setShowAddModal(false);
      setNewPlaylistName("");
    }
  };

  // Edit Playlist Name
  const handleEditClick = () => {
    setEditNameInput(playList.name || "");
    setShowEditModal(true);
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
  }

  const handleEditConfirm = () => {
    if (editNameInput.trim()) {
      onNameChange(editNameInput);
      setShowEditModal(false);
    }
  };

  // react-select options
  const playlistOptions = existingPlaylists.map((pl) => ({
    value: pl.id,
    label: pl.name,
  }));

  const selectedOption =
    playlistOptions.find((opt) => opt.value === playList.id) || null;

  return (
    <div className="Playlist">
      <div className="Playlist-header">
        {/* React-Select Dropdown */}
        <Select
          value={selectedOption}
          onChange={(option) => {
            const selected = existingPlaylists.find((p) => p.id === option.value);
            if (selected) onSelectPlaylist(selected);
          }}
          options={playlistOptions}
          isSearchable={false} // disable typing
          styles={{
            // The main control (input box)
            control: (provided) => ({
              ...provided,
              backgroundColor: "rgba(1, 12, 63, 0.7)",
              borderRadius: "12px",
              border: "1px solid #6f6f6f",
              minHeight: "45px",
              padding: "0 8px",
              width: "400px",
            }),
            // Dropdown menu
            menu: (provided) => ({
              ...provided,
              backgroundColor: "#010c3f",
              borderRadius: "8px",
            }),
            // Each option
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isFocused ? "#333" : "#1b1b1b",
              color: state.isSelected ? "#ffff" : "#ffff",
              cursor: "pointer",
            }),
            // Selected value in the control
            singleValue: (provided) => ({
              ...provided,
              color: "#fff",
            }),
            // Placeholder
            placeholder: (provided) => ({
              ...provided,
              color: "#aaa",
            }),
          }}
        />

        {/* Control Buttons */}
        <div className="Playlist-controls">
          <button onClick={handleAddClick} title="add-playlist" className="Playlist-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </button>

          <button onClick={handleEditClick} title="edit-playlist" className="Playlist-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </button>

          <button onClick={handleClear} title="clear-playlist" className="Playlist-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Track List */}
      <TrackList tracks={playList.tracks} onRemove={onRemove} isRemoval={true} />

      {/* Save Button */}
      <button className="Playlist-save" onClick={handleSave}>
        SAVE TO SPOTIFY
      </button>

      {/* Add Playlist Modal */}
      {showAddModal && (
        <PlaylistNameDialog
          title="Add New Playlist"
          onClose={handleAddCancel}
          onConfirm={handleAddConfirm}
          confirmLabel="Add"
          cancelLabel="Cancel"
        >
          <input
            className="Playlist-input"
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Playlist Name"
          />
        </PlaylistNameDialog>
      )}

      {/* Edit Playlist Name Modal */}
      {showEditModal && (
        <PlaylistNameDialog
          title="Edit Playlist Name"
          onClose={handleEditCancel}
          onConfirm={handleEditConfirm}
          confirmLabel="Save"
          cancelLabel="Cancel"
        >
          <input
            className="Playlist-input"
            type="text"
            value={editNameInput}
            onChange={(e) => setEditNameInput(e.target.value)}
            placeholder="Playlist Name"
          />
        </PlaylistNameDialog>
      )}
    </div>
  );
}
