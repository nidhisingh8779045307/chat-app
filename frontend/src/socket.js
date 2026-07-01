import { io } from "socket.io-client";

export const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

// autoConnect is off so we only open the socket once the user has "logged in"
export const socket = io(SERVER_URL, {
  autoConnect: false,
});
