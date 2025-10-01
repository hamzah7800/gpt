// =================================================================
// 🧠 DEFINITIVE JAVASCRIPT WITH UI FUNCTIONALITY
// =================================================================

// Variable to store the bot's most recent response for context checking
let lastResponse = "";

// -----------------------------------------------------------------
// HISTORY MANAGER (NEW FEATURE)
// -----------------------------------------------------------------

const HISTORY_KEY = 'chatbot_sessions';
let currentSessionId = 'session_' + Date.now(); // Unique ID for the current chat

function loadHistory() {
    const historyData = localStorage.getItem(HISTORY_KEY);
    return historyData ? JSON.parse(historyData) : {
        [currentSessionId]: [{
            type: 'bot',
            text: "Hello! I am an advanced JavaScript simulator with a vast knowledge base. Ask me anything."
        }]
    };
}

function saveHistory(sessions) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
}

function renderChatBox(messages) {
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML = ''; // Clear existing messages

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
    // Save the current chat before starting a new one
    saveCurrentChat();
    
    // Create a new session ID and reset lastResponse
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

    if (userText) {
        currentSession.push({ type: 'user', text: userText });
    }
    if (botResponse) {
        currentSession.push({ type: 'bot', text: botResponse });
    }

    // Ensure the session has content before saving a title
    if (currentSession.length > 0) {
        allSessions[currentSessionId] = currentSession;
        saveHistory(allSessions);
        renderSidebar(allSessions);
    }
}

function renderSidebar(sessions) {
    const chatList = document.querySelector('.chat-list');
    chatList.innerHTML = '';
    
    // Iterate over sessions to create list items
    Object.keys(sessions).forEach(id => {
        const messages = sessions[id];
        const firstUserMsg = messages.find(m => m.type === 'user');
        
        // Use the first user message as the title, or a default title
        const title = firstUserMsg ? firstUserMsg.text.substring(0, 30) + '...' : 'New Chat (Simulated)';

        const listItem = document.createElement('li');
        listItem.className = 'chat-item';
        if (id === currentSessionId) {
            listItem.classList.add('active');
        }
        listItem.textContent = title;
        listItem.dataset.sessionId = id;
        
        // Add click listener to switch chats (FIXED)
        listItem.addEventListener('click', () => switchChat(id, sessions));
        
        chatList.appendChild(listItem);
    });
}

function switchChat(sessionId, sessions) {
    saveCurrentChat(); // Save the chat we are leaving
    currentSessionId = sessionId;
    
    const messages = sessions[sessionId];
    renderChatBox(messages);
    
    // Update active class in sidebar (FIXED)
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.sessionId === sessionId) {
            item.classList.add('active');
        }
    });
    
    // Restore lastResponse context for the new chat
    lastResponse = messages[messages.length - 1]?.text || "";
}

// -----------------------------------------------------------------
// DRAG & DROP LOGIC (NEW FEATURE)
// -----------------------------------------------------------------

function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    const inputArea = document.querySelector('.input-area');

    // Prevent default browser behavior for drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        inputArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Visual feedback for drag
    inputArea.addEventListener('dragenter', () => dropZone.classList.add('hover'), false);
    inputArea.addEventListener('dragleave', (e) => {
        // Only remove hover if cursor leaves the whole input area
        if (e.relatedTarget && !inputArea.contains(e.relatedTarget)) {
            dropZone.classList.remove('hover');
        }
    }, false);
    inputArea.addEventListener('drop', () => dropZone.classList.remove('hover'), false);


    // Handle File Drop (FIXED)
    inputArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;

        if (files.length > 0) {
            const fileName = files[0].name;
            const fileSize = (files[0].size / 1024 / 1024).toFixed(2); // Size in MB
            
            // SIMULATED USER MESSAGE
            const userDropMessage = `Attempting to upload file: ${fileName}`;
            const botDropResponse = `File **${fileName}** (${fileSize} MB) received. As a client-side simulator, I cannot process the content (like a BAT file) or search for external data, but the drag-and-drop feature works! Try a simple math question instead.`;

            // Display messages and update history
            const chatBox = document.getElementById('chatBox');

            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'message user-message';
            userMessageDiv.textContent = userDropMessage;
            chatBox.appendChild(userMessageDiv);
            
            setTimeout(() => {
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'message bot-message';
                botMessageDiv.textContent = botDropResponse;
                chatBox.appendChild(botMessageDiv);

                chatBox.scrollTop = chatBox.scrollHeight;
                
                // Save the simulated interaction
                saveCurrentChat(userDropMessage, botDropResponse);
                lastResponse = botDropResponse;
            }, 500);
        }
    }
}

// -----------------------------------------------------------------
// CORE CHAT ENGINE LOGIC (Unchanged from last fixed version)
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

function getBotResponse(input) {
    // Save the user's input immediately for history
    saveCurrentChat(input, null); 

    // 1. Math Check
    const mathResponse = evaluateMath(input);
    if (mathResponse) {
        saveCurrentChat(null, mathResponse); // Save the bot's response
        return mathResponse;
    }

    // 2. CONTEXT AWARENESS (Handles "u sure")
    const isQuestioningFact = input.includes('u sure') || input.includes('are you sure') || input.includes('is that true') || input.includes('really');
    if (isQuestioningFact) {
        if (lastResponse.includes('verifiable fact') || lastResponse.includes('programming language') || lastResponse.includes('defined as') || lastResponse.includes('the result of')) {
            const response = "Yes, I am certain. The information I provided is based on accurate, hardcoded data. I confirm its veracity based on my internal knowledge base.";
            saveCurrentChat(null, response);
            return response;
        } else {
            const response = "I can only confirm facts I've just stated. Could you repeat the specific piece of information you're questioning?";
            saveCurrentChat(null, response);
            return response;
        }
    }

    // 3. AI META-KNOWLEDGE
    let response;
    if (input.includes('what model') || input.includes('model are you') || input.includes('model is better')) {
        response = "I operate using a custom, **client-side JavaScript model** using keyword matching and hardcoded data. I am not a large language model like GPT or Claude, which require massive servers and cloud computing.";
    } else if (input.includes('who made you') || input.includes('creator') || input.includes('company name') || input.includes('who are u') || input.includes('who r u') || input.includes('us') || input.includes('where do u get your data base')) {
        response = "My source code was written by my user—you!—to demonstrate front-end AI simulation. I do not belong to a commercial company. My 'database' is the **hardcoded data** within my JavaScript file.";
    } else if (input.includes('how to make you better') || input.includes('when are you being updated') || input.includes('why') || input.includes('limitations') || input.includes('lazyloading')) {
        response = "To truly advance, I'd need a **back-end server** to connect to real-time APIs for internet access and genuine language generation. That's why I'm limited to my hardcoded facts.";
    } else if (input.includes('who better') || input.includes('who is smarter')) {
        response = "Real large language models (LLMs) like **Gemini** or **GPT-4** are superior because they can generate novel, human-like text and access the internet. My intelligence is limited to the data provided in my JavaScript file.";
    } else if (input.includes('hello') || input.includes('hi') || input.includes('bonjour') || input.includes('salam') || input.includes('hey')) {
        response = "Hello! I am an advanced JavaScript simulator with a vast knowledge base. I'm ready to assist you. What can I define, calculate, or explain?";
    } else if (input.includes('how are you') || input.includes('how r u')) {
        response = "I don't have feelings, but I am operating perfectly! Ready for your next query.";
    } else if (input.includes('what can u talk about') || input.includes('what subjects') || input.includes('what can you do')) {
        response = "I can answer questions on: **Web Technologies**, **Science** (gravity, light, biology), **Math Formulas**, and **Geography**. Try any of those!";
    } else if (input.includes('gravity') || input.includes('define gravity')) {
        response = "Gravity is a fundamental force that attracts any objects with mass or energy. The constant is approximately $9.8 \\text{ m/s}^2$ on Earth. (Verifiable Fact)";
    } else if (input.includes('photosynthesis') || input.includes('define photosynthesis')) {
        response = "Photosynthesis is the process used by plants, algae, and some bacteria to convert light energy into chemical energy (food). (Defined as fact)";
    } else if (input.includes('area of a circle') || input.includes('circle area formula')) {
        response = "The formula for the area of a circle is **$A = \\pi r^2$** (Pi multiplied by the radius squared). (Defined as fact)";
    } else if (input.includes('pythagorean') || input.includes('a^2+b^2')) {
        response = "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides: **$a^2 + b^2 = c^2$**. (Defined as fact)";
    } else if (input.includes('html') || input.includes('what html') || input.includes('define html')) {
        response = "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. (This is a verifiable fact.)";
    } else if (input.includes('css') || input.includes('define css') || input.includes('what is css')) {
        response = "CSS stands for **Cascading Style Sheets**. It describes how HTML elements are to be displayed, controlling the layout and visual presentation of your website. (This is a verifiable fact.)";
    } else if (input.includes('javascript') || input.includes('define javascript') || input.includes('define js') || input.includes('js')) {
        response = "JavaScript (JS) is a high-level **programming language** that is one of the core technologies of the World Wide Web. (This is a verifiable fact.)";
    } else if (input.includes('capital of france') || input.includes('france')) {
        response = "The capital of France is officially **Paris**. This is a verifiable fact.";
    } else if (input.includes('nice') || input.includes('cool') || input.includes('great answer') || input.includes('ok') || input.includes('thanks') || input.includes('thank you')) {
         response = "You're very welcome! I'm glad I could assist. Feel free to ask another question.";
    } else if (input.includes('meaning') || input.includes('definition') || input.includes('dnd') || input.includes('timmy')) {
         response = "I don't know that specific term, as I cannot search the internet. Try asking me about the **Quadratic Formula** or **Photosynthesis** instead!";
    } else {
        // Default response
        response = "I'm sorry, I can't process completely novel inputs like that or search the internet. I can answer questions about **Science, Math, Web Technologies, or my own simulated model**. Try asking: **'What is your model?'**";
    }

    saveCurrentChat(null, response); // Save the bot's response
    return response;
}

// -----------------------------------------------------------------
// INITIALIZATION (Start the App)
// -----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Load chat history and render sidebar
    const sessions = loadHistory();
    renderSidebar(sessions);
    
    // Render the active chat
    if (sessions[currentSessionId]) {
        renderChatBox(sessions[currentSessionId]);
    } else {
        // Fallback for new users
        startNewChat();
    }
    
    // Attach click listener to the New Chat Button (FIXED)
    document.querySelector('.new-chat-btn').addEventListener('click', startNewChat);

    // Setup Drag and Drop
    setupDragAndDrop();
});
