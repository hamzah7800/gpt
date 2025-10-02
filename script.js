// =================================================================
// 🧠 FINAL INTEGRATED JAVASCRIPT: LOCAL KNOWLEDGE + CLIENT-SIDE TOOLS
// This version is 100% compatible with GitHub Pages (No server required)
// =================================================================

let lastResponse = "";
let currentSessionId = localStorage.getItem('currentSessionId') || 'chat_1';

// -----------------------------------------------------------------
// SIMULATED LAZY LOAD: KNOWLEDGE BASE (EXPANDED)
// -----------------------------------------------------------------
const KNOWLEDGE_BASE = [
    { keywords: ['hello', 'hi', 'hey', 'bonjour', 'salam'], response: "Hello! I am an advanced **client-side** simulator. I can answer local knowledge questions, perform calculations with **math.js**, and render LaTeX formulas, such as the Pythagorean theorem: $a^2 + b^2 = c^2$. What can I assist you with?" },
    { keywords: ['how are you', 'how r u'], response: "I don't have feelings, but I am operating perfectly using only your browser's processing power! Ready for your next query." },
    { keywords: ['nice', 'cool', 'great answer', 'ok', 'thanks', 'thank you'], response: "You're very welcome! I'm glad I could assist. Feel free to ask another question." },
    { keywords: ['html', 'what html', 'define html'], response: "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. (This is a verifiable fact.)" },
    { keywords: ['css', 'what css', 'define css', 'use css'], response: "CSS stands for **Cascading Style Sheets**. It is a style sheet language used for describing the presentation of a document written in a markup language like HTML. (Local knowledge confirmed.)" },
    { keywords: ['javascript', 'js', 'programming'], response: "JavaScript is a high-level, interpreted scripting language that is primarily used for **client-side web development**." },
    { keywords: ['python', 'what python'], response: "Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation." },
    { keywords: ['area of a circle', 'circle area'], response: "The area of a circle is calculated using the formula: $A = \\pi r^2$. Try asking me to calculate 'area(10)'." },
    { keywords: ['quadratic formula'], response: "The **quadratic formula** is used to solve $ax^2 + bx + c = 0$ and is given by: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$" },
    { keywords: ['github pages', 'github', 'pages'], response: "GitHub Pages is a static site hosting service that takes HTML, CSS, and JavaScript files straight from a repository on GitHub and publishes a website." },
    { keywords: ['fibonacci'], response: "The Fibonacci sequence starts with 0 and 1, and each subsequent number is the sum of the previous two: $F_n = F_{n-1} + F_{n-2}$. Ask me to calculate `fib(10)`." },
];

// -----------------------------------------------------------------
// CORE CLIENT-SIDE FUNCTIONS (New KaTeX Helper)
// -----------------------------------------------------------------

/**
 * Creates a bot message div and runs KaTeX rendering on its content.
 * @param {string} text - The message text, potentially containing LaTeX.
 * @returns {HTMLElement} The created and rendered div element.
 */
function createBotMessageDiv(text) {
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'message bot-message';
    // Use innerHTML to allow KaTeX to parse the content
    botMessageDiv.innerHTML = text; 
    
    // Check if renderMathInElement function exists (from KaTeX)
    if (typeof renderMathInElement === 'function') {
        renderMathInElement(botMessageDiv, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
            ],
            throwOnError: false // Don't break if a math block is malformed
        });
    }

    return botMessageDiv;
}

// -----------------------------------------------------------------
// CLIENT-SIDE MATH ENGINE (Replaces MATH_BACKEND_URL)
// -----------------------------------------------------------------

/**
 * Performs client-side math calculation using the globally available math.js.
 * @param {string} query - The mathematical expression (e.g., "5 + 2 * 3").
 * @returns {string} The formatted result or an error message.
 */
function clientSideMath(query) {
    // The global 'math' object is provided by the math.js CDN script in index.html
    try {
        const result = math.evaluate(query);

        if (typeof result === 'function') {
             return `I understand you defined the function: \`${query}\`. I can now use it in calculations.`;
        }
        
        return `The calculated result is: **${result.toString()}** (Engine: **math.js** on client-side).`;
    } catch (error) {
        return "I had trouble calculating that. Please check your math syntax or ensure all variables are defined.";
    }
}


// -----------------------------------------------------------------
// CHAT HISTORY MANAGEMENT 
// -----------------------------------------------------------------

function loadHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('chatHistory')) || {};
        
        if (Object.keys(history).length === 0) {
            history['chat_1'] = [];
        }
        
        if (!history[currentSessionId]) {
            currentSessionId = Object.keys(history)[0];
            localStorage.setItem('currentSessionId', currentSessionId);
        }

        return history;
    } catch (e) {
        console.error("Error loading chat history:", e);
        return { 'chat_1': [] };
    }
}

function saveCurrentChat(userText, botText) {
    const history = loadHistory();
    if (!history[currentSessionId]) {
        history[currentSessionId] = [];
    }
    history[currentSessionId].push({ type: 'user', text: userText });
    history[currentSessionId].push({ type: 'bot', text: botText });
    localStorage.setItem('chatHistory', JSON.stringify(history));
}

function deleteChatSession(sessionId) {
    const history = loadHistory();
    delete history[sessionId];

    if (Object.keys(history).length === 0) {
        history['chat_1'] = []; 
    }

    if (currentSessionId === sessionId) {
        currentSessionId = Object.keys(history)[0];
        localStorage.setItem('currentSessionId', currentSessionId);
    }
    
    localStorage.setItem('chatHistory', JSON.stringify(history));
    renderSidebar(history);
    renderChatBox(history[currentSessionId]);
}

function startNewChat() {
    const history = loadHistory();
    const newId = `chat_${Date.now()}`;
    history[newId] = [];
    currentSessionId = newId;
    localStorage.setItem('currentSessionId', currentSessionId);
    localStorage.setItem('chatHistory', JSON.stringify(history));
    
    renderSidebar(history);
    renderChatBox(history[currentSessionId]);
    document.getElementById('userInput').focus();
}

function switchChat(sessionId) {
    currentSessionId = sessionId;
    localStorage.setItem('currentSessionId', currentSessionId);
    
    const history = loadHistory();
    renderSidebar(history);
    renderChatBox(history[currentSessionId]);
}


// -----------------------------------------------------------------
// UI RENDERING
// -----------------------------------------------------------------

function renderSidebar(sessions) {
    const chatList = document.querySelector('.chat-list');
    chatList.innerHTML = '';
    
    Object.keys(sessions).forEach((id, index) => {
        const li = document.createElement('li');
        li.className = 'chat-item';
        
        const messages = sessions[id];
        const firstUserMessage = messages.find(msg => msg.type === 'user');
        const title = firstUserMessage 
            ? firstUserMessage.text.substring(0, 25) + (firstUserMessage.text.length > 25 ? '...' : '')
            : `Chat ${index + 1}`;

        const titleSpan = document.createElement('span');
        titleSpan.textContent = title;
        titleSpan.onclick = () => switchChat(id);
        
        li.appendChild(titleSpan);

        if (id === currentSessionId) {
            li.classList.add('active');
        }

        // Use Font Awesome icon for delete
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-chat-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>'; 
        deleteBtn.onclick = (e) => {
            e.stopPropagation(); 
            if (confirm(`Are you sure you want to delete "${title}"?`)) {
                deleteChatSession(id);
            }
        };
        
        li.appendChild(deleteBtn);
        chatList.appendChild(li);
    });
}

function renderChatBox(messages) {
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML = ''; 
    
    if (!messages) return;

    messages.forEach(msg => {
        let messageDiv;
        
        if (msg.type === 'user') {
            messageDiv = document.createElement('div');
            messageDiv.className = 'message user-message';
            messageDiv.textContent = msg.text;
        } else {
            // Use the KaTeX-enabled helper for bot messages
            messageDiv = createBotMessageDiv(msg.text); 
        }
        
        chatBox.appendChild(messageDiv);
    });

    // The core of the scrolling fix, which works because the CSS is set correctly.
    chatBox.scrollTop = chatBox.scrollHeight;
}


// -----------------------------------------------------------------
// MESSAGE SENDING LOGIC (UPDATED FOR CLIENT-SIDE)
// -----------------------------------------------------------------

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const query = userInput.value.trim();
    const chatBox = document.getElementById('chatBox');

    if (query === '') return;

    // 1. Display user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.textContent = query;
    chatBox.appendChild(userMessageDiv);

    userInput.value = '';
    userInput.disabled = true;

    // 2. Display thinking message (Requires .thinking-message and .dot styles in style.css)
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message bot-message thinking-message';
    thinkingDiv.innerHTML = '...Thinking and checking sources<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    chatBox.appendChild(thinkingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // 3. Process query after a short delay for simulation
    setTimeout(async () => {
        let botResponse = '';
        
        // --- Step A: Local Knowledge Match ---
        const localMatch = KNOWLEDGE_BASE.find(item => 
            item.keywords.some(keyword => query.toLowerCase().includes(keyword))
        );

        if (localMatch) {
            botResponse = localMatch.response;
        } 
        
        // --- Step B: Client-Side Math Check (via math.js) ---
        else if (query.match(/^(?:.*[\d+\-*/^().e])|(\s*calculate\s)/i)) { 
            botResponse = clientSideMath(query);
        }

        // --- Step C: Final Fallback (Simulate Failed Search) ---
        else {
            // Provide a client-side-aware fallback
            const genericFallback = [
                `I am currently operating in **GitHub Pages client-side mode** and cannot access external APIs for real-time information. However, I can still answer questions from my **local knowledge base** or perform calculations using **math.js**. The topic '${query}' is outside my current local data.`,
                `External web search is disabled in this simulator's client-side configuration. I can process math, web terms (HTML, CSS), or files. Please try a different query or ask for the formula for the 'quadratic formula'.`,
                `This query requires real-time data which I cannot fetch right now. I apologize for the limitation of running on a static page.`
            ];
            botResponse = genericFallback[Math.floor(Math.random() * genericFallback.length)];
        }


        // 4. Update UI
        chatBox.removeChild(thinkingDiv);
        
        // Use the KaTeX-enabled helper
        const botMessageDiv = createBotMessageDiv(botResponse); 
        chatBox.appendChild(botMessageDiv);

        chatBox.scrollTop = chatBox.scrollHeight;
        
        // 5. Save and Re-enable
        saveCurrentChat(query, botResponse);
        lastResponse = botResponse;

        userInput.disabled = false;
        userInput.focus();
        
        renderSidebar(loadHistory());

    }, 800); 
}

// Attach the main send function to the Enter key
document.getElementById('userInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});


// -----------------------------------------------------------------
// DRAG & DROP LOGIC (EXPANDED)
// -----------------------------------------------------------------

function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    const chatInterface = document.querySelector('.chat-interface');
    const chatBox = document.getElementById('chatBox');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        chatInterface.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Show dropZone when drag enters
    chatInterface.addEventListener('dragenter', (e) => {
        if (e.target.closest('.chat-interface') && !e.target.closest('#dropZone')) {
             dropZone.classList.add('hover');
        }
    }, false);

    // Hide dropZone when drag leaves
    dropZone.addEventListener('dragleave', (e) => {
        if (e.target === dropZone) { 
            dropZone.classList.remove('hover');
        }
    }, false);

    // Handle file drop
    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        preventDefaults(e);
        dropZone.classList.remove('hover');

        const files = e.dataTransfer.files;

        if (files.length > 0) {
            const file = files[0];
            const fileName = file.name;
            const fileType = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

            let userDropMessage = `I attempted to upload and process the file: **${fileName}** (${file.type} / ${file.size} bytes).`;
            let botDropResponse = '';

            // Expanded file type handling
            if (fileType === '.bat' || fileType === '.exe') {
                botDropResponse = `**SECURITY ALERT:** I detected a potentially dangerous executable file (${fileType}). For your safety, I blocked all processing. This simulator prioritizes security.`;
            } else if (fileType === '.txt' || fileType === '.md') {
                botDropResponse = `Text file received! I can process the content, but since I am a simulator, I will only confirm its receipt. You may ask me to summarize local text files in the future.`;
            } else if (fileType === '.jpg' || fileType === '.png' || fileType === '.gif') {
                botDropResponse = `Image file received! My current client-side model cannot perform visual analysis (CV) without a powerful backend. Try asking a question about **CSS** instead.`;
            } else if (fileType === '.pdf' || fileType === '.docx') {
                botDropResponse = `Document received. Document processing requires extensive client-side libraries or an external API, both of which are not active. Processing halted.`;
            } else {
                botDropResponse = `File received, but the type (${fileType}) is not recognized by my client-side handler. I am unable to proceed with processing.`;
            }
            
            // 1. Show user message
            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'message user-message';
            userMessageDiv.textContent = userDropMessage;
            chatBox.appendChild(userMessageDiv);

            document.getElementById('userInput').disabled = true;

            // 2. Show simulated bot response
            setTimeout(() => {
                // Use the KaTeX-enabled helper
                const botMessageDiv = createBotMessageDiv(botDropResponse);
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
        // Fix for potential previous syntax error by ensuring clean addEventListener call
        newChatBtn.addEventListener('click', startNewChat);
    }
    
    const sessions = loadHistory();
    renderSidebar(sessions);
    renderChatBox(sessions[currentSessionId]);
    
    setupDragAndDrop();
}

// IMPORTANT: This ensures the initializeChatbot function runs after all HTML is loaded
document.addEventListener('DOMContentLoaded', initializeChatbot);
