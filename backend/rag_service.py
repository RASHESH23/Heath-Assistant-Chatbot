import os
import chromadb


# =========================================================
# PROJECT PATH
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)


CHROMA_PATH = os.path.join(
    BASE_DIR,
    "database",
    "chroma_db"
)


# =========================================================
# CHROMADB CLIENT
# =========================================================

client = chromadb.PersistentClient(
    path=CHROMA_PATH
)


# =========================================================
# HEALTH COLLECTION
# =========================================================

collection = client.get_collection(
    name="health_knowledge"
)


# =========================================================
# SEARCH HEALTH KNOWLEDGE
# =========================================================

def search_health_knowledge(
    question,
    number_of_results=4
):

    try:

        results = collection.query(
            query_texts=[question],
            n_results=number_of_results
        )

    except Exception as error:

        print(
            "RAG SEARCH ERROR:",
            error
        )

        return {
            "context": "",
            "sources": []
        }


    # =====================================================
    # GET DOCUMENTS
    # =====================================================

    documents = results.get(
        "documents",
        [[]]
    )[0]


    # =====================================================
    # GET METADATA
    # =====================================================

    metadatas = results.get(
        "metadatas",
        [[]]
    )[0]


    # =====================================================
    # NO RESULTS
    # =====================================================

    if not documents:

        return {
            "context": "",
            "sources": []
        }


    # =====================================================
    # COMBINE DOCUMENTS
    # =====================================================

    context = "\n\n".join(
        documents
    )


    # =====================================================
    # EXTRACT SOURCE CATEGORIES
    # =====================================================

    sources = []


    for metadata in metadatas:

        if metadata:

            category = metadata.get(
                "category"
            )

            if category and category not in sources:

                sources.append(
                    category
                )


    # =====================================================
    # RETURN RAG RESULT
    # =====================================================

    return {

        "context": context,

        "sources": sources

    }