import React, { useState } from "react";
import "./SearchBar.css";

export default function SearchBar({ onSearch, isAuthenticated }) {

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    onSearch(searchTerm); // pass input value to parent
  }

  const handleTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="SearchBar">
      <input placeholder="Enter A Song, Album, or Artist" value={searchTerm} onChange={handleTermChange} />
      <button 
        className={isAuthenticated ? "SearchButton" :"SearchButton-disable"}
        onClick={handleSearch} 
        disabled={!isAuthenticated}>SEARCH</button>
    </div>
  );
}