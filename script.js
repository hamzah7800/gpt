// =================================================================
// 🧠 FINAL INTEGRATED JAVASCRIPT: LOCAL KNOWLEDGE + ASYNC SEARCH
// =================================================================

let lastResponse = "";

// --- API CONFIGURATION ---
// IMPORTANT: Use your deployed URL here if you moved off localhost!
const BACKEND_URL = 'http://localhost:3000/api/search'; 
const MATH_BACKEND_URL = 'http://localhost:3000/api/calculate'; 

// -----------------------------------------------------------------
// SIMULATED LAZY LOAD: KNOWLEDGE BASE (Same as before)
// -----------------------------------------------------------------
const KNOWLEDGE_BASE = [
    { keywords: ['hello', 'hi', 'hey', 'bonjour', 'salam'], response: "Hello! I am an advanced JavaScript simulator with a vast knowledge base. I'm ready to assist you. What can I define, calculate, or explain?" },
    { keywords: ['how are you', 'how r u'], response: "I don't have feelings, but I am operating perfectly! Ready for your next query." },
    { keywords: ['nice', 'cool', 'great answer', 'ok', 'thanks', 'thank you'], response: "You're very welcome! I'm glad I could assist. Feel free to ask another question." },
    { keywords: ['html', 'what html', 'define html'], response: "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. (This is a verifiable fact.)" },
    { keywords: ['css', 'what css', 'define css', 'use css'], response: "CSS stands for **Cascading Style Sheets**. It describes how HTML elements are to be displayed, controlling the layout and visual presentation of your website. (This is a verifiable fact.)" },
    { keywords: ['javascript', 'define javascript', 'define js', 'js'], response: "JavaScript (JS) is a high-level **programming language** that is one of the core technologies of the World Wide Web. (This is a verifiable fact.)" },
    { keywords: ['what model', 'model are you', 'what is your model'], response: "I operate using a custom, **client-side JavaScript model** using keyword matching and hardcoded data. I am not a large language model like GPT or Claude, which require massive servers and cloud computing." },
    { keywords: ['who made you', 'creator', 'company name', 'who are u', 'who r u', 'us', 'where do u get your data base'], response: "My source code was written by my user—you!—to demonstrate front-end AI simulation. I do not belong to a commercial company. My 'database' is the **hardcoded data** within my JavaScript file." },
    { keywords: ['gravity', 'define gravity'], response: "Gravity is a fundamental force that attracts any objects with mass or energy. The constant is approximately $9.8 \\text{ m/s}^2$ on Earth. (Verifiable Fact)" },
    { keywords: ['area of a circle', 'circle area formula', 'area of a circle'], response: "The formula for the area of a circle is **$A = \\pi r^2$** (Pi multiplied by the radius squared). (Defined as fact)" },
    { keywords: ['capital of france', 'france'], response: "The capital of France is officially **Paris**. This is a verifiable fact." },
    { keywords: ['what can u talk about', 'what subjects', 'what can you do'], response: "I can answer questions on: **Web Technologies**, **Science** (gravity, light, biology), **Math Formulas**, and **Geography**. Try any of those!" },
    { keywords: ['meaning', 'definition', 'dnd', 'timmy', 'no', 'yes', 'but i am someone else'], response: "I'm sorry, I can't process completely novel inputs like that or search the internet. I can answer questions about **Science, Math, Web Technologies, or my own simulated model**. Try asking: **'What is your model?'**" }
];

// --- API CALL FUNCTIONS (Search and Math) ---

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
            // Success: false (e.g., no definitive result found by the search engine)
            return { type: 'search', response: "🔍 I couldn't find a definitive answer online for that exact phrasing. Checking my local knowledge...", found: false };
        }
    } catch (error) {
        console.error("Search API Call Error:", error);
        // Error: The server is down or unreachable
        return { 
            type: 'search', 
            response: "⚠️ **External search is unavailable.** The backend server at `http://localhost:3000` is unreachable. Checking my local knowledge base...", 
            found: false 
        };
    }
}

async function calculateMath(expression) {
    // Allows any string containing numbers, operators, and parentheses, plus 'x' for multiplication.
    // NOTE: This is a liberal regex intended to be filtered by the backend
    const mathRegexTest = /^\s*[\d\s\+\-\*\/\(\)\x\.]+$/; 
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
        return { type: 'math', response: "⚠️ **Math server is unavailable.** The backend server is unreachable. Please try again later.", isMath: false };
    }
}

// -----------------------------------------------------------------
// CORE UI LOGIC
// -----------------------------------------------------------------

async function sendMessage() { 
    const userInputField = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBox');
    const userText = userInputField.value.trim();

    if (userText === '') return;

    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.textContent = userText;
    chatBox.appendChild(userMessageDiv);
    
    saveCurrentChat(userText, null); 

    userInputField.value = '';
    userInputField.disabled = true;
    chatBox.scrollTop = chatBox.scrollHeight;

    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message bot-message thinking-message';
    thinkingDiv.textContent = '...Thinking and checking sources...';
    chatBox.appendChild(thinkingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;


    let finalResponse = null;
    let localResponse = getBotResponse(userText.toLowerCase()); 

    // 1. Check for Math Calculation first
    const mathResult = await calculateMath(userText);
    if (mathResult.isMath) {
        finalResponse = mathResult.response;
    }

    // 2. If not Math, check local knowledge
    if (!finalResponse) {
        
        // Check if local response is the final fallback message (i.e., no local match)
        const isLocalFallback = localResponse.startsWith("I'm sorry, I can't process completely novel inputs");

        if (isLocalFallback) {
            // 3. If no local match, attempt external search
            const searchResult = await searchAndVerify(userText);
            
            if (searchResult.found) {
                // Search succeeded and found a snippet
                finalResponse = searchResult.response; 
            } else {
                // Search failed (either no result or server down). Use the descriptive searchResult.response,
                // which includes the server down warning, and then append the local fallback message.
                finalResponse = `${searchResult.response} ${localResponse.replace("I'm sorry, I can't process completely novel inputs like that or search the internet.", "Please try a different query.")}`; 
            }

        } else {
            // A specific local keyword was matched
            finalResponse = localResponse;
        }
    }
    
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
// HISTORY MANAGER & SIDEBAR LOGIC (Updated for Deletion)
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
        
        // Title Span (for clicking/truncation)
        const titleSpan = document.createElement('span');
        titleSpan.className = 'chat-title';
        titleSpan.textContent = titleText;
        
        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-chat-btn';
        deleteBtn.textContent = '🗑️'; 
        
        // Event Listeners
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

    // FIX: Scroll to the active item (newest chat)
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
        const sessionKeys = Object.keys(allSessions).reverse(); // Get keys in display order
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
