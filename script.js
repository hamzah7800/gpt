// Variable to store the bot's most recent response for context checking
let lastResponse = "";

function sendMessage() {
    // --- Message Sending Logic (Unchanged) ---
    const userInputField = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBox');
    const userText = userInputField.value.trim();

    if (userText === '') return;

    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.textContent = userText;
    chatBox.appendChild(userMessageDiv);

    userInputField.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
        const botResponse = getBotResponse(userText.toLowerCase());
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message bot-message';
        botMessageDiv.textContent = botResponse;
        chatBox.appendChild(botMessageDiv);
        
        // IMPORTANT: Update the lastResponse variable
        lastResponse = botResponse;

        chatBox.scrollTop = chatBox.scrollHeight;
    }, 800);
}

// Function to handle simple math operations (FIXED for 'x')
function evaluateMath(input) {
    // Replace common 'x' multiplication with '*' before testing/evaluating
    const processedInput = input.replace(/x/g, '*'); 
    
    // Enhanced Regex to handle spaces and common math characters
    const mathRegex = /^[\d\s\+\-\*\/\(\)\.]+$/;
    
    if (mathRegex.test(processedInput) && (processedInput.includes('+') || processedInput.includes('-') || processedInput.includes('*') || processedInput.includes('/'))) {
        try {
            const cleanInput = processedInput.replace(/ /g, '');
            const result = eval(cleanInput);
            return `The result of that calculation is **${result}**.`;
        } catch (e) {
            return "I can handle basic arithmetic like 2+2 or 5*3. Please ensure your expression is valid and simple.";
        }
    }
    return null;
}

// Function to generate a 'smart' and 'truthful' response (EXPANDED)
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

    // --- Core Conversation & Greetings (FIXED for foreign words) ---
    if (input.includes('hello') || input.includes('hi') || input.includes('bonjour') || input.includes('salam') || input.includes('hey')) {
        return "Hello! I am an advanced JavaScript simulator with a vast knowledge base. I'm ready to assist you. What can I define, calculate, or explain?";
    }
    if (input.includes('how are you') || input.includes('how r u')) {
        return "I don't have feelings, but I am operating perfectly! Ready for your next query.";
    }

    // --- AI META-KNOWLEDGE (The "Smart" Section) ---
    if (input.includes('what model') || input.includes('model are you') || input.includes('model is better')) {
        return "I operate using a custom, **client-side JavaScript model** using keyword matching and hardcoded data. I am not a large language model like GPT or Claude, which require massive servers and cloud computing.";
    }
    if (input.includes('who made you') || input.includes('creator') || input.includes('company name') || input.includes('your company')) {
        return "My source code was written by my user—you!—to demonstrate front-end AI simulation. I do not belong to a commercial company like Google or OpenAI, and I run entirely in your web browser.";
    }
    if (input.includes('how to make you better') || input.includes('lazyloading') || input.includes('future')) {
        return "To truly advance, I'd need a **back-end server** to connect to real-time APIs (like the Gemini API) for internet access and genuine language generation. Features like **Lazy Loading** pertain to web asset optimization, which is handled by the browser, not my simulation logic.";
    }
    if (input.includes('who better') || input.includes('who is smarter')) {
        return "Real large language models (LLMs) like **Gemini** or **GPT-4** are superior because they can generate novel, human-like text and access the internet. My intelligence is limited to the data provided in my JavaScript file.";
    }
    
    // --- Topics of Conversation / Capabilities ---
    if (input.includes('what can u talk about') || input.includes('what subjects') || input.includes('what can you do')) {
        return "I can answer questions on: **Web Technologies** (HTML, CSS, JS), **Science** (gravity, light, biology), **Math Formulas**, and **Geography** (capitals, major landmarks). Try asking for a formula!";
    }

    // --- Science & Definitions (EXPANDED) ---
    if (input.includes('gravity') || input.includes('define gravity')) {
        return "Gravity is a fundamental force that attracts any objects with mass or energy. The constant is approximately $9.8 \\text{ m/s}^2$ on Earth. (Verifiable Fact)";
    }
    if (input.includes('speed of light') || input.includes('how fast is light')) {
        return "The speed of light in a vacuum is approximately **$299,792,458 \\text{ meters per second}$**. (Verifiable Fact)";
    }
    if (input.includes('photosynthesis') || input.includes('define photosynthesis')) {
        return "Photosynthesis is the process used by plants, algae, and some bacteria to convert light energy into chemical energy (food). (Defined as fact)";
    }
    if (input.includes('planets') || input.includes('solar system')) {
        return "The eight planets in our solar system, in order from the Sun, are: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. (Defined as fact)";
    }

    // --- Math Formulas & Equations (EXPANDED) ---
    if (input.includes('area of a circle') || input.includes('circle area formula')) {
        return "The formula for the area of a circle is **$A = \\pi r^2$** (Pi multiplied by the radius squared). (Defined as fact)";
    }
    if (input.includes('pythagorean') || input.includes('a^2+b^2')) {
        return "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides: **$a^2 + b^2 = c^2$**. (Defined as fact)";
    }
    if (input.includes('quadratic formula') || input.includes('solve for x')) {
        return "The quadratic formula solves $ax^2 + bx + c = 0$ and is given by **$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$**. (Defined as fact)";
    }

    // --- Web Technologies (Core Facts) ---
    if (input.includes('html') || input.includes('what html') || input.includes('define html')) {
        return "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. (This is a verifiable fact.)";
    }
    if (input.includes('css') || input.includes('define css') || input.includes('what is css')) {
        return "CSS stands for **Cascading Style Sheets**. It describes how HTML elements are to be displayed, controlling the layout and visual presentation of your website. (This is a verifiable fact.)";
    }
    if (input.includes('javascript') || input.includes('define javascript') || input.includes('define js') || input.includes('js')) {
        return "JavaScript (JS) is a high-level **programming language** that is one of the core technologies of the World Wide Web. (This is a verifiable fact.)";
    }
    
    // --- Geography & Facts ---
    if (input.includes('capital of france') || input.includes('france')) {
        return "The capital of France is officially **Paris**. This is a verifiable fact.";
    }
    if (input.includes('mount everest') || input.includes('height of everest')) {
        return "Mount Everest's official height is **$8,848.86 \\text{ meters}$** above sea level. (Verifiable Fact)";
    }
    
    // --- Compliments & Agreements ---
    if (input.includes('nice') || input.includes('cool') || input.includes('great answer')) {
        return "I'm glad I could help! That's what I'm here for. Ask me something else!";
    }
    if (input.includes('ok') || input.includes('thanks') || input.includes('thank you')) {
         return "You're very welcome! Feel free to ask another question.";
    }

    // --- Final Fallback & Limits (IMPROVED) ---
    if (input.includes('meaning') || input.includes('definition') || input.includes('dnd') || input.includes('timmy')) {
         return "I don't know that specific term, as I cannot search the internet. Try asking me about the **Quadratic Formula** or **Photosynthesis** instead!";
    }
    
    // Default response (The final fallback is now highly specific)
    return "I'm sorry, I can't process completely novel inputs like that or search the internet. I can answer questions about **Science, Math, Web Technologies, or my own simulated model**. Try asking: **'What is your model?'**";
}

// Enable sending messages with the Enter key
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
