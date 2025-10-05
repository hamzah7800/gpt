/* Custom D3 Tooltip Style */
.d3-tooltip {
    position: absolute;
    text-align: center;
    padding: 8px;
    font: 12px sans-serif;
    background: #374151; /* bg-gray-700 */
    color: white;
    border: 0px;
    border-radius: 4px;
    pointer-events: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
    z-index: 100;
}

/* Custom Styles for D3 Axes/Ticks */
/* This overrides default D3 styles to match the dark theme */
#d3-chart-container .tick line,
#d3-chart-container .domain {
    stroke: #4b5563; /* Tailwind gray-600 for subtle lines */
}

#d3-chart-container text {
    fill: #d1d5db; /* Tailwind gray-300 for tick labels */
}

/* Custom Input Field Focus Glow (Example) */
#user-input:focus {
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.5); /* Teal glow */
}

/* Basic Chat Bubble Animation */
.message-bubble {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
