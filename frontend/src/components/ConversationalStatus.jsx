import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

const MOCK_REPLIES = [
  "Your complaint is currently under review by the Roads & Infrastructure department.",
  "A field team has been assigned and is expected to visit within 2 days.",
  "Your complaint priority is High, so it's in the fast-track queue.",
];

export default function ConversationalStatus() {
  const navigate = useNavigate();
  const { speak, speakKey } = useApp();
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me anything about your complaint, like \"Where is my complaint?\"" },
  ]);
  const [input, setInput] = useState("");

  function send() {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    const botReply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
    const botMsg = { from: "bot", text: botReply };
    setMessages((m) => [...m, userMsg, botMsg]);
    setInput("");
    // Note: bot replies are only in English right now (mock data) — real translation
    // of dynamic AI responses would need the backend to return translated text too.
  }

  return (
    <div className="screen">
      <div className="back-link" onClick={() => navigate(-1)}>&larr; Back</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="title">Ask about your complaint</div>
        <span style={{ fontSize: 20, cursor: "pointer" }} onClick={() => speakKey("ask_status")}>🔊</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", flex: 1, marginTop: 12 }}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.from === "user" ? "chat-user" : "chat-bot"}`}>
            {m.text}
            {m.from === "bot" && (
              <span style={{ marginLeft: 8, cursor: "pointer" }} onClick={() => speak(m.text)}>🔊</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="btn btn-primary" style={{ width: "auto", padding: "0 20px" }} onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}