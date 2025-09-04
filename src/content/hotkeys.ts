/**
 * Hotkey management for the extension
 */

let isPanelVisible = false;
let toggleCallback: (() => void) | null = null;

/**
 * Initializes hotkey listeners
 */
export function initHotkeys(onToggle: () => void): void {
  toggleCallback = onToggle;

  // Listen for Alt+P key combination
  document.addEventListener("keydown", handleKeyDown);
}

/**
 * Cleans up hotkey listeners
 */
export function cleanupHotkeys(): void {
  document.removeEventListener("keydown", handleKeyDown);
  toggleCallback = null;
}

/**
 * Handles keydown events for hotkeys
 */
function handleKeyDown(event: KeyboardEvent): void {
  // Check for Alt+P combination
  if (event.altKey && event.key.toLowerCase() === "p") {
    event.preventDefault();
    event.stopPropagation();

    if (toggleCallback) {
      toggleCallback();
    }
  }
}

/**
 * Sets the current panel visibility state
 */
export function setPanelVisibility(visible: boolean): void {
  isPanelVisible = visible;
}

/**
 * Gets the current panel visibility state
 */
export function getPanelVisibility(): boolean {
  return isPanelVisible;
}
