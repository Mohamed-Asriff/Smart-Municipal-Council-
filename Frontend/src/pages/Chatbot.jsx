import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../services/api";
import { getStoredSessionId, formatTime } from "../services/chatbot";
import "./Chatbot.css";

const QUICK_ACTIONS = [
  { icon: "📝", label: "Submit Complaint", prompt: "How can I submit a municipal complaint?" },
  { icon: "🔍", label: "Track Complaint", prompt: "How can I track the status of my complaint?" },
  { icon: "💧", label: "Water Services", prompt: "How do I report a water supply interruption?" },
  { icon: "🚛", label: "Waste Collection", prompt: "Garbage has not been collected in my street for three days." },
  { icon: "🚧", label: "Road & Drainage", prompt: "There is a fallen tree blocking the main road." },
  { icon: "💳", label: "Municipal Billing", prompt: "How do I make a municipal assessment payment?" }
];

function Chatbot() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  
  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);
  const sessionIdRef = useRef(getStoredSessionId());

  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (chatBody) chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const startNewChat = () => {
    setMessages([]);
    setMessage("");
    setIsSidebarOpen(false);
    inputRef.current?.focus();
  };

  const sendMessage = async (event, nextMessage = message) => {
    event?.preventDefault();
    const currentMessage = nextMessage.trim();
    if (!currentMessage || isLoading) return;

    const history = messages.map((item) => ({
      role: item.sender === "user" ? "user" : "assistant",
      content: item.text
    }));

    setMessages((previous) => [
      ...previous,
      { sender: "user", text: currentMessage, timestamp: formatTime() }
    ]);
    setMessage("");
    setIsLoading(true);
    setIsSidebarOpen(false);

    try {
      const response = await sendChatMessage(currentMessage, sessionIdRef.current, history);
      const botReply = response?.reply || response?.response || "I'm here to assist with Kalmunai Municipal Council services. Please contact the council office for exact details.";

      setMessages((previous) => [...previous, {
        sender: "bot",
        text: botReply,
        timestamp: formatTime()
      }]);
    } catch (error) {
      const fallbackMessage = error?.response?.data?.reply || "The AI Service Assistant is currently reconnecting. Please try again in a moment.";
      setMessages((previous) => [...previous, {
        sender: "bot",
        text: fallbackMessage,
        timestamp: formatTime(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kmc-page">
      <nav className="kmc-navbar" aria-label="Main navigation">
        <a className="kmc-brand" href="/" onClick={(e) => e.preventDefault()}>
          <span className="kmc-logo" aria-hidden="true">KMC</span>
          <span className="kmc-brand-copy">
            <strong>Kalmunai Municipal Council</strong>
            <span>AI Service Assistant • SMC</span>
          </span>
        </a>

        <div className="kmc-actions">
          <label className="language-select">
            <span className="sr-only">Select language</span>
            <select defaultValue="EN" aria-label="Language">
              <option value="EN">English</option>
              <option value="TA">தமிழ்</option>
              <option value="SI">සිංහල</option>
            </select>
          </label>
        </div>
      </nav>

      <div className="chat-workspace">
        <button className="mobile-menu-button" type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">☰</button>
        {isSidebarOpen && <button className="sidebar-overlay" type="button" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu" />}

        <aside className={`chat-sidebar ${isSidebarOpen ? "open" : ""}`} aria-label="Chat sidebar">
          <button className="new-chat-button" type="button" onClick={startNewChat}>
            <span aria-hidden="true">＋</span> New Conversation
          </button>

          <div className="sidebar-section">
            <span className="sidebar-heading">Service Assistant</span>
            <button className="sidebar-item selected" type="button" onClick={() => setIsSidebarOpen(false)}>
              <span aria-hidden="true">✦</span> Active Conversation
            </button>
          </div>

          <div className="sidebar-footer">
            Official Kalmunai Municipal Council AI Service Assistant
          </div>
        </aside>

        <main className="chat-main">
          <header className="chat-main-header">
            <div className="assistant-avatar" aria-hidden="true">✦</div>
            <div>
              <h1>Kalmunai Municipal Council AI Service Assistant</h1>
              <p>Official assistant for municipal services, complaints, requests, and council information</p>
            </div>
            <span className="online-status"><i /> Online</span>
          </header>

          <div className={`chat-body ${messages.length === 0 ? "empty" : ""}`} ref={chatBodyRef} aria-live="polite">
            {messages.length === 0 ? (
              <section className="welcome-screen" aria-label="Assistant welcome">
                <div className="welcome-avatar" aria-hidden="true">✦</div>
                <h2>Welcome to the Kalmunai Municipal Council AI Assistant.</h2>
                <p>I can help you with municipal services, complaints, applications, requests, and other Council-related information.</p>
                <p><strong>How may I assist you today?</strong></p>

                <div className="quick-actions">
                  {QUICK_ACTIONS.map((action) => (
                    <button className="quick-action" type="button" key={action.label} onClick={() => sendMessage(null, action.prompt)}>
                      <span className="quick-action-icon" aria-hidden="true">{action.icon}</span>
                      <span>{action.label}</span>
                      <span className="quick-action-arrow" aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              messages.map((msg, index) => (
                <article className={`message ${msg.sender === "user" ? "user-message" : "bot-message"} ${msg.isError ? "error-message" : ""}`} key={`${msg.timestamp}-${index}`}>
                  {msg.sender === "bot" && <span className="message-assistant-icon" aria-hidden="true">✦</span>}
                  <div className="message-content">
                    <div className="message-meta">
                      <span>{msg.sender === "user" ? "You" : "KMC AI Assistant"}</span>
                      <time>{msg.timestamp}</time>
                    </div>
                    <div className="message-text" style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
                  </div>
                </article>
              ))
            )}
            {isLoading && (
              <div className="typing-indicator" role="status" aria-label="Assistant is typing">
                <span className="typing-dot" /> KMC Assistant is analyzing request...
              </div>
            )}
          </div>

          <form className="chat-composer" onSubmit={sendMessage}>
            <div className="composer-shell">
              <input
                ref={inputRef}
                type="text"
                aria-label="Ask about municipal services"
                placeholder="Ask about complaints, water supply, garbage, road damage, street lights, tracking..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={isLoading}
              />
              <button type="submit" aria-label="Send message" disabled={isLoading || !message.trim()}>
                <span aria-hidden="true">➤</span>
              </button>
            </div>
            <p>For verified rates, requirements, and office details, please contact the Kalmunai Municipal Council office.</p>
          </form>
        </main>
      </div>
    </div>
  );
}

export default Chatbot;
