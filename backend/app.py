from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from gemini_service import get_health_response

from health_safety import (
    is_health_question,
    is_emergency,
    get_non_health_response,
    get_emergency_response
)


# ==========================================
# FASTAPI APP
# ==========================================

app = FastAPI(
    title="HealthAI API",
    description="AI Health Information Assistant",
    version="1.0.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ==========================================
# REQUEST MODEL
# ==========================================

class ChatRequest(BaseModel):

    message: str

    conversation_history: list = []


# ==========================================
# HOME / HEALTH CHECK
# ==========================================

@app.get("/")
def home():

    return {
        "message": "HealthAI API is running",
        "status": "online"
    }


# ==========================================
# CHAT
# ==========================================

@app.post("/chat")
def chat(request: ChatRequest):

    try:

        question = request.message.strip()


        # ======================================
        # EMPTY QUESTION
        # ======================================

        if not question:

            return {
                "response":
                "Please enter a health-related question."
            }


        # ======================================
        # CHECK IF HEALTH RELATED
        # ======================================

        if not is_health_question(question):

            return {
                "response":
                get_non_health_response()
            }


        # ======================================
        # CHECK EMERGENCY
        # ======================================

        if is_emergency(question):

            return {
                "response":
                get_emergency_response()
            }


        # ======================================
        # GEMINI + RAG
        # ======================================

        response = get_health_response(

            question,

            request.conversation_history

        )


        # ======================================
        # RETURN AI RESPONSE
        # ======================================

        return {

            "response": response

        }


    except Exception as error:

        print(
            "AI ERROR:",
            error
        )


        return {

            "response":
            "Sorry, I couldn't process your question "
            "right now. Please try again."

        }