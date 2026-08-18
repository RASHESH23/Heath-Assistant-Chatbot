/* =========================================================
   HEALTHAI — PREMIUM APP.JS
   COMPLETE JAVASCRIPT
========================================================= */

"use strict";

const API_URL = "http://127.0.0.1:8000/chat";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const userInput    = document.getElementById("user-input");
const sendButton   = document.getElementById("send-button");
const chatInput    = document.getElementById("chat-input");
const chatSend     = document.getElementById("chat-send");
const chatMessages = document.getElementById("chat-messages");
const clearChat    = document.getElementById("clear-chat");
const typingStatus = document.getElementById("typing-status");
const navbar       = document.getElementById("navbar");
const heroCard     = document.getElementById("hero-card");
const heroSearch   = document.getElementById("hero-search");
const cursorGlow   = document.getElementById("cursor-glow");
const particlesBg  = document.getElementById("particles-bg");


/* =========================================================
   CURSOR GLOW
========================================================= */

document.addEventListener("mousemove", e => {
    cursorGlow.style.left = e.clientX + "px";
    cursorGlow.style.top  = e.clientY + "px";
});


/* =========================================================
   PARTICLES
========================================================= */

(function createParticles() {
    const count = 28;

    for (let i = 0; i < count; i++) {
        const p    = document.createElement("div");
        p.className = "particle";

        const size = Math.random() * 3 + 2;

        p.style.cssText = `
            width:             ${size}px;
            height:            ${size}px;
            left:              ${Math.random() * 100}%;
            animation-duration:${Math.random() * 14 + 10}s;
            animation-delay:  -${Math.random() * 14}s;
        `;

        particlesBg.appendChild(p);
    }
}());


/* =========================================================
   NAVBAR — SCROLL EFFECT
========================================================= */

window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
    updateActiveNavLink();
}, { passive: true });


/* =========================================================
   ACTIVE NAV LINK
========================================================= */

function updateActiveNavLink() {
    const sections = document.querySelectorAll(
        "section[id], main[id]"
    );
    const links = document.querySelectorAll(".nav-link");
    let   current = "";

    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) {
            current = sec.id;
        }
    });

    links.forEach(link => {
        const href = link.getAttribute("href").replace("#", "");
        const isActive = href === current;
        link.classList.toggle("active", isActive);
        const underline = link.querySelector(".nav-underline");
        if (underline) {
            underline.style.width = isActive ? "100%" : "0";
        }
    });
}


/* =========================================================
   HERO CARD — 3D TILT
========================================================= */

if (heroCard) {
    heroCard.addEventListener("mousemove", e => {
        const rect    = heroCard.getBoundingClientRect();
        const cx      = rect.left + rect.width  / 2;
        const cy      = rect.top  + rect.height / 2;
        const rx      = ((e.clientY - cy) / (rect.height / 2)) * -6;
        const ry      = ((e.clientX - cx) / (rect.width  / 2)) *  6;

        heroCard.style.transition = "transform 0.1s ease";
        heroCard.style.transform  =
            `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    });

    heroCard.addEventListener("mouseleave", () => {
        heroCard.style.transition = "transform 0.55s cubic-bezier(0.34,1.56,0.64,1)";
        heroCard.style.transform  =
            "perspective(900px) rotateX(0) rotateY(0) scale(1)";
    });
}


/* =========================================================
   GENERIC 3D TILT — [data-tilt]
========================================================= */

function initTilt() {
    document.querySelectorAll("[data-tilt]").forEach(el => {
        el.addEventListener("mousemove", e => {
            const rect = el.getBoundingClientRect();
            const cx   = rect.left + rect.width  / 2;
            const cy   = rect.top  + rect.height / 2;
            const rx   = ((e.clientY - cy) / (rect.height / 2)) * -5;
            const ry   = ((e.clientX - cx) / (rect.width  / 2)) *  5;

            el.style.transition = "transform 0.1s ease";
            el.style.transform  =
                `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
        });

        el.addEventListener("mouseleave", () => {
            el.style.transition = "transform 0.55s cubic-bezier(0.34,1.56,0.64,1)";
            el.style.transform  =
                "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
        });
    });
}

initTilt();


/* =========================================================
   SCROLL REVEAL
========================================================= */

function initScrollReveal() {
    const selectors = [
        ".topic-card",
        ".feature-card",
        ".about-content",
        ".disclaimer-card",
        ".section-heading",
        ".chat-panel",
        ".how-cta-bar",
        ".testimonials-section",
        ".stats-section"
    ];

    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach((el, i) => {
            el.classList.add("reveal");
            el.style.transitionDelay = `${i * 0.08}s`;
        });
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal").forEach(el => {
        observer.observe(el);
    });
}

initScrollReveal();


/* =========================================================
   STATS COUNTER ANIMATION
========================================================= */

function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const steps    = 60;
    const stepTime = duration / steps;
    let   step     = 0;

    const timer = setInterval(() => {
        step++;
        const val = Math.floor(easeOutExpo(step / steps) * target);
        el.textContent = val.toLocaleString();

        if (step >= steps) {
            clearInterval(timer);
            el.textContent = target.toLocaleString();
        }
    }, stepTime);
}

function animateBar(bar) {
    const w = bar.dataset.width || "0";
    setTimeout(() => { bar.style.width = w + "%"; }, 300);
}

(function initStats() {
    const section = document.querySelector(".stats-section");
    if (!section) return;

    let done = false;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !done) {
                done = true;

                document.querySelectorAll(".stat-counter")
                    .forEach((el, i) => {
                        setTimeout(() => animateCounter(el), i * 150);
                    });

                document.querySelectorAll(".stat-bar-fill")
                    .forEach((bar, i) => {
                        setTimeout(() => animateBar(bar), i * 150 + 400);
                    });

                document.querySelectorAll(".stat-card")
                    .forEach((card, i) => {
                        card.style.opacity   = "0";
                        card.style.transform = "translateY(40px)";
                        card.style.transition =
                            `all 0.65s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.12}s`;

                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                card.style.opacity   = "1";
                                card.style.transform = "translateY(0)";
                            });
                        });
                    });
            }
        });
    }, { threshold: 0.25 });

    obs.observe(section);
}());


/* =========================================================
   STAT CARDS — 3D TILT
========================================================= */

document.querySelectorAll(".stat-card").forEach(card => {
    card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const rx   = ((e.clientY - cy) / (rect.height / 2)) * -6;
        const ry   = ((e.clientX - cx) / (rect.width  / 2)) *  6;

        card.style.transition = "transform 0.1s ease";
        card.style.transform  =
            `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-12px) scale(1.02)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transition = "transform 0.55s cubic-bezier(0.34,1.56,0.64,1)";
        card.style.transform  =
            "perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)";
    });
});


/* =========================================================
   TESTIMONIAL SLIDER
========================================================= */

(function initTestimonials() {
    const track    = document.getElementById("test-track");
    const dotsWrap = document.getElementById("test-dots");
    const prevBtn  = document.getElementById("test-prev");
    const nextBtn  = document.getElementById("test-next");

    if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

    const cards   = Array.from(track.querySelectorAll(".test-card"));
    const total   = cards.length;
    let current   = 0;
    let autoTimer = null;
    let cardW     = 0;
    let visCount  = 1;

    function buildDots() {
        dotsWrap.innerHTML = "";
        const pages = Math.ceil(total / visCount);

        for (let i = 0; i < pages; i++) {
            const dot       = document.createElement("button");
            dot.className   = `test-dot ${i === 0 ? "active" : ""}`;
            dot.setAttribute("aria-label", `Slide ${i + 1}`);
            dot.addEventListener("click", () => {
                stopAuto();
                goTo(i * visCount);
                startAuto();
            });
            dotsWrap.appendChild(dot);
        }
    }

    function updateDots() {
        const dots = dotsWrap.querySelectorAll(".test-dot");
        const page = Math.floor(current / Math.max(visCount, 1));
        dots.forEach((d, i) => d.classList.toggle("active", i === page));
    }

    function calcSizes() {
        if (!cards[0]) return;
        const gap = 24;
        cardW    = cards[0].offsetWidth + gap;
        visCount = Math.max(1,
            Math.floor((track.parentElement.offsetWidth) / cardW)
        );
        buildDots();
        goTo(0);
    }

    function goTo(index) {
        const max = Math.max(0, total - visCount);
        current   = Math.max(0, Math.min(index, max));
        track.style.transform  = `translateX(-${current * cardW}px)`;
        track.style.transition = "transform 0.55s cubic-bezier(0.4,0,0.2,1)";
        updateDots();
    }

    function goNext() {
        const max = Math.max(0, total - visCount);
        goTo(current >= max ? 0 : current + 1);
    }

    function goPrev() {
        const max = Math.max(0, total - visCount);
        goTo(current <= 0 ? max : current - 1);
    }

    function startAuto() {
        stopAuto();
        autoTimer = setInterval(goNext, 4500);
    }

    function stopAuto() {
        if (autoTimer) clearInterval(autoTimer);
    }

    nextBtn.addEventListener("click", () => {
        stopAuto(); goNext(); startAuto();
    });

    prevBtn.addEventListener("click", () => {
        stopAuto(); goPrev(); startAuto();
    });

    track.addEventListener("mouseenter", stopAuto);
    track.addEventListener("mouseleave", startAuto);

    /* TOUCH SWIPE */
    let touchX = 0;

    track.addEventListener("touchstart", e => {
        touchX = e.touches[0].clientX;
        stopAuto();
    }, { passive: true });

    track.addEventListener("touchend", e => {
        const diff = touchX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? goNext() : goPrev();
        }
        startAuto();
    }, { passive: true });

    /* KEYBOARD */
    document.addEventListener("keydown", e => {
        if (e.key === "ArrowRight") { stopAuto(); goNext(); startAuto(); }
        if (e.key === "ArrowLeft")  { stopAuto(); goPrev(); startAuto(); }
    });

    /* RESIZE */
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(calcSizes, 200);
    });

    /* TEST CARD 3D TILT */
    cards.forEach(card => {
        card.addEventListener("mousemove", e => {
            const rect = card.getBoundingClientRect();
            const cx   = rect.left + rect.width  / 2;
            const cy   = rect.top  + rect.height / 2;
            const rx   = ((e.clientY - cy) / (rect.height / 2)) * -5;
            const ry   = ((e.clientX - cx) / (rect.width  / 2)) *  5;

            card.style.transition = "transform 0.1s ease";
            card.style.transform  =
                `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-10px) scale(1.02)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transition =
                "transform 0.55s cubic-bezier(0.34,1.56,0.64,1)";
            card.style.transform  =
                "perspective(700px) rotateX(0) rotateY(0) translateY(0) scale(1)";
        });
    });

    calcSizes();
    startAuto();
}());


/* =========================================================
   HOW IT WORKS — STEP ANIMATIONS
========================================================= */

(function initHowSteps() {
    const steps   = document.querySelectorAll(".how-step");
    const section = document.querySelector(".how-section");
    if (!steps.length || !section) return;

    steps.forEach((s, i) => {
        s.style.opacity   = "0";
        s.style.transform = "translateY(50px)";
        s.style.transition =
            `opacity 0.7s ease ${i * 0.18}s,
             transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.18}s`;
    });

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                steps.forEach(s => {
                    s.style.opacity   = "1";
                    s.style.transform = "translateY(0)";
                });
                obs.disconnect();
            }
        });
    }, { threshold: 0.20 });

    obs.observe(section);
}());


/* =========================================================
   CTA BAR TILT
========================================================= */

(function initCtaTilt() {
    const bar = document.querySelector(".how-cta-bar");
    if (!bar) return;

    bar.addEventListener("mousemove", e => {
        const rect = bar.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const rx   = ((e.clientY - cy) / (rect.height / 2)) * -3;
        const ry   = ((e.clientX - cx) / (rect.width  / 2)) *  3;

        bar.style.transition = "transform 0.1s ease";
        bar.style.transform  =
            `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    bar.addEventListener("mouseleave", () => {
        bar.style.transition =
            "transform 0.65s cubic-bezier(0.34,1.56,0.64,1)";
        bar.style.transform  =
            "perspective(1200px) rotateX(0) rotateY(0)";
    });
}());


/* =========================================================
   TOPIC CARDS — CLICK TO QUESTION
========================================================= */

const topicQuestions = {
    "Heart Health":
        "Tell me about cardiovascular health and how to keep my heart healthy.",
    "Nutrition":
        "What are the key principles of healthy eating and good nutrition?",
    "Sleep & Wellness":
        "How can I improve my sleep quality and establish healthy sleep habits?",
    "Fitness":
        "What are the best exercises and fitness tips for overall physical health?"
};

document.querySelectorAll(".topic-card").forEach(card => {
    card.addEventListener("click", () => {
        const title    = card.querySelector("h3")?.textContent?.trim();
        const question = topicQuestions[title];
        if (question) {
            sendQuestion(question);
            document.getElementById("chat-section")
                .scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});


/* =========================================================
   QUICK ASK (global — called from inline onclick)
========================================================= */

function quickAsk(question) {
    sendQuestion(question);
}


/* =========================================================
   SEND QUESTION — MAIN FUNCTION
========================================================= */

async function sendQuestion(question) {
    question = question.trim();
    if (!question) return;

    addChatMessage(question, "user");
    userInput.value = "";
    chatInput.value = "";

    setInputState(true);
    typingStatus.classList.add("active");

    const loadingMsg = addLoadingMessage();

    try {
        const response = await fetch(API_URL, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ message: question })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        loadingMsg.remove();
        typingStatus.classList.remove("active");

        await addTypingMessage(data.response, "assistant");

    } catch (error) {
        console.error("HealthAI Error:", error);
        loadingMsg.remove();
        typingStatus.classList.remove("active");

        addChatMessage(
            "Sorry, I couldn't connect to the HealthAI server. " +
            "Please make sure the FastAPI backend is running.",
            "assistant"
        );
    }

    setInputState(false);
}


/* =========================================================
   ADD CHAT MESSAGE
========================================================= */

function addChatMessage(message, sender) {
    removeWelcomeMessage();

    const wrap = document.createElement("div");
    wrap.className = `chat-message ${sender}`;

    const avatar       = document.createElement("div");
    avatar.className   = "chat-message-avatar";
    avatar.textContent = sender === "user" ? "👤" : "🩺";

    const content   = document.createElement("div");
    content.className = "message-content";

    const bubble   = document.createElement("div");
    bubble.className = "chat-bubble";

    if (sender === "assistant") {
        bubble.innerHTML = formatAIResponse(message);
    } else {
        bubble.textContent = message;
    }

    const time       = document.createElement("div");
    time.className   = "message-time";
    time.textContent = getCurrentTime();

    content.appendChild(bubble);
    content.appendChild(time);
    wrap.appendChild(avatar);
    wrap.appendChild(content);
    chatMessages.appendChild(wrap);

    scrollToBottom();
    return wrap;
}


/* =========================================================
   TYPING MESSAGE (character by character)
========================================================= */

async function addTypingMessage(message, sender) {
    removeWelcomeMessage();

    const wrap = document.createElement("div");
    wrap.className = `chat-message ${sender}`;

    const avatar       = document.createElement("div");
    avatar.className   = "chat-message-avatar";
    avatar.textContent = "🩺";

    const content    = document.createElement("div");
    content.className = "message-content";

    const bubble    = document.createElement("div");
    bubble.className = "chat-bubble";

    content.appendChild(bubble);
    wrap.appendChild(avatar);
    wrap.appendChild(content);
    chatMessages.appendChild(wrap);

    /* plain text version for typing animation */
    const formatted = formatAIResponse(message);
    const temp      = document.createElement("div");
    temp.innerHTML  = formatted;
    const plainText = temp.textContent || temp.innerText || "";

    for (let i = 0; i <= plainText.length; i++) {
        bubble.textContent = plainText.substring(0, i);
        scrollToBottom();
        await sleep(7);
    }

    /* replace with formatted HTML */
    bubble.innerHTML = formatted;

    const time       = document.createElement("div");
    time.className   = "message-time";
    time.textContent = getCurrentTime();
    content.appendChild(time);

    scrollToBottom();
}


/* =========================================================
   FORMAT AI RESPONSE
========================================================= */

function formatAIResponse(text) {
    let f = escapeHTML(text);

    f = f.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    f = f.replace(/^[-•]\s+(.*)$/gm, "<li>$1</li>");
    f = f.replace(/^\d+\.\s+(.*)$/gm, "<li>$1</li>");
    f = f.replace(
        /(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs,
        "<ul>$1</ul>"
    );
    f = f.replace(/^###\s+(.*)$/gm, "<h4>$1</h4>");
    f = f.replace(/^##\s+(.*)$/gm,  "<h3>$1</h3>");
    f = f.replace(/\n\n/g, "<br><br>");
    f = f.replace(/\n/g,   "<br>");

    return f;
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {
    const div      = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


/* =========================================================
   LOADING MESSAGE
========================================================= */

function addLoadingMessage() {
    removeWelcomeMessage();

    const wrap    = document.createElement("div");
    wrap.className = "chat-message assistant";

    wrap.innerHTML = `
        <div class="chat-message-avatar">🩺</div>
        <div class="message-content">
            <div class="chat-bubble typing-bubble">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    chatMessages.appendChild(wrap);
    scrollToBottom();
    return wrap;
}


/* =========================================================
   WELCOME CHAT HTML
========================================================= */

function getWelcomeHTML() {
    return `
        <div class="welcome-chat">
            <div class="welcome-orb"></div>
            <div class="large-ai-icon">
                <span>🩺</span>
                <div class="icon-rings">
                    <div class="ring r1"></div>
                    <div class="ring r2"></div>
                    <div class="ring r3"></div>
                </div>
            </div>
            <h3>How can I help you today?</h3>
            <p>Ask me anything related to health,
            nutrition, fitness or wellness.</p>
            <div class="quick-prompts">
                <button class="quick-prompt-btn"
                onclick="quickAsk('What are symptoms of dehydration?')">
                    💧 Dehydration symptoms
                </button>
                <button class="quick-prompt-btn"
                onclick="quickAsk('How to improve sleep quality?')">
                    💤 Better sleep tips
                </button>
                <button class="quick-prompt-btn"
                onclick="quickAsk('Best foods for heart health?')">
                    ❤️ Heart healthy foods
                </button>
                <button class="quick-prompt-btn"
                onclick="quickAsk('How much water should I drink daily?')">
                    🥤 Daily water intake
                </button>
            </div>
        </div>
    `;
}


/* =========================================================
   HELPERS
========================================================= */

function removeWelcomeMessage() {
    const w = document.querySelector(".welcome-chat");
    if (w) w.remove();
}

function getCurrentTime() {
    return new Date().toLocaleTimeString([], {
        hour:   "2-digit",
        minute: "2-digit"
    });
}

function scrollToBottom() {
    chatMessages.scrollTo({
        top:      chatMessages.scrollHeight,
        behavior: "smooth"
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setInputState(disabled) {
    sendButton.disabled = disabled;
    chatSend.disabled   = disabled;
    userInput.disabled  = disabled;
    chatInput.disabled  = disabled;
}


/* =========================================================
   HERO SEARCH EVENTS
========================================================= */

sendButton.addEventListener("click", () => {
    sendQuestion(userInput.value);
    document.getElementById("chat-section")
        .scrollIntoView({ behavior: "smooth" });
});

userInput.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    sendQuestion(userInput.value);
    document.getElementById("chat-section")
        .scrollIntoView({ behavior: "smooth" });
});

userInput.addEventListener("focus", () => {
    heroSearch?.classList.add("focused");
});

userInput.addEventListener("blur", () => {
    heroSearch?.classList.remove("focused");
});


/* =========================================================
   CHAT SEND EVENTS
========================================================= */

chatSend.addEventListener("click", () => {
    sendQuestion(chatInput.value);
});

chatInput.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    sendQuestion(chatInput.value);
});


/* =========================================================
   SEND BUTTON — RIPPLE
========================================================= */

chatSend.addEventListener("click", function(e) {
    const ripple = this.querySelector(".send-ripple");
    if (!ripple) return;
    const rect      = this.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + "px";
    ripple.style.top  = (e.clientY - rect.top)  + "px";
});


/* =========================================================
   CLEAR CHAT
========================================================= */

clearChat.addEventListener("click", async () => {
    try {
        await fetch("http://127.0.0.1:8000/chat/clear", {
            method: "DELETE"
        });
    } catch (err) {
        console.error("Could not clear server memory:", err);
    }

    chatMessages.innerHTML = getWelcomeHTML();
});


/* =========================================================
   QUICK HEALTH TOPICS (legacy .health-topic support)
========================================================= */

document.querySelectorAll(".health-topic").forEach(topic => {
    topic.addEventListener("click", () => {
        const q = topic.dataset.question;
        if (q) {
            sendQuestion(q);
            document.getElementById("chat-section")
                .scrollIntoView({ behavior: "smooth" });
        }
    });
});