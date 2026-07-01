function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Message({ message, isOwn }) {
  if (message.system) {
    return <div className="system-message">{message.text}</div>;
  }

  return (
    <div className={`message-row ${isOwn ? "own" : ""}`}>
      <div className={`message-bubble ${isOwn ? "own" : ""}`}>
        {!isOwn && <div className="message-author">{message.username}</div>}
        <div className="message-text">{message.text}</div>
        <div className="message-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
}
