
import os

from dotenv import load_dotenv
from google import genai

from rag_service import search_health_knowledge


# ==========================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL")


if not GEMINI_API_KEY:
    raise ValueError(
        "GEMINI_API_KEY is missing. "
        "Please check your .env file."
    )


if not GEMINI_MODEL:
    raise ValueError(
        "GEMINI_MODEL is missing. "
        "Please check your .env file."
    )


# ==========================================
# GEMINI CLIENT
# ==========================================

client = genai.Client(
    api_key=GEMINI_API_KEY
)


# ==========================================
# HEALTH AI SYSTEM PROMPT
# ==========================================

SYSTEM_PROMPT = """
You are HealthAI, an AI Health Information Assistant.

Your specialization is ONLY health and healthcare information.

You can help users understand:

- General health
- Symptoms
- Diseases and health conditions
- Nutrition
- Fitness and exercise
- Sleep
- Lifestyle
- Preventive healthcare
- Medical terminology
- General medicine information

IMPORTANT SAFETY RULES:

1. Do not diagnose the user.

2. Do not prescribe medicines.

3. Do not provide personalized medication dosages.

4. Do not pretend to be a doctor.

5. If symptoms could indicate a serious or emergency
   condition, recommend seeking appropriate professional
   medical attention.

6. Explain information in simple language.

7. Do not intentionally invent medical information.

8. Do not provide dangerous instructions.

9. Clearly distinguish general educational information
   from professional medical advice.

10. Encourage users to consult qualified healthcare
    professionals when appropriate.

RAG RULES:

- Use the retrieved health knowledge as supporting
  information.
- Prefer information relevant to the user's question.
- Do not mention ChromaDB, RAG, embeddings, or internal
  implementation details.
- Explain the information naturally.
- Do not blindly copy the retrieved text.
- If the available information is insufficient, say so.

CONVERSATION RULES:

- Use previous conversation messages when relevant.
- Understand follow-up words such as "it", "this",
  "that", and "they".
- Do not claim to remember information that isn't
  present in the conversation.
- Stay focused on health-related topics.

Your purpose is to provide educational health information,
not diagnosis or treatment.
"""


# ==========================================
# GET HEALTH RESPONSE
# ==========================================

def get_health_response(
    question,
    conversation_history=None
):

    # --------------------------------------
    # RETRIEVE HEALTH KNOWLEDGE
    # --------------------------------------

    rag_result = search_health_knowledge(
    question,
    number_of_results=4
)

    health_context = rag_result.get(
    "context",
    ""
)


    # --------------------------------------
    # CREATE PROMPT
    # --------------------------------------

    prompt = f"""
{SYSTEM_PROMPT}

RELEVANT HEALTH KNOWLEDGE:

{health_context}

END OF RELEVANT HEALTH KNOWLEDGE.


USER QUESTION:

{question}
"""


    # --------------------------------------
    # ADD CONVERSATION HISTORY
    # --------------------------------------

    if conversation_history:

        history_text = "\n\nCONVERSATION HISTORY:\n"

        for message in conversation_history:

            role = message.get("role", "user")
            content = message.get("content", "")

            history_text += (
                f"{role.upper()}: {content}\n"
            )

        prompt += history_text


    # --------------------------------------
    # GEMINI REQUEST
    # --------------------------------------

    response = client.models.generate_content(

        model=GEMINI_MODEL,

        contents=prompt

    )


    # --------------------------------------
    # RETURN RESPONSE
    # --------------------------------------

    return response.text