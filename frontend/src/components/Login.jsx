import { useState } from "react";
import { SERVER_URL } from "../socket.js";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${SERVER_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not log in");
        return;
      }

      onLogin(data.username);
    } catch (err) {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Join the chat</h1>
        <p className="login-subtitle">Pick a display name to enter the room. No password needed.</p>

        <input
          autoFocus
          type="text"
          placeholder="Your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={24}
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={loading || !username.trim()}>
          {loading ? "Joining…" : "Join"}
        </button>
      </form>
    </div>
  );
}
