# ==========================================
# HEALTH SAFETY MODULE
# ==========================================


# ==========================================
# HEALTH-RELATED KEYWORDS
# ==========================================

HEALTH_KEYWORDS = [

    # General health
    "health",
    "healthy",
    "wellness",
    "wellbeing",
    "body",
    "human body",

    # Symptoms
    "symptom",
    "symptoms",
    "pain",
    "fever",
    "cold",
    "cough",
    "headache",
    "stomach",
    "vomiting",
    "nausea",
    "diarrhea",
    "dizziness",
    "weakness",
    "fatigue",
    "tired",
    "swelling",

    # Diseases / conditions
    "disease",
    "condition",
    "infection",
    "diabetes",
    "blood pressure",
    "cholesterol",
    "anemia",
    "asthma",
    "migraine",
    "dehydration",
    "obesity",

    # Nutrition
    "food",
    "foods",
    "eat",
    "eating",
    "meal",
    "meals",
    "diet",
    "nutrition",
    "nutrient",
    "nutrients",
    "protein",
    "carbohydrate",
    "carbs",
    "fat",
    "fats",
    "fiber",
    "vitamin",
    "vitamins",
    "mineral",
    "minerals",
    "calorie",
    "calories",
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "snacks",
    "morning",
    "evening",
    "hydration",
    "water",
    "drink",
    "drinks",
    "healthy food",
    "junk food",
    "fast food",
    "vegetarian",
    "vegan",

    # Fitness
    "fitness",
    "exercise",
    "workout",
    "gym",
    "training",
    "muscle",
    "muscles",
    "strength",
    "cardio",
    "running",
    "walking",
    "stretching",
    "weight",
    "weight loss",
    "weight gain",

    # Sleep
    "sleep",
    "sleeping",
    "insomnia",
    "rest",

    # Mental wellness
    "stress",
    "anxiety",
    "mental health",
    "relaxation",
    "meditation",

    # Medicine
    "medicine",
    "medication",
    "drug",
    "tablet",
    "capsule",
    "doctor",
    "hospital",
    "treatment",
    "therapy",
    "diagnosis",

    # Preventive health
    "prevention",
    "prevent",
    "checkup",
    "check-up",
    "screening",
    "immunity",
    "immune system"
]


# ==========================================
# EMERGENCY KEYWORDS
# ==========================================

EMERGENCY_KEYWORDS = [

    "severe chest pain",
    "chest pain",
    "difficulty breathing",
    "can't breathe",
    "cannot breathe",
    "severe bleeding",
    "unconscious",
    "loss of consciousness",
    "stroke",
    "heart attack",
    "seizure",
    "suicide",
    "suicidal",
    "overdose",
    "poisoning"
]


# ==========================================
# CHECK HEALTH QUESTION
# ==========================================

def is_health_question(question):

    question = question.lower().strip()


    # --------------------------------------
    # Check health keywords
    # --------------------------------------

    for keyword in HEALTH_KEYWORDS:

        if keyword in question:

            return True


    return False


# ==========================================
# CHECK EMERGENCY
# ==========================================

def is_emergency(question):

    question = question.lower().strip()


    for keyword in EMERGENCY_KEYWORDS:

        if keyword in question:

            return True


    return False


# ==========================================
# NON-HEALTH RESPONSE
# ==========================================

def get_non_health_response():

    return (
        "I'm HealthAI, a health-focused assistant 🩺. "
        "I can help with health, nutrition, food, fitness, "
        "exercise, sleep, wellness, symptoms and general "
        "health information. Please ask me a health-related "
        "question."
    )


# ==========================================
# EMERGENCY RESPONSE
# ==========================================

def get_emergency_response():

    return (
        "⚠️ This may require urgent medical attention. "
        "I cannot diagnose or manage emergencies. "
        "If you are experiencing severe or life-threatening "
        "symptoms, please seek immediate professional medical "
        "help or contact your local emergency service. "
        "Do not rely on this chatbot for emergency care."
    )