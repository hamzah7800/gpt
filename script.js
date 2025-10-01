// =================================================================
// 🧠 FINAL INTEGRATED JAVASCRIPT: LOCAL KNOWLEDGE + ASYNC SEARCH
// This file requires your Node.js server (server.js) to be running 
// on port 3000 for math and search to function.
// =================================================================

// Variable to store the bot's most recent response for context checking
let lastResponse = "";

// --- API CONFIGURATION ---
const BACKEND_URL = 'http://localhost:3000/api/search'; 
const MATH_BACKEND_URL = 'http://localhost:3000/api/calculate'; 

// -----------------------------------------------------------------
// SIMULATED LAZY LOAD: KNOWLEDGE BASE STRUCTURE (PRIORITIZED)
// -----------------------------------------------------------------
const KNOWLEDGE_BASE = [
    // 0. GREETINGS & AGREEMENTS
    { keywords: ['hello', 'hi', 'hey', 'bonjour', 'salam'], response: "Hello! I am an advanced JavaScript simulator with a vast knowledge base. I'm ready to assist you. What can I define, calculate, or explain?" },
    { keywords: ['how are you', 'how r u'], response: "I don't have feelings, but I am operating perfectly! Ready for your next query." },
    { keywords: ['nice', 'cool', 'great answer', 'ok', 'thanks', 'thank you'], response: "You're very welcome! I'm glad I could assist. Feel free to ask another question." },

    // 1. WEB TECHNOLOGIES
    { keywords: ['html', 'what html', 'define html'], response: "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. (This is a verifiable fact.)" },
    { keywords: ['css', 'what css', 'define css', 'use css'], response: "CSS stands for **Cascading Style Sheets**. It describes how HTML elements are to be displayed, controlling the layout and visual presentation of your website. (This is a verifiable fact.)" },
    { keywords: ['javascript', 'define javascript', 'define js', 'js'], response: "JavaScript (JS) is a high-level **programming language** that is one of the core technologies of the World Wide Web. (This is a verifiable fact.)" },

    // 2. MODEL IDENTITY & META-KNOWLEDGE
    { keywords: ['what model', 'model are you', 'what is your model'], response: "I operate using a custom, **client-side JavaScript model** using keyword matching and hardcoded data. I am not a large language model like GPT or Claude, which require massive servers and cloud computing." },
    { keywords: ['who made you', 'creator', 'company name', 'who are u', 'who r u', 'us', 'where do u get your data base'], response: "My source code was written by my user—you!—to demonstrate front-end AI simulation. I do not belong to a commercial company. My 'database' is the **hardcoded data** within my JavaScript file." },
    { keywords: ['how to make you better', 'when are you being updated', 'why', 'limitations', 'lazyloading'], response: "To truly advance, I'd need a **back-end server** to connect to real-time APIs for internet access and genuine language generation. That's why I'm limited to my hardcoded facts." },
    { keywords: ['who better', 'who is smarter'], response: "Real large language models (LLMs) like **Gemini** or **GPT-4** are superior because they can generate novel, human-like text and access the internet. My intelligence is limited to the data provided in my JavaScript file." },

    // 3. SCIENCE & FORMULAS
    { keywords: ['gravity', 'define gravity'], response: "Gravity is a fundamental force that attracts any objects with mass or energy. The constant is approximately $9.8 \\text{ m/s}^2$ on Earth. (Verifiable Fact)" },
    { keywords: ['photosynthesis', 'define photosynthesis'], response: "Photosynthesis is the process used by plants, algae, and some bacteria to convert light energy into chemical energy (food). (Defined as fact)" },
    { keywords: ['area of a circle', 'circle area formula', 'area of a circle'], response: "The formula for the area of a circle is **$A = \\pi r^2$** (Pi multiplied by the radius squared). (Defined as fact)" },
    { keywords: ['pythagorean', 'a^2+b^2'], response: "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides: **$a^2 + b^2 = c^2$**. (Defined as fact)" },

    // 4. GEOGRAPHY
    { keywords: ['capital of france', 'france'], response: "The capital of France is officially **Paris**. This is a verifiable fact." },
    
    // 5. AMBIGUITY/FALLBACKS
    { keywords: ['what can u talk about', 'what subjects', 'what can you do'], response: "I can answer questions on: **Web Technologies**, **Science** (gravity, light, biology), **Math Formulas**, and **Geography**. Try any of those!" },
    { keywords: ['meaning', 'definition', 'dnd', 'timmy', 'no', 'yes', 'but i am someone else'], response: "I don't know that specific term, as I cannot search the internet. Try asking me about the **Quadratic Formula** or **Photosynthesis** instead!" }
];

// -----------------------------------------------------------------
// API CALL FUNCTIONS (Search and Math)
// -----------------------------------------------------------------

async function searchAndVerify(query) {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        
        const data = await response.json();
        
        if (data.success && data.snippet) {
            return { type: 'search', response: `🌐 I checked the internet for that! The top result states: **${data.snippet}** (Source: ${data.title})`, found: true };
        } else {
            return { type: 'search', response: "🔍 I couldn't find a definitive answer online for that exact phrasing, or the search failed. Checking my local knowledge...", found: false };
        }
    } catch (error) {
        console.error("Search API Call Error:", error);
        return { type: 'search', response: "⚠️ I attempted to search externally, but the connection failed. Sticking to my local facts for now.", found: false };
    }
}

async function calculateMath(expression) {
    // Basic regex to determine if the input looks like a math problem
    const mathRegexTest = /^\s*[\d\s\+\-\*\/\(\)x\.]+$/;
    if (!mathRegexTest.test(expression.toLowerCase())) {
         return { type: 'math', response: null, isMath: false };
    }

    try {
        const response = await fetch(MATH_BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expression: expression })
        });
        
        const data = await response.json();
        
        if (data.success) {
            return { type: 'math', response: `The result of that calculation is **${data.result}**.`, isMath: true };
        } else {
            return { type: 'math', response: "I can handle basic arithmetic, but that expression seems invalid or too complex for my calculator.", isMath: false };
        }
    } catch (error) {
        console.error("Math API Call Error:", error);
        return { type: 'math', response: "I can't calculate that right now, the server connection failed.", isMath: false };
    }
}

// -----------------------------------------------------------------
// CORE UI LOGIC (ASYNCHRONOUS)
// -----------------------------------------------------------------

async function sendMessage() { 
    const userInputField = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBox');
    const userText = userInputField.value.trim();

    if (userText === '') return;

    // UI setup: show user message, disable input, show thinking bubble
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.textContent = userText;
    chatBox.appendChild(userMessageDiv);
    
    saveCurrentChat(userText.toLowerCase(), null);
    userInputField.value = '';
    userInputField.disabled = true;
    chatBox.scrollTop = chatBox.scrollHeight;

    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message bot-message thinking-message';
    thinkingDiv.textContent = '...Thinking and checking sources...';
    chatBox.appendChild(thinkingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;


    let finalResponse = null;
    let localResponse = getBotResponse(userText.toLowerCase()); // Get local keyword match

    // --- 1. CHECK FOR MATH (Highest Priority) ---
    const mathResult = await calculateMath(userText);
    if (mathResult.isMath) {
        finalResponse = mathResult.response;
    }

    // --- 2. CHECK LOCAL KNOWLEDGE OR SEARCH ---
    if (!finalResponse) {
        
        const isLocalFallback = localResponse.startsWith("I'm sorry, I can't process") || localResponse.includes("I don't know that specific term");

        if (isLocalFallback) {
            // If local knowledge failed, search the internet
            const searchResult = await searchAndVerify(userText);
            
            if (searchResult.found) {
                finalResponse = searchResult.response; 
            } else {
                // If search failed or gave no results, use the polite local failure message
                finalResponse = localResponse; 
            }

        } else {
            // Use the successful local response
            finalResponse = localResponse;
        }
    }
    
    // 3. Display Final Response
    chatBox.removeChild(thinkingDiv); 
    
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'message bot-message';
    botMessageDiv.textContent = finalResponse;
    chatBox.appendChild(botMessageDiv);

    lastResponse = finalResponse;
    saveCurrentChat(null, finalResponse); 

    userInputField.disabled = false;
    userInputField.focus();
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Enable sending messages with the Enter key
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// -----------------------------------------------------------------
// GET BOT RESPONSE (PURELY SYNC KEYWORD CHECK)
// -----------------------------------------------------------------

function getBotResponse(input) {
    // 1. CONTEXT AWARENESS (Handles "u sure")
    const isQuestioningFact = input.includes('u sure') || input.includes('are you sure') || input.includes('is that true') || input.includes('really');
    if (isQuestioningFact) {
        if (lastResponse.includes('verifiable fact') || lastResponse.includes('programming language') || lastResponse.includes('defined as') || lastResponse.includes('the result of')) {
            return "Yes, I am certain. The information I provided is based on accurate, hardcoded data. I confirm its veracity based on my internal knowledge base.";
        } else {
            return "I can only confirm facts I've just stated. Could you repeat the specific piece of information you're questioning?";
        }
    }

    // 2. Knowledge Base Lookup
    for (const item of KNOWLEDGE_BASE) {
        if (item.keywords.some(keyword => input.includes(keyword))) {
            return item.response;
        }
    }

    // Default response (Lowest Priority) - This is what triggers the search in sendMessage()
    return "I'm sorry, I can't process completely novel inputs like that or search the internet. I can answer questions about **Science, Math, Web Technologies, or my own simulated model**. Try asking: **'What is your model?'**";
}

// -----------------------------------------------------------------
// HISTORY MANAGER & SIDEBAR LOGIC
// -----------------------------------------------------------------

const HISTORY_KEY = 'chatbot_sessions';
let currentSessionId = localStorage.getItem('currentSessionId') || 'session_' + Date.now(); 

function loadHistory() {
    const historyData = localStorage.getItem(HISTORY_KEY);
    const sessions = historyData ? JSON.parse(historyData) : {};
    
    if (!sessions[currentSessionId]) {
        sessions[currentSessionId] = [{
            type: 'bot',
            text: "Hello! I am an advanced JavaScript simulator with a vast knowledge base. Ask me anything."
        }];
    }
    return sessions;
}

function saveHistory(sessions) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
    localStorage.setItem('currentSessionId', currentSessionId);
}

function renderChatBox(messages) {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;
    chatBox.innerHTML = ''; 

    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.type}-message`;
        messageDiv.textContent = msg.text;
        
        if (msg.type === 'bot' && msg.text.includes('advanced JavaScript simulator')) {
            messageDiv.classList.add('intro-message');
        }
        
        chatBox.appendChild(messageDiv);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

function startNewChat() {
    saveCurrentChat();
    currentSessionId = 'session_' + Date.now();
    lastResponse = "";

    const newSession = [{
        type: 'bot',
        text: "New conversation started! I am an advanced JavaScript simulator with a vast knowledge base. Ask me anything."
    }];

    const allSessions = loadHistory();
    allSessions[currentSessionId] = newSession;
    saveHistory(allSessions);

    renderChatBox(newSession);
    renderSidebar(allSessions);
}

function saveCurrentChat(userText, botResponse) {
    const allSessions = loadHistory();
    let currentSession = allSessions[currentSessionId] || [];

    if (userText && userText !== 'no' && userText !== 'yes') {
        currentSession.push({ type: 'user', text: userText });
    }
    if (botResponse) {
        currentSession.push({ type: 'bot', text: botResponse });
    }

    if (currentSession.length > 0) {
        allSessions[currentSessionId] = currentSession;
        saveHistory(allSessions);
        if (userText || botResponse) {
             renderSidebar(allSessions);
        }
    }
}

function renderSidebar(sessions) {
    const chatList = document.querySelector('.chat-list');
    if (!chatList) return; 

    chatList.innerHTML = '';
    const sessionKeys = Object.keys(sessions).reverse(); 
    
    sessionKeys.forEach(id => {
        const messages = sessions[id];
        const firstUserMsg = messages.find(m => m.type === 'user');
        const title = firstUserMsg ? firstUserMsg.text.substring(0, 30) + '...' : 'New Chat (Simulated)';

        const listItem = document.createElement('li');
        listItem.className = 'chat-item';
        if (id === currentSessionId) {
            listItem.classList.add('active');
        }
        listItem.textContent = title;
        listItem.dataset.sessionId = id;
        
        listItem.addEventListener('click', () => switchChat(id, sessions));
        
        chatList.appendChild(listItem);
    });
}

function switchChat(sessionId, sessions) {
    saveCurrentChat();
    currentSessionId = sessionId;
    
    const messages = sessions[sessionId];
    renderChatBox(messages);
    
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.sessionId === sessionId) {
            item.classList.add('active');
        }
    });
    
    lastResponse = messages[messages.length - 1]?.text || "";
}

// -----------------------------------------------------------------
// DRAG & DROP LOGIC
// -----------------------------------------------------------------

function setupDragAndDrop() {
    const dropTarget = document.querySelector('.chat-interface'); 
    const dropZone = document.getElementById('dropZone');

    if (!dropTarget || !dropZone) return; 

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropTarget.addEventListener(eventName, preventDefaults, false); 
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dropTarget.addEventListener('dragenter', () => dropZone.classList.add('hover'), false);
    dropTarget.addEventListener('dragleave', () => dropZone.classList.remove('hover'), false);
    dropTarget.addEventListener('drop', () => dropZone.classList.remove('hover'), false);

    dropTarget.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;

        if (files.length > 0) {
            const fileName = files[0].name;
            const fileSize = (files[0].size / 1024 / 1024).toFixed(2);
            
            const userDropMessage = `Attempting to upload file: ${fileName}`;
            let botDropResponse;

            if (fileName.toLowerCase().endsWith('.bat')) {
                botDropResponse = `File **${fileName}** (${fileSize} MB) received. That appears to be a **Windows batch script**. As a client-side simulator, I cannot execute or read its code, but the drag-and-drop feature works! Try asking about CSS.`;
            } else if (fileName.toLowerCase().endsWith('.pdf')) {
                botDropResponse = `File **${fileName}** (${fileSize} MB) received. That is a **PDF document**. While I can't extract the text here, my system is prepared to send complex files like this to a powerful external AI for analysis!`;
            } else {
                botDropResponse = `File **${fileName}** (${fileSize} MB) received. As a client-side simulator, I cannot process the content, but the drag-and-drop feature works! Try a simple math question instead.`;
            }


            const chatBox = document.getElementById('chatBox');
            
            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'message user-message';
            userMessageDiv.textContent = userDropMessage;
            chatBox.appendChild(userMessageDiv);

            document.getElementById('userInput').disabled = true;

            setTimeout(() => {
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'message bot-message';
                botMessageDiv.textContent = botDropResponse;
                chatBox.appendChild(botMessageDiv);

                chatBox.scrollTop = chatBox.scrollHeight;
                
                saveCurrentChat(userDropMessage, botDropResponse);
                lastResponse = botDropResponse;

                document.getElementById('userInput').disabled = false;
                document.getElementById('userInput').focus();
            }, 500);
        }
    }
}

// -----------------------------------------------------------------
// INITIALIZATION
// -----------------------------------------------------------------

function initializeChatbot() {
    const newChatBtn = document.querySelector('.new-chat-btn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChat);
    }
    
    const sessions = loadHistory();
    renderSidebar(sessions);
    renderChatBox(sessions[currentSessionId]);
    
    setupDragAndDrop();
}

document.addEventListener('DOMContentLoaded', initializeChatbot);
