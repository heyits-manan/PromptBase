import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Global state
let isInitialized = false;
let root: any = null;
let container: HTMLElement | null = null;

/**
 * Creates a shadow DOM container for the React app
 */
function createShadowContainer(): HTMLElement {
  // Check if already exists
  const existing = document.getElementById("promptpeek-root");
  if (existing) {
    return existing;
  }

  // Create container
  const container = document.createElement("div");
  container.id = "promptpeek-root";
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  `;

  // Create shadow DOM
  const shadowRoot = container.attachShadow({ mode: "open" });

  // Create styles element and inject Tailwind CSS
  const styles = document.createElement("style");
  styles.textContent = `
    /* Tailwind CSS Reset and Base */
    *, ::before, ::after {
      box-sizing: border-box;
      border-width: 0;
      border-style: solid;
      border-color: #e5e7eb;
    }
    
    /* Essential Tailwind Classes */
    .fixed { position: fixed !important; }
    .absolute { position: absolute !important; }
    .relative { position: relative !important; }
    .top-4 { top: 1rem !important; }
    .right-4 { right: 1rem !important; }
    .w-80 { width: 20rem !important; }
    .bg-white { background-color: #ffffff !important; }
    .rounded-lg { border-radius: 0.5rem !important; }
    .shadow-lg { 
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important; 
    }
    .border { border-width: 1px !important; }
    .border-gray-200 { border-color: #e5e7eb !important; }
    .z-9999 { z-index: 9999 !important; }
    .select-none { user-select: none !important; }
    .pointer-events-auto { pointer-events: auto !important; }
    .pointer-events-none { pointer-events: none !important; }
    
    /* Flexbox */
    .flex { display: flex !important; }
    .items-center { align-items: center !important; }
    .items-start { align-items: flex-start !important; }
    .justify-between { justify-content: space-between !important; }
    .gap-1 { gap: 0.25rem !important; }
    .gap-2 { gap: 0.5rem !important; }
    .flex-1 { flex: 1 1 0% !important; }
    .min-w-0 { min-width: 0px !important; }
    .ml-2 { margin-left: 0.5rem !important; }
    .mb-1 { margin-bottom: 0.25rem !important; }
    
    /* Spacing */
    .p-3 { padding: 0.75rem !important; }
    .p-4 { padding: 1rem !important; }
    .p-1\.5 { padding: 0.375rem !important; }
    
    /* Text */
    .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
    .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
    .font-semibold { font-weight: 600 !important; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace !important; }
    .text-gray-800 { color: #1f2937 !important; }
    .text-gray-500 { color: #6b7280 !important; }
    .text-gray-700 { color: #374151 !important; }
    .text-gray-100 { color: #f3f4f6 !important; }
    .text-gray-200 { color: #e5e7eb !important; }
    .text-gray-400 { color: #9ca3af !important; }
    .text-blue-600 { color: #2563eb !important; }
    .text-blue-400 { color: #60a5fa !important; }
    .text-green-600 { color: #16a34a !important; }
    .text-green-400 { color: #4ade80 !important; }
    .text-red-600 { color: #dc2626 !important; }
    .text-red-400 { color: #f87171 !important; }
    .text-yellow-400 { color: #facc15 !important; }
    .text-yellow-600 { color: #ca8a04 !important; }
    .text-center { text-align: center !important; }
    .leading-relaxed { line-height: 1.625 !important; }
    
    /* Backgrounds */
    .bg-gray-50 { background-color: #f9fafb !important; }
    .bg-blue-50 { background-color: #eff6ff !important; }
    .bg-green-50 { background-color: #f0fdf4 !important; }
    .bg-red-50 { background-color: #fef2f2 !important; }
    .bg-gray-100 { background-color: #f3f4f6 !important; }
    .bg-gray-800 { background-color: #1f2937 !important; }
    .bg-gray-900 { background-color: #111827 !important; }
    .bg-yellow-50 { background-color: #fefce8 !important; }
    .bg-yellow-900\/20 { background-color: rgba(113, 63, 18, 0.2) !important; }
    .bg-blue-900\/20 { background-color: rgba(30, 58, 138, 0.2) !important; }
    .bg-green-900\/20 { background-color: rgba(20, 83, 45, 0.2) !important; }
    .bg-red-900\/20 { background-color: rgba(127, 29, 29, 0.2) !important; }
    
    /* Hover states */
    .hover\\:bg-gray-50:hover { background-color: #f9fafb !important; }
    .hover\\:bg-blue-50:hover { background-color: #eff6ff !important; }
    .hover\\:bg-green-50:hover { background-color: #f0fdf4 !important; }
    .hover\\:bg-red-50:hover { background-color: #fef2f2 !important; }
    .hover\\:bg-gray-100:hover { background-color: #f3f4f6 !important; }
    .hover\\:bg-gray-700:hover { background-color: #374151 !important; }
    .hover\\:bg-gray-800:hover { background-color: #1f2937 !important; }
    .hover\\:bg-yellow-50:hover { background-color: #fefce8 !important; }
    .hover\\:bg-yellow-900\/20:hover { background-color: rgba(113, 63, 18, 0.2) !important; }
    .hover\\:bg-blue-900\/20:hover { background-color: rgba(30, 58, 138, 0.2) !important; }
    .hover\\:bg-green-900\/20:hover { background-color: rgba(20, 83, 45, 0.2) !important; }
    .hover\\:bg-red-900\/20:hover { background-color: rgba(127, 29, 29, 0.2) !important; }
    .hover\\:text-blue-600:hover { color: #2563eb !important; }
    .hover\\:text-blue-400:hover { color: #60a5fa !important; }
    .hover\\:text-green-600:hover { color: #16a34a !important; }
    .hover\\:text-green-400:hover { color: #4ade80 !important; }
    .hover\\:text-red-600:hover { color: #dc2626 !important; }
    .hover\\:text-red-400:hover { color: #f87171 !important; }
    .hover\\:text-gray-700:hover { color: #374151 !important; }
    .hover\\:text-gray-200:hover { color: #e5e7eb !important; }
    .hover\\:text-yellow-400:hover { color: #facc15 !important; }
    .hover\\:text-yellow-600:hover { color: #ca8a04 !important; }
    
    /* Borders */
    .border-b { border-bottom-width: 1px !important; }
    .last\\:border-b-0:last-child { border-bottom-width: 0px !important; }
    .rounded { border-radius: 0.25rem !important; }
    .border-gray-200 { border-color: #e5e7eb !important; }
    .border-gray-700 { border-color: #374151 !important; }
    
    /* Transitions */
    .transition-colors { 
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke !important;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
      transition-duration: 150ms !important;
    }
    .transition-transform { 
      transition-property: transform !important;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
      transition-duration: 150ms !important;
    }
    
    /* Transform */
    .rotate-180 { transform: rotate(180deg) !important; }
    
    /* Overflow */
    .overflow-y-auto { overflow-y: auto !important; }
    
    /* SVG */
    .w-4 { width: 1rem !important; }
    .h-4 { height: 1rem !important; }
    
    /* Line clamp */
    .line-clamp-3 {
      display: -webkit-box !important;
      -webkit-line-clamp: 3 !important;
      -webkit-box-orient: vertical !important;
      overflow: hidden !important;
    }
    
    /* Custom styles */
    .promptpeek-highlight {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px !important;
      background-color: rgba(59, 130, 246, 0.1) !important;
      transition: all 0.3s ease !important;
    }
    
    /* Ensure buttons and interactive elements work */
    button {
      pointer-events: auto !important;
      cursor: pointer !important;
      background: transparent !important;
      border: none !important;
      outline: none !important;
      transition: all 0.15s ease !important;
    }
    
    /* Button hover and active states */
    button:hover {
      transform: scale(1.05) !important;
      opacity: 0.8 !important;
    }
    
    button:active {
      transform: scale(0.95) !important;
      opacity: 0.6 !important;
    }
    
    /* Button focus states */
    button:focus {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px !important;
    }
    
    /* Specific button styling */
    .p-1\.5 {
      padding: 0.375rem !important;
      border-radius: 0.25rem !important;
    }
    
    
    /* Make sure the panel container allows pointer events */
    .promptpeek-panel {
      pointer-events: auto !important;
      transition: box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease !important;
    }
    
    /* Dragging styles */
    .cursor-move {
      cursor: move !important;
    }
    
    .cursor-grabbing {
      cursor: grabbing !important;
    }
    
    .panel-header {
      user-select: none !important;
    }
    
    /* Visual feedback when dragging */
    .promptpeek-panel.dragging {
      opacity: 0.8 !important;
      transform: scale(1.02) !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
    }
    
    /* Transform utilities */
    .will-change-transform {
      will-change: transform !important;
    }
    
    /* Scale and shadow utilities */
    .scale-105 { transform: scale(1.05) !important; }
    .shadow-2xl { 
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important; 
    }
    
    /* Scrollbar */
    .overflow-y-auto::-webkit-scrollbar {
      width: 6px;
    }
    .overflow-y-auto::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 3px;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `;
  shadowRoot.appendChild(styles);

  // Create React mount point
  const reactMount = document.createElement("div");
  reactMount.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  `;
  shadowRoot.appendChild(reactMount);

  // Append to document
  document.body.appendChild(container);

  return reactMount;
}

/**
 * Initializes the extension
 */
function initializeExtension(): void {
  if (isInitialized) return;

  try {
    // Create shadow container
    container = createShadowContainer();

    // Create React root
    root = createRoot(container);

    // Render the app
    root.render(React.createElement(App));

    // Hotkeys are now handled directly in the App component

    isInitialized = true;
    console.log("PromptBase extension initialized");
  } catch (error) {
    console.error("Failed to initialize PromptBase extension:", error);
  }
}

/**
 * Checks if we're on a ChatGPT page
 */
function isChatGPTPage(): boolean {
  const hostname = window.location.hostname;
  return hostname === "chatgpt.com" || hostname === "chat.openai.com";
}

/**
 * Handles page navigation (SPA routing)
 */
function handleNavigation(): void {
  console.log("PromptBase: Navigation detected, refreshing prompts...");

  // Don't cleanup the extension, just refresh the prompts
  if (isInitialized && root) {
    // Dispatch a custom event to refresh prompts
    window.dispatchEvent(new CustomEvent("promptpeek-refresh"));
  } else {
    // If not initialized, initialize now
    setTimeout(() => {
      if (isChatGPTPage()) {
        initializeExtension();
      }
    }, 500);
  }
}

/**
 * Main initialization
 */
function main(): void {
  // Check if we're on a ChatGPT page
  if (!isChatGPTPage()) {
    return;
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeExtension);
  } else {
    initializeExtension();
  }

  // Handle SPA navigation
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      handleNavigation();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Also listen for popstate events
  window.addEventListener("popstate", handleNavigation);

  // Listen for pushState/replaceState (SPA navigation)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(history, args);
    setTimeout(handleNavigation, 100);
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(history, args);
    setTimeout(handleNavigation, 100);
  };

  // Periodic check to ensure extension stays alive
  setInterval(() => {
    if (isChatGPTPage() && !isInitialized) {
      console.log("PromptBase: Periodic check - reinitializing extension");
      initializeExtension();
    }
  }, 5000);
}

// Start the extension
main();
