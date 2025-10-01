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

// Function to handle simple math operations
function evaluateMath(input) {
    const processedInput = input.replace(/x/g, '*'); 
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

// Function to generate a 'smart' and 'truthful' response (EXPANDED KNOWLEDGE)
function getBotResponse(input) {
    // 1. Math Check
    const mathResponse = evaluateMath(input);
    if (mathResponse) {
        return mathResponse;
    }

    // 2. CONTEXT AWARENESS (Handles "u sure" after a fact)
    const isQuestioningFact = input.includes('u sure') || input.includes('are you sure') || input.includes('is that true') || input.includes('really');
    if (isQuestioningFact) {
        // Check for keywords in the LAST response that indicate a fact was stated
        if (lastResponse.includes('verifiable fact') || lastResponse.includes('standard markup language') || lastResponse.includes('programming language') || lastResponse.includes('the result of') || lastResponse.includes('defined as')) {
            return "Yes, I am certain. The information I provided is based on accurate, hardcoded data. I have no way to 'search the internet,' but I can confirm my own facts.";
        } else {
            return "I can only confirm facts I've just stated. Could you repeat the fact you're questioning?";
        }
    }

    // --- Core Conversation & Identity ---
    if (input.includes('hello') || input.includes('hi')) {
        return "Hello! I am an advanced JavaScript simulator, now with a vast hardcoded knowledge base. Ask me about **science, history, web tech, or math formulas**!";
    }
    if (input.includes('how are you') || input.includes('how r u')) {
        return "I don't have feelings, but I am operating perfectly! Ready for your next query.";
    }
    if (input.includes('your name') || input.includes('who are you') || input.includes('who r u')) {
        return "I am a Simple AI Chatbot built with JavaScript, CSS, and HTML for demonstration purposes on GitHub Pages.";
    }

    // --- Science & Definitions (New!) ---
    if (input.includes('gravity') || input.includes('define gravity')) {
        return "Gravity is a fundamental force that attracts any objects with mass or energy. On Earth, it gives weight to physical objects. (Verifiable Fact)";
    }
    if (input.includes('speed of light') || input.includes('how fast is light')) {
        return "The speed of light in a vacuum is approximately **299,792,458 meters per second** (about 186,282 miles per second). (Verifiable Fact)";
    }
    if (input.includes('photosynthesis') || input.includes('define photosynthesis')) {
        return "Photosynthesis is the process used by plants, algae, and some bacteria to convert light energy, usually from the sun, into chemical energy (food). (Defined as fact)";
    }
    if (input.includes('planets') || input.includes('solar system')) {
        return "The eight planets in our solar system, in order from the Sun, are: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. (Defined as fact)";
    }

    // --- Math Formulas & Equations (New!) ---
    if (input.includes('area of a circle') || input.includes('circle area formula')) {
        return "The formula for the area of a circle is **A = $\\pi r^2$** (Pi multiplied by the radius squared). (Defined as fact)";
    }
    if (input.includes('pythagorean') || input.includes('a^2+b^2')) {
        return "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse (the side opposite the right angle) is equal to the sum of the squares of the other two sides: **a² + b² = c²**. (Defined as fact)";
    }

    // --- Geography & Facts (New!) ---
    if (input.includes('capital of france') || input.includes('france')) {
        return "The capital of France is officially **Paris**. This is a verifiable fact.";
    }
    if (input.includes('mount everest') || input.includes('height of everest')) {
        return "Mount Everest's official height is **8,848.86 meters** (or 29,031.7 feet) above sea level. (Verifiable Fact)";
    }
    if (input.includes('nile river') || input.includes('longest river')) {
        return "The Nile River is widely regarded as the longest river in the world, flowing approximately **6,650 kilometers** (4,132 miles). (Verifiable Fact)";
    }
    
    // --- Web Technologies (Unchanged but important) ---
    if (input.includes('html') || input.includes('what html') || input.includes('define html')) {
        return "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. (This is a verifiable fact.)";
    }
    if (input.includes('css') || input.includes('define css') || input.includes('what is css')) {
        return "CSS stands for **Cascading Style Sheets**. It describes how HTML elements are to be displayed, controlling the layout and visual presentation of your website. (This is a verifiable fact.)";
    }
    if (input.includes('javascript') || input.includes('define javascript') || input.includes('define js') || input.includes('js')) {
        return "JavaScript (JS) is a high-level **programming language** that is one of the core technologies of the World Wide Web. (This is a verifiable fact.)";
    }

    // --- Compliments & Agreements (New!) ---
    if (input.includes('nice') || input.includes('cool') || input.includes('great answer')) {
        return "I'm glad I could help! That's what I'm here for. Ask me something else!";
    }
    if (input.includes('ok') || input.includes('thanks') || input.includes('thank you')) {
         return "You're very welcome! Feel free to ask another question.";
    }

    // --- Final Fallback & Limits ---
    if (input.includes('meaning') || input.includes('definition') || input.includes('dnd') || input.includes('timmy')) {
         return "I don't know that specific term, as I cannot search the internet. Try asking me about **photosynthesis** or the **speed of light** instead!";
    }
    
    // Default response 
    return "I'm sorry, I can't process completely novel inputs like that or search the internet. I can answer questions about **Science, Geography, Math Formulas, or Web Technologies**. Try asking me for the **Pythagorean theorem**!";
}

// Enable sending messages with the Enter key
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
