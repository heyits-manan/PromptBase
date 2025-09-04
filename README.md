# PromptBase - Chrome Extension for ChatGPT

A minimal Chrome Extension that displays your prompts in a floating panel on ChatGPT pages. Built with React, TypeScript, and Tailwind CSS.

## Features

- 🎯 **Floating Panel**: Displays user prompts in a draggable panel anchored to the top-right
- ⌨️ **Hotkey Toggle**: Press `Alt+P` to show/hide the panel
- 🔄 **Live Updates**: Automatically detects new prompts as you chat
- 📋 **Copy Prompts**: One-click copy for any prompt
- 🎯 **Jump to Prompt**: Click to scroll to the original message and highlight it
- 🎨 **Clean UI**: Minimal, non-intrusive design that doesn't interfere with ChatGPT
- 🔒 **Privacy**: No data storage, no network calls, works entirely client-side

## Installation

### Prerequisites

- Node.js 16+ and npm
- Chrome browser

### Build the Extension

1. **Clone and install dependencies:**

   ```bash
   git clone <your-repo-url>
   cd promptbase
   npm install
   ```

2. **Build the extension:**

   ```bash
   npm run build:extension
   ```

3. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project
   - The extension should now appear in your extensions list

### Development

For development with auto-rebuild:

```bash
npm run dev
```

This will watch for changes and rebuild automatically. You'll need to reload the extension in Chrome after each build.

## Usage

1. **Navigate to ChatGPT**: Go to `https://chatgpt.com` or `https://chat.openai.com`
2. **Toggle Panel**: Press `Alt+P` to show/hide the prompt panel
3. **View Prompts**: Your prompts will appear in the floating panel
4. **Interact with Prompts**:
   - **Copy**: Click the copy button to copy a prompt to clipboard
   - **Jump**: Click the jump button to scroll to the original message
   - **Expand**: Click on prompt text to expand/collapse long prompts
5. **Drag Panel**: Click and drag the panel to reposition it
6. **Collapse**: Use the collapse button to minimize the panel

## Technical Details

### Architecture

- **Manifest V3**: Uses the latest Chrome extension format
- **Content Script**: Injects React app into ChatGPT pages
- **Shadow DOM**: Isolates styles to prevent conflicts
- **MutationObserver**: Watches for new prompts in real-time
- **No Storage**: All data stays in memory, no persistence

### File Structure

```
src/
├── content/
│   ├── main.tsx          # Content script entry point
│   ├── App.tsx           # Main React component
│   ├── dom.ts            # DOM utilities and selectors
│   ├── hotkeys.ts        # Keyboard shortcut handling
│   └── styles.css        # Tailwind CSS styles
├── manifest.json         # Chrome extension manifest
├── vite.config.ts        # Vite build configuration
├── tailwind.config.cjs   # Tailwind CSS configuration
└── postcss.config.cjs    # PostCSS configuration
```

### DOM Selectors

The extension uses these selectors to find user prompts:

- Primary: `article[data-turn="user"]`
- Fallback: `[data-turn="user"]`
- Fallback: `article[data-testid^="conversation-turn"][data-turn="user"]`

### Browser Compatibility

- Chrome 88+ (Manifest V3 support)
- Works on both `chatgpt.com` and `chat.openai.com`

## Troubleshooting

### Extension Not Working

1. **Check Console**: Open DevTools (F12) and look for errors
2. **Reload Extension**: Go to `chrome://extensions/` and click the reload button
3. **Check Permissions**: Ensure the extension has access to ChatGPT pages
4. **Clear Cache**: Try clearing browser cache and reloading

### Panel Not Appearing

1. **Press Alt+P**: The panel is hidden by default
2. **Check Page**: Make sure you're on a ChatGPT conversation page
3. **Refresh Page**: Try refreshing the ChatGPT page

### Prompts Not Updating

1. **Manual Refresh**: Click the refresh button in the panel
2. **Check Selectors**: ChatGPT may have updated their DOM structure
3. **Console Logs**: Check for selector-related errors in DevTools

## Development

### Adding New Features

1. **Update DOM Selectors**: Modify `src/content/dom.ts` if ChatGPT changes their structure
2. **UI Changes**: Edit `src/content/App.tsx` for interface modifications
3. **Styling**: Update `src/content/styles.css` for visual changes
4. **Hotkeys**: Modify `src/content/hotkeys.ts` for keyboard shortcuts

### Building for Production

```bash
npm run build:extension
```

This creates a `dist` folder with the built extension ready for distribution.

### Testing

1. Build the extension: `npm run build:extension`
2. Load in Chrome as an unpacked extension
3. Test on both `chatgpt.com` and `chat.openai.com`
4. Verify all features work: toggle, copy, jump, drag, etc.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.0.0

- Initial release
- Basic prompt panel functionality
- Alt+P hotkey toggle
- Copy and jump actions
- Draggable panel
- Live updates with MutationObserver
