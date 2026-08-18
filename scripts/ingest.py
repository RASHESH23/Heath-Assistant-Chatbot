import os
import chromadb


# ==========================================
# PROJECT PATHS
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

DOCUMENT_PATH = os.path.join(
    BASE_DIR,
    "data",
    "health_documents",
    "health_knowledge.txt"
)

CHROMA_PATH = os.path.join(
    BASE_DIR,
    "database",
    "chroma_db"
)


# ==========================================
# CHECK DOCUMENT
# ==========================================

if not os.path.exists(DOCUMENT_PATH):

    raise FileNotFoundError(
        f"Health knowledge file not found:\n{DOCUMENT_PATH}"
    )


# ==========================================
# READ HEALTH KNOWLEDGE
# ==========================================

with open(
    DOCUMENT_PATH,
    "r",
    encoding="utf-8"
) as file:

    text = file.read()


# ==========================================
# SPLIT DOCUMENT INTO SECTIONS
# ==========================================

sections = [
    section.strip()
    for section in text.split("\n\n")
    if section.strip()
]


print(
    f"Loaded {len(sections)} health knowledge sections."
)


# ==========================================
# CREATE CHROMADB CLIENT
# ==========================================

client = chromadb.PersistentClient(
    path=CHROMA_PATH
)


# ==========================================
# CREATE / GET COLLECTION
# ==========================================

collection = client.get_or_create_collection(
    name="health_knowledge"
)


# ==========================================
# REMOVE OLD DATA
# ==========================================

existing_data = collection.get()

if existing_data["ids"]:

    collection.delete(
        ids=existing_data["ids"]
    )

    print("Old knowledge base cleared.")


# ==========================================
# CREATE IDS
# ==========================================

ids = [
    f"health_doc_{index}"
    for index in range(len(sections))
]


# ==========================================
# METADATA
# ==========================================

metadatas = [
    {
        "source": "health_knowledge.txt",
        "type": "health_education"
    }
    for _ in sections
]


# ==========================================
# STORE DOCUMENTS
# ==========================================

collection.add(
    ids=ids,
    documents=sections,
    metadatas=metadatas
)


# ==========================================
# RESULT
# ==========================================

print()
print("=" * 50)
print("HealthAI Knowledge Base Created Successfully")
print("=" * 50)
print()
print(f"Documents stored : {len(sections)}")
print(f"Database location: {CHROMA_PATH}")
print()
print("ChromaDB is ready for RAG.")