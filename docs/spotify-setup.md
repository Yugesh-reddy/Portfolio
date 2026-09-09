# Connect the listening tile

The site displays only your currently playing track, artist, and album artwork. It never controls playback or asks visitors to sign in. Until connected, the tile says “Not connected yet”. When nothing is playing, the tile shows what you last played, resolved in this order: the paused track itself (Spotify only writes history once a track finishes or is skipped, so a paused track may never appear there), then the last track this server saw playing (covers quitting the app mid-track; private sessions are never remembered), then your Spotify history. With none of those, the tile shows an idle state. Upstream failures show an unavailable state rather than an invented song.

1. Create an app in the [Spotify developer dashboard](https://developer.spotify.com/dashboard). Select Web API and register `http://127.0.0.1:4381/callback` as the redirect URI. Spotify currently requires the app owner to have Premium for [development-mode apps](https://developer.spotify.com/documentation/web-api/concepts/quota-modes).
2. Put the app's client ID and client secret into `.env.local` as `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`. Keep the values out of chat and source control.
3. From the project root, run `node scripts/connect-spotify.mjs`. Open the printed authorization URL and approve `user-read-currently-playing` and `user-read-recently-played`. The helper listens only on your computer and writes `SPOTIFY_REFRESH_TOKEN` directly to the ignored `.env.local`; it never prints tokens. If you connected before the last-played fallback existed, rerun this step so the new permission is granted.
4. Restart the dev server, play a song on Spotify, and scroll to the footer. Verify `/api/spotify` returns `playing` and the tile links to the right track.
5. Add all three `SPOTIFY_*` variables to the Vercel project's environment settings and redeploy when ready to enable the production tile.

The tile refreshes every 30 seconds while visible and the tab is active. The server caches playback for 30 seconds and exposes only the display fields. Allow roughly a minute for updates through the production cache. The displayed track is public once deployed.

Reference: [Spotify authorization code flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow) and [currently playing endpoint](https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track).
