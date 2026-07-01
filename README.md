# Basic Chat App

A minimal real-time chat application:

- **Backend:** Node.js, Express, Socket.io (in-memory storage — no database needed to try it out)
- **Frontend:** React (via Vite) + `socket.io-client`

> Note on React Native: the prompt allowed falling back to React if React Native wasn't the right fit here. A Vite-based React web app was used instead so this can be run and tested directly in a terminal/browser. The chat logic (Socket.io client, login flow, message list) would port to React Native almost as-is — you'd swap the DOM elements (`<div>`, `<input>`) for React Native components (`<View>`, `<TextInput>`, `<FlatList>`) but keep the same socket event handling.

## Features

- Real-time messaging over Socket.io (instant delivery to everyone in the room)
- Dummy login — pick any display name, no password (rejects duplicate names currently online)
- Message timestamps
- Online users list
- "X is typing…" indicator
- Join/leave system messages
- Chat history sent to new clients on join

## Project structure

```
chat-app/
├── backend/
│   ├── server.js        # Express + Socket.io server
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── socket.js
    │   └── components/
    │       ├── Login.jsx
    │       ├── ChatRoom.jsx
    │       └── Message.jsx
    ├── index.html
    ├── package.json
    └── .env.example
```

## Running it

### 1. Backend

```bash
cd backend
npm install
npm start        # or: npm run dev (auto-restart with nodemon)
```

The server starts on `http://localhost:4000`.

### 2. Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Open it in two browser tabs/windows with different names to see real-time messaging in action.

By default the frontend talks to `http://localhost:4000`. If you deploy the backend elsewhere, copy `frontend/.env.example` to `frontend/.env` and set `VITE_SERVER_URL` accordingly.

## How it works

- **Login (`POST /api/login`):** takes a username, no password check, returns a fake token. This is a placeholder — swap in real auth (JWT + a users table, or an auth provider) when you're ready.
- **Socket connection:** after "logging in," the client connects to Socket.io and emits a `join` event with the username. The server tracks online users in memory (`socket.id -> username`).
- **Sending a message:** client emits `send_message`; server stamps it with a UUID + ISO timestamp, stores it, and broadcasts `receive_message` to everyone (including the sender), so all clients render from the same source of truth.
- **Typing indicator:** client emits `typing` on keystroke (debounced to clear after 1.5s of inactivity); server relays it to everyone else.
- **History:** `GET /api/messages` and the `message_history` socket event both expose the same in-memory array, so a newly joined client can catch up.

## Building an Android APK

This project now includes a Capacitor Android wrapper (`frontend/android/`), so the React app can be packaged as a real installable `.apk`. Capacitor just loads your built web app inside a native Android WebView shell — no UI rewrite needed.

**Prerequisites (on your own machine, not needed for web dev):**
- [Android Studio](https://developer.android.com/studio) installed (this also installs the Android SDK)
- JDK 17 (Android Studio bundles one)

**Steps:**

```bash
cd frontend
npm install
npm run build              # builds the web app into dist/
npx cap sync android       # copies the fresh build into the android project
```

Then either:

- **Easiest:** `npx cap open android` — opens the project in Android Studio. Click **Build → Build Bundle(s)/APK(s) → Build APK(s)**. Android Studio handles the SDK/Gradle downloads for you. The APK lands in `android/app/build/outputs/apk/debug/app-debug.apk`.
- **Command line** (once Android Studio/SDK is installed once): `cd android && ./gradlew assembleDebug`

**Before you build for real use:**
- The app currently points at `http://localhost:4000` for the backend. A phone can't reach your laptop's `localhost`, so deploy the backend somewhere reachable (Render, Railway, Fly.io, your own server) and set `VITE_SERVER_URL` in `frontend/.env` to that URL before running `npm run build`.
- Once the backend is on HTTPS, remove `cleartext: true` from `frontend/capacitor.config.ts` — it's only there for local HTTP testing.
- `assembleDebug` produces a debug-signed APK (fine for testing/sideloading). For the Play Store you'd build a signed release APK/AAB — Android Studio's Build menu walks you through generating a signing key.

## Next steps if you extend this

- Swap the in-memory arrays for a real database (Postgres/Mongo) so history survives restarts.
- Replace the dummy login with real authentication and persist a users table.
- Add multiple chat rooms/channels instead of one global room.
- Add read receipts, message editing/deletion, or file/image attachments.
- Deploy the backend somewhere with WebSocket support (Render, Railway, Fly.io) and set `VITE_SERVER_URL` on the frontend build.
