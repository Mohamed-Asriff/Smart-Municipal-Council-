import sys
from pathlib import Path

THIS_DIR = Path(__file__).resolve().parent
CHATBOT_DIR = THIS_DIR.parent.parent / "AI" / "chatbot"
if str(CHATBOT_DIR) not in sys.path:
    sys.path.append(str(CHATBOT_DIR))

from chatbot import municipal_chatbot

def process_chat_message(message: str, session_id: str = "default", history=None):
    """Services wrapper for municipal chatbot calls."""
    return municipal_chatbot(message, session_id=session_id, history=history)
