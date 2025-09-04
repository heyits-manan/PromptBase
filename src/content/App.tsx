import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  queryUserTurns,
  highlightElement,
  copyToClipboard,
  startObservingConversation,
  getPanelSize,
  clampToViewport,
} from "./dom";
import type { UserTurn } from "./dom";
import { setPanelVisibility } from "./hotkeys";

interface PromptItemProps {
  prompt: UserTurn;
  onJump: (prompt: UserTurn) => void;
  onCopy: (prompt: UserTurn) => void;
  isDarkTheme: boolean;
}

const PromptItem: React.FC<PromptItemProps> = ({
  prompt,
  onJump,
  onCopy,
  isDarkTheme,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(prompt.text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    onCopy(prompt);
  };

  const handleJump = () => {
    onJump(prompt);
  };

  return (
    <div
      className={`border-b last:border-b-0 p-3 transition-colors ${
        isDarkTheme
          ? "border-gray-700 hover:bg-gray-800"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-mono ${
                isDarkTheme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              #{prompt.index + 1}
            </span>
          </div>
          <div
            className={`text-sm leading-relaxed ${
              isDarkTheme ? "text-gray-200" : "text-gray-800"
            } ${isExpanded ? "" : "line-clamp-3"}`}
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ cursor: "pointer" }}
          >
            {prompt.text}
          </div>
        </div>
        <div className="flex gap-1 ml-2">
          <button
            onClick={handleJump}
            className={`p-1.5 rounded transition-colors ${
              isDarkTheme
                ? "text-gray-400 hover:text-blue-400 hover:bg-blue-900/20"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            }`}
            title="Jump to prompt"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
          <button
            onClick={handleCopy}
            className={`p-1.5 rounded transition-colors ${
              copied
                ? isDarkTheme
                  ? "text-green-400 bg-green-900/20"
                  : "text-green-600 bg-green-50"
                : isDarkTheme
                ? "text-gray-400 hover:text-green-400 hover:bg-green-900/20"
                : "text-gray-500 hover:text-green-600 hover:bg-green-50"
            }`}
            title={copied ? "Copied!" : "Copy prompt"}
          >
            {copied ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [prompts, setPrompts] = useState<UserTurn[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    // Check localStorage for saved theme preference
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("promptpeek-theme");
      return saved === "dark";
    }
    return false;
  });
  const [translateX, setTranslateX] = useState(() => {
    // Initialize to right side of screen
    return typeof window !== "undefined" ? window.innerWidth - 320 - 16 : 0;
  });
  const [translateY, setTranslateY] = useState(0);
  const [panelSize, setPanelSize] = useState({ width: 320, height: 400 }); // Default panel size
  const panelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Load prompts from DOM
  const loadPrompts = () => {
    console.log("PromptBase App: Loading prompts...");
    const newPrompts = queryUserTurns();
    console.log("PromptBase App: Found", newPrompts.length, "prompts");
    setPrompts(newPrompts);

    // If we found prompts and panel is not visible, make it visible
    if (newPrompts.length > 0 && !isVisible) {
      console.log("PromptBase App: Found prompts, making panel visible");
      setIsVisible(true);
    }
  };

  // Handle jump to prompt
  const handleJump = (prompt: UserTurn) => {
    highlightElement(prompt.el);
  };

  // Handle copy prompt
  const handleCopy = (_prompt: UserTurn) => {
    // Additional logic if needed
  };

  // Toggle panel visibility
  const toggleVisibility = () => {
    const newVisibility = !isVisible;
    console.log(
      "PromptBase App: Toggling visibility from",
      isVisible,
      "to",
      newVisibility
    );
    setIsVisible(newVisibility);
    setPanelVisibility(newVisibility);

    if (newVisibility) {
      loadPrompts();
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadPrompts();
  };

  // Handle close
  const handleClose = () => {
    console.log("PromptBase App: Closing panel");
    setIsVisible(false);
    setPanelVisibility(false);
  };

  // Handle collapse toggle
  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    localStorage.setItem("promptpeek-theme", newTheme ? "dark" : "light");
  };

  // Measure panel size and update state
  const updatePanelSize = useCallback(() => {
    if (panelRef.current) {
      const size = getPanelSize(panelRef.current);
      setPanelSize(size);
    }
  }, []);

  // Clamp current position to viewport bounds
  const clampCurrentPosition = useCallback(() => {
    const clamped = clampToViewport(
      translateX,
      translateY,
      panelSize.width,
      panelSize.height
    );
    setTranslateX(clamped.x);
    setTranslateY(clamped.y);
  }, [translateX, translateY, panelSize.width, panelSize.height]);

  // Handle pointer down on drag handle
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as HTMLElement;

      // Only allow dragging from the header area, not from buttons
      const isHeader = target.closest(".panel-header");
      const isButton = target.closest("button");

      if (!isHeader || isButton) return;

      e.preventDefault();
      e.stopPropagation();

      // Set pointer capture for smooth dragging
      if (panelRef.current) {
        panelRef.current.setPointerCapture(e.pointerId);
      }

      setIsDragging(true);

      // Store initial drag state
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        offsetX: translateX,
        offsetY: translateY,
      };
    },
    [translateX, translateY]
  );

  // Handle pointer move during drag
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging || !dragStartRef.current) return;

      e.preventDefault();

      // Calculate new position directly for immediate response
      const deltaX = e.clientX - dragStartRef.current!.x;
      const deltaY = e.clientY - dragStartRef.current!.y;

      const newX = dragStartRef.current!.offsetX + deltaX;
      const newY = dragStartRef.current!.offsetY + deltaY;

      // Simple bounds checking for better performance
      const padding = 10;
      const minX = padding;
      const minY = padding;
      const maxX = window.innerWidth - panelSize.width - padding;
      const maxY = window.innerHeight - panelSize.height - padding;

      const clampedX = Math.max(minX, Math.min(newX, maxX));
      const clampedY = Math.max(minY, Math.min(newY, maxY));

      setTranslateX(clampedX);
      setTranslateY(clampedY);
    },
    [isDragging, panelSize.width, panelSize.height]
  );

  // Handle pointer up to end drag
  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!isDragging) return;

      e.preventDefault();

      // Release pointer capture
      if (panelRef.current) {
        panelRef.current.releasePointerCapture(e.pointerId);
      }

      setIsDragging(false);
      dragStartRef.current = null;
    },
    [isDragging]
  );

  // Handle window resize to re-clamp position
  const handleResize = useCallback(() => {
    updatePanelSize();
    // Use a small delay to ensure panel size is updated
    setTimeout(clampCurrentPosition, 100);
  }, [updatePanelSize, clampCurrentPosition]);

  // Initialize
  useEffect(() => {
    console.log("PromptBase App: Initializing...");
    console.log("PromptBase App: isVisible =", isVisible);

    // Set up pointer event listeners for dragging
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);

    // Set up window resize listener
    window.addEventListener("resize", handleResize);

    // Set up mutation observer
    observerRef.current = startObservingConversation(loadPrompts);

    // Initial load
    loadPrompts();

    // Set up hotkey toggle
    const handleHotkeyToggle = () => {
      console.log("PromptBase App: Hotkey toggle triggered");
      toggleVisibility();
    };

    // Listen for hotkey events
    window.addEventListener("promptpeek-toggle", handleHotkeyToggle);

    // Listen for refresh events (navigation)
    const handleRefresh = () => {
      console.log(
        "PromptBase App: Refresh event received, reloading prompts..."
      );
      loadPrompts();
    };
    window.addEventListener("promptpeek-refresh", handleRefresh);

    // Also set up direct hotkey listener as backup
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "p") {
        console.log("PromptBase App: Alt+P pressed");
        event.preventDefault();
        event.stopPropagation();
        toggleVisibility();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", handleKeyDown);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      window.removeEventListener("promptpeek-toggle", handleHotkeyToggle);
      window.removeEventListener("promptpeek-refresh", handleRefresh);
    };
  }, [handlePointerMove, handlePointerUp, handleResize]);

  // Initial position is now set in state initialization

  // Measure panel size when it becomes visible and clamp position
  useEffect(() => {
    if (isVisible && panelRef.current) {
      // Use a small delay to ensure the panel is fully rendered
      const timer = setTimeout(() => {
        updatePanelSize();
        // Clamp position after measuring size to ensure panel is within bounds
        setTimeout(clampCurrentPosition, 50);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, updatePanelSize, clampCurrentPosition]);

  // Don't render if not visible
  if (!isVisible) {
    console.log("PromptBase App: Not visible, not rendering");
    return null;
  }

  console.log(
    "PromptBase App: Rendering panel with",
    prompts.length,
    "prompts"
  );

  return (
    <div
      ref={panelRef}
      className={`fixed w-80 rounded-lg shadow-lg border z-9999 select-none pointer-events-auto promptpeek-panel will-change-transform ${
        isDarkTheme ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      } ${isDragging ? "cursor-grabbing" : "cursor-move"}`}
      style={{
        maxHeight: "90vh",
        top: "16px",
        left: "16px",
        transform: `translate(${translateX}px, ${translateY}px)`,
        userSelect: isDragging ? "none" : "auto",
      }}
      onPointerDown={handlePointerDown}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-3 border-b rounded-t-lg panel-header ${
          isDarkTheme
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <h3
          className={`text-sm font-semibold cursor-move ${
            isDarkTheme ? "text-gray-100" : "text-gray-800"
          }`}
        >
          Your Prompts
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleThemeToggle}
            onPointerDown={(e) => e.stopPropagation()}
            className={`p-1.5 rounded transition-colors ${
              isDarkTheme
                ? "text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/20"
                : "text-gray-500 hover:text-yellow-600 hover:bg-yellow-50"
            }`}
            title={
              isDarkTheme ? "Switch to light theme" : "Switch to dark theme"
            }
          >
            {isDarkTheme ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
          <button
            onClick={handleRefresh}
            onPointerDown={(e) => e.stopPropagation()}
            className={`p-1.5 rounded transition-colors ${
              isDarkTheme
                ? "text-gray-400 hover:text-blue-400 hover:bg-blue-900/20"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            }`}
            title="Refresh prompts"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            onClick={handleCollapse}
            onPointerDown={(e) => e.stopPropagation()}
            className={`p-1.5 rounded transition-colors ${
              isDarkTheme
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                isCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <button
            onClick={handleClose}
            onPointerDown={(e) => e.stopPropagation()}
            className={`p-1.5 rounded transition-colors ${
              isDarkTheme
                ? "text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                : "text-gray-500 hover:text-red-600 hover:bg-red-50"
            }`}
            title="Close panel"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(50vh - 60px)" }}
        >
          {prompts.length === 0 ? (
            <div
              className={`p-4 text-center text-sm ${
                isDarkTheme ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No prompts found in current conversation
            </div>
          ) : (
            prompts.map((prompt) => (
              <PromptItem
                key={prompt.id}
                prompt={prompt}
                onJump={handleJump}
                onCopy={handleCopy}
                isDarkTheme={isDarkTheme}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default App;
