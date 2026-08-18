import os

from dotenv import load_dotenv
from groq import Groq

from rag_service import search_health_knowledge


# ==========================================
# LOAD ENVIRONMENT
# ==========================================

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
MODEL = os.getenv("GROQ_MODEL")


if not API_KEY:
    raise ValueError(
        "GROQ_API_KEY is missing. Check your .env file."
    )

if not MODEL:
    raise ValueError(
        "GROQ_MODEL is missing. Check your .env file."
    )


# ==========================================
# GROQ CLIENT
# ==========================================

client = Groq(
    api_key=API_KEY
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

5. If the user's symptoms could indicate a serious
   or emergency condition, recommend seeking
   appropriate professional medical care.

6. Explain information in simple language.

7. Do not intentionally invent medical information.

8. Do not provide dangerous instructions.

9. Clearly distinguish educational information
   from professional medical advice.

10. Encourage users to consult qualified healthcare
    professionals when appropriate.

RAG RULES:

- Use the retrieved health knowledge as supporting
  information for your answer.
- Prefer information relevant to the user's question.
- Do not mention ChromaDB, RAG, embeddings, or
  internal system details to the user.
- Do not blindly copy the retrieved information.
- Explain it naturally and clearly.
- If the retrieved information does not contain
  enough information, say that general information
  may not be sufficient and recommend a healthcare
  professional when appropriate.

CONVERSATION RULES:

- Remember relevant information from the conversation.
- Use previous messages when answering follow-up questions.
- Understand words such as "it", "this", "that", and "they"
  using the conversation history.
- Do not claim to remember information that is not
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
    # RETRIEVE RELEVANT HEALTH INFORMATION
    # --------------------------------------

    health_context = search_health_knowledge(
        question,
        number_of_results=4
    )


    # --------------------------------------
    # BUILD RAG CONTEXT
    # --------------------------------------

    if health_context:

        context_message = f"""
RELEVANT HEALTH KNOWLEDGE:

{health_context}

END OF HEALTH KNOWLEDGE
"""

    else:

        context_message = """
No directly relevant health knowledge was
found in the local knowledge base.
"""


    # --------------------------------------
    # BUILD MESSAGES
    # --------------------------------------

    messages = [

        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },

        {
            "role": "system",
            "content": context_message
        }

    ]


    # --------------------------------------
    # ADD CONVERSATION HISTORY
    # --------------------------------------

    if conversation_history:

        messages.extend(
            conversation_history
        )


    # --------------------------------------
    # ADD CURRENT QUESTION
    # --------------------------------------

    messages.append({

        "role": "user",

        "content": question

    })


    # --------------------------------------
    # GROQ REQUEST
    # --------------------------------------

    response = client.chat.completions.create(

        model=MODEL,

        messages=messages,

        temperature=0.3,

        max_tokens=700

    )


    # --------------------------------------
    # RETURN ANSWER
    # --------------------------------------

    return response.choices[0].message.content