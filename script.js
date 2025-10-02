// =================================================================
// 🚀 CLEANER & FASTER JAVASCRIPT CHATBOT
// Features: Local Knowledge + Math API + Search API + History + DragDrop
// Requires: server.js backend on port 3000
// =================================================================

// ---------------- CONFIG ----------------
const API = {
    search: 'http://localhost:3000/api/search',
    math: 'http://localhost:3000/api/calculate'
};

let lastResponse = ""; // store last bot reply
const HISTORY_KEY = 'chatbot_sessions';
let currentSessionId = localStorage.getItem('currentSessionId') || `session_${Date.now()}`;

// ---------------- KNOWLEDGE BASE ----------------
const KNOWLEDGE_BASE = [
    { keywords: ['hello','hi','hey','bonjour','salam'], response: "Hello! I’m your JavaScript AI simulator. Ask me about science, math, web tech, or geography!" },
    { keywords: ['how are you'], response: "I don’t have feelings, but I’m running perfectly fine! 😎" },
    { keywords: ['thanks','thank you','nice','cool'], response: "You’re welcome! Ask me something else anytime." },

    // Web
    { keywords: ['html'], response: "HTML = HyperText Markup Language. It structures web pages. (Fact)" },
    { keywords: ['css'], response: "CSS = Cascading Style Sheets. It styles how HTML is displayed. (Fact)" },
    { keywords: ['javascript','js'], response: "JavaScript = Programming language that powers web interactivity. (Fact)" },

    // Model identity
    { keywords: ['what model','model are you'], response: "I’m a front-end AI simulator, not a full LLM like GPT. I use keyword rules + backend APIs." },
    { keywords: ['who made you','creator'], response: "You did! This is a client-side simulation with a small knowledge base and API support." },

    // Science
    { keywords: ['gravity'], response: "Gravity = Force of attraction. On Earth, g ≈ 9.8 m/s². (Fact)" },
    { keywords: ['photosynthesis'], response: "Photosynthesis = Plants using light to make energy. (Fact)" },
    { keywords: ['pythagorean'], response: "Pythagoras: a² + b² = c² for right triangles. (Fact)" },
    { keywords: ['area of a circle'], response: "Area = πr² (Pi times radius squared). (Fact)" },

    // Geography
    { keywords: ['capital of france'], response: "Paris is the capital of France. (Fact)" },

    // Fallback
    { keywords: ['what can you do','subjects'], response: "I know **Math, Science, Web Tech, and some Geography**. Try asking: *What is HTML?*" }
];

// ---------------- HELPERS ----------------
function renderMessage(text, type = 'bot') {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;

    const div = document.createElement('div');
    div.className = `message ${type}-message`;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function matchKnowledge(input) {
    input = input.toLowerCase();
    for (const item of KNOWLEDGE_BASE) {
        if (item.keywords.some(k => input.includes(k))) return item.response;
    }
    return null;
}

// ---------------- API CALLS ----------------
async function fetchAPI(url, body) {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return await res.json();
    } catch (err) {
        console.error("API error:", err);
        return null;
    }
}

async function calculateMath(query) {
    const mathRegex = /^[\d\s\+\-\*\/\(\)\.]+$/;
    if (!mathRegex.test(query)) return null;

    const data = await fetchAPI(API.math, { expression: query });
    return data?.success ? `The result is **${data.result}**.` : null;
}

async function searchWeb(query) {
    const data = await fetchAPI(API.search, { query });
    if (data?.success && data.snippet) {
        return `🌐 I searched online: **${data.snippet}** (Source: ${data.title})`;
    }
    return null;
}

// ---------------- CORE CHAT LOGIC ----------------
async function sendMessage() {
    const inputEl = document.getElementById('userInput');
    const userText = inputEl.value.trim();
    if (!userText) return;

    renderMessage(userText, 'user');
    saveChat(userText, null);
    inputEl.value = '';
    inputEl.disabled = true;

    renderMessage("...Thinking...", 'bot');

    let reply = null;

    // 1. Try math
    reply = await calculateMath(userText);

    // 2. Try local knowledge
    if (!reply) reply = matchKnowledge(userText);

    // 3. Try web search
    if (!reply) reply = await searchWeb(userText);

    // 4. Default fallback
    if (!reply) reply = "🤔 I don’t know that yet. Try asking about Math, Science, Web Tech, or Geography.";

    // Replace thinking with actual reply
    const chatBox = document.getElementById('chatBox');
    chatBox.lastChild.textContent = reply;

    lastResponse = reply;
    saveChat(null, reply);

    inputEl.disabled = false;
    inputEl.focus();
}

// ---------------- HISTORY ----------------
function loadHistory() {
    const raw = localStorage.getItem(HISTORY_KEY);
    const sessions = raw ? JSON.parse(raw) : {};
    if (!sessions[currentSessionId]) {
        sessions[currentSessionId] = [{ type: 'bot', text: "Hello! I’m your JavaScript AI simulator. Ask me anything." }];
    }
    return sessions;
}

function saveHistory(sessions) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
    localStorage.setItem('currentSessionId', currentSessionId);
}

function saveChat(user, bot) {
    const sessions = loadHistory();
    const chat = sessions[currentSessionId] || [];
    if (user) chat.push({ type: 'user', text: user });
    if (bot) chat.push({ type: 'bot', text: bot });
    sessions[currentSessionId] = chat;
    saveHistory(sessions);
    renderSidebar(sessions);
}

function renderSidebar(sessions) {
    const chatList = document.querySelector('.chat-list');
    if (!chatList) return;
    chatList.innerHTML = '';
    Object.keys(sessions).reverse().forEach(id => {
        const firstUser = sessions[id].find(m => m.type === 'user');
        const title = firstUser ? firstUser.text.slice(0, 20) + "..." : "New Chat";
        const li = document.createElement('li');
        li.className = 'chat-item';
        if (id === currentSessionId) li.classList.add('active');
        li.textContent = title;
        li.onclick = () => switchChat(id, sessions);
        chatList.appendChild(li);
    });
}

function renderChat(messages) {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;
    chatBox.innerHTML = '';
    messages.forEach(m => renderMessage(m.text, m.type));
}

function switchChat(id, sessions) {
    currentSessionId = id;
    lastResponse = sessions[id].at(-1)?.text || "";
    renderChat(sessions[id]);
    renderSidebar(sessions);
}

function startNewChat() {
    currentSessionId = `session_${Date.now()}`;
    lastResponse = "";
    const sessions = loadHistory();
    sessions[currentSessionId] = [{ type: 'bot', text: "New chat started! I’m your JavaScript AI simulator." }];
    saveHistory(sessions);
    renderChat(sessions[currentSessionId]);
    renderSidebar(sessions);
}

// ---------------- DRAG & DROP ----------------
function setupDragDrop() {
    const dropZone = document.getElementById('dropZone');
    const target = document.querySelector('.chat-interface');
    if (!dropZone || !target) return;

    ['dragenter','dragover','dragleave','drop'].forEach(e =>
        target.addEventListener(e, ev => { ev.preventDefault(); ev.stopPropagation(); })
    );

    target.addEventListener('drop', e => {
        const file = e.dataTransfer.files[0];
        if (!file) return;
        renderMessage(`📂 Uploaded: ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`, 'user');
        renderMessage(`I can’t open **${file.name}**, but file upload works! Try a question about CSS or math.`, 'bot');
    });
}

// ---------------- INIT ----------------
function init() {
    document.getElementById('userInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });
    document.querySelector('.new-chat-btn')?.addEventListener('click', startNewChat);

    const sessions = loadHistory();
    renderSidebar(sessions);
    renderChat(sessions[currentSessionId]);
    setupDragDrop();
}

document.addEventListener('DOMContentLoaded', init);
