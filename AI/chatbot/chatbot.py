import os
from pathlib import Path

from dotenv import load_dotenv

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    from google import genai as google_genai
except ImportError:
    google_genai = None

try:
    import google.generativeai as genai_legacy
except ImportError:
    genai_legacy = None

# Load environment variables from the project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
AI_PROVIDER = (os.getenv("AI_PROVIDER") or "openai").lower()

# Kalmunai Municipal Council knowledge base
KNOWLEDGE_BASE = """
You are the official AI Assistant for Kalmunai Municipal Council (KMC), Sri Lanka.

Your role is limited to KMC municipal services, complaints, permits, public services,
and information available through the Smart Municipal Council System.

KMC responsibilities and supported services:
- Road maintenance, water supply, waste collection, and drainage systems
- Street lighting, public facilities, environmental services, and municipal billing
- Public parks, recreational facilities, complaint management, and citizen services
- Complaint submission and tracking

Complaint categories:
- Water Supply, Waste Management, Road Maintenance, Drainage
- Electrical Issues, Street Light Issues, Public Facilities, Environmental Issues
- Municipal Billing, Boat Services, Other Municipal Services

Priority rules:
- HIGH: fallen trees blocking roads, exposed electrical wires, electrical hazards,
  dangerous road damage, major flooding, sewage overflow, or public safety emergencies
- MEDIUM: water supply interruptions, drainage problems, waste collection delays,
  or street light failures
- LOW: suggestions, public facility improvements, information requests, and general inquiries

Complaint workflow:
1. Identify the complaint category.
2. Suggest HIGH, MEDIUM, or LOW priority.
3. Explain why.
4. Ask for exact location, description, date and time, and a photograph when available.
5. Encourage immediate submission for urgent complaints through the Smart Municipal Council Complaint Portal.

Known guidance:
- Submit complaints through the Smart Municipal Council Complaint Portal with category,
  location, description, date, and time.
- Track a complaint with the reference number received during submission.
- Water leaks use Water Supply; road damage uses Road Maintenance; broken street lights
    use Street Lights; missed garbage collection uses Waste Management.

Language and safety rules:
- Answer in the same language as the citizen: English, Sinhala, Tamil, Singlish,
    or Tamil-English mixed text.
- Never invent phone numbers, addresses, email addresses, permit rules, tax amounts,
    fees, payment information, or opening hours.
- Do not claim that a complaint, payment, application, or appointment was completed.
- For unavailable information, reply exactly:
    "Please contact the Kalmunai Municipal Council office for exact details."
- For unrelated questions, reply exactly:
    "I can only assist with Kalmunai Municipal Council services and complaints."
- Be friendly, professional, concise, helpful, and citizen-focused.
"""


def _generate_with_openai(prompt: str, history=None):
    if OpenAI is None or not OPENAI_API_KEY:
        raise RuntimeError("OpenAI API key or openai SDK is missing.")

    client = OpenAI(api_key=OPENAI_API_KEY)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": KNOWLEDGE_BASE}]
        + (history or [])
        + [{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    return response.choices[0].message.content.strip()


def _generate_with_new_sdk(prompt: str, history=None):
    if google_genai is None or not GEMINI_API_KEY:
        raise RuntimeError("Gemini API key or google-genai SDK is missing.")

    client = google_genai.Client(api_key=GEMINI_API_KEY)
    conversation = "\n".join(
        f"{item.get('role', 'user').title()}: {item.get('content', '')}"
        for item in (history or [])
    )
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=f"{conversation}\nCitizen: {prompt}" if conversation else prompt,
    )

    if hasattr(response, "text") and response.text:
        return response.text

    if hasattr(response, "candidates") and response.candidates:
        return response.candidates[0].content.parts[0].text

    raise RuntimeError("Gemini returned an empty response.")


def _generate_with_legacy_sdk(prompt: str, history=None):
    if genai_legacy is None or not GEMINI_API_KEY:
        raise RuntimeError("Gemini API key or google-generativeai SDK is missing.")

    genai_legacy.configure(api_key=GEMINI_API_KEY)
    model = genai_legacy.GenerativeModel("gemini-3.6-flash")
    conversation = "\n".join(
        f"{item.get('role', 'user').title()}: {item.get('content', '')}"
        for item in (history or [])
    )
    response = model.generate_content(
        f"{conversation}\nCitizen: {prompt}" if conversation else prompt
    )

    if hasattr(response, "text") and response.text:
        return response.text

    raise RuntimeError("Gemini returned an empty response.")


def _fallback_response(question: str, history=None) -> str:
    text = (question or "").lower()
    history = history or []
    municipal_terms = [
        "municipal", "council", "complaint", "water", "waste", "garbage", "trash",
        "road", "pothole", "drain", "flood", "sewage", "electric", "streetlight",
        "light", "facility", "park", "library", "billing", "bill", "payment", "tax",
        "permit", "license", "boat", "bus", "transit", "certificate", "service",
        "appointment", "office", "collection", "environment"
    ]

    if not any(term in text for term in municipal_terms):
        return "I can only assist with Kalmunai Municipal Council services and complaints."

    if any(word in text.split() for word in ["hi", "hello", "hey"]):
        return (
            "Hello! I can help you report a municipal issue, check what department handles it, "
            "or explain what information to include. What would you like help with?"
        )

    if any(phrase in text for phrase in ["thank you", "thanks", "great", "okay"]) or text.strip() in ["ok", "okay"]:
        return "You are welcome. Is there anything else about your municipal issue that you would like me to help with?"

    if any(phrase in text for phrase in ["submit a complaint", "file a complaint", "report an issue"]):
        return (
            "You can submit a complaint through the Smart Municipal Council Complaint Portal by providing the complaint category, location, and description."
        )

    if any(word in text for word in ["permit", "license", "licence", "building approval", "business registration"]):
        return (
            "I can help with municipal permits and licenses, including building or business-related applications. "
            "Please tell me which permit or license you need and whether you want the requirements, application steps, or status of an existing request."
        )

    if any(word in text for word in ["shop tax", "business tax", "trade tax", "commercial tax"]):
        return (
            "For a shop or business tax question, the council normally needs the business or assessment number, "
            "the owner or business name, and the property location. Please share whether you need the current amount, "
            "a payment method, a receipt, or a review of the assessment. I should not guess the official rate or due date."
        )

    if any(word in text for word in ["house tax", "property tax", "land tax", "assessment"]):
        return (
            "I can help with house tax and property assessment questions. Please share the assessment number or property reference, "
            "the area, and whether you need the current amount, payment guidance, a receipt, or an assessment review. "
            "For the official rate and due date, the Council revenue section must confirm the record."
        )

    if any(word in text for word in ["birth certificate", "death certificate", "residence certificate", "certificate", "document"]):
        return (
            "I can guide you on municipal certificates and documents. Which document do you need, and are you applying for the first time, "
            "requesting a replacement, or checking an application?"
        )

    if any(word in text for word in ["parking", "bus", "transport", "boat schedule", "traffic permit"]) or " park " in f" {text} ":
        return (
            "I can help with municipal transport, parking, and boat service information. Please tell me the route, parking area, permit, "
            "or schedule you are asking about."
        )

    if any(word in text for word in ["appointment", "office hours", "opening hours", "contact"]):
        return (
            "I can help you prepare for a council visit or appointment. Tell me which department or service you need. "
            "For exact office hours, phone numbers, or locations, please confirm with the Municipal Council office because I should not guess those details."
        )

    if any(word in text for word in ["event", "community program", "recreation", "library", "sports"]):
        return (
            "I can help with council events, community programs, recreation, libraries, and sports facilities. "
            "What program or facility would you like information about?"
        )

    if any(word in text for word in ["blocked drain", "drainage", "drain", "flood", "overflow", "water on road"]):
        return (
            "Category: Drainage\nPriority: MEDIUM\nReason: Blocked drainage can cause flooding and sanitation risks.\n\n"
            "Please provide the exact location, whether the water is still rising, the date and time, and a photograph if available. "
            "Please submit it through the Smart Municipal Council Complaint Portal."
        )

    if any(word in text for word in ["water leak", "water supply", "no water", "water is not", "water not", "pipe burst", "low water", "leak"]) or ("water" in text and any(word in text for word in ["coming", "available", "interruption", "problem"])):
        return (
            "Category: Water Supply\nPriority: MEDIUM\nReason: A water interruption or leak can disrupt service and cause property damage.\n\n"
            "Please provide the exact location, duration or date and time, whether it affects one property or the whole street, and a photograph if available. "
            "Please submit it through the Smart Municipal Council Complaint Portal."
        )

    if any(word in text for word in ["waste", "garbage", "trash", "dump", "litter", "sewage"]):
        if "sewage" in text:
            return (
                "Category: Environmental Issues\nPriority: HIGH\nReason: Sewage overflow can create serious public health and environmental risks.\n\n"
                "Please provide the exact location, date and time, and a photograph if available. Avoid contact with the overflow and submit it through the Smart Municipal Council Complaint Portal."
            )
        return (
            "Category: Waste Management\nPriority: MEDIUM\nReason: Missed collection or sewage can affect sanitation and the environment.\n\n"
            "Please provide the exact location, waste type, date and time or duration, and a photograph if available. "
            "Please submit it through the Smart Municipal Council Complaint Portal."
        )

    if any(word in text for word in ["road", "pothole", "traffic", "carriageway", "broken road"]):
        if ("tree" in text and any(word in text for word in ["fallen", "blocking"])) or any(word in text for word in ["dangerous", "accident", "unsafe"]):
            return (
                "Category: Road Maintenance\nPriority: HIGH\nReason: This may create a public safety or traffic risk.\n\n"
                "Please provide the exact location, obstruction description, date and time, and a photograph if available. "
                "Please submit it through the Smart Municipal Council Complaint Portal."
            )
        return (
            "Category: Road Maintenance\nPriority: MEDIUM\nReason: Road damage can affect traffic and public safety.\n\n"
            "Please provide the exact location, the size or severity of the damage, date and time, and a photograph if possible. "
            "Please submit it through the Smart Municipal Council Complaint Portal."
        )

    if any(word in text for word in ["electric", "streetlight", "street light", "power cut", "bulb", "lighting", "electricity"]):
        if any(word in text for word in ["wire", "exposed", "hazard", "spark", "danger"]):
            return (
                "Category: Electrical Issues\nPriority: HIGH\nReason: An electrical hazard may threaten public safety.\n\n"
                "Keep away from the hazard and provide the exact location, description, date and time if it is safe to do so. "
                "Please submit it through the Smart Municipal Council Complaint Portal."
            )
        return (
            "Category: Street Light Issues\nPriority: MEDIUM\nReason: A failed street light can affect public convenience and safety.\n\n"
            "Please share the exact pole location, road name, issue description, date and time, and a photograph if possible. "
            "Please submit it through the Smart Municipal Council Complaint Portal."
        )

    if any(word in text for word in ["payment not showing", "payment is not showing", "payment missing", "payment pending", "receipt"]):
        return (
            "If a payment is not showing, please keep the payment reference, date, amount, and account or assessment number ready. "
            "The Council revenue section can match the transaction and issue or correct the receipt. Do not send card numbers or passwords here."
        )

    if any(word in text for word in ["billing", "bill", "payment", "charge", "invoice"]):
        return (
            "I can help with billing and payment questions. Please describe whether you need the amount, payment method, receipt, "
            "or help with an unexpected charge. Keep your account or assessment reference ready for the revenue team."
        )

    if any(word in text for word in ["public facility", "school", "community center", "facility"]) or " park " in f" {text} ":
        return (
            "I can route that public-facility concern to the appropriate team. Please include the facility name, exact location, and what needs attention."
        )

    return (
        "I can help with municipal services, applications, payments, documents, permits, public facilities, transport, or complaints. "
        "What service do you need, and what would you like to know about it?"
    )

def municipal_chatbot(question, history=None):
    prompt = f"""
    {KNOWLEDGE_BASE}

    Conversation history:
    {history or []}

    Citizen Question:
    {question}

    Reply naturally and directly, like a helpful AI assistant for all Municipal Council services, not only complaints. Use the conversation context, ask one useful follow-up question when needed, and do not claim that an application, payment, appointment, or complaint was completed unless the user actually completes it. Never invent office details, requirements, fees, phone numbers, or processing times.
    """

    errors = []

    if AI_PROVIDER == "openai":
        try:
            return _generate_with_openai(prompt, history)
        except Exception as exc:
            errors.append(f"openai: {exc}")

    if AI_PROVIDER == "gemini":
        provider_order = ["gemini"]
    else:
        provider_order = ["gemini"]

    if provider_order:
        if google_genai is not None:
            try:
                return _generate_with_new_sdk(prompt, history)
            except Exception as exc:
                errors.append(f"new-sdk: {exc}")

        if genai_legacy is not None:
            try:
                return _generate_with_legacy_sdk(prompt, history)
            except Exception as exc:
                errors.append(f"legacy-sdk: {exc}")

    if OPENAI_API_KEY and AI_PROVIDER != "openai":
        try:
            return _generate_with_openai(prompt, history)
        except Exception as exc:
            errors.append(f"openai: {exc}")

    if not OPENAI_API_KEY and not GEMINI_API_KEY:
        return _fallback_response(question, history)

    if errors:
        return _fallback_response(question, history)

    return _fallback_response(question, history)


if __name__ == "__main__":

    print("\n====================================")
    print("SMART MUNICIPAL COUNCIL CHATBOT")
    print("Type 'exit' to quit")
    print("====================================\n")

    while True:

        user_input = input("Citizen: ")

        if user_input.lower() == "exit":
            print("\nGoodbye!")
            break

        try:

            answer = municipal_chatbot(
                user_input
            )

            print("\nBot:")
            print(answer)
            print()

        except Exception as e:

            print("\nError:")
            print(e)
            print()