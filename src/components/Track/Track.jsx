import React from "react";
import "./Track.css";

export default function Track({ track, isRemoval, onAdd, onRemove }) {
    const handleAdd = () => {
        onAdd(track);
    };

    const handleRemove = () => {
        onRemove(track);
    };


    const renderAction = () => {
        const symbol = isRemoval ? '-' : '+';
        return (
            <button className="Track-action" onClick={isRemoval ? handleRemove : handleAdd}>
                {symbol}
            </button>
        );
    };

    //console.log(track);

    return (
        <div className="Track">
            {track.image && (
                <img className="Track-image" src={track.image} alt={track.name} />
            )}
            <div className="Track-information">
                <h3>{track.name}</h3>
                <p>{`${track.artists} - ${track.album}`}</p>
            </div>
            {renderAction()}
        </div>
    );
}