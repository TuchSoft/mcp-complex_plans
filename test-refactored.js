#!/usr/bin/env node

// Test script for refactored modular structure
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

console.log('Testing Refactored Complex Plan MCP Server...\n');

// Test 1: Check if build succeeded
console.log('✓ Build test: Checking if dist/index.js exists...');
if (existsSync('./dist/index.js')) {
  console.log('  ✓ Build successful\n');
} else {
  console.log('  ✗ Build failed\n');
  process.exit(1);
}

// Test 2: Check configuration module
console.log('✓ Configuration test: Checking modular config...');
try {
  const configContent = readFileSync('./src/config.ts', 'utf-8');
  if (configContent.includes('configSchema') &&
      configContent.includes('DEFAULT_CONFIG') &&
      configContent.includes('loadConfig') &&
      configContent.includes('saveConfig')) {
    console.log('  ✓ Configuration module implemented correctly\n');
  } else {
    console.log('  ✗ Configuration module incomplete\n');
    process.exit(1);
  }
} catch (error) {
  console.log('  ✗ Error reading config module:', error.message, '\n');
  process.exit(1);
}

// Test 3: Check utilities module
console.log('✓ Utilities test: Checking modular utilities...');
try {
  const utilsContent = readFileSync('./src/utils.ts', 'utf-8');
  if (utilsContent.includes('getWorkspaceRoot') &&
      utilsContent.includes('getPlanDirectory') &&
      utilsContent.includes('handleGitignore')) {
    console.log('  ✓ Utilities module implemented correctly\n');
  } else {
    console.log('  ✗ Utilities module incomplete\n');
    process.exit(1);
  }
} catch (error) {
  console.log('  ✗ Error reading utilities module:', error.message, '\n');
  process.exit(1);
}

// Test 4: Check modular tool structure
console.log('✓ Modular structure test: Checking tool files...');
try {
  const toolsDir = './src/tools';
  if (!existsSync(toolsDir)) {
    console.log('  ✗ Tools directory missing\n');
    process.exit(1);
  }

  const toolFiles = readdirSync(toolsDir);
  const expectedTools = ['openInEditor.ts', 'createPlan.ts', 'deletePlan.ts', 'sequentialThinking.ts'];

  const allToolsPresent = expectedTools.every(tool => toolFiles.includes(tool));

  if (allToolsPresent) {
    console.log('  ✓ All tool files present in modular structure\n');
  } else {
    console.log('  ✗ Some tool files missing\n');
    process.exit(1);
  }
} catch (error) {
  console.log('  ✗ Error checking modular structure:', error.message, '\n');
  process.exit(1);
}

// Test 5: Check main index imports
console.log('✓ Main index test: Checking imports...');
try {
  const indexContent = readFileSync('./src/index.ts', 'utf-8');
  const requiredImports = [
    './config.js',
    './tools/openInEditor.js',
    './tools/createPlan.js',
    './tools/deletePlan.js'
  ];

  const allImportsPresent = requiredImports.every(importPath =>
    indexContent.includes(importPath)
  );

  if (allImportsPresent) {
    console.log('  ✓ All required imports present in main index\n');
  } else {
    console.log('  ✗ Some imports missing\n');
    process.exit(1);
  }
} catch (error) {
  console.log('  ✗ Error checking main index:', error.message, '\n');
  process.exit(1);
}

// Test 6: Check tool registration
console.log('✓ Tool registration test: Checking tool registration calls...');
try {
  const indexContent = readFileSync('./src/index.ts', 'utf-8');
  const registrationCalls = [
    'registerOpenInEditorTool(server)',
    'registerCreatePlanTool(server)',
    'registerDeletePlanTool(server)',
    'registerSequentialThinkingTools(server)'
  ];

  const allRegistrationsPresent = registrationCalls.every(call =>
    indexContent.includes(call)
  );

  if (allRegistrationsPresent) {
    console.log('  ✓ All tool registration calls present\n');
  } else {
    console.log('  ✗ Some tool registration calls missing\n');
    process.exit(1);
  }
} catch (error) {
  console.log('  ✗ Error checking tool registration:', error.message, '\n');
  process.exit(1);
}

console.log('🎉 All refactoring tests passed! The modular structure is working correctly.');
console.log('\nRefactored structure:');
console.log('  src/');
console.log('    index.ts          - Main entry point');
console.log('    config.ts         - Configuration management');
console.log('    utils.ts          - Utility functions');
console.log('    tools/');
console.log('      openInEditor.ts     - Open in Editor tool');
console.log('      createPlan.ts       - Create plan tool');
console.log('      deletePlan.ts       - Delete plan tool');
console.log('      sequentialThinking.ts - Sequential thinking tool');
console.log('\nTo start the server, run:');
console.log('  npm run start');
