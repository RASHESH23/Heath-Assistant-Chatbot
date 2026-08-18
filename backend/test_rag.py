from rag_service import search_health_knowledge


question = "What are some healthy breakfast foods?"


result = search_health_knowledge(
    question
)


print()
print("=" * 60)
print("RAG SEARCH RESULT")
print("=" * 60)
print()

print(result)

print()
print("=" * 60)