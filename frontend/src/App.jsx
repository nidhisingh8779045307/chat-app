import { useState } from "react";
import Login from "./components/Login.jsx";
import ChatRoom from "./components/ChatRoom.jsx";

export default function App() {
  const [username, setUsername] = useState(null);

  return username ? (
    <ChatRoom username={username} onLeave={() => setUsername(null)} />
  ) : (
    <Login onLogin={setUsername} />
  );
}
