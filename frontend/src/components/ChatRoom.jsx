import { useEffect, useRef, useState } from "react";
import { socket } from "../socket.js";
import Message from "./Message.jsx";

export default function ChatRoom({ username, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket.connect();
    socket.emit("join", username);

    socket.on("message_history", (history) => {
      setMessages(history);
    });

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("system_message", (message) => {
      setMessages((prev) => [...prev, { ...message, system: true }]);
    });

    socket.on("user_list", (users) => {
      setOnlineUsers(users);
    });

    socket.on("user_typing", ({ username: who, isTyping }) => {
      setTypingUser(isTyping ? who : null);
    });

    return () => {
      socket.off("message_history");
      socket.off("receive_message");
      socket.off("system_message");
      socket.off("user_list");
      socket.off("user_typing");
      socket.disconnect();
    };
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;

    socket.emit("send_message", draft);
    socket.emit("typing", false);
    setDraft("");
  };

  const handleChange = (e) => {
    setDraft(e.target.value);
    socket.emit("typing", true);

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", false);
    }, 1500);
  };

  const handleLeave = () => {
    socket.disconnect();
    onLeave();
  };

  return (
    <div className="chat-screen">
      <header className="chat-header">
        <div>
          <h2>Chat room</h2>
          <p className="online-count">{onlineUsers.length} online</p>
        </div>
        <button className="leave-button" onClick={handleLeave}>
          Leave
        </button>
      </header>

      <div className="chat-body">
        <aside className="user-list">
          <h3>Online</h3>
          <ul>
            {onlineUsers.map((user) => (
              <li key={user} className={user === username ? "current-user" : ""}>
                <span className="status-dot" />
                {user} {user === username && "(you)"}
              </li>
            ))}
          </ul>
        </aside>

        <main className="message-list">
          {messages.length === 0 && (
            <p className="empty-state">No messages yet — say hello!</p>
          )}
          {messages.map((message) => (
            <Message key={message.id} message={message} isOwn={message.username === username} />
          ))}
          {typingUser && <div className="typing-indicator">{typingUser} is typing…</div>}
          <div ref={bottomRef} />
        </main>
      </div>

      <form className="message-form" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type a message"
          value={draft}
          onChange={handleChange}
          maxLength={500}
        />
        <button type="submit" disabled={!draft.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
