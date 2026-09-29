# HealthAI

HealthAI is a health-focused AI assistant that answers general health questions using a Retrieval-Augmented Generation (RAG) pipeline and a FastAPI backend. The project combines a health knowledge database, Gemini API integration, and a polished frontend chat interface to provide educational health information in a safe and structured way.

## Project Overview

This application allows users to:

- Ask health-related questions in natural language
- Receive general health information and wellness guidance
- Get lifestyle, nutrition, sleep, and fitness suggestions
- Use a RAG-based knowledge layer built from curated health documents
- Be blocked from non-health requests and emergency scenarios

The project is designed as a lightweight demo/portfolio AI healthcare assistant, with:

- FastAPI backend for API endpoints
- ChromaDB for vector-based document retrieval
- Google Gemini for answer generation
- Static frontend for user interaction
- Local document ingestion pipeline for health knowledge

---

## Features

### Backend capabilities
- FastAPI chat endpoint at `/chat`
- Health question classification using keyword-based filters
- Emergency detection for life-threatening symptoms
- Retrieval of relevant medical knowledge from a local vector database
- AI response generation using Gemini
- Safety layer that prevents diagnosis, medication instructions, and emergency mismanagement

### Frontend capabilities
- Modern landing-page style UI
- Chat interface for user questions
- Symptom checker section
- BMI calculator section
- Wellness and health information cards
- Responsive design for desktop/mobile interaction

### Knowledge layer
- Local health knowledge file stored under `data/health_documents/`
- ChromaDB indexing script to create a persistent vector collection
- RAG retrieval that pulls relevant passages before generating a response

---

## Project Structure

```text
Health Assistant Bot/
├── backend/
│   ├── app.py                  # FastAPI application and API routes
│   ├── gemini_service.py       # Gemini AI integration and prompt construction
│   ├── rag_service.py          # ChromaDB retrieval logic
│   ├── health_safety.py        # Health-question and emergency detection
│   ├── test_gemini.py          # Gemini response test script
│   └── test_rag.py             # RAG retrieval test script
├── frontend/
│   ├── index.html              # Main frontend page
│   ├── css/
│   │   └── style.css           # Styling and layout
│   └── js/
│       └── app.js              # Frontend application logic and chat behavior
├── data/
│   └── health_documents/
│       └── health_knowledge.txt # Knowledge base source content
├── database/
│   └── chroma_db/              # Persistent Chroma vector database
├── scripts/
│   └── ingest.py               # Script to load health docs into ChromaDB
├── env/                        # Python virtual environment
├── .gitignore                  # Git ignore rules
├── README.md                   # Project documentation
└── .gitattributes              # Git attributes
```

---

## Technology Stack

### Backend
- Python 3.14 (virtual environment included)
- FastAPI
- Pydantic
- ChromaDB
- Google GenAI SDK
- python-dotenv

### Frontend
- HTML
- CSS
- JavaScript
- Static browser-based UI

### AI / RAG
- Google Gemini model
- Local vector search using ChromaDB
- Health knowledge context retrieval before generation

---

## Environment Setup

1. Open the project root.
2. Activate the provided virtual environment:

```bash
source env/bin/activate
```

3. Create a `.env` file in the project root (or backend directory if you run the app from there) with the following values:

```env
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Example model names may include:
- `gemini-2.5-flash`
- `gemini-2.0-flash`
- other valid Gemini model names available in your Google AI account

> Make sure your Gemini API key is valid and has access to the model you configure.

---

## Installation

If dependencies are not already installed in the active environment, install the required packages:

```bash
pip install fastapi uvicorn python-dotenv google-genai chromadb
```

---

## Data Ingestion

The health knowledge base is stored in `data/health_documents/health_knowledge.txt` and must be loaded into ChromaDB before running the chatbot.

Run:

```bash
python scripts/ingest.py
```

This script:
- reads the knowledge file
- splits content into sections
- clears any previous collection data
- stores data in the persistent ChromaDB collection named `health_knowledge`

---

## Running the App

### Start the backend API

From the project root, run:

```bash
cd backend
uvicorn app:app --reload
```

This starts the FastAPI server at:

```text
http://127.0.0.1:8000
```

Swagger docs are also available at:

```text
http://127.0.0.1:8000/docs
```

### Open the frontend

Open the HTML file directly in the browser, or serve the frontend locally:

```bash
cd frontend
python3 -m http.server 8001
```

Then open:

```text
http://127.0.0.1:8001/
```

The frontend JavaScript is configured to call the backend at:

```text
http://127.0.0.1:8000/chat
```

---

## API Usage

### Health check

```http
GET /
```

Example response:

```json
{
  "message": "HealthAI API is running",
  "status": "online"
}
```

### Chat endpoint

```http
POST /chat
```

Request body:

```json
{
  "message": "What are healthy breakfast options?",
  "conversation_history": []
}
```

Response:

```json
{
  "response": "Here are some healthy breakfast options..."
}
```

---

## How the System Works

1. The user sends a message from the frontend.
2. The backend checks whether the question is health-related.
3. If the input is non-health related, the app responds with a friendly redirect message.
4. If the input indicates emergency symptoms, an urgent-care response is returned.
5. If valid, the backend searches ChromaDB for relevant health contexts.
6. Gemini receives the question plus retrieved knowledge and generates a helpful response.
7. The final answer is sent back to the frontend and displayed in the chat UI.

---

## Safety Notes

This project is designed to provide educational health information and not medical diagnosis.

The application includes safeguards to:
- reject clearly non-health requests
- flag emergency conditions
- avoid pretending to be a doctor
- avoid diagnosis, treatment, or personalized medication instructions
- encourage professional medical care when needed

This should be treated as a learning/demo application, not a substitute for licensed medical care.

---

## Testing

You can run the built-in test scripts:

```bash
cd backend
python test_rag.py
python test_gemini.py
```

These scripts verify:
- RAG retrieval from ChromaDB
- Gemini response generation for health queries

---

## Common Use Cases

- Asking about nutrition and healthy eating
- Learning about symptoms in general terms
- Getting general information about diseases or conditions
- Asking fitness, sleep, or wellness questions
- Receiving a safe, educational response to general health concerns

---

## Future Improvements

Potential next steps for this project include:

- adding user authentication
- supporting multi-turn memory improvements
- adding a more robust medical safety classifier
- integrating a better frontend chat experience
- adding BMI and symptom logic with more structured medical rules
- deploying the backend and frontend to a cloud service

---

## License

This project is for educational and demonstration use.

---

## Summary

HealthAI is a functional AI-powered health assistant that combines:

- medical knowledge retrieval
- conversational AI
- frontend interaction
- safety checks
- local document-based knowledge management

It is a strong foundation for a health chatbot project and can be extended into a more advanced healthcare assistant.
