// =================================================================
// 🧠 MAXIMAL INTEGRATED JAVASCRIPT: LOCAL KNOWLEDGE + EXPANDED TOOLS
// This version is 100% front-end and compatible with GitHub Pages.
// =================================================================

let lastResponse = "";
const HISTORY_KEY = 'chatbot_sessions';
let currentSessionId = localStorage.getItem('currentSessionId') || 'session_' + Date.now(); 

// --- API CONFIGURATION ---
// These are disabled as we are running locally.
const BACKEND_URL = 'http://disabled'; 
const MATH_BACKEND_URL = 'http://disabled'; 

// -----------------------------------------------------------------
// 1. KNOWLEDGE BASE & JOKES
// -----------------------------------------------------------------
const KNOWLEDGE_BASE = [
    { keywords: ['hello', 'hi', 'hey', 'bonjour', 'salam'], response: "Hello! I am an advanced JavaScript simulator with a vast knowledge base. I'm ready to assist you. What can I define, calculate, or explain?" },
    { keywords: ['how are you', 'how r u'], response: "I don't have feelings, but I am operating perfectly! Ready for your next query." },
    { keywords: ['nice', 'cool', 'great answer', 'ok', 'thanks', 'thank you'], response: "You're very welcome! I'm glad I could assist. Feel free to ask another question." },
    { keywords: ['html', 'what html', 'define html'], response: "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. (This is a verifiable fact.)" },
    { keywords: ['css', 'what css', 'define css', 'use css'], response: "CSS stands for **Cascading Style Sheets**. It describes how HTML elements are to be displayed, controlling the layout and visual presentation of your website. (This is a verifiable fact.)" },
    { keywords: ['javascript', 'define javascript', 'define js', 'js'], response: "JavaScript (JS) is a high-level **programming language** that is one of the core technologies of the World Wide Web. (This is a verifiable fact.)" },
    { keywords: ['what model', 'model are you', 'what is your model'], response: "I operate using a custom, **client-side JavaScript model** using keyword matching and hardcoded data. I am not a large language model like GPT or Claude." },
    { keywords: ['who made you', 'creator', 'company name'], response: "My source code was written by my user—you!—to demonstrate front-end AI simulation. My 'database' is the **hardcoded data** within my JavaScript file." },
    { keywords: ['gravity', 'define gravity'], response: "Gravity is a fundamental force that attracts any objects with mass or energy. The constant is approximately $9.8 \\text{ m/s}^2$ on Earth. (Verifiable Fact)" },
    { keywords: ['area of a circle', 'circle area formula'], response: "The formula for the area of a circle is **$A = \\pi r^2$** (Pi multiplied by the radius squared). (Defined as fact)" },
    { keywords: ['capital of france', 'france'], response: "The capital of France is officially **Paris**. This is a verifiable fact." },
    { keywords: ['what can u talk about', 'what subjects', 'what can you do'], response: "I can answer questions on: **Web Technologies**, **Science**, **Math Formulas**, **Geography**, or you can try one of my **built-in commands** like **`TIME`** or **`JOKE`**!" },
    { keywords: ['meaning', 'definition', 'dnd', 'timmy', 'no', 'yes', 'but i am someone else'], response: "I'm sorry, I can't process completely novel inputs. I can only answer about **Science, Math, Web Technologies, or my own simulated model**." }
];

const JOKES = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "What do you call a fake noodle? An impasta.",
    "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
    "Did you hear about the two guys who stole a calendar? They each got six months.",
    "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    "Why did the invisible man turn down the job offer? He couldn't see himself doing it."
];

// -----------------------------------------------------------------
// 2. SIMPLIFIED API CALL FUNCTIONS (Fully Local)
// -----------------------------------------------------------------

// SEARCH: Always fails gracefully (no back-end/API key)
async function searchAndVerify(query) {
    return { 
        type: 'search', 
        response: "⚠️ External search is unavailable on this platform. Stick to **Math** or **Local Facts**!", 
        found: false 
    };
}

// MATH: Enhanced local evaluation
async function calculateMath(expression) {
    // Basic arithmetic characters: digits, spaces, basic operators, and parentheses
    const mathRegexTest = /^\s*[\d\s\+\-\*\/\(\)\.]+$/;
    if (!mathRegexTest.test(expression.toLowerCase())) {
          return { type: 'math', response: null, isMath: false };
    }

    try {
        // Use the browser's native JavaScript engine for evaluation.
        // We use a safe technique by wrapping the expression in a Function constructor 
        // after stripping potentially dangerous non-math characters.
        const mathExpression = expression.replace(/[^-()\d/*+.]/g, '');
        
        // This is a safer alternative to the raw 'eval()' function.
        const result = Function('"use strict";return (' + mathExpression + ')')();

        if (typeof result === 'number' && isFinite(result)) {
            // Check for integer vs. float to present clean number
            const formattedResult = Number.isInteger(result) ? result : result.toFixed(4);
            return { type: 'math', response: `The result of that calculation is **${formattedResult}**.`, isMath: true };
        } else {
            return { type: 'math', response: "I can handle basic arithmetic, but that expression seems invalid or too complex.", isMath: false };
        }
    } catch (error) {
        return { type: 'math', response: "I can't calculate that right now due to a parsing error.", isMath: false };
    }
}

// -----------------------------------------------------------------
// 3. NEW: ADVANCED COMMAND HANDLER
// -----------------------------------------------------------------

function handleCommands(input) {
    const lowerInput = input.toLowerCase().trim();
    const date = new Date();
    
    // Command 1: JOKE
    if (lowerInput === 'joke' || lowerInput.includes('tell a joke') || lowerInput.includes('funny')) {
        const randomJoke = JOKES[Math.floor(Math.random() * JOKES.length)];
        return `😂 Okay, here's one: **${randomJoke}**`;
    }

    // Command 2: TIME
    if (lowerInput === 'time' || lowerInput === 'what time is it') {
        return `⏰ The current time on your device is **${date.toLocaleTimeString()}**.`;
    }

    // Command 3: DATE
    if (lowerInput === 'date' || lowerInput === 'what day is it') {
        return `📅 Today's date is **${date.toLocaleDateString()}**.`;
    }

    // Command 4: CLEAR CHAT
    if (lowerInput === 'clear' || lowerInput === 'clear chat') {
        localStorage.removeItem(HISTORY_KEY);
        startNewChat();
        return "🧹 Chat history cleared and a new session has started!";
    }

    // Command 5: COMMANDS
    if (lowerInput === 'commands' || lowerInput === 'help commands') {
        return "✨ Available commands: **JOKE**, **TIME**, **DATE**, **CLEAR**. Try one!";
    }
    
    // Command 6: WEATHER (Mocked)
    if (lowerInput.includes('weather') || lowerInput.includes('temperature')) {
        // Mocked response since we can't use an external API without a server
        const day = ['sunny', 'cloudy', 'rainy', 'partly cloudy'][Math.floor(Math.random() * 4)];
        const temp = Math.floor(Math.random() * 15 + 15); // Temp between 15C and 30C
        return `🌤️ I can't check a live feed, but here is a simulation: Expect a **${day}** day with a temperature around **${temp}°C**.`;
    }

    return null; // No command found
}


// -----------------------------------------------------------------
// 4. CORE UI LOGIC (Updated to check new command handler)
// -----------------------------------------------------------------

async function sendMessage() { 
    const userInputField = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBox');
    const userText = userInputField.value.trim();

    if (userText === '') return;

    // 1. Display User Message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.textContent = userText;
    chatBox.appendChild(userMessageDiv);
    
    saveCurrentChat(userText, null); 

    userInputField.value = '';
    userInputField.disabled = true;
    chatBox.scrollTop = chatBox.scrollHeight;

    // 2. Display Thinking Message
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message bot-message thinking-message';
    thinkingDiv.textContent = '...Thinking and checking sources...';
    chatBox.appendChild(thinkingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    let finalResponse = null;
    const lowerInput = userText.toLowerCase();

    // Priority 1: Check for Built-in Commands
    finalResponse = handleCommands(lowerInput);

    // Priority 2: Check for Math
    if (!finalResponse) {
        const mathResult = await calculateMath(userText);
        if (mathResult.isMath) {
            finalResponse = mathResult.response;
        }
    }

    // Priority 3: Check Local Knowledge Base
    if (!finalResponse) {
        let localResponse = getBotResponse(lowerInput); 
        
        // If the response is the general fallback ("I'm sorry, I can't process...")
        const isLocalFallback = localResponse.startsWith("I'm sorry, I can't process");

        if (isLocalFallback) {
            // Priority 4: Search Fallback (Always returns failure on GitHub Pages)
            const searchResult = await searchAndVerify(userText);
            
            // If the search failed, use the search failure message, otherwise use the local fallback
            finalResponse = searchResult.response.startsWith("⚠️") ? searchResult.response : localResponse;
        } else {
            finalResponse = localResponse;
        }
    }
    
    // 5. Display Bot Response
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

function getBotResponse(input) {
    const isQuestioningFact = input.includes('u sure') || input.includes('are you sure') || input.includes('is that true') || input.includes('really');
    if (isQuestioningFact) {
        if (lastResponse.includes('verifiable fact') || lastResponse.includes('programming language') || lastResponse.includes('defined as') || lastResponse.includes('the result of')) {
            return "Yes, I am certain. The information I provided is based on accurate, hardcoded data. I confirm its veracity based on my internal knowledge base.";
        } else {
            return "I can only confirm facts I've just stated. Could you repeat the specific piece of information you're questioning?";
        }
    }

    for (const item of KNOWLEDGE_BASE) {
        if (item.keywords.some(keyword => input.includes(keyword))) {
            return item.response;
        }
    }

    return "I'm sorry, I can't process completely novel inputs like that or search the internet. I can answer questions about **Science, Math, Web Technologies, or my own simulated model**. Try asking: **'What is your model?'**";
}

// -----------------------------------------------------------------
// HISTORY MANAGER & SIDEBAR LOGIC (Standard Functions)
// -----------------------------------------------------------------

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

    if (userText && userText.toLowerCase() !== 'no' && userText.toLowerCase() !== 'yes') {
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
    
    let activeItemElement = null;

    sessionKeys.forEach(id => {
        const messages = sessions[id];
        const firstUserMsg = messages.find(m => m.type === 'user');
        const titleText = firstUserMsg ? firstUserMsg.text.substring(0, 30) + '...' : 'New Chat (Simulated)';

        const listItem = document.createElement('li');
        listItem.className = 'chat-item';
        if (id === currentSessionId) {
            listItem.classList.add('active');
            activeItemElement = listItem; 
        }
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'chat-title';
        titleSpan.textContent = titleText;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-chat-btn';
        deleteBtn.textContent = '🗑️'; 
        
        titleSpan.addEventListener('click', () => switchChat(id, sessions));
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            deleteChat(id);
        });
        
        listItem.dataset.sessionId = id;
        listItem.appendChild(titleSpan);
        listItem.appendChild(deleteBtn);
        
        chatList.appendChild(listItem);
    });

    if (activeItemElement) {
        activeItemElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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

function deleteChat(sessionIdToDelete) {
    if (!confirm("Are you sure you want to delete this chat history?")) {
        return;
    }

    const allSessions = loadHistory();
    
    delete allSessions[sessionIdToDelete];
    saveHistory(allSessions);

    if (sessionIdToDelete === currentSessionId) {
        const sessionKeys = Object.keys(allSessions).reverse(); 
        if (sessionKeys.length > 0) {
            switchChat(sessionKeys[0], allSessions); 
        } else {
            startNewChat();
        }
    } else {
        renderSidebar(allSessions);
    }
}

// -----------------------------------------------------------------
// DRAG & DROP LOGIC (Standard Functions)
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
