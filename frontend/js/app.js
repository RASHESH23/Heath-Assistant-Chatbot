/* =========================================================
   HEALTHAI — COMPLETE APP.JS
   WITH SYMPTOM CHECKER + DYNAMIC CONVERSATIONAL CHATBOT
========================================================= */
"use strict";

/* =========================================================
   CONFIG
========================================================= */
const API_URL      = "http://127.0.0.1:8000/chat";
const MAX_CHARS    = 500;
const TYPING_SPEED = 15;

/* =========================================================
   HELPERS
========================================================= */
const $  = id  => document.getElementById(id);
const $$ = sel => [...document.querySelectorAll(sel)];

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function getTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit", minute: "2-digit"
    });
}

function escHTML(text) {
    const d = document.createElement("div");
    d.textContent = text;
    return d.innerHTML;
}

/* =========================================================
   ELEMENTS
========================================================= */
const cursor         = $("cursor");
const cursorTrail    = $("cursor-trail");
const nav            = $("nav");
const scrollBar      = $("scroll-progress");
const mobileMenuBtn  = $("mobile-menu-btn");
const mobileMenu     = $("mobile-menu");
const userInput      = $("user-input");
const sendButton     = $("send-button");
const chatInput      = $("chat-input");
const chatSend       = $("chat-send");
const chatMessages   = $("chat-messages");
const clearChat      = $("clear-chat");
const typingInd      = $("typing-indicator");
const charCount      = $("char-count");
const offlineBanner  = $("offline-banner");
const obRetry        = $("ob-retry");
const toastContainer = $("toast-container");

/* =========================================================
   STATE
========================================================= */
let isOnline       = true;
let isSending      = false;
let backendChecked = false;
let chatHistory    = [];  /* tracks conversation for context */

/* =========================================================
   CONVERSATION KNOWLEDGE BASE
   Layer 1 — Greetings & small talk
   Layer 2 — Questions about HealthAI
   Layer 3 — Sympathy / feeling sick responses
   Layer 4 — Health knowledge base
========================================================= */

/* ── LAYER 1: CONVERSATION RESPONSES ── */
const CONVERSATION_KB = [

    /* GREETINGS */
    {
        keys: ["hello", "hi ", "hi!", "hey", "hii",
               "helo", "helo", "good morning", "good afternoon",
               "good evening", "good night", "howdy", "greetings",
               "what's up", "whats up", "sup ", "yo "],
        type: "greeting",
        responses: [
            `Hello there! 👋 I'm **HealthAI**, your personal health assistant.

I'm here to help you with:
- 🩺 **Health questions** — symptoms, conditions, medications
- 🥗 **Nutrition advice** — diet, vitamins, healthy eating
- 🏃 **Fitness guidance** — exercise, activity, weight management
- 😴 **Sleep & wellness** — rest, stress, mental health
- ⚖️ **BMI & body health** — weight, measurements

What health topic can I help you with today?`,

            `Hi! 😊 Welcome to **HealthAI**!

Great to have you here. I'm your AI-powered health information assistant, ready to answer all your health-related questions clearly and simply.

Feel free to ask me anything — from understanding symptoms to nutrition tips, fitness advice or general wellness guidance.

What would you like to know? 🌿`,

            `Hey there! 👋 I'm **HealthAI** — your smart health companion.

Whether you have questions about how you're feeling, what to eat, how to exercise better or just want general health advice — I'm here for you!

Try asking me something like:
- *"What causes headaches?"*
- *"How much water should I drink?"*
- *"Tips for better sleep?"*

What's on your mind today? 😊`
        ]
    },

    /* HOW ARE YOU */
    {
        keys: ["how are you", "how r you", "how are u",
               "how do you do", "you ok", "are you ok",
               "you good", "hows it going", "how's it going"],
        type: "how_are_you",
        responses: [
            `I'm doing great, thank you for asking! 😊

As an AI health assistant, I'm always ready to help — no days off, no bad moods! I'm running at full capacity and ready to answer your health questions.

How are **you** doing today? Is there anything health-related I can help you with? 🌿`,

            `I'm perfectly operational and ready to help! 🤖💚

More importantly — how are **you** feeling? If something's bothering you health-wise, don't hesitate to ask. That's exactly what I'm here for!

Whether it's a question about symptoms, diet, exercise or just general wellness — I've got you covered. 😊`
        ]
    },

    /* THANK YOU */
    {
        keys: ["thank you", "thankyou", "thanks", "thank u",
               "thx", "ty ", "ty!", "cheers", "appreciate",
               "helpful", "great answer", "perfect", "awesome",
               "amazing", "wonderful", "brilliant", "excellent",
               "well done", "good job", "nice"],
        type: "gratitude",
        responses: [
            `You're very welcome! 😊 I'm so glad I could help!

Remember, I'm always here whenever you have more health questions. Don't hesitate to ask about:
- Any symptoms you're experiencing
- Nutrition and diet advice
- Fitness and exercise tips
- Mental health and wellness

Take care of yourself and stay healthy! 💚`,

            `So happy to help! 🌿 That's exactly what I'm here for.

Your health and wellbeing matter. If you ever have more questions — big or small — just ask away. I'm available 24/7!

Stay healthy and take care! 😊`,

            `Wonderful! You're most welcome! 💚

It's a pleasure helping you with your health journey. Remember — small, consistent healthy habits make a huge difference over time!

Feel free to come back anytime you need health information or advice. Take care! 🌿`
        ]
    },

    /* GOODBYE */
    {
        keys: ["bye", "goodbye", "see you", "see ya", "cya",
               "later", "take care", "farewell", "good bye",
               "i'm going", "im going", "got to go", "gotta go"],
        type: "goodbye",
        responses: [
            `Goodbye! 👋 Take care of yourself!

Remember these quick health reminders before you go:
- 💧 Stay hydrated throughout the day
- 🥗 Eat a balanced, colourful diet
- 😴 Get your 7–9 hours of sleep tonight
- 🚶 Move your body regularly

Come back anytime you have health questions. Stay healthy! 💚`,

            `See you later! 😊 Stay healthy and take good care!

Don't forget — I'm here 24/7 whenever you need health information or guidance. Wishing you great health and wellness! 🌿💚`
        ]
    },

    /* WHO ARE YOU / WHAT IS HEALTHAI */
    {
        keys: ["who are you", "what are you", "what is healthai",
               "what is health ai", "about you", "tell me about yourself",
               "introduce yourself", "what can you do",
               "what do you do", "your features", "help me",
               "how do you work", "how does this work"],
        type: "about",
        responses: [
            `I'm **HealthAI** — your intelligent health information assistant! 🩺

**What I can help you with:**

🔍 **Symptom Information**
Understand what your symptoms might mean and when to see a doctor.

🥗 **Nutrition & Diet**
Personalized guidance on healthy eating, vitamins and nutrition.

🏃 **Fitness & Exercise**
Exercise recommendations, workout tips and activity guidance.

😴 **Sleep & Mental Health**
Tips for better sleep, stress management and mental wellness.

⚖️ **BMI & Weight Health**
Calculate and understand your body mass index.

🌡️ **General Health Questions**
From headaches to hydration — ask me anything!

**Important:** I provide general health education only. For medical diagnosis and treatment, always consult a qualified doctor.

What would you like to know? 😊`,

            `Great question! I'm **HealthAI** — a BCA Artificial Intelligence project! 🎓

I combine **Natural Language Processing (NLP)** with a trusted medical knowledge base to give you clear, simple health information instantly.

**My capabilities:**
- Answer health questions in plain language
- Explain symptoms and conditions
- Give nutrition and fitness guidance
- Check your BMI
- Help you understand when to see a doctor

I'm powered by **FastAPI** on the backend and use advanced AI to understand your questions naturally.

⚠️ I'm an educational tool — always consult a healthcare professional for personal medical advice.

So, what health question can I answer for you today? 🌿`
        ]
    },

    /* I'M BORED / SMALL TALK */
    {
        keys: ["i'm bored", "im bored", "bored", "nothing to do",
               "entertain me", "fun fact", "tell me something",
               "interesting", "did you know"],
        type: "smalltalk",
        responses: [
            `Here's a fascinating health fact for you! 🧠✨

**Did you know?**

The human heart beats approximately **100,000 times per day** — that's over 35 million beats per year and about 2.5 billion beats in an average lifetime!

Here are more amazing body facts:
- 🦴 You're born with **270 bones** but adults only have **206** (they fuse together!)
- 👁️ The human eye can distinguish over **10 million different colours**
- 🧠 Your brain uses **20% of your body's energy** despite being only 2% of body weight
- 💪 The **strongest muscle** relative to size is the masseter (jaw muscle)
- 🫀 Blood travels **12,000 miles** through your body every day

Want to know more health facts or ask a health question? 😊`,

            `Since you've got a moment — let's talk about a quick health habit that could change your life! 💚

**The 2-Minute Rule for Health:**

If a healthy action takes less than 2 minutes — do it immediately!
- Drink a glass of water 💧
- Do 10 deep breaths 🫁
- Take a short walk 🚶
- Eat a piece of fruit 🍎
- Write one thing you're grateful for ✍️

Small habits compound into massive results over time.

Want to know more about building healthy habits or anything else? 😊`
        ]
    },

    /* COMPLIMENTS TO THE BOT */
    {
        keys: ["you're great", "you are great", "you're amazing",
               "you are amazing", "you're helpful", "you are helpful",
               "love you", "love this", "i like you", "best ai",
               "good ai", "smart", "intelligent", "clever"],
        type: "compliment",
        responses: [
            `Aww, thank you so much! 😊💚 That really means a lot!

I'm built to make health information as clear and accessible as possible for everyone — so hearing that I'm being helpful is wonderful!

I'll keep doing my best to give you accurate, easy-to-understand health guidance. Is there anything else health-related I can help you with today? 🌿`,

            `That's so kind of you! 🥹💚 Thank you!

My goal is to make health information simple, safe and accessible for everyone — so I'm thrilled I could help!

Now, let's keep that health journey going! Do you have any health questions I can answer for you? 😊`
        ]
    },

    /* NOT FEELING WELL / GENERAL SICKNESS */
    {
        keys: ["i feel sick", "i am sick", "i'm sick", "feeling sick",
               "not feeling well", "i feel bad", "i feel terrible",
               "i feel awful", "i feel unwell", "i'm unwell",
               "i don't feel good", "i feel ill", "feeling ill",
               "something is wrong", "i feel strange", "feel weird"],
        type: "feeling_sick",
        responses: [
            `I'm sorry to hear you're not feeling well. 😔 I hope you feel better soon!

**A few immediate things to check:**

**1. Hydration** 💧
Drink a glass of water right now — dehydration worsens almost every symptom.

**2. Rest** 😴
If possible, lie down and rest. Your body heals faster when at rest.

**3. Temperature** 🌡️
Check if you have a fever (above 38°C/100.4°F).

**4. Symptoms** 🔍
Can you tell me more about what you're experiencing? For example:
- Do you have a headache or body aches?
- Any nausea, vomiting or stomach pain?
- Sore throat or cough?
- Fever or chills?

**When to seek immediate help:**
- Chest pain or difficulty breathing
- Severe headache or confusion
- High fever above 39.5°C (103°F)

Tell me your specific symptoms and I can give you more tailored information! 🩺`,

            `Oh no, I'm sorry you're feeling unwell! 🤒 

Let's try to figure out what might be happening. Could you describe your symptoms in more detail?

For example:
- 📍 **Where** does it hurt or feel uncomfortable?
- ⏱️ **How long** have you been feeling this way?
- 🌡️ Do you have a **fever**?
- 😴 Are you feeling **fatigued** or weak?

The more details you share, the better I can guide you. And remember — if your symptoms are severe or worsening, please visit a doctor or emergency services right away. 🩺`
        ]
    },

    /* I HAVE PAIN */
    {
        keys: ["i have pain", "i'm in pain", "i am in pain",
               "it hurts", "pain in", "ache", "painful",
               "i hurt", "hurting", "discomfort", "sore"],
        type: "pain",
        responses: [
            `I'm sorry to hear you're in pain. 😔 Let me try to help.

Pain is your body's signal that something needs attention. To give you the most relevant information, could you tell me:

**1. Location** 📍
Where exactly is the pain? (Head, chest, stomach, back, joints, etc.)

**2. Type** 🔍
- Is it sharp or dull?
- Constant or comes and goes?
- Does it radiate to other areas?

**3. Duration** ⏱️
How long have you had this pain?

**4. Severity** 📊
On a scale of 1–10, how bad is it?

**⚠️ Seek emergency care immediately if:**
- Chest pain (possible heart attack)
- Severe sudden headache ("thunderclap")
- Abdominal pain with fever
- Pain after a serious injury

Please share more details and I'll provide the most relevant health information I can! 🩺`
        ]
    },

    /* EMERGENCY KEYWORDS */
    {
        keys: ["chest pain", "can't breathe", "cannot breathe",
               "hard to breathe", "difficulty breathing",
               "heart attack", "stroke", "unconscious",
               "not breathing", "emergency", "dying", "help me now",
               "call ambulance", "severe pain", "blood",
               "overdose", "poisoning"],
        type: "emergency",
        responses: [
            `🚨 **THIS MAY BE A MEDICAL EMERGENCY** 🚨

**Please take immediate action:**

## Call Emergency Services NOW
📞 **Emergency:** 112 (India/EU) | 911 (USA) | 999 (UK)

**While waiting for help:**
- Stay calm and stay still
- If chest pain — sit or lie in a comfortable position
- If someone is unconscious — check breathing, start CPR if trained
- Don't eat or drink anything
- Keep phone line open with emergency services
- Unlock your door if possible

**Do NOT wait.** Do NOT drive yourself to hospital if experiencing chest pain or stroke symptoms.

---

⚠️ **I am an AI and cannot provide emergency assistance.** Please contact emergency services or have someone take you to the nearest hospital immediately.`
        ]
    }
];

/* ── LAYER 2: SYMPTOM-AWARE RESPONSES ── */
const SYMPTOM_RESPONSES = [
    {
        keys: ["i have a headache", "my head hurts", "head is aching",
               "headache since", "i have headache", "got a headache"],
        response: `I understand you have a headache. Let me help! 🤕

**First, let's assess it:**

**Possible causes of your headache:**
- **Dehydration** (most common!) — Have you had enough water today?
- **Tension** — Stress, eye strain or poor posture
- **Lack of sleep** — Even one bad night can trigger headaches
- **Skipping meals** — Low blood sugar causes headaches
- **Screen time** — Extended phone/computer use strains eyes

**Immediate relief:**
1. 💧 Drink 2–3 glasses of water right now
2. 😌 Step away from screens for 15–20 minutes
3. 🧊 Apply cold compress to forehead or back of neck
4. 💊 Take paracetamol or ibuprofen if appropriate
5. 😴 Rest in a dark, quiet room if possible

**See a doctor if your headache:**
- Came on suddenly and severely ("worst headache of your life")
- Is accompanied by fever, stiff neck or confusion
- Doesn't improve with medication
- Is occurring very frequently (more than 15 days/month)

How long have you had this headache? That can help narrow down the cause! 🩺`
    },
    {
        keys: ["i have fever", "i have a fever", "my temperature is high",
               "running a fever", "feeling hot", "high temperature",
               "body is hot", "i feel feverish"],
        response: `A fever can be concerning — let me help you understand it. 🌡️

**Temperature Guide:**
- Normal: 36.1–37.2°C (97–99°F)
- Low-grade fever: 37.3–38.0°C
- Fever: **38.1°C+ (100.4°F+)**
- High fever: **39.4°C+ (103°F+) — seek medical attention**

**Common causes:**
- Viral infection (cold, flu, COVID-19)
- Bacterial infection
- Recent vaccination (normal reaction)
- Heat exhaustion

**Home care for mild-moderate fever:**
1. 💧 Drink plenty of fluids — water, clear broth, herbal tea
2. 🛏️ Rest as much as possible
3. 👕 Wear light, breathable clothing
4. 🧊 Cool flannel on forehead
5. 💊 Paracetamol or ibuprofen (follow dosing instructions)
6. 🌡️ Monitor temperature every 2–4 hours

**Go to emergency if:**
- Fever above 39.4°C (103°F)
- Infant under 3 months with ANY fever
- Confusion, stiff neck, rash, or difficulty breathing
- Fever lasting more than 3 days

Do you know your current temperature? 🩺`
    },
    {
        keys: ["i have cough", "i'm coughing", "coughing a lot",
               "dry cough", "wet cough", "persistent cough",
               "can't stop coughing", "sore throat and cough"],
        response: `Coughing is your body's natural defence mechanism. Let me help! 🫁

**Types of cough:**
- **Dry cough** — tickling sensation, no mucus (viral, allergies, acid reflux)
- **Wet/productive cough** — brings up mucus (infection, bronchitis)
- **Barking cough** — harsh sound (croup in children)
- **Whooping cough** — gasping after coughing fits

**Immediate relief:**
1. 🍯 Honey and warm water or ginger tea
2. 💧 Stay well hydrated — thins mucus
3. 🌊 Steam inhalation (hot shower or bowl of hot water)
4. 🧂 Warm salt water gargle (1/2 tsp salt in warm water)
5. 🍭 Sugar-free lozenges or throat sweets
6. 💨 Avoid smoke, dust and strong scents

**See a doctor if:**
- Cough lasts more than 3 weeks
- You're coughing up blood
- Accompanied by high fever or chest pain
- Shortness of breath or wheezing
- Night sweats with unexplained weight loss

How long have you had the cough? Is it dry or producing mucus? 🩺`
    },
    {
        keys: ["i feel tired", "so tired", "always tired", "fatigue",
               "no energy", "exhausted", "i feel exhausted",
               "low energy", "feeling drained", "always exhausted"],
        response: `Persistent fatigue is very common but shouldn't be ignored. 😴

**Common reasons you might feel tired:**

**Lifestyle factors:**
- Not enough sleep (less than 7 hours)
- Poor diet or skipping meals
- Dehydration
- Sedentary lifestyle (counterintuitively — sitting too much makes you more tired!)
- Too much caffeine

**Medical causes to consider:**
- Iron deficiency anaemia (especially common in women)
- Vitamin D or B12 deficiency
- Thyroid issues (hypothyroidism)
- Diabetes
- Sleep apnoea
- Depression or anxiety

**What to try immediately:**
1. 💧 Drink a large glass of water (dehydration = fatigue)
2. 🥗 Eat an iron-rich meal (spinach, lentils, lean meat)
3. ☀️ Get 15 minutes of sunlight
4. 🚶 Short walk — even 10 minutes boosts energy
5. 😴 Aim for 7–9 hours of sleep tonight

**See a doctor if fatigue:**
- Has lasted more than 2 weeks
- Accompanied by weight loss, fever or night sweats
- Significantly affects your daily life

How long have you been feeling this way? 🩺`
    },
    {
        keys: ["stomach pain", "stomach ache", "tummy ache",
               "abdominal pain", "belly pain", "stomach hurts",
               "my stomach hurts", "nausea", "feeling nauseous",
               "i feel nauseous", "want to vomit", "want to throw up"],
        response: `Stomach discomfort is very common but location and type matter. 🫃

**Common causes by location:**
- **Upper abdomen** — acid reflux, gastritis, ulcer
- **Lower right** — appendicitis (seek urgent care if severe!)
- **Lower left** — constipation, IBS
- **All over** — food poisoning, gastroenteritis, IBS
- **Around navel** — early appendicitis, intestinal issues

**For nausea and general stomach upset:**
1. 🫚 Eat small, bland meals (BRAT diet: Banana, Rice, Applesauce, Toast)
2. 💧 Sip clear fluids slowly — avoid large gulps
3. 🫚 Avoid fatty, spicy or acidic foods
4. 🫚 Ginger tea — natural anti-nausea remedy
5. 😮‍💨 Rest in a comfortable position
6. 🌊 Peppermint tea for bloating and cramps

**Seek emergency care if:**
- Sudden severe abdominal pain
- Pain with fever above 38.5°C
- Vomiting blood or blood in stool
- Rigid/hard abdomen
- Pain after injury

Can you describe where exactly and how long you've had this? 🩺`
    }
];

/* ── LAYER 3: MAIN HEALTH KNOWLEDGE BASE ── */
const HEALTH_KB = {
    entries: [
        {
            keys: ["dehydrat", "thirst", "dry mouth", "not drinking enough"],
            response: `**Dehydration — Signs & Prevention**

Dehydration occurs when your body loses more fluid than it takes in.

**Common Symptoms:**
- Dark yellow or amber-coloured urine
- Dry mouth and cracked lips
- Feeling dizzy or lightheaded
- Fatigue and low energy
- Headache
- Decreased urination frequency

**Severe Symptoms (seek medical help):**
- Rapid heartbeat and breathing
- Confusion or disorientation
- Sunken eyes
- No urination for 8+ hours

**Prevention Tips:**
- Drink 8–10 glasses (2–2.5 litres) of water daily
- Increase intake during exercise, heat or illness
- Eat water-rich foods: cucumber, watermelon, oranges
- Avoid excessive caffeine and alcohol

⚠️ If severe symptoms occur, seek medical attention immediately.`
        },
        {
            keys: ["water", "how much drink", "daily water", "hydrat",
                   "water intake", "glasses of water"],
            response: `**Daily Water Intake Guide**

**General Recommendations:**
- **Women:** ~2.0–2.2 litres (8–9 cups) per day
- **Men:** ~2.5–3.0 litres (10–12 cups) per day
- **Children (5–12):** ~1.5–2.0 litres per day

**When to Drink More:**
- During and after exercise (add 500ml per hour)
- In hot or humid weather
- When ill with fever, vomiting or diarrhoea
- During pregnancy or breastfeeding

**Easy Ways to Track Intake:**
- Use a marked water bottle
- Set hourly phone reminders
- Drink a glass before every meal
- Drink water first thing every morning

**Signs You're Well Hydrated:**
- Pale yellow or clear urine
- Good energy levels
- Moist lips and skin`
        },
        {
            keys: ["sleep", "insomnia", "rest", "bedtime",
                   "sleep quality", "can't sleep", "sleeping"],
            response: `**Sleep Health — Complete Guide**

**Recommended Sleep Duration:**
- Adults (18–64 years): **7–9 hours** per night
- Teenagers (14–17): 8–10 hours
- Older adults (65+): 7–8 hours

**Tips for Better Sleep:**
- Consistent sleep and wake schedule (even weekends)
- Keep bedroom cool (16–19°C is ideal)
- Avoid screens 60 minutes before bed
- Limit caffeine after 2 PM
- No heavy meals within 3 hours of bedtime
- Regular exercise (but not too close to bedtime)
- Blackout curtains or sleep mask

**Signs of Poor Sleep:**
- Difficulty concentrating
- Mood changes and irritability
- Frequent headaches
- Weakened immune system

Persistent insomnia lasting more than 3 weeks — visit your doctor.`
        },
        {
            keys: ["heart", "cardiovascular", "cardiac", "cholesterol",
                   "blood pressure", "hypertension"],
            response: `**Heart Health — Complete Overview**

**Signs of Good Heart Health:**
- Resting heart rate: 60–100 bpm
- Blood pressure: below 120/80 mmHg
- Healthy cholesterol: LDL < 100 mg/dL, HDL > 60 mg/dL

**Heart-Protective Habits:**
- Exercise 150 minutes of moderate activity per week
- Eat vegetables, whole grains and lean protein
- Limit saturated fats, salt and added sugar
- Maintain a healthy weight (BMI 18.5–24.9)
- Don't smoke — doubles heart disease risk
- Limit alcohol
- Manage stress
- Regular blood pressure checks

**Warning Signs — Call Emergency Services:**
- Chest pain or pressure
- Pain radiating to arm, jaw or back
- Sudden shortness of breath
- Nausea with sweating`
        },
        {
            keys: ["nutrition", "diet", "eating", "food",
                   "healthy eat", "balanced diet", "meal", "what to eat"],
            response: `**Healthy Nutrition — Key Principles**

**The Balanced Plate (per meal):**
- **½ plate:** Non-starchy vegetables
- **¼ plate:** Lean protein (chicken, fish, lentils, tofu)
- **¼ plate:** Complex carbohydrates (brown rice, quinoa)
- Plus healthy fats (olive oil, avocado, nuts)

**Essential Nutrients:**
- **Protein:** 1.0–1.6g per kg body weight
- **Carbohydrates:** Primary energy source
- **Healthy Fats:** Supports brain and hormones
- **Fibre:** 25–38g per day
- **Vitamins & Minerals:** From colourful vegetables

**Foods to Eat More:**
- Leafy greens, colourful vegetables, berries, whole grains
- Legumes, fatty fish, eggs

**Foods to Limit:**
- Ultra-processed foods, sugary drinks, refined carbs
- Excessive red meat, fried foods, added sugar`
        },
        {
            keys: ["fitness", "exercise", "workout", "gym",
                   "physical", "active", "running", "yoga",
                   "steps", "weight loss"],
            response: `**Fitness & Exercise Guide**

**WHO Weekly Recommendations:**
- 150–300 min moderate-intensity activity
- OR 75–150 min vigorous activity
- Muscle strengthening 2+ days per week

**Types of Exercise:**
- **Cardio:** Walking, running, cycling, swimming
- **Strength:** Weight training, bodyweight exercises
- **Flexibility:** Yoga, stretching
- **Balance:** Tai chi, pilates

**Beginner's Weekly Plan:**
- Monday: 30 min brisk walk
- Wednesday: 20 min bodyweight exercises
- Friday: 30 min cycling
- Sunday: Yoga/stretching (20 min)

**Benefits:**
- Reduces heart disease, diabetes and cancer risk
- Improves mental health
- Strengthens bones and muscles
- Boosts energy and sleep quality`
        },
        {
            keys: ["mental", "anxiety", "stress", "depress",
                   "mood", "worry", "panic", "psychological",
                   "mental health"],
            response: `**Mental Health & Wellness Guide**

**Everyday Mental Wellness:**
- Mindfulness meditation (10 min daily)
- Regular exercise — releases endorphins naturally
- Social connection with friends and family
- Quality sleep (critical for mental health)
- Limit news/social media if anxiety-inducing
- Journaling to process emotions

**Managing Stress:**
- Deep breathing: Inhale 4s → Hold 4s → Exhale 6s
- Progressive muscle relaxation
- Time in nature (20 min reduces cortisol)
- Creative activities

**Anxiety Management:**
- Challenge negative thought patterns
- Ground yourself: Name 5 things you can see
- Limit caffeine and alcohol
- Consistent sleep schedule

**Seek Professional Help if:**
- Feeling persistently sad or hopeless
- Anxiety significantly affecting daily life
- Thoughts of self-harm — call a helpline immediately`
        },
        {
            keys: ["vitamin d", "sunshine vitamin", "vit d",
                   "vitamin deficiency", "vitamins"],
            response: `**Vitamin D — Complete Guide**

**Why Vitamin D Matters:**
- Supports calcium absorption for strong bones
- Boosts immune function
- Regulates mood (low levels linked to depression)
- Supports muscle function

**Signs of Deficiency:**
- Bone pain or tenderness
- Muscle weakness or aches
- Fatigue and low energy
- Frequent infections
- Depression or low mood

**Normal Levels:**
- Sufficient: 50–125 nmol/L
- Deficient: Below 30 nmol/L

**How to Increase:**
- **Sunlight:** 15–30 min midday sun (3–4 days/week)
- **Foods:** Fatty fish, egg yolks, fortified milk
- **Supplements:** 1000–2000 IU daily (consult doctor)`
        },
        {
            keys: ["stress", "relax", "calm", "relief",
                   "tension", "overwhelm", "burnout", "stressed"],
            response: `**Stress Relief — Natural Methods**

**Immediate Relief (5 minutes):**
- **Box breathing:** 4s inhale → 4s hold → 4s exhale → 4s hold
- Cold water on face or wrists
- 5-minute walk outside
- Calming music
- Progressive muscle relaxation

**Daily Stress Management:**
- Regular exercise (reduces cortisol by ~30%)
- Consistent sleep schedule
- Healthy regular meals
- Limit caffeine and alcohol
- Set clear boundaries

**Weekly Practices:**
- Meditation or yoga 2–3x per week
- Time with supportive people
- Time in nature
- Joyful hobbies

**Long-term Habits:**
- Daily journaling
- Gratitude practice (3 things daily)
- Professional counselling if persistent`
        },
        {
            keys: ["bmi", "body mass", "overweight", "obesity",
                   "weight", "underweight", "body weight"],
            response: `**BMI & Healthy Weight Guide**

**BMI Categories (WHO):**
- **Below 18.5:** Underweight
- **18.5 – 24.9:** Normal / Healthy weight ✓
- **25.0 – 29.9:** Overweight
- **30.0 and above:** Obese

**How to Calculate:**
BMI = Weight (kg) ÷ Height² (m²)

**Limitations:**
- Doesn't account for muscle mass
- May not apply to athletes, elderly or pregnant women
- Doesn't measure fat distribution

**Healthy Weight Management:**
- Gradual loss: 0.5–1 kg per week
- Combine diet awareness with exercise
- Focus on sustainable habits

**Use our BMI Calculator above for your personalised result!**`
        },
        {
            keys: ["immune", "immunity", "sick", "cold",
                   "flu", "infection", "boost", "immune system"],
            response: `**Boosting Immune System Naturally**

**Top Immune-Boosting Nutrition:**
- Vitamin C: Citrus, bell peppers, broccoli
- Zinc: Nuts, seeds, legumes, meat
- Vitamin D: Sunlight + supplements
- Probiotics: Yoghurt, kefir, fermented foods
- Antioxidants: Colourful vegetables and berries

**Lifestyle for Strong Immunity:**
- Sleep 7–9 hours
- Regular moderate exercise
- Manage stress (chronic stress suppresses immunity)
- Don't smoke
- Limit alcohol

**Hygiene:**
- Wash hands for 20 seconds frequently
- Stay up to date with vaccinations

**Signs of Low Immunity:**
- Frequent colds (more than 3–4 per year)
- Slow wound healing
- Persistent fatigue`
        },
        {
            keys: ["diabetes", "blood sugar", "glucose",
                   "insulin", "diabetic"],
            response: `**Diabetes — Information & Management**

**Types:**
- **Type 1:** Autoimmune — body doesn't produce insulin
- **Type 2:** Body resistant to insulin (most common)
- **Gestational:** During pregnancy (usually temporary)
- **Prediabetes:** Higher than normal but not yet diabetic

**Common Symptoms:**
- Excessive thirst and frequent urination
- Unexplained weight loss
- Blurred vision
- Slow healing wounds
- Fatigue and numbness in hands/feet

**Blood Sugar Targets (Type 2):**
- Fasting: 4.0–7.0 mmol/L
- 2 hours after meals: Below 8.5 mmol/L

**Management:**
- Regular blood sugar monitoring
- Balanced diet (limit simple sugars)
- Regular exercise
- Medications as prescribed

⚠️ Always follow your doctor's guidance.`
        },
        {
            keys: ["headache", "migraine", "head pain",
                   "head ache", "head hurts"],
            response: `**Headaches — Types & Relief**

**Common Types:**
- **Tension:** Dull pressure around head (most common)
- **Migraine:** Intense throbbing, one-sided, with nausea
- **Cluster:** Severe pain around one eye
- **Dehydration:** Caused by insufficient water

**Immediate Relief:**
- 💧 Drink 2–3 glasses of water
- 😌 Rest in dark, quiet room
- 🧊 Cold compress on forehead
- 💆 Gentle neck massage
- 💊 Paracetamol/ibuprofen as directed

**Prevention:**
- Stay well hydrated
- Regular sleep schedule
- Manage stress
- Eat regular meals
- Limit caffeine and alcohol

**See a Doctor if:**
- Sudden, severe "thunderclap" headache
- With fever, stiff neck or confusion
- Not improving with medication
- Occurring 15+ days per month`
        },
        {
            keys: ["back pain", "backache", "spine",
                   "lower back", "posture", "back hurts"],
            response: `**Back Pain — Causes & Relief**

**Common Causes:**
- Poor posture (desk work)
- Muscle strain or sprain
- Herniated disc
- Sedentary lifestyle
- Weak core muscles

**Immediate Relief:**
- Ice first 48–72 hours (reduces inflammation)
- Then switch to heat therapy
- Gentle movement (avoid complete bed rest)
- Anti-inflammatory medication
- Gentle stretching

**Long-term Prevention:**
- Strengthen core (planks, bridges)
- Improve posture — screen at eye level
- Take breaks every 30–45 minutes
- Sleep on supportive mattress, on your side
- Yoga and swimming are excellent

**Seek Help if:**
- Pain radiates down the leg
- Numbness or tingling
- Loss of bladder/bowel control`
        },
        {
            keys: ["fever", "temperature", "high temp",
                   "body temperature", "feverish"],
            response: `**Fever — Guide & Management**

**Temperature Ranges:**
- Normal: 36.1–37.2°C (97–99°F)
- Low-grade: 37.3–38.0°C
- Fever: 38.1°C+ (100.4°F+)
- High fever: 39.4°C+ (103°F+)

**Home Management:**
- Rest and stay in bed
- Drink plenty of fluids
- Light clothing and bedding
- Cool flannel on forehead
- Paracetamol or ibuprofen

**Seek Medical Attention if:**
- Fever above 39.4°C (103°F)
- Lasts more than 3 days
- With rash, stiff neck or confusion
- Any fever in infant under 3 months
- Difficulty breathing`
        },
        {
            keys: ["health", "wellness", "general", "tip",
                   "advice", "healthy living", "healthy lifestyle"],
            response: `**General Health & Wellness — The 8 Pillars**

**1. 💧 Hydration**
Drink 2–3 litres of water daily.

**2. 🥗 Nutrition**
Eat whole foods — vegetables, fruits, lean protein and whole grains.

**3. 🏃 Physical Activity**
150 minutes of moderate exercise weekly.

**4. 😴 Sleep**
7–9 hours of quality sleep. Non-negotiable for health.

**5. 🧘 Stress Management**
Chronic stress causes disease. Meditate, breathe and rest.

**6. 🤝 Social Connection**
Strong relationships associated with longer, healthier lives.

**7. 🚭 Avoid Harmful Substances**
Don't smoke. Limit alcohol.

**8. 🩺 Regular Check-ups**
Prevention is better than cure.

Ask me about any specific health topic!`
        }
    ],

    find(query) {
        const q = query.toLowerCase();
        let bestScore = 0;
        let bestEntry = null;

        for (const entry of this.entries) {
            let score = 0;
            for (const key of entry.keys) {
                if (q.includes(key)) {
                    score += key.length;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestEntry = entry;
            }
        }

        if (bestEntry && bestScore > 0) {
            return bestEntry.response;
        }
        return this.noMatch(query);
    },

    noMatch(query) {
        return `I'd love to help with **"${escHTML(query)}"**, but I want to make sure I give you the most accurate information! 🤔

Could you try rephrasing your question? Or you can ask me about:

- 💧 **Hydration & Water intake**
- 😴 **Sleep quality & Insomnia**
- ❤️ **Heart health & Blood pressure**
- 🥗 **Nutrition & Healthy eating**
- 🏃 **Fitness & Exercise**
- 🧠 **Mental health & Stress relief**
- ⚖️ **BMI & Healthy weight**
- ☀️ **Vitamin D & Deficiencies**
- 🛡️ **Immunity & Immune system**
- 💊 **Diabetes & Blood sugar**
- 🤕 **Headaches & Migraines**
- 🦴 **Back pain & Posture**
- 🌡️ **Fever & Temperature**

⚠️ For specific medical concerns, always consult a qualified healthcare professional.`;
    }
};

/* =========================================================
   MASTER RESPONSE FINDER
   Priority: Emergency → Conversation → Symptom → Health KB
========================================================= */
function findOfflineResponse(query) {
    const q = query.toLowerCase().trim();

    /* ── PRIORITY 1: Check emergency keywords first ── */
    const emergencyEntry = CONVERSATION_KB.find(e => e.type === "emergency");
    if (emergencyEntry) {
        for (const key of emergencyEntry.keys) {
            if (q.includes(key)) {
                return emergencyEntry.responses[0];
            }
        }
    }

    /* ── PRIORITY 2: Symptom-aware responses ── */
    let bestSymptomScore = 0;
    let bestSymptomResponse = null;

    for (const entry of SYMPTOM_RESPONSES) {
        let score = 0;
        for (const key of entry.keys) {
            if (q.includes(key)) {
                score += key.length * 2; /* weighted higher */
            }
        }
        if (score > bestSymptomScore) {
            bestSymptomScore = score;
            bestSymptomResponse = entry.response;
        }
    }

    if (bestSymptomResponse && bestSymptomScore > 0) {
        return bestSymptomResponse;
    }

    /* ── PRIORITY 3: Conversation KB ── */
    let bestConvScore = 0;
    let bestConvEntry = null;

    for (const entry of CONVERSATION_KB) {
        if (entry.type === "emergency") continue; /* already checked */
        let score = 0;
        for (const key of entry.keys) {
            if (q.includes(key)) {
                score += key.length;
            }
        }
        if (score > bestConvScore) {
            bestConvScore = score;
            bestConvEntry = entry;
        }
    }

    if (bestConvEntry && bestConvScore > 0) {
        /* Rotate through multiple responses for variety */
        const responses = bestConvEntry.responses;
        const idx = Math.floor(Math.random() * responses.length);
        return responses[idx];
    }

    /* ── PRIORITY 4: Health Knowledge Base ── */
    return HEALTH_KB.find(query);
}

/* =========================================================
   SYMPTOM CHECKER DATA
========================================================= */
const SYMPTOM_DATA = {
    head: {
        label: "Head",
        symptoms: [
            "Headache", "Migraine", "Dizziness", "Lightheadedness",
            "Head pressure", "Throbbing pain", "Forehead pain",
            "Confusion", "Memory issues", "Fainting"
        ],
        emergency: ["Sudden severe headache", "Confusion", "Fainting"]
    },
    eyes: {
        label: "Eyes",
        symptoms: [
            "Blurred vision", "Eye pain", "Red eyes", "Itchy eyes",
            "Watery eyes", "Light sensitivity", "Double vision",
            "Eye discharge", "Swollen eyelids", "Dry eyes"
        ],
        emergency: ["Sudden vision loss", "Double vision", "Eye injury"]
    },
    throat: {
        label: "Throat & Neck",
        symptoms: [
            "Sore throat", "Difficulty swallowing", "Hoarse voice",
            "Throat pain", "Swollen glands", "Neck stiffness",
            "Dry throat", "Tonsil pain", "Coughing", "Throat irritation"
        ],
        emergency: ["Difficulty breathing", "Severe swelling", "Neck stiffness with fever"]
    },
    chest: {
        label: "Chest",
        symptoms: [
            "Chest pain", "Shortness of breath", "Chest tightness",
            "Rapid heartbeat", "Irregular heartbeat", "Wheezing",
            "Cough", "Chest pressure", "Difficulty breathing", "Palpitations"
        ],
        emergency: [
            "Chest pain", "Shortness of breath", "Difficulty breathing",
            "Rapid heartbeat", "Chest pressure"
        ]
    },
    stomach: {
        label: "Stomach",
        symptoms: [
            "Stomach pain", "Nausea", "Vomiting", "Bloating",
            "Diarrhoea", "Constipation", "Heartburn", "Acid reflux",
            "Loss of appetite", "Cramping"
        ],
        emergency: ["Severe abdominal pain", "Blood in vomit", "Blood in stool"]
    },
    skin: {
        label: "Skin",
        symptoms: [
            "Rash", "Itching", "Redness", "Swelling", "Hives",
            "Dry skin", "Acne", "Bruising", "Skin peeling",
            "Dark spots"
        ],
        emergency: ["Widespread rash with fever", "Severe allergic reaction", "Rapid swelling"]
    },
    joints: {
        label: "Joints & Muscles",
        symptoms: [
            "Joint pain", "Muscle ache", "Swollen joints", "Stiffness",
            "Back pain", "Knee pain", "Shoulder pain", "Muscle weakness",
            "Limited movement", "Muscle cramps"
        ],
        emergency: ["Severe joint swelling", "Complete loss of movement"]
    },
    general: {
        label: "General Body",
        symptoms: [
            "Fever", "Fatigue", "Chills", "Night sweats", "Weight loss",
            "Weight gain", "Loss of appetite", "General weakness",
            "Body aches", "Feeling unwell"
        ],
        emergency: ["High fever above 39.4°C", "Severe weakness", "Loss of consciousness"]
    }
};

/* =========================================================
   SYMPTOM CHECKER STATE
========================================================= */
let selectedBodyPart = null;
let selectedSymptoms = new Set();
let selectedSeverity = null;

/* =========================================================
   SYMPTOM CHECKER — INIT BODY PART BUTTONS
========================================================= */
function initSymptomChecker() {
    const bodyBtns = $$(".sc-body-btn");
    bodyBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            /* Toggle active state */
            bodyBtns.forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-pressed", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-pressed", "true");

            selectedBodyPart = btn.dataset.part;
            selectedSymptoms.clear();
            selectedSeverity = null;

            /* Update step numbers */
            activateStepNum("sc-num-2");

            /* Load symptom chips */
            loadSymptomChips(selectedBodyPart);
            updateSummary();

            /* Reset severity buttons */
            $$(".sc-sev-btn").forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-pressed", "false");
            });
        });
    });

    /* Severity buttons */
    $$(".sc-sev-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            $$(".sc-sev-btn").forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-pressed", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-pressed", "true");
            selectedSeverity = btn.dataset.sev;

            /* Activate step 3 */
            activateStepNum("sc-num-3");
            updateSummary();

            /* Check for emergency severity */
            checkEmergency();
        });
    });
}

function activateStepNum(id) {
    const el = $(id);
    if (el) {
        el.classList.remove("sc-step-num-inactive");
        el.classList.add("sc-step-num-active");
    }
}

function loadSymptomChips(part) {
    const placeholder = $("sc-symptom-placeholder");
    const chipsWrap   = $("sc-symptom-chips");

    if (!SYMPTOM_DATA[part]) return;

    const symptoms = SYMPTOM_DATA[part].symptoms;

    /* Show chips container */
    placeholder?.classList.add("hidden");
    chipsWrap?.classList.remove("hidden");

    /* Clear existing */
    if (chipsWrap) chipsWrap.innerHTML = "";

    /* Create chips */
    symptoms.forEach(symptom => {
        const chip = document.createElement("button");
        chip.className   = "sc-symptom-chip";
        chip.textContent = symptom;
        chip.setAttribute("aria-pressed", "false");
        chip.setAttribute("type", "button");

        chip.addEventListener("click", () => {
            if (selectedSymptoms.has(symptom)) {
                selectedSymptoms.delete(symptom);
                chip.classList.remove("selected");
                chip.setAttribute("aria-pressed", "false");
            } else {
                selectedSymptoms.add(symptom);
                chip.classList.add("selected");
                chip.setAttribute("aria-pressed", "true");
            }

            /* Activate step 3 if symptoms selected */
            if (selectedSymptoms.size > 0) {
                activateStepNum("sc-num-3");
            }

            updateSummary();
            checkEmergency();
        });

        chipsWrap?.appendChild(chip);
    });
}

function updateSummary() {
    const summaryText = $("sc-summary-text");
    if (!summaryText) return;

    if (selectedSymptoms.size === 0) {
        summaryText.textContent = "No symptoms selected yet";
    } else {
        const list = [...selectedSymptoms].join(", ");
        summaryText.textContent =
            `${selectedSymptoms.size} symptom${selectedSymptoms.size > 1 ? "s" : ""} selected: ${list}`;
    }
}

function checkEmergency() {
    const emergencyBanner = $("sc-emergency");
    if (!emergencyBanner || !selectedBodyPart) return;

    const partData        = SYMPTOM_DATA[selectedBodyPart];
    const emergencySyms   = partData?.emergency || [];
    const isSevere        = selectedSeverity === "severe";

    /* Check if any selected symptom is an emergency symptom */
    const hasEmergencySymptom = [...selectedSymptoms].some(sym =>
        emergencySyms.some(es =>
            sym.toLowerCase().includes(es.toLowerCase()) ||
            es.toLowerCase().includes(sym.toLowerCase())
        )
    );

    /* Show emergency banner if severe + emergency symptom */
    if ((hasEmergencySymptom && isSevere) ||
        (hasEmergencySymptom && selectedBodyPart === "chest")) {
        emergencyBanner.classList.remove("hidden");
    } else {
        emergencyBanner.classList.add("hidden");
    }
}

window.resetSymptomChecker = function() {
    /* Reset state */
    selectedBodyPart = null;
    selectedSymptoms.clear();
    selectedSeverity = null;

    /* Reset body buttons */
    $$(".sc-body-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
    });

    /* Reset severity buttons */
    $$(".sc-sev-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
    });

    /* Reset duration */
    const dur = $("sc-duration");
    if (dur) dur.value = "";

    /* Reset symptom area */
    const placeholder = $("sc-symptom-placeholder");
    const chipsWrap   = $("sc-symptom-chips");
    placeholder?.classList.remove("hidden");
    chipsWrap?.classList.add("hidden");
    if (chipsWrap) chipsWrap.innerHTML = "";

    /* Reset step nums */
    ["sc-num-2", "sc-num-3"].forEach(id => {
        const el = $(id);
        if (el) {
            el.classList.remove("sc-step-num-active");
            el.classList.add("sc-step-num-inactive");
        }
    });

    /* Hide emergency banner */
    $("sc-emergency")?.classList.add("hidden");

    /* Reset summary */
    updateSummary();

    showToast("Symptom checker reset ✓", "success", 2000);
};

window.checkSymptoms = function() {
    if (!selectedBodyPart) {
        showToast("Please select a body area first", "warning");
        return;
    }
    if (selectedSymptoms.size === 0) {
        showToast("Please select at least one symptom", "warning");
        return;
    }

    const partLabel  = SYMPTOM_DATA[selectedBodyPart]?.label || selectedBodyPart;
    const symptomList = [...selectedSymptoms].join(", ");
    const severity   = selectedSeverity || "unspecified severity";
    const duration   = $("sc-duration")?.value || "unspecified duration";

    /* Build natural language question */
    const question =
        `I have the following symptoms in my ${partLabel} area: ${symptomList}. ` +
        `The severity is ${severity} and I've had these symptoms for ${duration}. ` +
        `What could be causing these symptoms and what should I do?`;

    /* Send to chat */
    sendQuestion(question);

    /* Scroll to chat */
    $("chat-section")?.scrollIntoView({ behavior: "smooth" });

    showToast("Symptoms sent to AI! 🩺", "success", 2500);
};

/* =========================================================
   TOAST NOTIFICATIONS
========================================================= */
function showToast(message, type = "info", duration = 3500) {
    if (!toastContainer) return;

    const icons = {
        success: "✅", error: "❌", info: "ℹ️", warning: "⚠️"
    };

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML =
        `<span>${icons[type] || "ℹ️"}</span>` +
        `<span>${escHTML(message)}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-out");
        setTimeout(() => toast.remove(), 320);
    }, duration);
}

window.showToast = showToast;

/* =========================================================
   CUSTOM CURSOR
========================================================= */
const isPointerFine = window.matchMedia("(pointer: fine)").matches;

if (isPointerFine && cursor && cursorTrail) {
    let mx = 0, my = 0, tx = 0, ty = 0;

    document.addEventListener("mousemove", e => {
        mx = e.clientX; my = e.clientY;
        cursor.style.left = mx + "px";
        cursor.style.top  = my + "px";
    });

    (function animateTrail() {
        tx += (mx - tx) * 0.11;
        ty += (my - ty) * 0.11;
        cursorTrail.style.left = tx + "px";
        cursorTrail.style.top  = ty + "px";
        requestAnimationFrame(animateTrail);
    })();

    document.addEventListener("mouseleave", () => {
        cursor.style.opacity      = "0";
        cursorTrail.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
        cursor.style.opacity      = "1";
        cursorTrail.style.opacity = "1";
    });
} else {
    if (cursor)      cursor.style.display      = "none";
    if (cursorTrail) cursorTrail.style.display = "none";
}

/* =========================================================
   SCROLL PROGRESS + NAV
========================================================= */
function onScroll() {
    const total = document.body.scrollHeight - window.innerHeight;
    if (total > 0 && scrollBar) {
        scrollBar.style.width = (window.scrollY / total * 100) + "%";
    }
    if (nav) {
        nav.classList.toggle("nav-scrolled", window.scrollY > 30);
    }
    updateReveal();
}

window.addEventListener("scroll", onScroll, { passive: true });

/* =========================================================
   MOBILE MENU
========================================================= */
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("open");
        mobileMenuBtn.setAttribute("aria-expanded", isOpen);
        const [s1, s2, s3] = mobileMenuBtn.children;
        if (isOpen) {
            s1.style.transform = "rotate(45deg) translateY(7px)";
            s2.style.opacity   = "0";
            s3.style.transform = "rotate(-45deg) translateY(-7px)";
        } else {
            s1.style.transform = "";
            s2.style.opacity   = "1";
            s3.style.transform = "";
        }
    });

    $$(".mob-link, .mob-cta").forEach(el => {
        el.addEventListener("click", closeMobileMenu);
    });
}

function closeMobileMenu() {
    if (!mobileMenu || !mobileMenuBtn) return;
    mobileMenu.classList.remove("open");
    mobileMenuBtn.setAttribute("aria-expanded", "false");
    const [s1, s2, s3] = mobileMenuBtn.children;
    s1.style.transform = "";
    s2.style.opacity   = "1";
    s3.style.transform = "";
}

document.addEventListener("click", e => {
    if (!mobileMenu || !mobileMenuBtn) return;
    if (
        mobileMenu.classList.contains("open") &&
        !mobileMenu.contains(e.target) &&
        !mobileMenuBtn.contains(e.target)
    ) {
        closeMobileMenu();
    }
});

/* =========================================================
   REVEAL ON SCROLL
========================================================= */
function updateReveal() {
    $$(".reveal:not(.visible)").forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.88) {
            el.classList.add("visible");
        }
    });
}

/* =========================================================
   BENTO CARDS — 3D TILT + CLICK TO ASK
========================================================= */
$$(".bento-card[data-q]").forEach(card => {
    card.addEventListener("mousemove", e => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -4;
        const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  4;
        card.style.transition = "transform 0.1s ease, box-shadow 0.1s ease";
        card.style.transform  =
            `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transition =
            "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.5s ease";
        card.style.transform =
            "perspective(800px) rotateX(0) rotateY(0) translateY(0)";
    });

    card.addEventListener("click", () => {
        const q = card.dataset.q;
        if (q) {
            sendQuestion(q);
            $("chat-section")?.scrollIntoView({ behavior: "smooth" });
        }
    });

    card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            card.click();
        }
    });
});

/* =========================================================
   HOW STEP + TEST CARDS — 3D TILT
========================================================= */
$$(".how-step-card, .test-card").forEach(card => {
    card.addEventListener("mousemove", e => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -3;
        const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  3;
        card.style.transition = "transform 0.08s ease";
        card.style.transform  =
            `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transition =
            "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
        card.style.transform = "perspective(700px) rotateX(0) rotateY(0)";
    });
});

/* =========================================================
   HERO VISUAL — PARALLAX
========================================================= */
const heroVisual = $("hero-visual");

if (heroVisual && isPointerFine) {
    document.addEventListener("mousemove", e => {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        heroVisual.style.transform =
            `perspective(1200px) rotateX(${dy * -3}deg) rotateY(${dx * 3}deg)`;
    });
}

/* =========================================================
   FLOATING METRIC CARDS — PARALLAX
========================================================= */
const hvf1 = $("hvf1");
const hvf2 = $("hvf2");
const hvf3 = $("hvf3");

if (isPointerFine && (hvf1 || hvf2 || hvf3)) {
    document.addEventListener("mousemove", e => {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        if (hvf1) hvf1.style.transform =
            `translateY(${dy * -10}px) translateX(${dx * -5}px)`;
        if (hvf2) hvf2.style.transform =
            `translateY(${dy * -15}px) translateX(${dx * 8}px)`;
        if (hvf3) hvf3.style.transform =
            `translateY(${dy * -8}px) translateX(${dx * -8}px)`;
    });
}

/* =========================================================
   LOGO SCROLL — PAUSE ON HOVER
========================================================= */
const lsTrack = $("ls-track");
if (lsTrack) {
    lsTrack.addEventListener("mouseenter", () => {
        lsTrack.style.animationPlayState = "paused";
    });
    lsTrack.addEventListener("mouseleave", () => {
        lsTrack.style.animationPlayState = "running";
    });
}

/* =========================================================
   NAV DROPDOWN — KEYBOARD SUPPORT
========================================================= */
$$(".nav-has-dropdown").forEach(item => {
    const btn  = item.querySelector(".nav-btn");
    const drop = item.querySelector(".nav-dropdown");
    if (!btn || !drop) return;

    btn.addEventListener("focus", () => {
        drop.style.opacity    = "1";
        drop.style.visibility = "visible";
        drop.style.transform  = "translateX(-50%) translateY(0)";
        btn.setAttribute("aria-expanded", "true");
    });
    btn.addEventListener("blur", e => {
        if (!item.contains(e.relatedTarget)) {
            drop.style.opacity    = "";
            drop.style.visibility = "";
            drop.style.transform  = "";
            btn.setAttribute("aria-expanded", "false");
        }
    });
});

/* =========================================================
   SMOOTH ANCHOR SCROLL
========================================================= */
$$("a[href^='#']").forEach(a => {
    a.addEventListener("click", e => {
        const href   = a.getAttribute("href");
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            closeMobileMenu();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

/* =========================================================
   KEYBOARD SECTION NAVIGATION
========================================================= */
document.addEventListener("keydown", e => {
    if (isTypingInInput()) return;

    const sections = $$("section[id]");
    let cur = -1;
    sections.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.5 &&
            r.bottom > window.innerHeight * 0.4) {
            cur = i;
        }
    });

    if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        sections[cur + 1]?.scrollIntoView({ behavior: "smooth" });
    }
    if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        sections[cur - 1]?.scrollIntoView({ behavior: "smooth" });
    }
});

function isTypingInInput() {
    const tag = document.activeElement?.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/* =========================================================
   CHARACTER COUNTER
========================================================= */
if (chatInput && charCount) {
    chatInput.addEventListener("input", () => {
        const len       = chatInput.value.length;
        const remaining = MAX_CHARS - len;

        if (len === 0) {
            charCount.textContent = "";
            charCount.className   = "cw-char-count";
        } else if (remaining <= 20) {
            charCount.textContent = remaining;
            charCount.className   = "cw-char-count limit";
        } else if (remaining <= 60) {
            charCount.textContent = remaining;
            charCount.className   = "cw-char-count warn";
        } else {
            charCount.textContent = "";
            charCount.className   = "cw-char-count";
        }
    });
}

/* =========================================================
   BACKEND CONNECTIVITY CHECK
========================================================= */
async function checkBackend() {
    try {
        const ctrl = new AbortController();
        const id   = setTimeout(() => ctrl.abort(), 3000);

        const res = await fetch(API_URL, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ message: "ping" }),
            signal:  ctrl.signal
        });

        clearTimeout(id);
        if (res.ok) { setOnlineMode(true); return true; }
        throw new Error("non-ok");

    } catch {
        setOnlineMode(false);
        return false;
    }
}

function setOnlineMode(online) {
    isOnline = online;
    const statusEl = $("ai-status-text");
    if (statusEl) {
        statusEl.textContent = online ? "Online" : "Offline mode";
    }
    if (offlineBanner) {
        offlineBanner.classList.toggle("hidden", online);
    }
    const dot = document.querySelector(".cw-online-dot");
    if (dot) {
        dot.style.background = online ? "var(--green)" : "var(--amber)";
    }
}

if (obRetry) {
    obRetry.addEventListener("click", async () => {
        obRetry.textContent = "Checking...";
        obRetry.disabled    = true;
        const ok = await checkBackend();
        showToast(
            ok
                ? "Connected to HealthAI server! ✅"
                : "Server still unreachable — using offline mode",
            ok ? "success" : "warning"
        );
        obRetry.textContent = "Retry ↺";
        obRetry.disabled    = false;
    });
}

/* =========================================================
   SEND QUESTION — MAIN FUNCTION
========================================================= */
async function sendQuestion(question) {
    question = (question || "").trim();
    if (!question) return;
    if (question.length > MAX_CHARS) {
        showToast(`Question too long (max ${MAX_CHARS} characters)`, "warning");
        return;
    }
    if (isSending) return;

    isSending = true;
    setInputsDisabled(true);

    addMessage(question, "user");
    chatHistory.push({ role: "user", content: question });

    if (userInput)  userInput.value  = "";
    if (chatInput)  chatInput.value  = "";
    if (charCount) {
        charCount.textContent = "";
        charCount.className   = "cw-char-count";
    }

    if (typingInd) typingInd.classList.add("active");
    const loadingEl = addLoadingBubble();

    try {
        let responseText = "";

        if (isOnline) {
            try {
                const ctrl = new AbortController();
                const id   = setTimeout(() => ctrl.abort(), 10000);

                const res = await fetch(API_URL, {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify({ message: question }),
                    signal:  ctrl.signal
                });

                clearTimeout(id);
                if (!res.ok) throw new Error("Server error " + res.status);

                const data = await res.json();
                responseText = data.response || data.message || "";
                if (!responseText) throw new Error("Empty response");

            } catch (fetchErr) {
                console.warn("Backend unreachable:", fetchErr);
                setOnlineMode(false);
                showToast("Switched to offline mode", "warning", 2500);
                responseText = findOfflineResponse(question);
            }
        } else {
            await sleep(600 + Math.random() * 500);
            responseText = findOfflineResponse(question);
        }

        loadingEl.remove();
        if (typingInd) typingInd.classList.remove("active");

        chatHistory.push({ role: "assistant", content: responseText });
        await addTypingMessage(responseText);

    } catch (err) {
        console.error("HealthAI Error:", err);
        loadingEl.remove();
        if (typingInd) typingInd.classList.remove("active");
        addMessage("Something went wrong. Please try again.", "assistant");
        showToast("Something went wrong. Please try again.", "error");
    } finally {
        isSending = false;
        setInputsDisabled(false);
        if (chatInput) setTimeout(() => chatInput.focus(), 100);
    }
}

/* =========================================================
   ADD MESSAGE (instant)
========================================================= */
function addMessage(text, role) {
    removeWelcome();

    const wrap = document.createElement("div");
    wrap.className = `cw-msg ${role}`;

    const avatar = document.createElement("div");
    avatar.className   = "cw-msg-avatar";
    avatar.textContent = role === "user" ? "👤" : "🩺";
    avatar.setAttribute("aria-hidden", "true");

    const content = document.createElement("div");
    content.className = "cw-msg-content";

    const bubble = document.createElement("div");
    bubble.className = "cw-msg-bubble";

    if (role === "assistant") {
        bubble.innerHTML = formatResponse(text);
    } else {
        bubble.textContent = text;
    }

    const time = document.createElement("div");
    time.className   = "cw-msg-time";
    time.textContent = getTime();

    content.appendChild(bubble);
    content.appendChild(time);

    if (role === "user") {
        wrap.appendChild(content);
        wrap.appendChild(avatar);
    } else {
        wrap.appendChild(avatar);
        wrap.appendChild(content);
    }

    chatMessages.appendChild(wrap);
    scrollBottom();
    return wrap;
}

/* =========================================================
   TYPING MESSAGE — word by word
========================================================= */
async function addTypingMessage(text) {
    removeWelcome();

    const wrap = document.createElement("div");
    wrap.className = "cw-msg assistant";

    const avatar = document.createElement("div");
    avatar.className   = "cw-msg-avatar";
    avatar.textContent = "🩺";
    avatar.setAttribute("aria-hidden", "true");

    const content = document.createElement("div");
    content.className = "cw-msg-content";

    const bubble = document.createElement("div");
    bubble.className = "cw-msg-bubble";

    wrap.appendChild(avatar);
    content.appendChild(bubble);
    wrap.appendChild(content);
    chatMessages.appendChild(wrap);

    /* Extract plain text for typing animation */
    const formatted = formatResponse(text);
    const temp       = document.createElement("div");
    temp.innerHTML   = formatted;
    const plain      = (temp.textContent || temp.innerText || "").trim();
    const words      = plain.split(/\s+/).filter(Boolean);

    /* Type word by word */
    let displayed = "";
    for (let i = 0; i < words.length; i++) {
        if (!wrap.isConnected) return;
        displayed     += (i === 0 ? "" : " ") + words[i];
        bubble.textContent = displayed;
        scrollBottom();
        const delay = words[i].length < 4 ? TYPING_SPEED * 0.6 : TYPING_SPEED;
        await sleep(delay);
    }

    /* Swap to formatted HTML */
    bubble.innerHTML = formatted;

    /* Add health disclaimer only for health topics (not greetings) */
    const isHealthResponse = !text.includes("Welcome to") &&
                             !text.includes("Great to have you") &&
                             !text.includes("You're very welcome") &&
                             !text.includes("Goodbye") &&
                             !text.includes("See you later") &&
                             !text.includes("Aww, thank you") &&
                             text.length > 200;

    if (isHealthResponse) {
        const disclaimer = document.createElement("div");
        disclaimer.className   = "msg-disclaimer";
        disclaimer.textContent =
            "⚠️ General health information only. " +
            "Always consult a qualified healthcare professional " +
            "for personal medical advice.";
        bubble.appendChild(disclaimer);
    }

    const time = document.createElement("div");
    time.className   = "cw-msg-time";
    time.textContent = getTime();
    content.appendChild(time);

    scrollBottom();
}

/* =========================================================
   LOADING BUBBLE
========================================================= */
function addLoadingBubble() {
    removeWelcome();

    const wrap = document.createElement("div");
    wrap.className = "cw-msg assistant";
    wrap.setAttribute("aria-label", "AI is thinking");
    wrap.innerHTML = `
        <div class="cw-msg-avatar" aria-hidden="true">🩺</div>
        <div class="cw-msg-content">
            <div class="cw-msg-bubble">
                <div class="cw-typing">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>`;

    chatMessages.appendChild(wrap);
    scrollBottom();
    return wrap;
}

/* =========================================================
   FORMAT RESPONSE — FIXED REGEX
========================================================= */
function formatResponse(text) {
    let t = escHTML(text);
    t = t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/\*(.*?)\*/g,     "<em>$1</em>");
    t = t.replace(/^###\s+(.+)$/gm, "<h4>$1</h4>");
    t = t.replace(/^##\s+(.+)$/gm,  "<h3>$1</h3>");
    t = t.replace(/^[-•*]\s+(.+)$/gm,  "<li>$1</li>");
    t = t.replace(/^\d+\.\s+(.+)$/gm,  "<li>$1</li>");
    t = t.replace(/((?:<li>.*?<\/li>\n?)+)/g, "<ul>$1</ul>");
    t = t.replace(/\n\n+/g, "</p><p>");
    t = t.replace(/\n/g,    "<br>");
    if (!t.startsWith("<")) t = "<p>" + t + "</p>";
    return t;
}

/* =========================================================
   HELPERS
========================================================= */
function removeWelcome() {
    const w = $("chat-welcome");
    if (w) w.remove();
}

function getWelcomeHTML() {
    return `
        <div class="cw-welcome" id="chat-welcome">
            <div class="cww-icon">🩺</div>
            <h3>How can I help you today?</h3>
            <p>Ask me anything about health, nutrition,
               fitness or wellness. You can also just say hi! 👋</p>
            <div class="cww-chips">
                <button class="chip"
                    onclick="quickAsk('What are symptoms of dehydration?')">
                    💧 Dehydration symptoms
                </button>
                <button class="chip"
                    onclick="quickAsk('How to improve sleep quality?')">
                    💤 Sleep tips
                </button>
                <button class="chip"
                    onclick="quickAsk('Best foods for heart health?')">
                    ❤️ Heart foods
                </button>
                <button class="chip"
                    onclick="quickAsk('How much water should I drink daily?')">
                    🥤 Water intake
                </button>
                <button class="chip"
                    onclick="quickAsk('What are signs of vitamin D deficiency?')">
                    ☀️ Vitamin D
                </button>
                <button class="chip"
                    onclick="quickAsk('How to reduce stress naturally?')">
                    🧘 Stress relief
                </button>
                <button class="chip"
                    onclick="quickAsk('What is a healthy diet plan?')">
                    🥗 Healthy diet
                </button>
                <button class="chip"
                    onclick="quickAsk('How to boost immune system naturally?')">
                    🛡️ Boost immunity
                </button>
            </div>
        </div>`;
}

function scrollBottom() {
    if (chatMessages) {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: "smooth"
        });
    }
}

function setInputsDisabled(disabled) {
    if (sendButton) sendButton.disabled = disabled;
    if (chatSend)   chatSend.disabled   = disabled;
    if (userInput)  userInput.disabled  = disabled;
    if (chatInput)  chatInput.disabled  = disabled;
}

/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */
window.quickAsk = function(q) {
    sendQuestion(q);
    const chatSection = $("chat-section");
    if (chatSection) {
        const rect = chatSection.getBoundingClientRect();
        if (rect.top > window.innerHeight || rect.bottom < 0) {
            chatSection.scrollIntoView({ behavior: "smooth" });
        }
    }
};

/* =========================================================
   EVENT LISTENERS
========================================================= */
if (sendButton) {
    sendButton.addEventListener("click", () => {
        if (!userInput?.value.trim()) return;
        sendQuestion(userInput.value);
        $("chat-section")?.scrollIntoView({ behavior: "smooth" });
    });
}

if (userInput) {
    userInput.addEventListener("keydown", e => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        if (!userInput.value.trim()) return;
        sendQuestion(userInput.value);
        $("chat-section")?.scrollIntoView({ behavior: "smooth" });
    });
}

if (chatSend) {
    chatSend.addEventListener("click", () => {
        if (!chatInput?.value.trim()) return;
        sendQuestion(chatInput.value);
    });
}

if (chatInput) {
    chatInput.addEventListener("keydown", e => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        if (!chatInput.value.trim()) return;
        sendQuestion(chatInput.value);
    });
}

if (clearChat) {
    clearChat.addEventListener("click", async () => {
        if (isOnline) {
            try {
                await fetch("http://127.0.0.1:8000/chat/clear", {
                    method: "DELETE",
                    signal: AbortSignal.timeout(2000)
                });
            } catch { /* ignore */ }
        }
        chatMessages.innerHTML = getWelcomeHTML();
        chatHistory = [];
        showToast("Chat cleared ✓", "success", 2000);
    });
}

/* =========================================================
   BMI CALCULATOR
========================================================= */
let currentUnit = "metric";

window.switchUnit = function(unit) {
    currentUnit = unit;
    const metricInputs   = $("metric-inputs");
    const imperialInputs = $("imperial-inputs");
    const btnMetric      = $("btn-metric");
    const btnImperial    = $("btn-imperial");

    if (unit === "metric") {
        metricInputs?.classList.remove("hidden");
        imperialInputs?.classList.add("hidden");
        btnMetric?.classList.add("active");
        btnImperial?.classList.remove("active");
        btnMetric?.setAttribute("aria-pressed", "true");
        btnImperial?.setAttribute("aria-pressed", "false");
    } else {
        metricInputs?.classList.add("hidden");
        imperialInputs?.classList.remove("hidden");
        btnMetric?.classList.remove("active");
        btnImperial?.classList.add("active");
        btnMetric?.setAttribute("aria-pressed", "false");
        btnImperial?.setAttribute("aria-pressed", "true");
    }
    resetBMIResult();
};

function resetBMIResult() {
    $("bmi-empty")?.classList.remove("hidden");
    $("bmi-result")?.classList.add("hidden");
}

window.calculateBMI = function() {
    let heightM = 0, weightKg = 0;

    if (currentUnit === "metric") {
        const hCm = parseFloat($("bmi-height-cm")?.value);
        const wKg = parseFloat($("bmi-weight-kg")?.value);
        if (!hCm || !wKg || hCm <= 0 || wKg <= 0) {
            showToast("Please enter valid height and weight", "warning");
            return;
        }
        if (hCm < 50 || hCm > 300) {
            showToast("Please enter a valid height (50–300 cm)", "warning");
            return;
        }
        if (wKg < 10 || wKg > 500) {
            showToast("Please enter a valid weight (10–500 kg)", "warning");
            return;
        }
        heightM  = hCm / 100;
        weightKg = wKg;
    } else {
        const ft  = parseFloat($("bmi-height-ft")?.value) || 0;
        const in_ = parseFloat($("bmi-height-in")?.value) || 0;
        const lb  = parseFloat($("bmi-weight-lb")?.value);
        if ((!ft && !in_) || !lb || lb <= 0) {
            showToast("Please enter valid height and weight", "warning");
            return;
        }
        heightM  = ((ft * 12) + in_) * 0.0254;
        weightKg = lb * 0.453592;
    }

    const bmi = weightKg / (heightM * heightM);
    if (!isFinite(bmi) || bmi <= 0) {
        showToast("Invalid values — please check inputs", "error");
        return;
    }
    displayBMIResult(bmi, weightKg, heightM);
};

function displayBMIResult(bmi, weightKg, heightM) {
    const rounded = Math.round(bmi * 10) / 10;

    let category, catClass, description, gradStart, gradEnd;

    if (bmi < 18.5) {
        category    = "Underweight";
        catClass    = "bmi-cat-underweight";
        description = "Your BMI suggests you may be underweight. Consider speaking with a healthcare professional about reaching a healthy weight through balanced nutrition.";
        gradStart   = "#06b6d4"; gradEnd = "#0891b2";
    } else if (bmi < 25) {
        category    = "✓ Normal Weight";
        catClass    = "bmi-cat-normal";
        description = "Great news! Your BMI is in the healthy range. Maintain this through balanced eating and regular physical activity.";
        gradStart   = "#28aa79"; gradEnd = "#059669";
    } else if (bmi < 30) {
        category    = "Overweight";
        catClass    = "bmi-cat-overweight";
        description = "Your BMI suggests you may be overweight. Small, consistent changes in diet and activity can help.";
        gradStart   = "#f59e0b"; gradEnd = "#d97706";
    } else {
        category    = "Obese";
        catClass    = "bmi-cat-obese";
        description = "Your BMI falls in the obese range. Please consult a healthcare professional for personalised guidance.";
        gradStart   = "#ef4444"; gradEnd = "#dc2626";
    }

    const indicatorPct = Math.min(Math.max(((bmi - 10) / 30) * 100, 2), 98);
    const healthyMin   = Math.round(18.5 * heightM * heightM * 10) / 10;
    const healthyMax   = Math.round(24.9 * heightM * heightM * 10) / 10;

    const scoreNum = $("bmi-score-num");
    if (scoreNum) scoreNum.textContent = rounded;

    const badge = $("bmi-category-badge");
    if (badge) {
        badge.textContent = category;
        badge.className   = `bmi-category-badge ${catClass}`;
    }

    const desc = $("bmi-desc");
    if (desc) desc.textContent = description;

    const indicator = $("bmi-indicator");
    if (indicator) indicator.style.left = indicatorPct + "%";

    $("bmi-grad-start")?.setAttribute("stop-color", gradStart);
    $("bmi-grad-end")?.setAttribute("stop-color", gradEnd);

    const healthyRange = $("bmi-healthy-range");
    if (healthyRange) {
        healthyRange.innerHTML =
            `Healthy weight for your height: ` +
            `<strong>${healthyMin} – ${healthyMax} kg</strong>`;
    }

    const askAiBtn = $("bmi-ask-ai");
    if (askAiBtn) {
        askAiBtn.onclick = () => {
            const q =
                `My BMI is ${rounded} which is classified as ` +
                `${category.replace("✓ ", "")}. ` +
                `What does this mean for my health and what should I do?`;
            sendQuestion(q);
            $("chat-section")?.scrollIntoView({ behavior: "smooth" });
        };
    }

    const circle = $("bmi-ring-circle");
    if (circle) {
        const fillPct   = Math.min(bmi / 40, 1);
        const circumf   = 2 * Math.PI * 52;
        circle.setAttribute("stroke-dasharray",
            `${fillPct * circumf} ${circumf}`);
        circle.setAttribute("stroke-dashoffset",
            `${circumf * 0.25}`);
    }

    $("bmi-empty")?.classList.add("hidden");
    $("bmi-result")?.classList.remove("hidden");

    showToast(
        `BMI: ${rounded} — ${category.replace("✓ ", "")}`,
        "success"
    );
}

/* =========================================================
   INIT
========================================================= */
window.addEventListener("load", () => {
    updateReveal();

    /* Stagger hero animations */
    const heroEls = [
        $("hbw"), $("hero-headline"), $("hero-sub"),
        $("hero-actions"), $("hero-trusted"),
        $("hero-visual"), $("scroll-arrow")
    ];
    heroEls.forEach((el, i) => {
        if (el) el.style.animationDelay = `${i * 0.08}s`;
    });

    /* Init symptom checker */
    initSymptomChecker();

    /* Check backend */
    checkBackend().then(online => {
        backendChecked = true;
        if (!online) {
            console.info(
                "HealthAI: FastAPI backend not found. " +
                "Running in offline mode with built-in knowledge base."
            );
        }
    });

    /* Ticker hover pause */
    const tickerTrack = $("ticker-track");
    if (tickerTrack) {
        tickerTrack.addEventListener("mouseenter", () => {
            tickerTrack.style.animationPlayState = "paused";
        });
        tickerTrack.addEventListener("mouseleave", () => {
            tickerTrack.style.animationPlayState = "running";
        });
    }
});