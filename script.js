// ... (Previous JavaScript content remains the same up to initialization) ...
// =================================================================
// 🧠 FINAL INTEGRATED JAVASCRIPT: LOCAL KNOWLEDGE + MATH.JS (100% Client-Side)
// =================================================================

// ... (KNOWLEDGE_BASE and math functions remain the same) ...

// ... (CORE UI LOGIC remains the same, except for the new function below) ...

// ... (HISTORY MANAGER & SIDEBAR LOGIC remains the same) ...

// -----------------------------------------------------------------
// NEW: SIDEBAR TOGGLE LOGIC
// -----------------------------------------------------------------

function toggleSidebar() {
    const container = document.querySelector('.chatbot-container');
    
    // On large screens, we toggle the 'sidebar-visible' class
    if (window.innerWidth > 1200) {
        container.classList.toggle('sidebar-visible');
    } 
    // On small screens, we toggle the 'sidebar-toggled' class for the overlay/absolute positioning effect
    else {
        container.classList.toggle('sidebar-toggled');
        
        // Add a click handler to close the sidebar when the overlay is clicked
        if (container.classList.contains('sidebar-toggled')) {
            const overlay = document.querySelector('.chat-interface::after');
            if (overlay) {
                 // Simple trick to close when clicking outside the sidebar on mobile
                 overlay.addEventListener('click', toggleSidebar, { once: true });
            }
        }
    }
}

// -----------------------------------------------------------------
// INITIALIZATION
// -----------------------------------------------------------------

function initializeChatbot() {
    const newChatBtn = document.querySelector('.new-chat-btn');
    const toggleBtn = document.getElementById('sidebarToggle'); // NEW
    
    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChat);
    }
    
    if (toggleBtn) { // NEW: Add listener for the new toggle button
        toggleBtn.addEventListener('click', toggleSidebar);
    }
    
    // Initial state: Hide sidebar on small devices by default
    if (window.innerWidth <= 1200) {
        document.querySelector('.chatbot-container').classList.remove('sidebar-visible');
    }
    
    const sessions = loadHistory();
    renderSidebar(sessions);
    renderChatBox(sessions[currentSessionId]);
    
    setupDragAndDrop();
}

document.addEventListener('DOMContentLoaded', initializeChatbot);
