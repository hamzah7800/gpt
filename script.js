// =================================================================
// 🧠 FINAL INTEGRATED JAVASCRIPT: LOCAL KNOWLEDGE + MATH.JS (100% Client-Side)
// =================================================================

let lastResponse = "";
const HISTORY_KEY = 'chatbot_sessions';
let currentSessionId = localStorage.getItem('currentSessionId') || 'session_' + Date.now(); 

// -----------------------------------------------------------------
// SIMULATED LAZY LOAD: KNOWLEDGE BASE
// -----------------------------------------------------------------
const KNOWLEDGE_BASE = [
    { keywords: ['hello', 'hi', 'hey', 'bonjour', 'salam'], response: "Hello! I am an advanced **client-side** simulator running entirely in your browser. I can answer local knowledge questions and perform **basic math**." },
    { keywords: ['how are you', 'how r u'], response: "I don't have feelings, but I am operating perfectly using only your browser's processing power! Ready for your next query." },
    { keywords: ['nice', 'cool', 'great answer', 'ok', 'thanks', 'thank you'], response: "You're very welcome! I'm glad I could assist. Feel free to ask another question." },
    { keywords: ['html', 'what html', 'define html'], response: "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. (Local knowledge confirmed.)" },
    { keywords: ['css', 'what css', 'define css', 'use css'], response: "CSS stands for **Cascading Style Sheets**. It is a style sheet language used for describing the presentation of a document written in HTML. (Local knowledge confirmed.)" },
    { keywords: ['javascript', 'js', 'programming'], response: "JavaScript is a high-level, interpreted scripting language that is primarily used for **client-side web development**." },
    { keywords: ['area of a circle', 'circle area formula'], response: "The area of a circle is calculated using the formula: $A = \\pi r^2$. Try a simple calculation like '2*5'." },
    { keywords: ['gravity', 'define gravity'], response: "Gravity is a fundamental force that attracts any objects with mass or energy. The constant is approximately $9.8 \\text{ m/s}^2$ on Earth." },
    { keywords: ['what model', 'model are you'], response: "I operate using a custom, **client-side JavaScript model** using keyword matching and hardcoded data." },
];

// -----------------------------------------------------------------
// CLIENT-SIDE MATH ENGINE (Uses local math.js or simple JS eval if needed)
// -----------------------------------------------------------------

/**
 * Performs client-side numerical math calculation.
 * NOTE: Requires <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/10.0.0/math.min.js"></script> 
 * or similar in index.html to support advanced math.
 * @param {string} query - The expression (e.g., "5 + 2 * 3").
 * @returns {string} The formatted result or null if it's not a calculation.
 */
function clientSideMath(query) {
    const mathRegex = /^\s*[\d\s\+\-\*\/\(\)\^logexp\.]+$/i;

    if (!mathRegex.test(query)) {
        return null;
    }

    try {
        // Attempt to use global 'math.evaluate' if available (requires math.js library)
        if (typeof math !== 'undefined' && typeof math.evaluate === 'function') {
            const result = math.evaluate(query);
            return `The calculated result is: **${result.toString()}** (Engine: **math.js** on client-side).`;
        }

        // Fallback to native JavaScript evaluation (less safe/powerful)
        const result = eval(query);
        if (typeof result === 'number' && isFinite(result)) {
            return `The calculated result is: **${result.toString()}** (Engine: **JS Eval**).`;
        }
        return null; // Not a valid simple math expression
    } catch (error) {
        return "I had trouble calculating that. Please check your math syntax.";
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
    // Using the 'thinking dots' from the previous style.css versions
    thinkingDiv.innerHTML = '...Thinking and checking sources<span class="dot"></span><span class="dot"></span><span class="dot"></span>'; 
    chatBox.appendChild(thinkingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;


    let finalResponse = null;
    
    // 1. Math Check (Client-side)
    finalResponse = clientSideMath(userText);
    
    // 2. Local Knowledge Match
    if (!finalResponse) {
        finalResponse = getBotResponse(userText.toLowerCase()); 
    }

    // 3. General Fallback
    if (finalResponse === "I'm sorry, I can't process completely novel inputs like that or search the internet. I can answer questions about **Science, Math, Web Technologies, or my own simulated model**. Try asking: **'What is your model?'**") {
        finalResponse = `I am running entirely **client-side** and cannot fetch new information for '${userText}'. Please try a question about **Web Technologies** or a simple **math calculation** instead.`;
    }

    // 4. Update UI after a short delay for simulation
    setTimeout(() => {
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

        renderSidebar(loadHistory());
    }, 800);
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
        if (lastResponse.includes('client-side simulator') || lastResponse.includes('local knowledge')) {
            return "Yes, I am certain. The information I provided is based on accurate, hardcoded data from my internal knowledge base.";
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
// HISTORY MANAGER & SIDEBAR LOGIC (No major logic changes, just cleaner)
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
        const titleText = firstUserMsg ? firstUserMsg.text.substring(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '') : 'New Chat (Simulated)';

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
// DRAG & DROP LOGIC (Updated to use client-side messaging)
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

    dropTarget.addEventListener('dragenter', (e) => {
        // Ensure we only show the drop zone when dragging over the main chat area
        if (e.target.closest('.chat-interface') && !e.target.closest('.input-container')) {
            dropZone.classList.add('hover');
        }
    }, false);
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('hover'), false);
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

            if (fileName.toLowerCase().endsWith('.bat') || fileName.toLowerCase().endsWith('.exe')) {
                botDropResponse = `**SECURITY ALERT:** File **${fileName}** (${fileSize} MB) received. As a client-side simulator, I cannot execute or read this file for security reasons. The drag-and-drop feature works! Try asking about **CSS** instead.`;
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
