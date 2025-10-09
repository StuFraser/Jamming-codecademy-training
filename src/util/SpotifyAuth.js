const SpotifyAuth = {
  client_id: process.env.SPOTIFY_API_KEY,
  redirect_uri: 'http://127.0.0.1:5173/callback',
  scopes: 'playlist-modify-public playlist-modify-private playlist-read-private',

  get isAuthenticated() {
    const accessToken = sessionStorage.getItem('spotify_access_token');
    const expiry = Number(sessionStorage.getItem('spotify_access_expiry'));
    return Boolean(accessToken && expiry && Date.now() < expiry);
  },

  get access_token() {
    return sessionStorage.getItem('spotify_access_token');
  },

  clearTokens() {
    sessionStorage.removeItem('spotify_access_token');
    sessionStorage.removeItem('spotify_access_expiry');
    sessionStorage.removeItem('spotify_refresh_token');
    sessionStorage.removeItem('spotify_code_verifier');
  },

  async generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    let base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },

  async getAccessToken() {
    // Generate new PKCE token
    let codeVerifier = sessionStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      codeVerifier = [...crypto.getRandomValues(new Uint8Array(64))]
        .map((x) => ('0' + x.toString(16)).slice(-2))
        .join('');
      sessionStorage.setItem('spotify_code_verifier', codeVerifier);
    }

    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const authUrl =
      `https://accounts.spotify.com/authorize?` +
      `client_id=${this.client_id}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(this.redirect_uri)}` +
      `&scope=${encodeURIComponent(this.scopes)}` +
      `&code_challenge_method=S256` +
      `&code_challenge=${codeChallenge}`;

    // redirect to Spotify login
    window.location = authUrl;
  },

  async refreshAccessToken() {
    const refreshToken = sessionStorage.getItem('spotify_refresh_token');
    if (!refreshToken) throw new Error('No refresh token');

    const body = new URLSearchParams({
      client_id: this.client_id,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const data = await response.json();
    if (data.error) throw new Error('Refresh token invalid');

    sessionStorage.setItem('spotify_access_token', data.access_token);
    sessionStorage.setItem(
      'spotify_access_expiry',
      Date.now() + data.expires_in * 1000
    );

    if (data.refresh_token) {
      sessionStorage.setItem('spotify_refresh_token', data.refresh_token);
    }

    return data.access_token;
  },

  async handleAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (!code) return;

    const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) throw new Error('Code verifier missing');

    const body = new URLSearchParams({
      client_id: this.client_id,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirect_uri,
      code_verifier: codeVerifier,
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const data = await response.json();
    if (data.error) throw new Error('Token exchange failed');

    sessionStorage.setItem('spotify_access_token', data.access_token);
    sessionStorage.setItem('spotify_refresh_token', data.refresh_token);
    sessionStorage.setItem('spotify_access_expiry', Date.now() + data.expires_in * 1000);

    sessionStorage.removeItem('spotify_code_verifier');
    window.history.replaceState({}, document.title, window.location.pathname);

    return data.access_token;
  },

  // ✅ MAIN LOGIN ENTRY POINT
  async login() {
    const accessToken = sessionStorage.getItem('spotify_access_token');
    const expiry = Number(sessionStorage.getItem('spotify_access_expiry'));
    //Beaware that if the key spotify_access_expiry doesn't exist this will return 0

    try {
      // If no token → start PKCE auth
      if (!accessToken) {
        return await this.getAccessToken();
      }

      // Token expired → try refresh
      if (Date.now() >= expiry) {
        try {
          return await this.refreshAccessToken();
        } catch (err) {
          console.warn('Refresh failed, falling back to full login', err);
          this.clearTokens();
          return await this.getAccessToken();
        }
      }

      // Token valid
      return accessToken;
    } catch (err) {
      console.error('Login failed', err);
      throw err;
    }
  },

  logout() {
    this.clearTokens();
    window.location.reload();
  },
};

export default SpotifyAuth;
