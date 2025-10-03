import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

// ---------------------------
// CONFIGURE FIREBASE (REPLACE)
// ---------------------------
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
  projectId: "REPLACE_WITH_YOUR_PROJECT",
  appId: "REPLACE_WITH_YOUR_APP_ID",
  // Optional: storageBucket, messagingSenderId, measurementId
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ---------------------------
// GLOBAL VARIABLES
// ---------------------------
let lastResponse = "";
let currentSessionId = null; // will be set after login (namespaced per user)
const HISTORY_ROOT_KEY = 'chatbot_sessions'; // sessions object stored under a user-specific key
const mathScope = {}; // persistent math.js scope per session/user

// UI elements (queried on DOMContentLoaded)
let signInButton, signOutButton, disconnectButton, authStatusEl;
let chatbotContainer, authPanel, chatBox, userInput, sidebarToggle, newChatBtn, chatList;

// ---------------------------
// DYNAMIC LOADING HELPERS
// ---------------------------
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      // already present: wait for it to be ready (best-effort)
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

function loadStyle(href) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    l.onload = () => resolve();
    l.onerror = (e) => reject(e);
    document.head.appendChild(l);
  });
}

async function ensureMathJS() {
  // Prefer global `math` (if loaded via <script>), otherwise dynamically load the browser bundle
  if (window.math && typeof window.math.evaluate === 'function') return;
  await loadScript('https://cdn.jsdelivr.net/npm/mathjs@11.8.0/lib/browser/math.js');
  // math should be available as window.math
}

async function ensureKaTeX() {
  if (window.renderMathInElement) return;
  await loadStyle('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css');
  await loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js');
  await loadScript('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js');
  // renderMathInElement will be available
}

// ---------------------------
// MATH HANDLER (uses math.js if available, else fallback to eval)
// ---------------------------

/**
 * Evaluate math expressions or assignments with a persistent mathScope.
 * Returns a formatted string result or null if input is not math-like.
 */
function clientSideMath(query) {
  // Allow letters for variables, numbers, math operators, parentheses, commas, dot, =, ^, functions
  const mathRegex = /^\s*[\w\d\s\+\-\*\/\(\)\^,=\.\!%]+$/i;
  if (!mathRegex.test(query)) return null;

  try {
    if (window.math && typeof window.math.evaluate === 'function') {
      // Evaluate with math.js using the shared mathScope
      const result = window.math.evaluate(query, mathScope);

      // Display defined variables (numbers or matrices)
      const definedVars = Object.keys(mathScope).filter(k => {
        const v = mathScope[k];
        return (typeof v === 'number') || (typeof v === 'object') || (typeof v === 'function');
      });

      const scopeDisplay = definedVars.length ? definedVars.map(v => {
        try {
          let repr = mathScope[v];
          if (typeof repr === 'object' && repr !== null && repr.entries) repr = repr.toString();
          return `${v} = ${String(repr).substring(0, 30)}${String(repr).length > 30 ? '...' : ''}`;
        } catch (e) {
          return `${v} = (value)`;
        }
      }).join(' | ') : '';

      // If assignment
      if (query.includes('=') && !query.includes('==')) {
        return `Variable defined/updated. **\`${query}\`** processed. Current Math Scope: \`${scopeDisplay}\` (Engine: **math.js**).`;
      }

      return `The calculated result is: **${String(result)}**.\n\n*Current Math Scope: \`${scopeDisplay}\`* (Engine: **math.js**).`;
    }

    // fallback to JS eval for simple numeric results
    const evalRes = eval(query);
    if (typeof evalRes === 'number' && isFinite(evalRes)) {
      return `The calculated result is: **${evalRes}** (Engine: **JS Eval**).`;
    }
    return null;
  } catch (err) {
    return "I had trouble calculating that expression or referencing a variable. Please check your math syntax.";
  }
}

// ---------------------------
// LOCAL KNOWLEDGE BASE
// ---------------------------
const KNOWLEDGE_BASE = [
  { keywords: ['hello', 'hi', 'hey', 'bonjour', 'salam'], response: "Hello! I am an advanced **client-side** simulator running entirely in your browser. I can answer local knowledge questions and perform **basic math**." },
  { keywords: ['how are you', 'how r u'], response: "I don't have feelings, but I am operating perfectly using only your browser's processing power! Ready for your next query." },
  { keywords: ['nice', 'cool', 'great answer', 'ok', 'thanks', 'thank you'], response: "You're very welcome! I'm glad I could assist. Feel free to ask another question." },
  { keywords: ['html', 'what html', 'define html'], response: "HTML stands for **HyperText Markup Language**. It is the standard markup language for documents designed to be displayed in a web browser. (Local knowledge confirmed.)" },
  { keywords: ['css', 'what css', 'define css', 'use css'], response: "CSS stands for **Cascading Style Sheets**. It is a style sheet language used for describing the presentation of a document written in HTML. (Local knowledge confirmed.)" },
  { keywords: ['javascript', 'js', 'programming'], response: "JavaScript is a high-level, interpreted scripting language that is primarily used for **client-side web development**." },
  { keywords: ['area of a circle', 'circle area formula'], response: "The area of a circle is calculated using the formula: $A = \\pi r^2$. Try a simple calculation like '2*5'." },
  { keywords: ['gravity', 'define gravity'], response: "Gravity is a fundamental force that attracts any objects with mass or energy. The constant is approximately $9.8 \\text{ m/s}^2$ on Earth." },
  { keywords: ['what model', 'model are you'], response: "I operate using a custom, **client-side JavaScript model** using keyword matching and hardcoded data." },
];

// ---------------------------
// CHATBOT CORE UI & LOGIC
// ---------------------------

async function sendMessage() {
  if (!userInput) return;
  const userText = userInput.value.trim();
  if (!userText) return;

  appendUserMessage(userText);
  saveCurrentChat(userText, null); // save user text

  userInput.value = '';
  userInput.disabled = true;

  const thinkingDiv = appendBotThinking();
  chatBox.scrollTop = chatBox.scrollHeight;

  // Attempt math first
  let finalResponse = clientSideMath(userText);

  // Local knowledge fallback
  if (!finalResponse) {
    finalResponse = getBotResponse(userText.toLowerCase());
  }

  // Generic fallback rewrite
  if (finalResponse === "I'm sorry, I can't process completely novel inputs like that or search the internet. I can answer questions about **Science, Math, Web Technologies, or my own simulated model**. Try asking: **'What is your model?'**") {
    finalResponse = `I am running entirely **client-side** and cannot fetch new information for '${userText}'. Please try a question about **Web Technologies** or a simple **math calculation** instead.`;
  }

  // Simulate thinking then display
  setTimeout(async () => {
    thinkingDiv.remove();

    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'message bot-message';
    botMessageDiv.innerHTML = finalResponse;
    chatBox.appendChild(botMessageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    lastResponse = finalResponse;
    saveCurrentChat(null, finalResponse);

    userInput.disabled = false;
    userInput.focus();

    // Render any math in the new bot message
    if (window.renderMathInElement) {
      try {
        renderMathInElement(botMessageDiv, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ]
        });
      } catch (e) {
        console.warn('KaTeX render failed:', e);
      }
    }

    renderSidebar(loadHistory());
  }, 800);
}

function appendUserMessage(text) {
  const userMessageDiv = document.createElement('div');
  userMessageDiv.className = 'message user-message';
  userMessageDiv.textContent = text;
  chatBox.appendChild(userMessageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendBotThinking() {
  const thinkingDiv = document.createElement('div');
  thinkingDiv.className = 'message bot-message thinking-message';
  thinkingDiv.innerHTML = '...Thinking and checking sources<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  chatBox.appendChild(thinkingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return thinkingDiv;
}

function getBotResponse(input) {
  const isQuestioningFact = input.includes('u sure') || input.includes('are you sure') || input.includes('is that true') || input.includes('really');
  if (isQuestioningFact) {
    if (lastResponse.includes('client-side simulator') || lastResponse.includes('local knowledge')) {
      return "Yes, I am certain. The information I provided is based on accurate, hardcoded data from my internal knowledge base.";
    } else {
      return "I can only confirm facts I've just stated. Could you repeat the specific piece of information you're questioning?";
    }
  }

  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some(keyword => input.includes(keyword))) {
      return item.response;
    }
  }

  return "I'm sorry, I can't process completely novel inputs like that or search the internet. I can answer questions about **Science, Math, Web Technologies, or my own simulated model**. Try asking: **'What is your model?'**";
}

// ---------------------------
// HISTORY (namespaced per user)
// ---------------------------

function userStorageKey(uid) {
  return `${HISTORY_ROOT_KEY}_${uid}`;
}

function loadHistory() {
  // Use currentSessionId and user-specific key
  const uid = auth.currentUser ? auth.currentUser.uid : 'anon';
  const key = userStorageKey(uid);
  const historyData = localStorage.getItem(key);
  const sessions = historyData ? JSON.parse(historyData) : {};

  // If currentSessionId not set, initialize one
  if (!currentSessionId) {
    currentSessionId = 'session_' + Date.now();
    if (!sessions[currentSessionId]) {
      sessions[currentSessionId] = [{
        type: 'bot',
        text: "Hello! I am an advanced JavaScript simulator with a vast knowledge base. Ask me anything."
      }];
      localStorage.setItem(key, JSON.stringify(sessions));
    }
  }

  return sessions;
}

function saveHistory(sessions) {
  const uid = auth.currentUser ? auth.currentUser.uid : 'anon';
  const key = userStorageKey(uid);
  localStorage.setItem(key, JSON.stringify(sessions));
  localStorage.setItem('currentSessionId', currentSessionId);
}

function renderChatBox(messages) {
  if (!chatBox) return;
  chatBox.innerHTML = '';
  (messages || []).forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.type}-message`;
    messageDiv.innerHTML = msg.text;
    chatBox.appendChild(messageDiv);

    if (msg.type === 'bot' && window.renderMathInElement) {
      try {
        renderMathInElement(messageDiv, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ]
        });
      } catch (e) {
        console.warn('KaTeX render error for history:', e);
      }
    }
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

function startNewChat() {
  saveCurrentChat(); // flush any pending
  currentSessionId = 'session_' + Date.now();
  lastResponse = '';

  // Clear math scope for the new chat
  Object.keys(mathScope).forEach(k => delete mathScope[k]);

  const newSession = [{
    type: 'bot',
    text: "New conversation started! I am an advanced JavaScript simulator with a vast knowledge base. **Math variables have been cleared.** Ask me anything."
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

  if (userText && userText.toLowerCase() !== 'no' && userText.toLowerCase() !== 'yes') {
    currentSession.push({ type: 'user', text: userText });
  }
  if (botResponse) {
    currentSession.push({ type: 'bot', text: botResponse });
  }

  if (currentSession.length > 0) {
    allSessions[currentSessionId] = currentSession;
    saveHistory(allSessions);
    if (userText || botResponse) {
      renderSidebar(allSessions);
    }
  }
}

function renderSidebar(sessions) {
  if (!chatList) return;
  chatList.innerHTML = '';
  const sessionKeys = Object.keys(sessions).reverse();

  let activeItemElement = null;

  sessionKeys.forEach(id => {
    const messages = sessions[id];
    const firstUserMsg = messages.find(m => m.type === 'user');
    const titleText = firstUserMsg ? (firstUserMsg.text.substring(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '')) : 'New Chat (Simulated)';

    const listItem = document.createElement('li');
    listItem.className = 'chat-item';
    if (id === currentSessionId) {
      listItem.classList.add('active');
      activeItemElement = listItem;
    }

    const titleSpan = document.createElement('span');
    titleSpan.className = 'chat-title';
    titleSpan.textContent = titleText;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-chat-btn';
    deleteBtn.textContent = '🗑️';

    titleSpan.addEventListener('click', () => switchChat(id, sessions));
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteChat(id);
    });

    listItem.dataset.sessionId = id;
    listItem.appendChild(titleSpan);
    listItem.appendChild(deleteBtn);

    chatList.appendChild(listItem);
  });

  if (activeItemElement) {
    activeItemElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function switchChat(sessionId, sessions) {
  saveCurrentChat();
  currentSessionId = sessionId;
  const messages = sessions[sessionId];
  renderChatBox(messages);

  document.querySelectorAll('.chat-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.sessionId === sessionId) {
      item.classList.add('active');
    }
  });

  lastResponse = messages[messages.length - 1]?.text || '';
}

function deleteChat(sessionIdToDelete) {
  if (!confirm("Are you sure you want to delete this chat history?")) return;

  const allSessions = loadHistory();
  delete allSessions[sessionIdToDelete];
  saveHistory(allSessions);

  if (sessionIdToDelete === currentSessionId) {
    const sessionKeys = Object.keys(allSessions).reverse();
    if (sessionKeys.length > 0) {
      switchChat(sessionKeys[0], allSessions);
    } else {
      startNewChat();
    }
  } else {
    renderSidebar(allSessions);
  }
}

// ---------------------------
// DRAG & DROP (same logic)
// ---------------------------
function setupDragAndDrop() {
  const dropTarget = document.querySelector('.chat-interface');
  const dropZone = document.getElementById('dropZone');
  if (!dropTarget || !dropZone) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropTarget.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  dropTarget.addEventListener('dragenter', (e) => {
    if (e.target.closest('.chat-interface') && !e.target.closest('.input-container')) {
      dropZone.classList.add('hover');
    }
  }, false);

  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('hover'), false);
  dropTarget.addEventListener('drop', () => dropZone.classList.remove('hover'), false);

  dropTarget.addEventListener('drop', handleDrop, false);

  function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    if (files.length === 0) return;

    const fileName = files[0].name;
    const fileSize = (files[0].size / 1024 / 1024).toFixed(2);

    const userDropMessage = `Attempting to upload file: ${fileName}`;
    let botDropResponse;

    if (fileName.toLowerCase().endsWith('.bat') || fileName.toLowerCase().endsWith('.exe')) {
      botDropResponse = `**SECURITY ALERT:** File **${fileName}** (${fileSize} MB) received. As a client-side simulator, I cannot execute or read this file for security reasons. The drag-and-drop feature works! Try asking about **CSS** instead.`;
    } else {
      botDropResponse = `File **${fileName}** (${fileSize} MB) received. As a client-side simulator, I cannot process the content, but the drag-and-drop feature works! Try a simple math question instead.`;
    }

    appendUserMessage(userDropMessage);
    userInput.disabled = true;

    setTimeout(() => {
      const botMessageDiv = document.createElement('div');
      botMessageDiv.className = 'message bot-message';
      botMessageDiv.innerHTML = botDropResponse;
      chatBox.appendChild(botMessageDiv);
      chatBox.scrollTop = chatBox.scrollHeight;

      saveCurrentChat(userDropMessage, botDropResponse);
      lastResponse = botDropResponse;

      userInput.disabled = false;
      userInput.focus();

      if (window.renderMathInElement) {
        try {
          renderMathInElement(botMessageDiv, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ]
          });
        } catch (e) { console.warn(e); }
      }
    }, 500);
  }
}

// ---------------------------
// SIDEBAR TOGGLE
// ---------------------------
function toggleSidebar() {
  const container = document.querySelector('.chatbot-container');
  if (!container) return;
  container.classList.toggle('sidebar-visible');

  if (window.innerWidth <= 1200 && container.classList.contains('sidebar-visible')) {
    const chatInterface = document.querySelector('.chat-interface');
    const clickAwayHandler = (e) => {
      if (!e.target.closest('.sidebar')) {
        toggleSidebar();
        chatInterface.removeEventListener('click', clickAwayHandler);
      }
    };
    setTimeout(() => {
      chatInterface.addEventListener('click', clickAwayHandler);
    }, 10);
  }
}

// ---------------------------
// PWA: Service Worker Register
// ---------------------------
if ('serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service worker registered', reg))
      .catch(err => console.warn('SW register failed:', err));
  } catch (e) {
    console.warn('Service worker registration error', e);
  }
}

// ---------------------------
// AUTH UI & HANDLERS
// ---------------------------

async function onSignInClick() {
  try {
    await signInWithPopup(auth, provider);
    // onAuthStateChanged will handle UI transition
  } catch (err) {
    console.error('Sign-in error', err);
    alert('Sign-in failed: ' + (err.message || err));
  }
}

async function onSignOutClick() {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign-out failed', e);
  }
}

// ---------------------------
// INITIALIZATION & BOOT
// ---------------------------

async function initializeChatbot() {
  // Query UI elements (required elements)
  signInButton = document.getElementById('googleSignInBtn') || document.getElementById('googleSignIn'); // support both ids
  signOutButton = document.getElementById('signOutBtn');
  disconnectButton = document.getElementById('revokeBtn');
  authStatusEl = document.getElementById('authStatus');

  chatbotContainer = document.querySelector('.chatbot-container');
  authPanel = document.querySelector('.auth-panel'); // optional: if you have a dedicated auth panel
  chatBox = document.getElementById('chatBox');
  userInput = document.getElementById('userInput');
  sidebarToggle = document.getElementById('sidebarToggle');
  newChatBtn = document.querySelector('.new-chat-btn');
  chatList = document.querySelector('.chat-list');

  // Wire input send -> Enter key + send button if present
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }
  if (userInput) {
    userInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') sendMessage();
    });
  }

  if (newChatBtn) newChatBtn.addEventListener('click', startNewChat);
  if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);

  // Sign-in/out wiring
  if (signInButton) signInButton.addEventListener('click', onSignInClick);
  if (signOutButton) signOutButton.addEventListener('click', onSignOutClick);

  // Setup drag & drop
  setupDragAndDrop();

  // Load mathjs & KaTeX for rendering
  await ensureMathJS().catch(e => console.warn('math.js load failed', e));
  await ensureKaTeX().catch(e => console.warn('KaTeX load failed', e));

  // Auth state handling: lock chatbot until logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User signed in: initialize session namespacing
      const uid = user.uid;
      currentSessionId = localStorage.getItem('currentSessionId') || 'session_' + Date.now();
      // Ensure sessions exist for this user
      const sessions = loadHistory();
      if (!sessions[currentSessionId]) {
        // Try to set a more meaningful session id (first available)
        const keys = Object.keys(sessions);
        if (keys.length > 0) currentSessionId = keys[0];
      }

      // Update UI: show chatbot container, hide auth panel if present
      if (chatbotContainer) chatbotContainer.style.display = '';
      if (authPanel) authPanel.style.display = 'none';
      if (authStatusEl) authStatusEl.textContent = `Signed in as ${user.displayName || user.email}`;

      // Personalize storage key namespace and render UI
      renderSidebar(sessions);
      renderChatBox(sessions[currentSessionId]);
      // Ensure math scope exists (persisted per user is in memory here)
      // We keep mathScope ephemeral per page load; clear on new chat
    } else {
      // Signed out: hide chatbot and show sign-in instructions
      if (chatbotContainer) chatbotContainer.style.display = 'none';
      if (authPanel) authPanel.style.display = '';
      if (authStatusEl) authStatusEl.textContent = 'Not signed in. Sign in with Google to continue.';
      // Optionally show a lightweight sign-in prompt in-page
    }
  });

  // On initial load, set chatbot hidden until auth processed
  if (chatbotContainer) chatbotContainer.style.display = 'none';
}

// ---------------------------
// DOMContentLoaded boot
// ---------------------------
document.addEventListener('DOMContentLoaded', async () => {
  await initializeChatbot();
});
