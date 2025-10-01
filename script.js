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
        
        // Scroll again after the bot replies
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 800);
}

// Function to handle simple math operations (like "2+2-2")
function evaluateMath(input) {
    // Regex to check for simple arithmetic (e.g., 5+3, 10-2, 4*4, 9/3)
    const mathRegex = /^[\d\s\+\-\*\/\(\)\.]+$/;
    
    // Check if the input looks like a calculation (and isn't just a number)
    if (mathRegex.test(input) && (input.includes('+') || input.includes('-') || input.includes('*') || input.includes('/'))) {
        try {
            // WARNING: Using eval() can be dangerous in real applications, 
            // but is fine for this simple, controlled chatbot example.
            const result = eval(input.replace(/ /g, ''));
            return `The result of that calculation is **${result}**.`;
        } catch (e) {
            return "I tried to calculate that, but the math expression seems invalid. Try something simpler like 2+2.";
        }
    }
    return null;
}

// Function to generate a simple, 'smart' and 'truthful' response
function getBotResponse(input) {
    // 1. Math Check (Added)
    const mathResponse = evaluateMath(input);
    if (mathResponse) {
        return mathResponse;
    }

    // 2. Greetings
    if (input.includes('hello') || input.includes('hi')) {
        return "Hello! I am a simple, JavaScript-based simulator ready to answer your basic questions.";
    }
    
    // 3. Truthfulness Reassurance (Added)
    if (input.includes('u sure') || input.includes('are you sure') || input.includes('is that true')) {
        return "Yes, my responses are based on the accurate, hardcoded facts I was programmed with. I am certain about that information!";
    }

    // 4. Capital of France
    // Trigger on 'capital of france', 'france', etc.
    if (input.includes('capital of france') || input.includes('france')) {
        return "The capital of France is officially **Paris**. This is a verifiable fact.";
    }
    
    // 5. Define HTML (Corrected)
    // Trigger on 'define html', 'html', 'what html', etc.
    if (input.includes('define html') || input.includes('html') || input.includes('htmk')) {
        return "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. It's the structure of any webpage!";
    }

    // 6. Limits and Backend
    if (input.includes('run server') || input.includes('backend') || input.includes('python')) {
        return "As a purely client-side application (running only on JS/HTML/CSS), I cannot run complex algorithms or connect to a live back-end server. My responses are pre-programmed.";
    }

    // 7. Identity
    if (input.includes('your name') || input.includes('who are you')) {
        return "I am a Simple AI Chatbot built with JavaScript, CSS, and HTML for demonstration purposes on GitHub Pages.";
    }
    
    // Default response for unmatched input
    return "That's an interesting topic! My simple logic is currently limited to basic facts and greetings. Could you try asking me about **HTML**, the **capital of France**, or a simple **math calculation**?";
}

// Enable sending messages with the Enter key
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
