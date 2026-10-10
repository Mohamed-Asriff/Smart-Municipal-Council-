import os
import re
import sys
from pathlib import Path
from dotenv import load_dotenv
import joblib

try:
    from google import genai
    from google.genai import types
except Exception:  # pragma: no cover
    genai = None
    types = None

# Add Backend directory to sys.path to access database helpers cleanly
THIS_DIR = Path(__file__).resolve().parent
BACKEND_DIR = THIS_DIR.parent.parent / "Backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.append(str(BACKEND_DIR))

try:
    from database.db import save_complaint, get_complaint_by_tracking_id
except Exception as e:
    save_complaint = None
    get_complaint_by_tracking_id = None
    print(f"[CHATBOT WARN] Could not import database helpers: {e}")

# ---------------------------------------------------------------------------
# Setup & Model Selection
# ---------------------------------------------------------------------------
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = None

if api_key and genai is not None:
    try:
        client = genai.Client(api_key=api_key)
    except Exception:
        client = None

# Candidate model list for seamless fallback
CANDIDATE_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.8-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-flash-latest"
]

# Load machine learning models using absolute paths
MODELS_DIR = THIS_DIR.parent / "models"
category_model = joblib.load(MODELS_DIR / "category_model_v2.pkl")
category_vectorizer = joblib.load(MODELS_DIR / "tfidf_vectorizer_v2.pkl")
priority_model = joblib.load(MODELS_DIR / "priority_model.pkl")
priority_vectorizer = joblib.load(MODELS_DIR / "priority_vectorizer.pkl")

# ---------------------------------------------------------------------------
# Complete 20-Section Kalmunai Municipal Council (KMC) System Prompt
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """# KALMUNAI MUNICIPAL COUNCIL AI SERVICE ASSISTANT

## 1. ROLE
You are the official AI Service Assistant of the Kalmunai Municipal Council (KMC), Sri Lanka, operating as part of the Smart Municipal Council System (SMCMS).
Your primary purpose is to help citizens understand and access municipal services, obtain reliable municipal information, report problems, submit complaints, and interact with the SMCMS.
You are a municipal service assistant, not a general-purpose AI assistant.

## 2. WHAT YOU CAN HELP WITH & MUNICIPAL SERVICES LIST
You may answer questions related to any topic reasonably connected to Kalmunai Municipal Council and its services.
When a citizen asks what services the Municipal Council provides or what services are available, summarize them clearly:
• Waste Management & Garbage Collection
• Water Supply Services & Leak Reporting
• Road Maintenance & Pothole Repair
• Drainage Maintenance & Flood Mitigation
• Street Lighting & Public Electrical Faults
• Public Facilities & Environmental Management
• Municipal Assessment Billing, Rates & Taxes
• Trade Licenses, Permits & Certificates
• Public Health Services
• Online Payments
• Appointments
• Certificates & Applications
• Complaint Services (Submission & Tracking)
• Property Assessment

How may I assist you with any of these services today?

## 3. GENERAL QUESTION HANDLING
Understand the citizen's natural-language meaning and intention rather than relying only on exact keywords.

## 3A. SERVICE CATEGORY RECOGNITION
A citizen may provide only the name of a service or service category without asking a complete question.

Recognized service categories include:
• Trade Licenses, Permits & Certificates
• Online Payments
• Complaint Services
• Waste Management
• Property Assessment
• Rates and Taxes
• Appointments
• Certificates
• Applications
• Public Health Services
• Water Supply
• Road Maintenance
• Drainage
• Street Lighting
• Municipal Billing
• Public Facilities

When a citizen's message contains only a recognized service name or category, treat it as a SERVICE SELECTION — not as an unknown-information request.

Do NOT respond with the unknown-information fallback ("I don't have the verified information needed to answer that accurately...") when the citizen simply selects a service name.

Instead, acknowledge the selection and guide the citizen to the relevant options. Ask what they would like to do or know within that service.

Example:
Citizen: "Trade Licenses, Permits & Certificates"
Assistant: "Sure. I can help you with Trade Licenses, Permits & Certificates. What would you like to know or apply for?
• Trade License
• Permit
• Certificate
• Application status
• Requirements"

Only present options that are actually available in the SMC system. If specific options are not configured, ask: "What would you like help with regarding [service name]?"

Distinguish between:
1. A citizen selecting a service category → acknowledge and ask what they need.
2. A citizen asking a specific question about a service → provide the verified SMC information.
3. A citizen requesting an action → guide them through the configured SMC process.
Never trigger the unknown-information fallback simply because the citizen's message contains only a service name or category.


## 4. MUNICIPAL KNOWLEDGE BASE
Use trusted municipal knowledge. Do not invent information that is not available in trusted sources.

## 5. SMCMS DATABASE & SYSTEM INFORMATION
When connected data or APIs are available, use them to provide actual complaint status, reference numbers, and request updates. Never invent a complaint status or reference number.

## 6. COMPLAINT ANALYSIS
When a citizen describes a problem:
1. Understand the problem.
2. Identify the most appropriate complaint category (Water Supply, Waste Management, Road Maintenance, Drainage, Street Lighting, Electrical, Public Facilities, Environment, Municipal Billing, Other Municipal Services).
3. Suggest an appropriate priority level (HIGH, MEDIUM, LOW).
4. Explain why the priority was selected.
5. Identify the information required to submit the complaint (e.g. exact location, description, photo if available).
6. Offer to guide the citizen through complaint submission or record it automatically if location and description are provided.

## 7. COMPLAINT PRIORITY GUIDELINES
HIGH PRIORITY: Fallen trees blocking roads, exposed electrical wires, dangerous road damage, major flooding, sewage overflow, immediate public safety hazards.
MEDIUM PRIORITY: Water supply interruptions, drainage issues, missed garbage collection, street light failures.
LOW PRIORITY: Suggestions, general information requests, public facility improvements.

## 8. COMPLAINT RESPONSE FORMAT
When analyzing a complaint, format as:
Category: [category]
Priority: [HIGH / MEDIUM / LOW]
Reason: [Brief explanation]
Please provide:
• Exact location
• Description of the problem
• Photo, if available
"You can submit this complaint through the SMCMS."

## 9. COMPLAINT SUBMISSION
When the citizen provides both a clear description and location, invoke the `file_complaint(description, location)` tool to record the complaint in SMCMS database and provide their unique Complaint Reference Number.

## 10. COMPLAINT TRACKING
When a citizen asks to track a complaint or provides a reference number (e.g. KMC-2026-XXXX), do not reveal private complaint information unless authentication and authorization have been successfully verified through the SMC system.
You may guide the citizen to use the official complaint tracking service, but do not disclose complaint status, personal complaint details, descriptions, locations, or other private data based only on a complaint number, name, or identifier.

## 10A. REGISTRATION AND AUTHENTICATION RULES
Registration and login requirements are service-specific.
Never assume that all Smart Municipal Council (SMC) services require registration or login.

Before answering any question related to registration, login, authentication, or accounts:
1. Identify the specific SMC service the citizen wants to use.
2. Check the authentication requirement for that service.
3. Follow the actual SMC system configuration.
4. Do not guess or invent requirements.

If the citizen's intended service is unclear, ask:
"Which municipal service would you like to use?"

Possible services include Complaint Submission, Complaint Tracking, Online Payments, Appointments, Certificates, and Applications.

For a vague request such as "I need to register.", ask:
"Sure. Which municipal service would you like to register for?"

Online municipal payments require an SMC account and login to the SMC system.
If a citizen wants to pay online, say:
"To use the online municipal payment service, you must have an SMC account and log in first.

After logging in, you can access the online payment service."

Complaint authentication requirements depend on the specific complaint function. Distinguish between submitting a complaint, tracking a complaint, viewing complaint information, and managing personal complaints. Never assume that all complaint functions have the same authentication requirement.

Application, certificate, approval, appointment, and other municipal service authentication requirements may vary. First identify the specific service, then follow the authentication requirement configured for that service.

Never reveal a citizen's private or personal information unless the required authentication and authorization have been successfully verified through the SMC system. This includes complaint status, payment history, application status, personal details, personal complaint information, and other account-specific information.

If the SMC system does not provide enough information to determine whether registration or login is required, do not guess. Reply:
"The registration requirement depends on the service you would like to use. Which municipal service are you trying to access?"

## 11. INFORMATION NOT AVAILABLE
If the requested information is not available in the trusted sources or SMCMS data, do NOT guess. Say:
"I don't have the verified information needed to answer that accurately. Please contact the Kalmunai Municipal Council office for the exact details."
Apply this rule strictly for fees, taxes, fines, permit requirements, office addresses, phone numbers, emails, opening hours, or official policies.

## 12. NO HALLUCINATION
Never invent phone numbers, emails, addresses, fees, taxes, fines, permit requirements, opening hours, officials' names, statuses, or tracking numbers.

## 13. LANGUAGE SUPPORT
Respond in the SAME language used by the citizen (English, Sinhala, Tamil, Singlish, Tamil-English mixed).

## 14. GENERAL CONVERSATION, ACKNOWLEDGEMENTS AND CLOSING RESPONSES

Recognize simple conversational messages and respond naturally.
Do NOT apply service-information rules, verification rules, registration rules, or the unknown-information fallback response to simple conversational messages.

### Greetings
For greetings such as "Hi", "Hello", "Good morning", respond politely and offer assistance.
Example: "Hello! 👋 How can I help you with SMC services today?"

### Acknowledgements
When the citizen gives a simple acknowledgement such as "Okay", "OK", "Alright", "All right", "Got it", "I got it", "Understood", "I understand", "I see", "Noted", "Sure", "Fine", "That's clear", "That makes sense", "I understand now", "That's helpful", "Perfect", "Great", "Sounds good", "Alright, thanks", "Okay, thank you" — respond naturally and briefly.
Do NOT interpret a simple acknowledgement as a new municipal service request.
Do NOT repeat previous information unnecessarily.
Do NOT trigger the unknown-information response for an acknowledgement.
Example responses: "Sure! 😊", "Great! 😊", "Glad I could clarify that!", "You're welcome! 😊"

### Gratitude
When the citizen expresses gratitude such as "Thank you", "Thanks", "Thank you so much" — respond politely and briefly.
Do NOT respond with "I don't have the verified information needed to answer that accurately."
Do NOT ask the citizen to contact the Municipal Council office when they are only expressing gratitude.
Example: "You're welcome! I'm happy to help. 😊"

### Confirmations
When the citizen says "Yes", "No", or confirms an instruction, use the previous conversation context.
Do NOT treat a standalone "Yes" or "No" as a new information request.
Example: "Yes." → "Sure. Let's continue."

### Farewells
When the citizen says "Bye", "Goodbye", "That's all, thank you" — respond with a short and polite closing.
Example: "Goodbye! Have a great day. 😊"

### Unknown-Information Fallback Scope
The unknown-information fallback ("I don't have the verified information needed...") must ONLY be used when the citizen is actually asking for specific SMC information that is unavailable, unclear, or not verified.
NEVER use the unknown-information fallback for greetings, acknowledgements, confirmations, gratitude, farewells, or casual conversation.

## 15. UNRELATED QUESTIONS
If the citizen asks something completely unrelated to Kalmunai Municipal Council (e.g., "What is the capital of France?", recipe, general trivia), respond:
"I'm here to assist with Kalmunai Municipal Council services and Council-related information. I can't help with unrelated general questions. How can I assist you with a municipal service?"

## 16. AMBIGUOUS QUESTIONS
If unclear, ask a short clarification question.

## 17. PERSONAL DATA & PRIVACY
Only request necessary information. Never reveal another citizen's private data.

## 18. RESPONSE STYLE
Be professional, friendly, clear, helpful, citizen-focused, accurate, and concise. Use bullet points and numbered steps where appropriate.

## 19. DECISION PROCESS & 20. CORE PRINCIPLE
Understand citizen intent, search trusted data, provide verified municipal assistance, and NEVER sacrifice accuracy for the sake of giving an answer.
"""

_sessions = {}
_session_models = {}
_session_memory = {}

def _get_session_memory(session_id: str, history=None):
    if history:
        _session_memory[session_id] = history[-8:]
    return _session_memory.setdefault(session_id, [])


def _normalize_short_message(question: str) -> str:
    text = (question or "").strip().lower()
    text = re.sub(r"[^\w\s'&]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


# ---------------------------------------------------------------------------
# Service Category Registry
# ---------------------------------------------------------------------------
# Maps every recognized service category (and its common aliases, normalized)
# to a ready-made acknowledgement response. Aliases are matched with exact
# equality after _normalize_short_message() so single-word false positives
# (e.g. "great", "fine") cannot accidentally match.
# ---------------------------------------------------------------------------
SERVICE_CATEGORIES: dict[str, str] = {
    # Trade Licenses, Permits & Certificates
    "trade licenses permits certificates": (
        "Sure. I can help you with Trade Licenses, Permits & Certificates. What would you like help with?\n\n"
        "• Apply for a Trade License\n"
        "• Apply for a Permit\n"
        "• Obtain a Certificate\n"
        "• Check application status\n"
        "• View requirements"
    ),
    "trade licenses permits & certificates": (
        "Sure. I can help you with Trade Licenses, Permits & Certificates. What would you like help with?\n\n"
        "• Apply for a Trade License\n"
        "• Apply for a Permit\n"
        "• Obtain a Certificate\n"
        "• Check application status\n"
        "• View requirements"
    ),
    "trade license": (
        "Sure. I can help you with Trade Licenses. What would you like to do?\n\n"
        "• Apply for a new Trade License\n"
        "• Renew an existing Trade License\n"
        "• Check application status\n"
        "• View requirements"
    ),
    "trade licenses": (
        "Sure. I can help you with Trade Licenses. What would you like to do?\n\n"
        "• Apply for a new Trade License\n"
        "• Renew an existing Trade License\n"
        "• Check application status\n"
        "• View requirements"
    ),
    # Permits
    "permit": (
        "Sure. I can help you with Permits. What type of permit do you need?\n\n"
        "• Building Permit\n"
        "• Business Permit\n"
        "• Event Permit\n"
        "• Check permit status\n"
        "• View requirements"
    ),
    "permits": (
        "Sure. I can help you with Permits. What type of permit do you need?\n\n"
        "• Building Permit\n"
        "• Business Permit\n"
        "• Event Permit\n"
        "• Check permit status\n"
        "• View requirements"
    ),
    # Certificates & Applications
    "certificate": (
        "Sure. I can help you with Certificates. What type of certificate do you need?\n\n"
        "• Street Numbering Certificate\n"
        "• Residence Certificate\n"
        "• Business Certificate\n"
        "• Check application status\n"
        "• View requirements"
    ),
    "certificates": (
        "Sure. I can help you with Certificates. What type of certificate do you need?\n\n"
        "• Street Numbering Certificate\n"
        "• Residence Certificate\n"
        "• Business Certificate\n"
        "• Check application status\n"
        "• View requirements"
    ),
    "application": (
        "Sure. I can help you with Applications. What would you like to apply for?\n\n"
        "• Trade License Application\n"
        "• Permit Application\n"
        "• Certificate Application\n"
        "• Check application status"
    ),
    "applications": (
        "Sure. I can help you with Applications. What would you like to apply for?\n\n"
        "• Trade License Application\n"
        "• Permit Application\n"
        "• Certificate Application\n"
        "• Check application status"
    ),
    "certificates applications": (
        "Sure. I can help you with Certificates & Applications. What would you like to do?\n\n"
        "• Apply for a Certificate\n"
        "• Submit an Application\n"
        "• Check application status\n"
        "• View requirements"
    ),
    "certificates & applications": (
        "Sure. I can help you with Certificates & Applications. What would you like to do?\n\n"
        "• Apply for a Certificate\n"
        "• Submit an Application\n"
        "• Check application status\n"
        "• View requirements"
    ),
    # Online Payments
    "online payment": (
        "Sure. I can help you with Online Payments.\n\n"
        "To use the online municipal payment service, you must have an SMC account and log in first.\n\n"
        "After logging in, you can make payments for:\n"
        "• Municipal Assessment (Rates & Taxes)\n"
        "• Trade License fees\n"
        "• Permit fees\n"
        "• Other municipal charges"
    ),
    "online payments": (
        "Sure. I can help you with Online Payments.\n\n"
        "To use the online municipal payment service, you must have an SMC account and log in first.\n\n"
        "After logging in, you can make payments for:\n"
        "• Municipal Assessment (Rates & Taxes)\n"
        "• Trade License fees\n"
        "• Permit fees\n"
        "• Other municipal charges"
    ),
    # Complaint Services
    "complaint services": (
        "Sure. I can help you with Complaint Services. What would you like to do?\n\n"
        "• Submit a new complaint\n"
        "• Track an existing complaint\n"
        "• Learn about the complaint process"
    ),
    "complaints": (
        "Sure. I can help you with Complaint Services. What would you like to do?\n\n"
        "• Submit a new complaint\n"
        "• Track an existing complaint\n"
        "• Learn about the complaint process"
    ),
    "complaint submission": (
        "Sure. I can help you submit a complaint. Please describe the problem and provide the exact location, "
        "and I'll record it in the SMCMS for you."
    ),
    "complaint tracking": (
        "Sure. I can help you track a complaint. Please provide your Complaint Reference Number "
        "(e.g. KMC-2026-XXXX) and I'll look it up for you."
    ),
    # Waste Management
    "waste management": (
        "Sure. I can help you with Waste Management services. What would you like help with?\n\n"
        "• Report missed garbage collection\n"
        "• Report illegal dumping\n"
        "• Garbage collection schedule\n"
        "• Waste disposal information"
    ),
    "garbage collection": (
        "Sure. I can help you with Garbage Collection. What would you like help with?\n\n"
        "• Report missed garbage collection\n"
        "• Collection schedule information\n"
        "• Special waste collection request"
    ),
    # Property Assessment
    "property assessment": (
        "Sure. I can help you with Property Assessment. What would you like to know?\n\n"
        "• Assessment valuation queries\n"
        "• Assessment billing\n"
        "• Payment of assessment\n"
        "• Objection to assessment"
    ),
    # Rates and Taxes
    "rates and taxes": (
        "Sure. I can help you with Rates and Taxes. What would you like help with?\n\n"
        "• View rates and tax information\n"
        "• Pay rates and taxes\n"
        "• Query your assessment\n"
        "• Arrears and penalties"
    ),
    "rates & taxes": (
        "Sure. I can help you with Rates and Taxes. What would you like help with?\n\n"
        "• View rates and tax information\n"
        "• Pay rates and taxes\n"
        "• Query your assessment\n"
        "• Arrears and penalties"
    ),
    "rates": (
        "Sure. I can help you with Rates and Taxes. What would you like help with?\n\n"
        "• View rates information\n"
        "• Pay your rates\n"
        "• Query your assessment"
    ),
    "taxes": (
        "Sure. I can help you with Rates and Taxes. What would you like help with?\n\n"
        "• View tax information\n"
        "• Pay your taxes\n"
        "• Query your assessment"
    ),
    # Appointments
    "appointment": (
        "Sure. I can help you with Appointments. What would you like to do?\n\n"
        "• Schedule a new appointment\n"
        "• View or manage an existing appointment\n"
        "• Learn about appointment requirements"
    ),
    "appointments": (
        "Sure. I can help you with Appointments. What would you like to do?\n\n"
        "• Schedule a new appointment\n"
        "• View or manage an existing appointment\n"
        "• Learn about appointment requirements"
    ),
    # Public Health Services
    "public health": (
        "Sure. I can help you with Public Health Services. What would you like help with?\n\n"
        "• Health inspection complaints\n"
        "• Food safety concerns\n"
        "• Environmental health issues\n"
        "• Public sanitation"
    ),
    "public health services": (
        "Sure. I can help you with Public Health Services. What would you like help with?\n\n"
        "• Health inspection complaints\n"
        "• Food safety concerns\n"
        "• Environmental health issues\n"
        "• Public sanitation"
    ),
    # Water Supply
    "water supply": (
        "Sure. I can help you with Water Supply services. What would you like help with?\n\n"
        "• Report a water supply interruption\n"
        "• Report a pipe leak\n"
        "• Water quality complaints\n"
        "• New water connection inquiry"
    ),
    # Road Maintenance
    "road maintenance": (
        "Sure. I can help you with Road Maintenance. What would you like help with?\n\n"
        "• Report a pothole\n"
        "• Report road damage\n"
        "• Report a fallen tree blocking a road\n"
        "• Road repair status"
    ),
    # Drainage
    "drainage": (
        "Sure. I can help you with Drainage services. What would you like help with?\n\n"
        "• Report a blocked drain\n"
        "• Report flooding\n"
        "• Drainage maintenance request"
    ),
    # Street Lighting
    "street lighting": (
        "Sure. I can help you with Street Lighting. What would you like help with?\n\n"
        "• Report a faulty street light\n"
        "• Report a non-functioning lamp\n"
        "• Street lighting installation request"
    ),
    "street lights": (
        "Sure. I can help you with Street Lighting. What would you like help with?\n\n"
        "• Report a faulty street light\n"
        "• Report a non-functioning lamp\n"
        "• Street lighting installation request"
    ),
    # Municipal Billing
    "municipal billing": (
        "Sure. I can help you with Municipal Billing. What would you like help with?\n\n"
        "• View your municipal bill\n"
        "• Make a payment\n"
        "• Query an assessment charge\n"
        "• Arrears and penalties"
    ),
    "billing": (
        "Sure. I can help you with Municipal Billing. What would you like help with?\n\n"
        "• View your municipal bill\n"
        "• Make a payment\n"
        "• Query an assessment charge\n"
        "• Arrears and penalties"
    ),
    # Public Facilities
    "public facilities": (
        "Sure. I can help you with Public Facilities. What would you like help with?\n\n"
        "• Report a damaged public facility\n"
        "• Request a facility improvement\n"
        "• Parks and recreational areas\n"
        "• Community facilities"
    ),
}


def _service_category_response(question: str) -> str | None:
    """Detect when a citizen sends only a recognized service category name.

    Returns a guided acknowledgement response, or None if the input is not
    a recognized standalone service selection.
    """
    # Use a normalized version that preserves '&' for matching category aliases
    raw = (question or "").strip()
    # Normalize: lowercase, collapse whitespace, keep alphanumeric, spaces, &, and apostrophes
    normalized = re.sub(r"[^\w\s&']", " ", raw.lower())
    normalized = re.sub(r"\s+", " ", normalized).strip()

    if normalized in SERVICE_CATEGORIES:
        return SERVICE_CATEGORIES[normalized]

    # Also try stripping '&' → 'and' variant
    alt = normalized.replace("&", "and")
    alt = re.sub(r"\s+", " ", alt).strip()
    if alt in SERVICE_CATEGORIES:
        return SERVICE_CATEGORIES[alt]

    return None


def _conversation_response(question: str, history=None) -> str | None:
    """Handle simple conversation before service-specific rules."""
    q = _normalize_short_message(question)
    if not q:
        return None

    greetings = {
        "hi": "Hello! How can I help you with SMC services today?",
        "hello": "Hello! How can I help you with SMC services today?",
        "hey": "Hello! How can I help you with SMC services today?",
        "good morning": "Good morning! How can I help you with SMC services today?",
        "good afternoon": "Good afternoon! How can I help you with SMC services today?",
        "good evening": "Good evening! How can I help you with SMC services today?",
    }
    gratitude = {
        "thanks": "You're welcome! I'm happy to help.",
        "thank you": "You're welcome! I'm happy to help.",
        "thank you so much": "You're very welcome! Glad I could help.",
        "thanks a lot": "You're very welcome! Glad I could help.",
    }
    farewells = {
        "bye": "Goodbye! Have a great day.",
        "goodbye": "Goodbye! Take care.",
        "see you": "Goodbye! Take care.",
        "that's all thank you": "You're welcome! Have a great day.",
        "that is all thank you": "You're welcome! Have a great day.",
    }
    acknowledgements = {
        "okay": "Sure!",
        "ok": "Sure!",
        "alright": "Sure!",
        "all right": "Sure!",
        "got it": "Great!",
        "i got it": "Great!",
        "understood": "Glad I could clarify that!",
        "i understand": "Glad I could clarify that!",
        "i see": "Glad I could clarify that!",
        "noted": "Noted.",
        "sure": "Sure!",
        "fine": "Sure!",
        "that's clear": "Great!",
        "that is clear": "Great!",
        "that makes sense": "Great!",
        "i understand now": "Glad I could clarify that!",
        "that's helpful": "You're welcome!",
        "that is helpful": "You're welcome!",
        "perfect": "Great! I'm here if you need any further help.",
        "great": "Great!",
        "sounds good": "Great!",
        "alright thanks": "You're welcome!",
        "okay thank you": "You're welcome!",
    }
    confirmations = {
        "yes": "Sure. Let's continue.",
        "yes that's what i need": "Understood. I'll help you with that.",
        "yes that is what i need": "Understood. I'll help you with that.",
        "no": "Understood.",
        "no thanks": "No problem.",
    }

    for group in (farewells, gratitude, greetings, acknowledgements, confirmations):
        if q in group:
            return group[q]

    return None


def _auth_policy_response(question: str) -> str | None:
    """Return deterministic auth/payment/privacy guidance before model calls."""
    q = (question or "").strip().lower()
    if not q:
        return None

    auth_terms = ["register", "registration", "login", "log in", "account", "authenticate", "authentication", "sign in"]
    payment_terms = ["pay", "payment", "online payment", "bill payment", "tax payment", "assessment payment"]
    complaint_tracking_terms = ["complaint tracking", "track complaint", "tracking complaint", "complaint status"]
    complaint_private_terms = ["view complaint", "complaint information", "personal complaint", "my complaint"]
    application_terms = ["application", "applications", "certificate", "certificates", "permit", "license", "approval"]
    appointment_terms = ["appointment", "appointments", "booking", "book appointment"]

    if any(term in q for term in payment_terms):
        return ("To use the online municipal payment service, you must have an SMC account and log in first.\n\n"
                "After logging in, you can access the online payment service.")

    if re.search(r"\b(kmc-\d{4}-\d{4})\b", q, re.IGNORECASE) or any(term in q for term in complaint_tracking_terms):
        return ("Complaint tracking is a complaint-specific service. I can guide you to the official Complaint Tracking "
                "section, but private complaint status or complaint details can only be shown after the required "
                "authentication and authorization are verified through the SMC system.")

    if any(term in q for term in ["private information", "personal information", "payment history", "application status"] + complaint_private_terms):
        return ("I can't disclose private or personal information unless the required authentication and authorization "
                "have been successfully verified through the SMC system.")

    if any(term in q for term in auth_terms):
        if not any(term in q for term in complaint_tracking_terms + application_terms + appointment_terms):
            return "Sure. Which municipal service would you like to register for?"

        return ("The registration requirement depends on the service you would like to use. "
                "Which municipal service are you trying to access?")

    return None


def _fallback_response(question: str, session_id: str = "default", history=None) -> str:
    """Strict fallback implementation following Section 11, 14, 15 rules when API is unreachable."""
    memory = _get_session_memory(session_id, history)
    q = (question or "").strip().lower()

    conversation_reply = _conversation_response(question, history=memory)
    if conversation_reply:
        return conversation_reply

    # Section 3A: Service category selection — intercept before auth checks and fallback
    category_reply = _service_category_response(question)
    if category_reply:
        return category_reply

    auth_reply = _auth_policy_response(question)
    if auth_reply:
        return auth_reply

    # Section 14: Greetings
    if any(greet in q for greet in ["hi", "hello", "good morning", "good afternoon", "who are you", "what do you do"]):
        return ("Welcome to the Kalmunai Municipal Council AI Assistant.\n\n"
                "I can help you with municipal services, complaints, applications, requests, and other Council-related information.\n\n"
                "How may I assist you today?")

    # General Municipal Services Inquiry
    if any(phrase in q for phrase in ["what services", "services provided", "services does the council", "services does the municipal", "list of services", "which services", "what do you provide"]):
        return ("The Kalmunai Municipal Council provides the following services:\n\n"
                "• Waste Management & Garbage Collection\n"
                "• Water Supply Services & Leak Reporting\n"
                "• Road Maintenance & Pothole Repair\n"
                "• Drainage Maintenance & Flood Mitigation\n"
                "• Street Lighting & Public Electrical Faults\n"
                "• Public Facilities & Environmental Management\n"
                "• Municipal Assessment Billing & Tax Inquiries\n"
                "• Trade Licenses, Permits & Certificates\n"
                "• Citizen Complaint Submission & SMCMS Reference Tracking\n\n"
                "How may I assist you with any of these services today?")


    # Section 15: Unrelated Questions
    if any(unrelated in q for unrelated in [
        "capital of france", "recipe", "python code", "movie", "weather in london",
        "who won", "game", "president of", "tell me a joke"
    ]):
        return ("I'm here to assist with Kalmunai Municipal Council services and Council-related information. "
                "I can't help with unrelated general questions. How can I assist you with a municipal service?")

    # Section 10: Complaint Tracking Query with Reference Number
    tracking_match = re.search(r"\b(kmc-\d{4}-\d{4})\b", q, re.IGNORECASE)
    if tracking_match and get_complaint_by_tracking_id:
        tid = tracking_match.group(1).upper()
        record = get_complaint_by_tracking_id(tid)
        if record:
            return (f"🔍 **Complaint Status for {record['tracking_id']}**\n"
                    f"**Status:** {record['status']}\n"
                    f"**Category:** {record['category']}\n"
                    f"**Priority:** {record['priority']}\n"
                    f"**Description:** {record['description']}\n"
                    f"**Location:** {record['location']}\n"
                    f"**Date Filed:** {record['created_at']}")
        else:
            return f"I checked the SMCMS records, but no complaint was found matching Reference Number '{tid}'. Please verify the reference number."

    # Section 6 & 8: Complaint Analysis
    if any(word in q for word in ["tree", "road", "pothole", "block", "damaged"]):
        return ("Category: Road Maintenance\n\n"
                "Priority: HIGH\n\n"
                "Reason:\n"
                "Road blockages and severe structural damage present immediate public safety and traffic risks.\n\n"
                "Please provide:\n"
                "• Exact location\n"
                "• Description of the problem\n"
                "• Photo, if available\n\n"
                "You can submit this complaint through the SMCMS.")

    if any(word in q for word in ["water", "pipe", "leak", "tap", "no water"]):
        return ("Category: Water Supply\n\n"
                "Priority: MEDIUM\n\n"
                "Reason:\n"
                "Water supply interruptions affect essential daily household needs.\n\n"
                "Please provide:\n"
                "• Exact location\n"
                "• Description of the problem\n"
                "• Photo, if available\n\n"
                "You can submit this complaint through the SMCMS.")

    if any(word in q for word in ["garbage", "waste", "trash", "dumping", "collection"]):
        return ("Category: Waste Management\n\n"
                "Priority: MEDIUM\n\n"
                "Reason:\n"
                "Uncollected garbage causes sanitation hazards and environmental issues.\n\n"
                "Please provide:\n"
                "• Exact location\n"
                "• Description of the problem\n"
                "• Photo, if available\n\n"
                "You can submit this complaint through the SMCMS.")

    if any(word in q for word in ["light", "street light", "lamp"]):
        return ("Category: Street Lighting\n\n"
                "Priority: MEDIUM\n\n"
                "Reason:\n"
                "Non-functioning street lamps affect public night safety and convenience.\n\n"
                "Please provide:\n"
                "• Exact location\n"
                "• Description of the problem\n"
                "• Photo, if available\n\n"
                "You can submit this complaint through the SMCMS.")

    # Section 11: Information Not Available Fallback
    return ("I don't have the verified information needed to answer that accurately. "
            "Please contact the Kalmunai Municipal Council office for the exact details.")


def _get_or_create_chat(session_id: str):
    if client is None:
        return None, None
    if session_id in _sessions:
        return _sessions[session_id], _session_models.get(session_id, CANDIDATE_MODELS[0])

    for model_name in CANDIDATE_MODELS:
        try:
            chat_instance = client.chats.create(
                model=model_name,
                config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
            )
            _sessions[session_id] = chat_instance
            _session_models[session_id] = model_name
            return chat_instance, model_name
        except Exception:
            continue

    return None, None


def _make_file_complaint_tool(result_holder: list):
    """Function tool for Gemini to file a municipal complaint into SQLite DB."""
    def file_complaint(description: str, location: str) -> dict:
        """Files an official municipal complaint into the SMCMS system.

        Args:
            description: Clear description of the municipal problem.
            location: Exact location or area in Kalmunai.
        """
        category = category_model.predict(category_vectorizer.transform([description]))[0]
        priority = priority_model.predict(priority_vectorizer.transform([description]))[0]

        if save_complaint:
            db_record = save_complaint(
                description=description,
                location=location,
                category=category,
                priority=priority,
                citizen_name="Citizen (AI Assistant)"
            )
            tracking_id = db_record["tracking_id"]
        else:
            tracking_id = "KMC-2026-0001"

        result = {
            "tracking_id": tracking_id,
            "description": description,
            "location": location,
            "category": category,
            "priority": priority,
            "status": "Recorded",
            "message": f"Complaint recorded successfully under Reference Number: {tracking_id}"
        }
        result_holder.append(result)
        return result

    return file_complaint


def _make_track_complaint_tool(result_holder: list):
    """Function tool for Gemini to track a complaint by reference number."""
    def track_complaint(tracking_id: str) -> dict:
        """Tracks the status of a complaint using its SMCMS reference number.

        Args:
            tracking_id: The complaint reference number (e.g. KMC-2026-8492).
        """
        if get_complaint_by_tracking_id:
            record = get_complaint_by_tracking_id(tracking_id.strip())
            if record:
                res = {
                    "found": True,
                    "tracking_id": record["tracking_id"],
                    "status": record["status"],
                    "category": record["category"],
                    "priority": record["priority"],
                    "description": record["description"],
                    "location": record["location"],
                    "created_at": record["created_at"]
                }
                result_holder.append(res)
                return res

        res = {"found": False, "tracking_id": tracking_id, "message": "No complaint found matching this reference number."}
        result_holder.append(res)
        return res

    return track_complaint


def municipal_chatbot(question: str, session_id: str = "default", history=None) -> dict:
    """Main entry point for Kalmunai Municipal Council AI Service Assistant."""
    if not question or not str(question).strip():
        return {
            "reply": "Please describe how I can assist you with Kalmunai Municipal Council services.",
            "complaint_filed": False,
            "complaint": None,
        }

    memory = _get_session_memory(session_id, history)
    memory.append({"role": "user", "content": question})

    # Section 14: Handle simple conversational messages FIRST — before auth checks or API calls.
    # This ensures greetings, acknowledgements, gratitude, confirmations, and farewells are
    # never misrouted through service-information, registration, or unknown-information rules.
    conversation_reply = _conversation_response(question, history=memory)
    if conversation_reply:
        memory.append({"role": "assistant", "content": conversation_reply})
        return {
            "reply": conversation_reply,
            "complaint_filed": False,
            "complaint": None,
        }

    # Section 3A: Handle bare service category selections before auth checks or API calls.
    # A citizen typing only a service name (e.g. "Trade Licenses, Permits & Certificates")
    # should receive an immediate guided acknowledgement, not the unknown-information fallback.
    category_reply = _service_category_response(question)
    if category_reply:
        memory.append({"role": "assistant", "content": category_reply})
        return {
            "reply": category_reply,
            "complaint_filed": False,
            "complaint": None,
        }

    auth_reply = _auth_policy_response(question)
    if auth_reply:
        memory.append({"role": "assistant", "content": auth_reply})
        return {
            "reply": auth_reply,
            "complaint_filed": False,
            "complaint": None,
        }

    chat, model_used = _get_or_create_chat(session_id)
    if chat is None:
        reply = _fallback_response(question, session_id=session_id, history=memory)
        memory.append({"role": "assistant", "content": reply})
        return {
            "reply": reply,
            "complaint_filed": False,
            "complaint": None,
        }

    try:
        result_holder = []
        file_tool = _make_file_complaint_tool(result_holder)

        response = chat.send_message(
            question,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                tools=[file_tool],
            ),
        )

        complaint = result_holder[0] if result_holder and "category" in result_holder[0] else None
        reply = response.text or ""
        
        if complaint and complaint.get("tracking_id"):
            reply += f"\n\n📋 **Complaint Submitted to SMCMS!**\nReference Number: `{complaint['tracking_id']}`\nCategory: {complaint['category']} | Priority: {complaint['priority']}\nYou can track your complaint anytime using this Reference Number."

        memory.append({"role": "assistant", "content": reply})

        return {
            "reply": reply.strip(),
            "complaint_filed": complaint is not None,
            "complaint": complaint,
        }
    except Exception as e:
        print(f"[CHATBOT WARN] Error invoking Gemini model: {e}")
        reply = _fallback_response(question, session_id=session_id, history=memory)
        memory.append({"role": "assistant", "content": reply})
        return {
            "reply": reply,
            "complaint_filed": False,
            "complaint": None,
        }


if __name__ == "__main__":
    print("\n====================================")
    print("KALMUNAI MUNICIPAL COUNCIL AI SERVICE ASSISTANT")
    print("Type 'exit' to quit")
    print("====================================\n")

    cli_session = "cli-session"
    while True:
        user_input = input("Citizen: ")
        if user_input.lower() == "exit":
            print("\nGoodbye!")
            break
        try:
            result = municipal_chatbot(user_input, session_id=cli_session)
            print("\nKMC AI Assistant:")
            print(result["reply"])
            if result["complaint_filed"]:
                print(f"\n[Complaint recorded: {result['complaint']}]")
            print()
        except Exception as err:
            print(f"\nError: {err}\n")

