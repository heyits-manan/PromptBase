#!/usr/bin/env node

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔄 Starting PromptBase development watch mode...");
console.log("📁 Watching for changes in src/ directory...");
console.log("⚡ Auto-rebuilding extension when files change...");
console.log("");

let isBuilding = false;

function buildExtension() {
  if (isBuilding) return;

  isBuilding = true;
  console.log("🔨 Building extension...");

  exec("npm run build:extension", (error, stdout, stderr) => {
    isBuilding = false;

    if (error) {
      console.error("❌ Build failed:", error.message);
      return;
    }

    if (stderr) {
      console.error("⚠️  Build warnings:", stderr);
    }

    console.log("✅ Extension built successfully!");
    console.log("🔄 Reload the extension in Chrome to see changes.");
    console.log("");
  });
}

// Watch for changes in src directory
fs.watch(
  path.join(__dirname, "src"),
  { recursive: true },
  (eventType, filename) => {
    if (
      filename &&
      (filename.endsWith(".tsx") ||
        filename.endsWith(".ts") ||
        filename.endsWith(".css"))
    ) {
      console.log(`📝 File changed: ${filename}`);
      buildExtension();
    }
  }
);

// Watch for changes in config files
fs.watch(path.join(__dirname, "vite.config.ts"), () => {
  console.log("📝 Config changed: vite.config.ts");
  buildExtension();
});

fs.watch(path.join(__dirname, "tailwind.config.js"), () => {
  console.log("📝 Config changed: tailwind.config.js");
  buildExtension();
});

fs.watch(path.join(__dirname, "manifest.json"), () => {
  console.log("📝 Config changed: manifest.json");
  buildExtension();
});

// Initial build
buildExtension();

console.log("👀 Watching for changes... (Press Ctrl+C to stop)");
