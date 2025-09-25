import React from "react";
import "./TrackList.css";
import Track from "../Track/Track";

export default function TrackList({ tracks = [], onAdd, onRemove, isRemoval }) {
  // Safety: in case tracks is undefined or empty
  if (!tracks || tracks.length === 0) {
    return <div className="TrackList">No tracks found here</div>;
  }

  return (
    <div className="TrackList">
      {tracks.map(track => (
        <Track
          key={track.id}
          track={track}
          onAdd={onAdd}
          onRemove={onRemove}
          isRemoval={isRemoval}
        />
      ))}
    </div>
  );
};

