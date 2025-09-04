export interface UserTurn {
  id: string;
  el: Element;
  text: string;
  index: number;
}

// Primary selector for user turns
const USER_TURN_SELECTOR = 'article[data-turn="user"]';
const FALLBACK_SELECTORS = [
  '[data-turn="user"]',
  'article[data-testid^="conversation-turn"][data-turn="user"]',
];

/**
 * Scans the DOM for user turns and returns them in order
 */
export function queryUserTurns(): UserTurn[] {
  const turns: UserTurn[] = [];

  // Try primary selector first
  let elements = document.querySelectorAll(USER_TURN_SELECTOR);

  // Fallback to other selectors if primary doesn't work
  if (elements.length === 0) {
    for (const selector of FALLBACK_SELECTORS) {
      elements = document.querySelectorAll(selector);
      if (elements.length > 0) break;
    }
  }

  elements.forEach((el, index) => {
    // Only process visible elements
    if (!isElementVisible(el)) return;

    const text = extractTextContent(el);
    if (!text.trim()) return;

    // Generate stable ID
    const id = generateStableId(el, text, index);

    turns.push({
      id,
      el,
      text: text.trim(),
      index,
    });
  });

  return turns;
}

/**
 * Extracts clean text content from an element, removing UI artifacts
 */
function extractTextContent(el: Element): string {
  // Clone the element to avoid modifying the original
  const clone = el.cloneNode(true) as Element;

  // Remove common UI elements that shouldn't be in the prompt text
  const elementsToRemove = clone.querySelectorAll(
    'button, .copy-button, [data-testid*="copy"], .action-button, .timestamp, .message-actions, .sr-only, [class*="sr-only"], h5.sr-only'
  );
  elementsToRemove.forEach((el) => el.remove());

  return clone.textContent || "";
}

/**
 * Generates a stable ID for an element
 */
function generateStableId(el: Element, text: string, index: number): string {
  // Try to use existing data attributes
  const turnId = el.getAttribute("data-turn-id");
  if (turnId) return turnId;

  const testId = el.getAttribute("data-testid");
  if (testId) return testId;

  // Generate deterministic hash from text and index
  const hash = simpleHash(text + index.toString());
  return `prompt-${hash}`;
}

/**
 * Simple hash function for generating stable IDs
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Checks if an element is visible in the viewport
 */
function isElementVisible(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0"
  );
}

/**
 * Highlights an element temporarily and scrolls to it
 */
export function highlightElement(el: Element): void {
  // Scroll to element
  el.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  // Add highlight class
  el.classList.add("promptpeek-highlight");

  // Remove highlight after 2 seconds
  setTimeout(() => {
    el.classList.remove("promptpeek-highlight");
  }, 2000);
}

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
}

/**
 * Creates a MutationObserver to watch for new user turns
 */
export function createMutationObserver(callback: () => void): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;

    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        // Check if any added nodes contain user turns
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (
              element.matches &&
              (element.matches(USER_TURN_SELECTOR) ||
                element.querySelector(USER_TURN_SELECTOR))
            ) {
              shouldUpdate = true;
            }
          }
        });
      }
    });

    if (shouldUpdate) {
      // Debounce updates
      setTimeout(callback, 100);
    }
  });

  return observer;
}

/**
 * Gets the size of a panel element for bounds calculations
 */
export function getPanelSize(el: HTMLElement): {
  width: number;
  height: number;
} {
  const rect = el.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Clamps panel position to stay within viewport bounds
 */
export function clampToViewport(
  x: number,
  y: number,
  panelWidth: number,
  panelHeight: number,
  viewportWidth: number = window.innerWidth,
  viewportHeight: number = window.innerHeight,
  padding: number = 10
): { x: number; y: number } {
  const minX = padding;
  const minY = padding;
  const maxX = viewportWidth - panelWidth - padding;
  const maxY = viewportHeight - panelHeight - padding;

  return {
    x: Math.max(minX, Math.min(x, maxX)),
    y: Math.max(minY, Math.min(y, maxY)),
  };
}

/**
 * Starts observing the conversation area for changes
 */
export function startObservingConversation(
  callback: () => void
): MutationObserver {
  const observer = createMutationObserver(callback);

  // Find the main conversation container
  const conversationSelectors = [
    '[data-testid="conversation-turn"]',
    "main",
    '[role="main"]',
    ".conversation-container",
  ];

  let targetElement: Element | null = null;
  for (const selector of conversationSelectors) {
    targetElement = document.querySelector(selector);
    if (targetElement) break;
  }

  if (targetElement) {
    observer.observe(targetElement, {
      childList: true,
      subtree: true,
    });
  } else {
    // Fallback to document body
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  return observer;
}
