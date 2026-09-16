import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Chatbot.css";

const WELCOME_MESSAGE = [
  "Welcome to the Smart Municipal Council AI Assistant.",
  "",
  "I can help you with:",
  "• Complaint Submission",
  "• Complaint Tracking",
  "• Water Supply Issues",
  "• Road Complaints",
  "• Waste Collection",
  "• Drainage Problems",
  "• Street Light Issues",
  "• Transit Pass Services",
  "• Permit Information",
  "• Municipal Services",
  "",
  "How may I assist you today?"
].join("\n");

const getTimestamp = () =>
  new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" }).format(new Date());

function Chatbot() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: WELCOME_MESSAGE, timestamp: getTimestamp() }
  ]);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (chatBody) chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (event) => {
    event?.preventDefault();
    const currentMessage = message.trim();
    if (!currentMessage || isLoading) return;

    const userMessage = { sender: "user", text: currentMessage, timestamp: getTimestamp() };
    const history = messages.map((item) => ({
      role: item.sender === "user" ? "user" : "assistant",
      content: item.text
    }));

    setMessages((previous) => [...previous, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/chat",
        { message: currentMessage, history },
        { timeout: 30000 }
      );

      setMessages((previous) => [...previous, {
        sender: "bot",
        text: response.data.response || "Please contact the Municipal Council office for exact details.",
        timestamp: getTimestamp()
      }]);
    } catch {
      setMessages((previous) => [...previous, {
        sender: "bot",
        text: "The AI service is currently unavailable. Please try again later.",
        timestamp: getTimestamp(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-card">
        <header className="chat-header">
          <div className="council-mark" aria-hidden="true">⌂</div>
          <div>
            <h1>Smart Municipal Council Assistant</h1>
            <p>Official Municipal Services AI Assistant</p>
          </div>
        </header>

        <div className="chat-body" ref={chatBodyRef} aria-live="polite">
          {messages.map((msg, index) => (
            <article
              className={`message ${msg.sender === "user" ? "user-message" : "bot-message"} ${msg.isError ? "error-message" : ""}`}
              key={`${msg.timestamp}-${index}`}
            >
              <div className="message-meta">
                <span>{msg.sender === "user" ? "You" : "Assistant"}</span>
                <time>{msg.timestamp}</time>
              </div>
              <div className="message-text">{msg.text}</div>
            </article>
          ))}
          {isLoading && (
            <div className="typing-indicator" role="status" aria-label="Assistant is typing">
              <span className="typing-dot" />
              <span>Assistant is typing...</span>
            </div>
          )}
        </div>

        <form className="chat-footer" onSubmit={sendMessage}>
          <input
            type="text"
            aria-label="Ask the Municipal Council Assistant"
            placeholder="Ask about a Municipal Council service..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !message.trim()}>
            <span aria-hidden="true">↑</span>
            Send
          </button>
        </form>
        <p className="chat-disclaimer">For official rates, requirements, and office details, please contact the Municipal Council office.</p>
      </div>
    </div>
  );
}

export default Chatbot;