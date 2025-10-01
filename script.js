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

// Function to generate a simple, 'smart' and 'truthful' response
function getBotResponse(input) {
    if (input.includes('hello') || input.includes('hi')) {
        return "Hello! I am a simple, JavaScript-based simulator ready to answer your basic questions.";
    }
    
    if (input.includes('capital of france')) {
        return "The capital of France is officially **Paris**. This is a verifiable fact.";
    }
    
    if (input.includes('define html')) {
        return "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. It's the structure of any webpage!";
    }

    if (input.includes('run server') || input.includes('backend')) {
        return "As a purely client-side application (running only on JS/HTML/CSS), I cannot run complex algorithms or connect to a live back-end server. My responses are pre-programmed.";
    }

    if (input.includes('truth')) {
        return "Truthfulness in this context means my responses are based on the accurate, hardcoded data I was programmed with. I avoid speculative answers.";
    }

    if (input.includes('your name') || input.includes('who are you')) {
        return "I am a Simple AI Chatbot built with JavaScript, CSS, and HTML for demonstration purposes on GitHub Pages.";
    }
    
    // Default response for unmatched input
    return "That's an interesting topic! My simple logic is currently limited to basic facts and greetings. Could you try asking me about HTML or the capital of France?";
}

// Enable sending messages with the Enter key
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
