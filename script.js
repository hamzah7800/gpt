// =================================================================
// 🧠 FINAL, FIXED, AND ROBUST JAVASCRIPT CHATBOT CODE
// =================================================================

// Variable to store the bot's most recent response for context checking
let lastResponse = "";

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
    chatBox.scrollTop = chatBox.scrollHeight;

    // 2. Simulate AI processing time with a short delay
    setTimeout(() => {
        const botResponse = getBotResponse(userText.toLowerCase());
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message bot-message';
        botMessageDiv.textContent = botResponse;
        chatBox.appendChild(botMessageDiv);
        
        // IMPORTANT: Update the lastResponse variable for context
        lastResponse = botResponse;

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
// MATH ENGINE (Highly Robust)
// -----------------------------------------------------------------

function evaluateMath(input) {
    // 1. Clean the input: Replace 'x' with '*', remove spaces, and aggressively remove all non-math symbols
    let processedInput = input.replace(/x/g, '*'); 
    processedInput = processedInput.replace(/[^0-9+\-*/().]/g, ''); 

    // 2. Regex to ensure only valid math characters remain
    const mathRegex = /^[\d\s\+\-\*\/\(\)\.]+$/;
    
    // 3. Check if it looks like a calculation (must contain an operator)
    if (mathRegex.test(processedInput) && (processedInput.includes('+') || processedInput.includes('-') || processedInput.includes('*') || processedInput.includes('/'))) {
        try {
            const result = eval(processedInput); // Safe evaluation of the clean input
            return `The result of that calculation is **${result}**.`;
        } catch (e) {
            return "I can handle basic arithmetic like 2+2 or 5*3. Please ensure your expression is valid and simple.";
        }
    }
    return null;
}

// -----------------------------------------------------------------
// KNOWLEDGE BASE & RESPONSE GENERATION
// -----------------------------------------------------------------

function getBotResponse(input) {
    // 1. Math Check (Highest Priority)
    const mathResponse = evaluateMath(input);
    if (mathResponse) {
        return mathResponse;
    }

    // 2. CONTEXT AWARENESS (Handles "u sure" after a fact or calculation)
    const isQuestioningFact = input.includes('u sure') || input.includes('are you sure') || input.includes('is that true') || input.includes('really');
    if (isQuestioningFact) {
        // Checks for 'the result of' from math, or any verifiable fact keyword
        if (lastResponse.includes('verifiable fact') || lastResponse.includes('programming language') || lastResponse.includes('defined as') || lastResponse.includes('the result of')) {
            return "Yes, I am certain. The information I provided is based on accurate, hardcoded data. I confirm its veracity based on my internal knowledge base.";
        } else {
            return "I can only confirm facts I've just stated. Could you repeat the specific piece of information you're questioning?";
        }
    }

    // 3. AI META-KNOWLEDGE (Handles Identity, Model, and Limitations)
    if (input.includes('what model') || input.includes('model are you') || input.includes('model is better')) {
        return "I operate using a custom, **client-side JavaScript model** using keyword matching and hardcoded data. I am not a large language model like GPT or Claude, which require massive servers and cloud computing.";
    }
    if (input.includes('who made you') || input.includes('creator') || input.includes('company name') || input.includes('who are u') || input.includes('who r u') || input.includes('us') || input.includes('where do u get your data base')) {
        return "My source code was written by my user—you!—to demonstrate front-end AI simulation. I do not belong to a commercial company. My 'database' is the **hardcoded data** within my JavaScript file.";
    }
    if (input.includes('how to make you better') || input.includes('when are you being updated') || input.includes('why') || input.includes('limitations') || input.includes('lazyloading')) {
        return "To truly advance, I'd need a **back-end server** to connect to real-time APIs for internet access and genuine language generation. That's why I'm limited to my hardcoded facts.";
    }
    
    // 4. Core Conversation & Greetings
    if (input.includes('hello') || input.includes('hi') || input.includes('bonjour') || input.includes('salam') || input.includes('hey')) {
        return "Hello! I am an advanced JavaScript simulator with a vast knowledge base. I'm ready to assist you. What can I define, calculate, or explain?";
    }
    if (input.includes('how are you') || input.includes('how r u')) {
        return "I don't have feelings, but I am operating perfectly! Ready for your next query.";
    }
    if (input.includes('what can u talk about') || input.includes('what subjects') || input.includes('what can you do')) {
        return "I can answer questions on: **Web Technologies**, **Science** (gravity, light, biology), **Math Formulas**, and **Geography**. Try any of those!";
    }

    // 5. Hardcoded Facts: Science & Definitions
    if (input.includes('gravity') || input.includes('define gravity')) {
        return "Gravity is a fundamental force that attracts any objects with mass or energy. The constant is approximately $9.8 \\text{ m/s}^2$ on Earth. (Verifiable Fact)";
    }
    if (input.includes('photosynthesis') || input.includes('define photosynthesis')) {
        return "Photosynthesis is the process used by plants, algae, and some bacteria to convert light energy into chemical energy (food). (Defined as fact)";
    }
    
    // 6. Hardcoded Facts: Math Formulas
    if (input.includes('area of a circle') || input.includes('circle area formula')) {
        return "The formula for the area of a circle is **$A = \\pi r^2$** (Pi multiplied by the radius squared). (Defined as fact)";
    }
    if (input.includes('pythagorean') || input.includes('a^2+b^2')) {
        return "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides: **$a^2 + b^2 = c^2$**. (Defined as fact)";
    }

    // 7. Hardcoded Facts: Web Technologies
    if (input.includes('html') || input.includes('what html') || input.includes('define html')) {
        return "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. (This is a verifiable fact.)";
    }
    if (input.includes('css') || input.includes('define css') || input.includes('what is css')) {
        return "CSS stands for **Cascading Style Sheets**. It describes how HTML elements are to be displayed, controlling the layout and visual presentation of your website. (This is a verifiable fact.)";
    }
    if (input.includes('javascript') || input.includes('define javascript') || input.includes('define js') || input.includes('js')) {
        return "JavaScript (JS) is a high-level **programming language** that is one of the core technologies of the World Wide Web. (This is a verifiable fact.)";
    }
    
    // 8. Hardcoded Facts: Geography
    if (input.includes('capital of france') || input.includes('france')) {
        return "The capital of France is officially **Paris**. This is a verifiable fact.";
    }

    // 9. Compliments & Agreements
    if (input.includes('nice') || input.includes('cool') || input.includes('great answer') || input.includes('ok') || input.includes('thanks') || input.includes('thank you')) {
         return "You're very welcome! I'm glad I could assist. Feel free to ask another question.";
    }

    // 10. Final Fallback & Limits
    if (input.includes('meaning') || input.includes('definition') || input.includes('dnd') || input.includes('timmy')) {
         return "I don't know that specific term, as I cannot search the internet. Try asking me about the **Quadratic Formula** or **Photosynthesis** instead!";
    }
    
    // Default response (The final, specific fallback)
    return "I'm sorry, I can't process completely novel inputs like that or search the internet. I can answer questions about **Science, Math, Web Technologies, or my own simulated model**. Try asking: **'What is your model?'**";
}
