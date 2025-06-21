#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Expo in offline mode...');

// Run expo start with offline flag
const expo = spawn('npx', ['expo', 'start', '--offline'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    EXPO_OFFLINE: '1',
    NODE_OPTIONS: '--dns-result-order=ipv4first'
  }
});

expo.on('close', (code) => {
  console.log(`Expo process exited with code ${code}`);
});