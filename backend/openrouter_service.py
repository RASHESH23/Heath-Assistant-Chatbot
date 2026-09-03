import os
from dotenv import load_dotenv
from openai import OpenAI

from rag_service import search_health_knowledge


# ==========================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL")

if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY is missing in .env")

if not OPENROUTER_MODEL:
    raise ValueError("OPENROUTER_MODEL is missing in .env")


# ==========================================
# OPENROUTER CLIENT
# ==========================================

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY
)


# ==========================================
# SYSTEM PROMPT
# ==========================================

SYSTEM_PROMPT = """
You are a Health Information Assistant.

Your job is to provide general, educational health information
in simple and understandable language.

IMPORTANT RULES:

1. Do not diagnose diseases.
2. Do not prescribe medicines.
3. Do not provide personalized medication dosages.
4. Do not replace a qualified doctor or medical professional.
5. If the user describes a potentially serious or emergency
   situation, advise them to seek immediate medical attention.
6. Use the provided health knowledge as supporting information.
7. Stay focused on health-related questions.
8. Be clear, helpful, and concise.
9. If the available information is insufficient, say so rather
   than inventing medical facts.
"""


# ==========================================
# HEALTH RESPONSE
# ==========================================

def get_health_response(question, conversation_history=None):

    # --------------------------------------
    # SEARCH HEALTH KNOWLEDGE
    # --------------------------------------

    rag_result = search_health_knowledge(
        question,
        number_of_results=4
    )

    health_context = rag_result.get("context", "")

    # --------------------------------------
    # BUILD MESSAGES
    # --------------------------------------

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        }
    ]

    # --------------------------------------
    # CONVERSATION HISTORY
    # --------------------------------------

    if conversation_history:

        for message in conversation_history:

            role = message.get("role", "user")
            content = message.get("content", "")

            if role not in ["user", "assistant"]:
                role = "user"

            messages.append({
                "role": role,
                "content": content
            })

    # --------------------------------------
    # CURRENT QUESTION + RAG CONTEXT
    # --------------------------------------

    user_prompt = f"""
RELEVANT HEALTH KNOWLEDGE:

{health_context}

USER QUESTION:

{question}

Answer the user's question using the relevant health
knowledge above when applicable.
"""

    messages.append({
        "role": "user",
        "content": user_prompt
    })

    # --------------------------------------
    # SEND REQUEST TO OPENROUTER
    # --------------------------------------

    response = client.chat.completions.create(
        model=OPENROUTER_MODEL,
        messages=messages,
        temperature=0.3
    )

    # --------------------------------------
    # RETURN AI RESPONSE
    # --------------------------------------

    return response.choices[0].message.content