// =================================================================
// 🧠 DEFINITIVE JAVASCRIPT WITH PRIORITY FIXES, HISTORY, AND UI FUNCTIONALITY
// =================================================================

// Variable to store the bot's most recent response for context checking
let lastResponse = "";

// -----------------------------------------------------------------
// SIMULATED LAZY LOAD: KNOWLEDGE BASE STRUCTURE (PRIORITIZED)
// -----------------------------------------------------------------
const KNOWLEDGE_BASE = [
    // 0. GREETINGS & AGREEMENTS (High Priority)
    { keywords: ['hello', 'hi', 'hey', 'bonjour', 'salam'], response: "Hello! I am an advanced JavaScript simulator with a vast knowledge base. I'm ready to assist you. What can I define, calculate, or explain?" },
    { keywords: ['how are you', 'how r u'], response: "I don't have feelings, but I am operating perfectly! Ready for your next query." },
    { keywords: ['nice', 'cool', 'great answer', 'ok', 'thanks', 'thank you'], response: "You're very welcome! I'm glad I could assist. Feel free to ask another question." },

    // 1. WEB TECHNOLOGIES (Specific Facts - Highest Priority to avoid identity overlap)
    { keywords: ['html', 'what html', 'define html'], response: "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. (This is a verifiable fact.)" },
    { keywords: ['css', 'what css', 'define css', 'use css'], response: "CSS stands for **Cascading Style Sheets**. It describes how HTML elements are to be displayed, controlling the layout and visual presentation of your website. (This is a verifiable fact.)" },
    { keywords: ['javascript', 'define javascript', 'define js', 'js'], response: "JavaScript (JS) is a high-level **programming language** that is one of the core technologies of the World Wide Web. (This is a verifiable fact.)" },

    // 2. MODEL IDENTITY & META-KNOWLEDGE (Specific Facts)
    { keywords: ['what model', 'model are you', 'what is your model'], response: "I operate using a custom, **client-side JavaScript model** using keyword matching and hardcoded data. I am not a large language model like GPT or Claude, which require massive servers and cloud computing." },
    { keywords: ['who made you', 'creator', 'company name', 'who are u', 'who r u', 'us', 'where do u get your data base'], response: "My source code was written by my user—you!—to demonstrate front-end AI simulation. I do not belong to a commercial company. My 'database' is the **hardcoded data** within my JavaScript file." },
    { keywords: ['how to make you better', 'when are you being updated', 'why', 'limitations', 'lazyloading'], response: "To truly advance, I'd need a **back-end server** to connect to real-time APIs for internet access and genuine language generation. That's why I'm limited to my hardcoded facts." },
    { keywords: ['who better', 'who is smarter'], response: "Real large language models (LLMs) like **Gemini** or **GPT-4** are superior because they can generate novel, human-like text and access the internet. My intelligence is limited to the data provided in my JavaScript file." },

    // 3. SCIENCE & FORMULAS
    { keywords: ['gravity', 'define gravity'], response: "Gravity is a fundamental force that attracts any objects with mass or energy. The constant is approximately $9.8 \\text{ m/s}^2$ on Earth. (Verifiable Fact)" },
    { keywords: ['photosynthesis', 'define photosynthesis'], response: "Photosynthesis is the process used by plants, algae, and some bacteria to convert light energy into chemical energy (food). (Defined as fact)" },
    { keywords: ['area of a circle', 'circle area formula'], response: "The formula for the area of a circle is **$A = \\pi r^2$** (Pi multiplied by the radius squared). (Defined as fact)" },
    { keywords: ['pythagorean', 'a^2+b^2'], response: "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides: **$a^2 + b^2 = c^2$**. (Defined as fact)" },

    // 4. GEOGRAPHY
    { keywords: ['capital of france', 'france'], response: "The capital of France is officially **Paris**. This is a verifiable fact." },
    
    // 5. AMBIGUITY/FALLBACKS (Lowest Priority)
    { keywords: ['what can u talk about', 'what subjects', 'what can you do'], response: "I can answer questions on: **Web Technologies**, **Science** (gravity, light, biology), **Math Formulas**, and **Geography**. Try any of those!" },
    { keywords: ['meaning', 'definition', 'dnd', 'timmy', 'no', 'yes', 'but i am someone else'], response: "I don't know that specific term, as I cannot search the internet. Try asking me about the **Quadratic Formula** or **Photosynthesis** instead!" }
];

// -----------------------------------------------------------------
// CORE UI LOGIC
// -----------------------------------------------------------------

function sendMessage() {
    const userInputField = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBox');
    const userText = userInputField.value.trim();

    if (userText === '') return;

    // 1. Display the user's message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.textContent = userText;
    chatBox.appendChild(userMessageDiv);

    userInputField.value = '';
    userInputField.disabled = true; // Disable input while processing (Optimized UX)
    
    // Save the user's input immediately for history
    saveCurrentChat(userText.toLowerCase(), null); 
    
    chatBox.scrollTop = chatBox.scrollHeight;

    // Simulate AI processing time with a short delay
    setTimeout(() => {
        const botResponse = getBotResponse(userText.toLowerCase());
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message bot-message';
        botMessageDiv.textContent = botResponse;
        chatBox.appendChild(botMessageDiv);
        
        lastResponse = botResponse; // Update context
        
        // Save the bot's response
        saveCurrentChat(null, botResponse);
        
        userInputField.disabled = false; // Re-enable input (Optimized UX)
        userInputField.focus(); // Focus input for quick reply (Optimized UX)
        
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 800);
}

// Enable sending messages with the Enter key
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

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
    if (!chatBox) return; // Safety check
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

    // Skip saving the "no" and "yes" responses to keep history clean if possible
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
// DRAG & DROP LOGIC (FIXED)
// -----------------------------------------------------------------

function setupDragAndDrop() {
    const dropTarget = document.querySelector('.chat-interface'); 
    const dropZone = document.getElementById('dropZone');

    if (!dropTarget || !dropZone) return; 

    // Prevent default browser behavior for drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropTarget.addEventListener(eventName, preventDefaults, false); 
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Visual feedback for drag
    dropTarget.addEventListener('dragenter', () => dropZone.classList.add('hover'), false);
    dropTarget.addEventListener('dragleave', () => dropZone.classList.remove('hover'), false);
    dropTarget.addEventListener('drop', () => dropZone.classList.remove('hover'), false);

    // Handle File Drop
    dropTarget.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;

        if (files.length > 0) {
            const fileName = files[0].name;
            const fileSize = (files[0].size / 1024 / 1024).toFixed(2);
            
            const userDropMessage = `Attempting to upload file: ${fileName}`;
            const botDropResponse = `File **${fileName}** (${fileSize} MB) received. As a client-side simulator, I cannot process the content (like a BAT file) or search for external data, but the drag-and-drop feature works! Try a simple math question instead.`;

            const chatBox = document.getElementById('chatBox');
            
            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'message user-message';
            userMessageDiv.textContent = userDropMessage;
            chatBox.appendChild(userMessageDiv);

            // Temporarily disable user input during simulated processing
            document.getElementById('userInput').disabled = true;

            setTimeout(() => {
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'message bot-message';
                botMessageDiv.textContent = botDropResponse;
                chatBox.appendChild(botMessageDiv);

                chatBox.scrollTop = chatBox.scrollHeight;
                
                saveCurrentChat(userDropMessage, botDropResponse);
                lastResponse = botDropResponse;

                // Re-enable user input after processing
                document.getElementById('userInput').disabled = false;
                document.getElementById('userInput').focus();
            }, 500);
        }
    }
}

// -----------------------------------------------------------------
// MATH ENGINE
// -----------------------------------------------------------------

function evaluateMath(input) {
    let processedInput = input.replace(/x/g, '*'); 
    processedInput = processedInput.replace(/[^0-9+\-*/().]/g, ''); 
    const mathRegex = /^[\d\s\+\-\*\/\(\)\.]+$/;
    
    if (mathRegex.test(processedInput) && (processedInput.includes('+') || processedInput.includes('-') || processedInput.includes('*') || processedInput.includes('/'))) {
        try {
            const result = eval(processedInput); 
            return `The result of that calculation is **${result}**.`;
        } catch (e) {
            return "I can handle basic arithmetic like 2+2 or 5*3. Please ensure your expression is valid and simple.";
        }
    }
    return null;
}

// -----------------------------------------------------------------
// GET BOT RESPONSE (Utilizing the Knowledge Base Array)
// -----------------------------------------------------------------

function getBotResponse(input) {
    // 1. Math Check (Highest Priority)
    const mathResponse = evaluateMath(input);
    if (mathResponse) {
        return mathResponse;
    }

    // 2. CONTEXT AWARENESS (Handles "u sure")
    const isQuestioningFact = input.includes('u sure') || input.includes('are you sure') || input.includes('is that true') || input.includes('really');
    if (isQuestioningFact) {
        if (lastResponse.includes('verifiable fact') || lastResponse.includes('programming language') || lastResponse.includes('defined as') || lastResponse.includes('the result of')) {
            return "Yes, I am certain. The information I provided is based on accurate, hardcoded data. I confirm its veracity based on my internal knowledge base.";
        } else {
            return "I can only confirm facts I've just stated. Could you repeat the specific piece of information you're questioning?";
        }
    }

    // 3. Knowledge Base Lookup
    for (const item of KNOWLEDGE_BASE) {
        if (item.keywords.some(keyword => input.includes(keyword))) {
            return item.response;
        }
    }

    // Default response (Lowest Priority)
    return "I'm sorry, I can't process completely novel inputs like that or search the internet. I can answer questions about **Science, Math, Web Technologies, or my own simulated model**. Try asking: **'What is your model?'**";
}

// -----------------------------------------------------------------
// INITIALIZATION
// -----------------------------------------------------------------

function initializeChatbot() {
    // Attach click listener to the New Chat Button
    const newChatBtn = document.querySelector('.new-chat-btn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChat);
    }
    
    // Load chat history and render sidebar/chat box
    const sessions = loadHistory();
    renderSidebar(sessions);
    renderChatBox(sessions[currentSessionId]);
    
    // Setup Drag and Drop
    setupDragAndDrop();
}

document.addEventListener('DOMContentLoaded', initializeChatbot);
