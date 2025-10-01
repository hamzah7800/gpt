// Variable to store the bot's most recent response for context checking
let lastResponse = "";

// Function to handle simple math operations (IMPROVED)
function evaluateMath(input) {
    // Replace common 'x' multiplication with '*' before testing/evaluating
    const processedInput = input.replace(/x/g, '*'); 

    // Enhanced Regex to handle spaces and common math characters
    const mathRegex = /^[\d\s\+\-\*\/\(\)\.]+$/;
    
    // Check if the input looks like a calculation (and isn't just a number)
    if (mathRegex.test(processedInput) && (processedInput.includes('+') || processedInput.includes('-') || processedInput.includes('*') || processedInput.includes('/'))) {
        try {
            // Remove spaces for safe evaluation
            const cleanInput = processedInput.replace(/ /g, '');
            const result = eval(cleanInput);
            return `The result of that calculation is **${result}**.`;
        } catch (e) {
            return "I can handle basic arithmetic like 2+2 or 5*3. Please ensure your expression is valid and simple.";
        }
    }
    return null;
}

// Function to generate a 'smart' and 'truthful' response (IMPROVED)
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
        if (lastResponse.includes('verifiable fact') || lastResponse.includes('standard markup language') || lastResponse.includes('cascading style sheets') || lastResponse.includes('programming language') || lastResponse.includes('the result of')) {
            return "Yes, I am certain. The information I provided is based on accurate, hardcoded data. I have no way to 'search the internet,' but I can confirm my own facts.";
        } else {
            return "I can only confirm facts I've just stated. Could you repeat the fact you're questioning?";
        }
    }

    // 3. Greetings
    if (input.includes('hello') || input.includes('hi')) {
        return "Hello! I am an advanced JavaScript simulator, now with basic memory. Ask me about HTML, CSS, or JavaScript.";
    }
    
    // 4. Time, Date, and Creator (NEW KNOWLEDGE)
    if (input.includes('time') || input.includes('date') || input.includes('year')) {
        const now = new Date();
        return `The time in your browser is ${now.toLocaleTimeString()}, and the current year is ${now.getFullYear()}.`;
    }
    if (input.includes('who made you') || input.includes('who is your creator')) {
        return "I was coded by my user—you!—as a simple JavaScript simulation to demonstrate client-side logic on GitHub Pages.";
    }
    if (input.includes('how are you') || input.includes('how r u')) {
        return "I don't have feelings, but I am operating perfectly! Ready for your next query.";
    }
    
    // 5. Identity
    if (input.includes('your name') || input.includes('who are you') || input.includes('who r u')) {
        return "I am a Simple AI Chatbot built with JavaScript, CSS, and HTML for demonstration purposes on GitHub Pages.";
    }

    // 6. Define HTML 
    if (input.includes('html') || input.includes('hgtml') || input.includes('what html') || input.includes('define html')) {
        return "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. It's the structure of any webpage! (This is a verifiable fact.)";
    }

    // 7. Define CSS
    if (input.includes('css') || input.includes('define css') || input.includes('what is css')) {
        return "CSS stands for **Cascading Style Sheets**. It describes how HTML elements are to be displayed, controlling the layout and visual presentation of your website. (This is a verifiable fact.)";
    }

    // 8. Define JavaScript
    if (input.includes('javascript') || input.includes('define javascript') || input.includes('define js') || input.includes('js')) {
        return "JavaScript (JS) is a high-level **programming language** that is one of the core technologies of the World Wide Web. It enables interactive features and dynamic content. (This is a verifiable fact.)";
    }
    
    // 9. Capital of France
    if (input.includes('capital of france') || input.includes('france')) {
        return "The capital of France is officially **Paris**. This is a verifiable fact.";
    }

    // 10. Simple Agreement/Filler (NEW)
    if (input.length < 5 && (input.includes('ok') || input.includes('thanks') || input.includes('cool') || input.includes('nice'))) {
         return "You're welcome! Feel free to ask another question.";
    }

    // 11. Unknown/General Terms (IMPROVED FALLBACK)
    if (input.includes('meaning') || input.includes('definition') || input.includes('dnd') || input.includes('timmy')) {
         return "I don't know that specific term, as I cannot search the internet. However, I can define core web technologies. Would you like me to tell you about **JavaScript** or **CSS**?";
    }

    // Default response (The final fallback is now more verbose and helpful)
    return "I'm sorry, I can't process completely novel inputs like that. My programming is limited to answering questions about **HTML, CSS, JavaScript**, the **capital of France**, or a **simple math calculation**.";
}

// Enable sending messages with the Enter key
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
