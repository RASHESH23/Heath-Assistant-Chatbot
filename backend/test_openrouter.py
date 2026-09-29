from openrouter_service import get_health_response


question = "What are some healthy foods to eat in the morning?"


response = get_health_response(
    question
)


print()
print("=" * 60)
print("OPENROUTER AI HEALTH TEST")
print("=" * 60)
print()

print(response)
print()
print("=" * 60)