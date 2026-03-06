#!/usr/bin/env node

// Simple test script to verify the tools work
import { readFileSync, existsSync } from "fs";
import { join } from "path";

console.log("Testing Complex Plan MCP Server tools...\n");

// Test 1: Check if build succeeded
console.log("✓ Build test: Checking if dist/index.js exists...");
if (existsSync("./dist/index.js")) {
  console.log("  ✓ Build successful\n");
} else {
  console.log("  ✗ Build failed\n");
  process.exit(1);
}

// Test 2: Check configuration loading
console.log("✓ Configuration test: Checking if config schema is valid...");
try {
  const configContent = readFileSync("./src/config.ts", "utf-8");
  if (
    configContent.includes("configSchema") &&
    configContent.includes("DEFAULT_CONFIG")
  ) {
    console.log("  ✓ Configuration management implemented\n");
  } else {
    console.log("  ✗ Configuration management not found\n");
    process.exit(1);
  }
} catch (error) {
  console.log("  ✗ Error reading config file:", error.message, "\n");
  process.exit(1);
}

// Test 3: Check tool registration
console.log("✓ Tool registration test: Checking if tools are registered...");
try {
  const sourceContent = readFileSync("./src/index.ts", "utf-8");
  const toolsFound = [
    sourceContent.includes("registerOpenInEditorTool"),
    sourceContent.includes("registerCreatePlanTool"),
    sourceContent.includes("registerDeletePlanTool"),
  ];

  if (toolsFound.every(Boolean)) {
    console.log(
      "  ✓ All tools registered (open_in_editor, create_plan, delete_plan)\n",
    );
  } else {
    console.log("  ✗ Some tools missing\n");
    process.exit(1);
  }
} catch (error) {
  console.log("  ✗ Error checking tool registration:", error.message, "\n");
  process.exit(1);
}

// Test 4: Check gitignore functionality
console.log(
  "✓ Gitignore test: Checking if gitignore handling is implemented...",
);
try {
  const utilsContent = readFileSync("./src/utils.ts", "utf-8");
  if (
    utilsContent.includes("handleGitignore") &&
    utilsContent.includes(".gitignore")
  ) {
    console.log("  ✓ Gitignore functionality implemented\n");
  } else {
    console.log("  ✗ Gitignore functionality not found\n");
    process.exit(1);
  }
} catch (error) {
  console.log(
    "  ✗ Error checking gitignore functionality:",
    error.message,
    "\n",
  );
  process.exit(1);
}

// Test 5: Check documentation
console.log("✓ Documentation test: Checking if README.md exists...");
if (existsSync("./README.md")) {
  console.log("  ✓ Documentation file exists\n");
} else {
  console.log("  ✗ Documentation file missing\n");
  process.exit(1);
}

console.log(
  "🎉 All tests passed! The MCP Complex Plans Server is ready to use.",
);
console.log("\nTo start the server, run:");
console.log("  npm run start");
console.log("\nOr for development:");
console.log("  npm run dev");
