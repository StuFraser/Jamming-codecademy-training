import SpotifyAuth from "./SpotifyAuth";

const SpotifyApi = {

    async savePlaylist(name, trackUris) {

        if (!name) return;
        const accessToken = await SpotifyAuth.login();
        const headers = { Authorization: `Bearer ${accessToken}` };

        // Get current user
        const userResponse = await fetch('https://api.spotify.com/v1/me', { headers });
        const user = await userResponse.json();
        const userId = user.id;

        // Create playlist
        const createResponse = await fetch(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description: 'Created with my React app', public: false }),
            }
        );
        const playlist = await createResponse.json();
        const playlistId = playlist.id;

        // Add tracks
        if (trackUris.length > 0) {

            await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ uris: trackUris }),
            });
        }
        return playlistId
    },

    async search(searchTerm) {

        const accessToken = await SpotifyAuth.login();

        const endpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
            searchTerm
        )}&type=track&limit=30`;

        const response = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error('Spotify API error');

        const data = await response.json();
        if (!data.tracks || !data.tracks.items.length) return [];

        return data.tracks.items.map((track) => {
            const images = track.album?.images ?? [];
            return {
                id: track.id,
                name: track.name,
                artist: track.artists[0]?.name ?? "Unknown Artist",
                album: track.album?.name ?? "Unknown Album",
                uri: track.uri,
                image: images.length > 0 ? images[images.length - 1].url : "" // smallest available
            };
        });
    },

    async getPlaylists(limit = 20) {
        // Ensure we have a valid token
        const accessToken = await SpotifyAuth.login();
        const endpoint = `https://api.spotify.com/v1/me/playlists?limit=${limit}`;
        const response = await fetch(endpoint, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}-${response.statusText}`);
        }

        const data = await response.json();
        if (!data.items || !data.items.length) return [];

        return data.items.map((playlist) => ({
            id: playlist.id,
            name: playlist.name,
            tracksTotal: playlist.tracks.total,
            owner: playlist.owner.display_name,
            uri: playlist.uri,
            public: playlist.public,
        }));
    },

    async getPlaylistTracks(playlistId) {
        const accessToken = await SpotifyAuth.login();

        const endpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;
        const response = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error(`Spotify API error: ${response.status}`);

        const data = await response.json();

        return data.items.map(({ track }) => {
            const images = track.album?.images ?? [];
            return {
                id: track.id,
                name: track.name,
                artist: track.artists[0]?.name ?? "Unknown Artist",
                album: track.album?.name ?? "Unknown Album",
                uri: track.uri,
                image: images.length > 0 ? images[images.length - 1].url : ""
            };
        });
    },

    async updatePlaylist(playlistId, name, trackUris) {
        const accessToken = await SpotifyAuth.login();
        const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

        // Optionally rename playlist
        if (name) {
            await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ name }),
            });
        }

        // Replace tracks
        await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ uris: trackUris }),
        });
    }

}

export default SpotifyApi