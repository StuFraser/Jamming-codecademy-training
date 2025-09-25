import React, { useEffect, useState } from 'react'

import './App.css'
import SearchBar from '../SearchBar/SearchBar'
import SearchResults from '../SearchResults/SearchResults'
import Playlist from '../Playlist/Playlist'
import { initialTracks, intitialPlayLists } from '../../assets/TrackData'
import SpotifyAuth from '../../util/SpotifyAuth'
import SpotifyApi from '../../util/SpotifyApi'
import LoadingDialog from "../LoadingDialog/LoadingDialog";
import AuthButton from '../AuthButton/AuthButton'
import AuthModal from '../AuthModal/AuthModal'
import { v4 as uuidv4 } from "uuid"

export default function App() { // extends React.Component {
  //const [count, setCount] = useState(0)

  const [searchResults, setSearchResults] = useState([]);
  const [playList, setPlaylist] = useState({
    name: "My Playlist",
    tracks: []
  });

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(SpotifyAuth.isAuthenticated);
  const [showAuthModal, setShowAuthModal] = useState(!SpotifyAuth.isAuthenticated);
  const [userPlaylists, setUserPlaylists] = useState([]);

  useEffect(() => {
    const handle = setInterval(() => {
      const auth = SpotifyAuth.isAuthenticated;
      setIsAuthenticated(auth);
      if (auth) setShowAuthModal(false); // hide modal if authenticated
    }, 1000);

    return () => clearInterval(handle);
  }, []);

  useEffect(() => {
    async function handleCallback() {
      const accessToken = await SpotifyAuth.handleAuthCallback();
      if (accessToken) setIsAuthenticated(true);
    }
    handleCallback();
  }, []);

  useEffect(() => {
    async function fetchUserPlaylists() {
      if (isAuthenticated) {
        setLoading(true);
        setLoadingMessage("Loading your playlists...");
        try {
          const playlists = await SpotifyApi.getPlaylists();

          console.log("playlists", playlists);

          setUserPlaylists(playlists);
        } catch (err) {
          console.error("Failed to load playlists:", err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchUserPlaylists();
  }, [isAuthenticated]);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      SpotifyAuth.logout();
    } else {
      SpotifyAuth.login();
    }
    setIsAuthenticated(SpotifyAuth.isAuthenticated);
  };

  const addTrack = track => {
    setPlaylist(prev => {
      // Avoid duplicates
      if (prev.tracks.find(t => t.id === track.id)) return prev;
      return {
        ...prev,
        tracks: [...prev.tracks, track]
      };
    });
    //Remove it from the search results.
    //decided to not do this.  
    // otherwise might need way to resore it back to search results?
    //setSearchResults(prev => prev.filter(t => t.id !== track.id));
  };

  const removeTrack = track => {
    //console.log('App removeTrack', track);
    setPlaylist(prev => ({
      ...prev, tracks: prev.tracks.filter(t => t.id !== track.id)
    }));
  }

const updatePlaylistName = name => {
  setPlaylist(prev => ({
    ...prev,
    name
  }));

  // Also update the name in userPlaylists
  setUserPlaylists(prev =>
    prev.map(pl =>
      pl.id === playList.id ? { ...pl, name } : pl
    )
  );
};

  const clearPlayList = () => {
    setPlaylist(prev => ({
      ...prev,   // keep existing properties (tracks)
      tracks: []
    }))
  }

const savePlaylist = async () => {
  setLoadingMessage("Saving Playlist....");
  setLoading(true);

  const trackURIs = playList.tracks.map(track => track.uri);
  let savedPlaylistId;

  if (playList.id && playList.id.startsWith('temp-')) {
    savedPlaylistId = await SpotifyApi.savePlaylist(playList.name, trackURIs);
  } else {
    savedPlaylistId = playList.id;
    await SpotifyApi.updatePlaylist(playList.id, playList.name, trackURIs);
  }

  // Update the playlist in userPlaylists
  const updatedPlaylist = { ...playList, id: savedPlaylistId };
  setUserPlaylists(prev => {
    // Replace the old playlist (temp or existing) with updated
    return prev.map(pl => pl.id === playList.id ? updatedPlaylist : pl);
  });

  // Select the updated playlist
  setPlaylist(updatedPlaylist);

  setLoading(false);
};

  const search = async (searchTerm) => {
    //console.log(searchTerm);
    if (searchTerm) {
      setLoading(true);
      setLoadingMessage("Searching Spotify Catalogues....")
      const newResults = await SpotifyApi.search(searchTerm);

      setSearchResults(newResults);
      setLoading(false);
    }
  }

  const handleAddPlaylist = (newPl) => {

    //Assign it a new tempId so selector works
    const tempId = `temp-${uuidv4()}`;
    const newPlaylist = { ...newPl, id: tempId };

    setUserPlaylists(prev => [...prev, newPlaylist]);
    setPlaylist(newPlaylist); // optionally select it immediately
  };


  const handleSelectPlaylist = async (selectedPlaylist) => {

    setLoading(true);
    setLoadingMessage("Loading playlist tracks...");

    let tracks = selectedPlaylist.tracks || [];

    if (!tracks.length && selectedPlaylist.id && !selectedPlaylist.id.startsWith('temp-')) {
      tracks = await SpotifyApi.getPlaylistTracks(selectedPlaylist.id);
    }

    setPlaylist({
      id: selectedPlaylist.id,
      name: selectedPlaylist.name,
      tracks,
    });

    setLoading(false);
  };

  const handleLogin = () => {
    SpotifyAuth.login(); // triggers redirect
  };

  const handleCancel = () => {
    SpotifyAuth.logout();
    setShowAuthModal(false);
  };

  return (
    <>
      {loading && <LoadingDialog message={loadingMessage} />}
      <AuthModal
        open={!isAuthenticated}
        onLogin={handleLogin}
        onCancel={handleCancel}
      />
      <div>
        <div>
          <h1>Ja<span className="highlight">mmm</span>ing</h1>
          <AuthButton isAuthenticated={isAuthenticated} onClick={handleAuthClick} />
        </div>

        <div className="App">
          <SearchBar onSearch={search} isAuthenticated={isAuthenticated} />
          <div className="App-playlist">

            <SearchResults
              searchResults={searchResults}
              onAdd={addTrack}
            />
            <Playlist
              playList={playList}
              onRemove={removeTrack}
              onNameChange={updatePlaylistName}
              clearPlayList={clearPlayList}
              savePlaylist={savePlaylist}
              existingPlaylists={userPlaylists}
              onSelectPlaylist={handleSelectPlaylist}
              onAddPlaylist={handleAddPlaylist}
            />
          </div>
        </div>
      </div>
    </>
  )

}


