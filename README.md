# Basic Chat App

A minimal real-time chat application:

- **Backend:** Node.js, Express, Socket.io (in-memory storage — no database needed to try it out)
- **Frontend:** React (via Vite) + `socket.io-client`

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

