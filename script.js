// =================================================================
// 🧠 FINAL INTEGRATED JAVASCRIPT: LOCAL KNOWLEDGE + MATH.JS + MARKDOWN
// =================================================================

let lastResponse = "";
const HISTORY_KEY = 'chatbot_sessions';
let currentSessionId = localStorage.getItem('currentSessionId') || 'session_' + Date.now(); 

// NEW: Persistent Math Scope and Markdown Renderer
const mathScope = {};
const md = typeof markdownit === 'function' ? markdownit() : { render: (text) => text };

// -----------------------------------------------------------------
// SIMULATED LAZY LOAD: KNOWLEDGE BASE (Enhanced with Markdown and Tables)
// -----------------------------------------------------------------
const KNOWLEDGE_BASE = [
    { keywords: ['hello', 'hi', 'hey', 'bonjour', 'salam'], response: "Hello! I am an advanced **client-side** simulator running entirely in your browser. I can answer local knowledge questions, perform **advanced math**, and handle **structured data**." },
    { keywords: ['how are you', 'how r u'], response: "I don't have feelings, but I am operating perfectly using only your browser's processing power! Ready for your next query. Try asking me to **'plot sin(x)'**." },
    { keywords: ['nice', 'cool', 'thanks', 'thank you'], response: "You're very welcome! I'm glad I could assist. Feel free to ask another question." },
    { keywords: ['html', 'define html', 'use html'], response: "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. It uses a **tag structure**, for example: \n\n```html\n<p>This is a paragraph.</p>\n```" },
    { keywords: ['css', 'define css', 'use css'], response: "CSS stands for **Cascading Style Sheets**. It defines how HTML elements are to be displayed. Here's a quick comparison of core technologies:\n\n| Technology | Purpose | Execution | \n|---|---|---|\n| **HTML** | Structure | Browser | \n| **CSS** | Presentation | Browser | \n| **JavaScript** | Behavior | Client-Side/Server-Side | " },
    { keywords: ['javascript', 'js', 'programming'], response: "JavaScript is a high-level, interpreted scripting language primarily used for **client-side web development**. It can be used to manipulate the DOM (Document Object Model). \n\nFor example, calculating the area of a circle with radius *r* is done like this: \n\n```javascript\nconst r = 5;\nconst area = Math.PI * r * r;\nconsole.log(area);\n```" },
    { keywords: ['area of a circle', 'circle area formula'], response: "The area of a circle is calculated using the formula: $A = \\pi r^2$. Try defining a variable in the chat, like: **`r = 5`** and then ask me to **`calculate pi * r^2`**." },
    { keywords: ['gravity', 'define gravity', 'force'], response: "Gravity is a fundamental force that attracts any objects with mass or energy. The gravitational constant, $G$, is approximately $6.674 \\times 10^{-11} \\text{ N}(\\text{m/kg})^2$." },
    { keywords: ['what model', 'model are you'], response: "I operate using a custom, **client-side JavaScript model** using keyword matching and hardcoded data. I run on your device with no external API calls, making me extremely fast and private." },
];

// -----------------------------------------------------------------
// CLIENT-SIDE MATH ENGINE (Uses local math.js with scope and visualization)
// -----------------------------------------------------------------

/**
 * Performs client-side numerical math calculation, handles variables, and plots.
 * @param {string} query - The expression (e.g., "5 + 2 * 3", "x=10", "plot sin(x)").
 * @returns {string} The formatted result or null if it's not a calculation.
 */
function clientSideMath(query) {
    // Allows simple math, variable assignment, and plot commands
    const mathRegex = /^\s*[\d\s\+\-\*\/\(\)\^logexp\.\=\,]+|^\s*plot\s+.*$/i;

    if (!mathRegex.test(query)) {
        return null;
    }

    try {
        if (typeof math !== 'undefined' && typeof math.evaluate === 'function') {
            
            // Special check for plot command
            if (query.toLowerCase().startsWith('plot')) {
                const expression = query.substring(4).trim();
                // We're simulating the graph output here for a client-side only demo
                return `**Graphing Simulated:** I would now use an HTML5 Canvas or SVG library (like Plotly.js or D3) to render the graph of **\`${expression}\`** directly below this message! (Engine: **math.js** on client-side).`;
            }

            const result = math.evaluate(query, mathScope);
            
            // Get current defined variables for context display
            const definedVars = Object.keys(mathScope).filter(key => 
                typeof mathScope[key] === 'number' || typeof mathScope[key] === 'function' || math.isMatrix(mathScope[key])
            );
            
            let scopeDisplay = '';
            if (definedVars.length > 0) {
                scopeDisplay = definedVars.map(v => `${v} = ${mathScope[v].toString().substring(0, 20) + (mathScope[v].toString().length > 20 ? '...' : '')}`).join(' | ');
            }

            // If the query involved an assignment, confirm the scope
            if (query.includes('=') && !query.includes('==')) {
                 return `Variable defined/updated. **\`${query}\`** processed. Current Math Scope: \`${scopeDisplay}\` (Engine: **math.js**).`;
            }
            
            // Regular calculation result
            return `The calculated result is: **${result.toString()}**. \n\n*Current Math Scope: \`${scopeDisplay}\`* (Engine: **math.js**).`;
        }

        // Fallback to native JavaScript evaluation
        // This is only triggered if math.js is not loaded, but kept for robustness
        const result = eval(query);
        if (typeof result === 'number' && isFinite(result)) {
            return `The calculated result is: **${result.toString()}** (Engine: **JS Eval**).`;
        }
        return null; 
    } catch (error) {
        return `I had trouble calculating that expression or referencing a variable. Please check your math syntax. Error: *${error.message.substring(0, 50)}...*`;
    }
}


// -----------------------------------------------------------------
// CORE UI LOGIC
// -----------------------------------------------------------------

/**
 * Renders the bot's response using Markdown for rich content and KaTeX for math.
 * @param {string} responseText - The bot's raw response text.
 * @returns {string} HTML content ready for insertion.
 */
function renderBotContent(responseText) {
    // 1. Markdown rendering (for tables, lists, bold, code blocks)
    let htmlContent = md.render(responseText);
    
    // 2. Custom code block styling:
    htmlContent = htmlContent.replace(/<pre><code class="language-(.*?)">/g, '<pre><code>');
    
    return htmlContent;
}

/**
 * Displays temporary visual feedback (error/warning) above the input box.
 */
function showFeedback(message, type) {
    const feedbackDiv = document.getElementById('feedback-message');
    if (!feedbackDiv) return;
    
    feedbackDiv.textContent = message;
    feedbackDiv.className = `feedback-${type}`;
    
    setTimeout(() => {
        feedbackDiv.textContent = '';
        feedbackDiv.className = '';
    }, 3000);
}


async function sendMessage() { 
    const userInputField = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBox');
    const userText = userInputField.value.trim();

    if (userText.length > 250) { 
        showFeedback("❌ Input too long (max 250 chars).", 'error'); 
        return; 
    }
    
    if (userText === '') {
        showFeedback("Type something first!", 'warning');
        return;
    }


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
    if (finalResponse.includes("I'm sorry, I can't process completely novel inputs")) {
        finalResponse = `I am running entirely **client-side** and cannot fetch new information for *'${userText}'*. Please try a question about **Web Technologies**, a complex **math calculation**, or define a **variable** instead.`;
    }

    // 4. Update UI after a short delay for simulation
    setTimeout(() => {
        chatBox.removeChild(thinkingDiv); 
        
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message bot-message';
        
        // NEW: Render content using Markdown and KaTeX
        botMessageDiv.innerHTML = renderBotContent(finalResponse);
        
        chatBox.appendChild(botMessageDiv);

        lastResponse = finalResponse;
        saveCurrentChat(null, finalResponse); 

        userInputField.disabled = false;
        userInputField.focus();
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // NEW: Re-render KaTeX math on the new message element
        if (window.renderMathInElement) {
             renderMathInElement(botMessageDiv, { delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}] });
        }

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
        // NEW: Basic NLP simulation - prioritize multi-word matches
        const score = item.keywords.filter(keyword => input.includes(keyword)).length;
        if (score > 0) {
            return item.response;
        }
    }

    return "I'm sorry, I can't process completely novel inputs like that or search the internet. I can answer questions about **Science, Math, Web Technologies, or my own simulated model**. Try asking: **'What is your model?'**";
}

// -----------------------------------------------------------------
// HISTORY MANAGER & SIDEBAR LOGIC (No major logic changes)
// -----------------------------------------------------------------
// ... (All history, sidebar, and switchChat functions remain the same) ...
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
        
        if (msg.type === 'bot') {
            // Render existing history bot messages
            messageDiv.innerHTML = renderBotContent(msg.text); 
        } else {
            messageDiv.textContent = msg.text;
        }

        chatBox.appendChild(messageDiv);
        
        // Re-render KaTeX on load
         if (msg.type === 'bot' && window.renderMathInElement) {
             renderMathInElement(messageDiv, { delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}] });
        }
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

function startNewChat() {
    saveCurrentChat();
    currentSessionId = 'session_' + Date.now();
    lastResponse = "";
    
    // Clear math scope on new chat
    Object.keys(mathScope).forEach(key => delete mathScope[key]);

    const newSession = [{
        type: 'bot',
        text: "New conversation started! I am an advanced JavaScript simulator with a vast knowledge base. **Math variables have been cleared.** Ask me anything."
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
                botDropResponse = `**SECURITY ALERT:** File **\`${fileName}\`** (${fileSize} MB) received. As a client-side simulator, I cannot execute or read this file for security reasons. The drag-and-drop feature works! Try asking about **CSS** instead.`;
            } else {
                botDropResponse = `File **\`${fileName}\`** (${fileSize} MB) received. As a client-side simulator, I cannot process the content, but the drag-and-drop feature works! Try a simple math question or defining a variable.`;
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
                
                // Render the drag and drop response
                botMessageDiv.innerHTML = renderBotContent(botDropResponse);
                
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
