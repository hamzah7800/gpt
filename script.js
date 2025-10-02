// script.js

function renderSidebar(sessions) {
    const chatList = document.querySelector('.chat-list');
    if (!chatList) return; 

    chatList.innerHTML = '';
    const sessionKeys = Object.keys(sessions).reverse(); // Show newest at the top
    
    let activeItemElement = null;

    sessionKeys.forEach(id => {
        const messages = sessions[id];
        const firstUserMsg = messages.find(m => m.type === 'user');
        const titleText = firstUserMsg ? firstUserMsg.text.substring(0, 30) + '...' : 'New Chat (Simulated)';

        const listItem = document.createElement('li');
        listItem.className = 'chat-item';
        if (id === currentSessionId) {
            listItem.classList.add('active');
            activeItemElement = listItem; 
        }
        
        // --- NEW: Title Span ---
        const titleSpan = document.createElement('span');
        titleSpan.className = 'chat-title';
        titleSpan.textContent = titleText;
        
        // --- NEW: Delete Button ---
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-chat-btn';
        deleteBtn.textContent = '🗑️'; // Trash can emoji for delete
        deleteBtn.dataset.sessionId = id;
        
        // Attach event listeners
        titleSpan.addEventListener('click', () => switchChat(id, sessions));
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents switching chat when clicking delete
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

// --- NEW FUNCTION: DELETE CHAT LOGIC ---
function deleteChat(sessionIdToDelete) {
    if (!confirm("Are you sure you want to delete this chat history?")) {
        return;
    }

    const allSessions = loadHistory();
    
    // 1. Delete the session from the sessions object
    delete allSessions[sessionIdToDelete];

    // 2. Save the updated history to localStorage
    saveHistory(allSessions);

    // 3. Handle UI update and switching the current chat
    if (sessionIdToDelete === currentSessionId) {
        // If the user deleted the currently active chat, start a new one
        const sessionKeys = Object.keys(allSessions);
        if (sessionKeys.length > 0) {
            // Switch to the first available chat
            switchChat(sessionKeys[0], allSessions); 
        } else {
            // No chats left, start a brand new session
            startNewChat();
        }
    } else {
        // Just re-render the sidebar to show the deletion
        renderSidebar(allSessions);
    }
}
// End of new/updated functions
