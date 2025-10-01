// Variable to store the bot's most recent response for context checking
let lastResponse = "";

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

    // 2. Clear the input field
    userInputField.value = '';

    // 3. Scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight;

    // 4. Get and display the AI's response after a short delay
    setTimeout(() => {
        const botResponse = getBotResponse(userText.toLowerCase());
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message bot-message';
        botMessageDiv.textContent = botResponse;
        chatBox.appendChild(botMessageDiv);
        
        // IMPORTANT: Update the lastResponse variable
        lastResponse = botResponse;

        // Scroll again after the bot replies
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 800);
}

// Function to handle simple math operations
function evaluateMath(input) {
    const mathRegex = /^[\d\s\+\-\*\/\(\)\.]+$/;
    
    if (mathRegex.test(input) && (input.includes('+') || input.includes('-') || input.includes('*') || input.includes('/'))) {
        try {
            const result = eval(input.replace(/ /g, ''));
            return `The result of that calculation is **${result}**.`;
        } catch (e) {
            return "I tried to calculate that, but the math expression seems invalid. Try something simpler like 2+2.";
        }
    }
    return null;
}

// Function to generate a 'smart' and 'truthful' response
function getBotResponse(input) {
    // 1. Math Check
    const mathResponse = evaluateMath(input);
    if (mathResponse) {
        return mathResponse;
    }

    // 2. CONTEXT AWARENESS (The big improvement!)
    if (input.includes('u sure') || input.includes('are you sure') || input.includes('is that true') || input.includes('really')) {
        // Check if the previous response was a known fact
        if (lastResponse.includes('verifiable fact') || lastResponse.includes('standard markup language') || lastResponse.includes('cascading style sheets') || lastResponse.includes('programming language')) {
            return "Yes, I am certain. The information I provided is based on accurate, hardcoded data, and I can confirm its veracity.";
        } else {
            return "I can only be absolutely certain about the facts I was explicitly programmed with. Which fact are you questioning?";
        }
    }

    // 3. Greetings
    if (input.includes('hello') || input.includes('hi')) {
        return "Hello! I am an advanced JavaScript simulator, now with basic memory. Ask me about HTML, CSS, or JavaScript.";
    }
    
    // 4. Capital of France
    if (input.includes('capital of france') || input.includes('france')) {
        return "The capital of France is officially **Paris**. This is a verifiable fact.";
    }
    
    // 5. Define HTML
    if (input.includes('define html') || input.includes('html')) {
        return "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. It's the structure of any webpage!";
    }

    // 6. Define CSS (New!)
    if (input.includes('define css') || input.includes('css')) {
        return "CSS stands for **Cascading Style Sheets**. It describes how HTML elements are to be displayed, controlling the layout and visual presentation of your website.";
    }

    // 7. Define JavaScript (New!)
    if (input.includes('define javascript') || input.includes('javascript') || input.includes('js')) {
        return "JavaScript (JS) is a high-level **programming language** that is one of the core technologies of the World Wide Web. It enables interactive features and dynamic content.";
    }

    // 8. Limits and Backend
    if (input.includes('run server') || input.includes('backend') || input.includes('python')) {
        return "As a purely client-side application (running only on JS/HTML/CSS), I cannot run complex algorithms or connect to a live back-end server. My responses are pre-programmed and cannot process code on a server.";
    }

    // 9. Identity
    if (input.includes('your name') || input.includes('who are you')) {
        return "I am a Simple AI Chatbot built with JavaScript, CSS, and HTML for demonstration purposes on GitHub Pages. I am designed to simulate intelligence and truthfulness.";
    }
    
    // Default response
    return "That's an interesting topic! I've been upgraded to handle more context, but I'm still limited to answering questions about web technologies (HTML, CSS, JS), simple math, and facts like the capital of France. What else can I define for you?";
}

// Enable sending messages with the Enter key
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
