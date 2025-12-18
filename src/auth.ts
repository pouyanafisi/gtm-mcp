#!/usr/bin/env node
/**
 * Standalone authentication script
 * Run this once to set up OAuth authentication
 */

import { authorize } from './auth-helper.js';
import { join } from 'path';

const credentialsPath =
  process.env.GTM_CREDENTIALS_FILE || join(process.cwd(), 'credentials.json');
const tokenPath =
  process.env.GTM_TOKEN_FILE || join(process.cwd(), 'token.json');

async function main() {
  try {
    console.log('Starting OAuth authentication flow...');
    console.log(`Credentials file: ${credentialsPath}`);
    console.log(`Token will be saved to: ${tokenPath}\n`);

    await authorize(credentialsPath, tokenPath);

    console.log('\n✅ Authentication successful!');
    console.log(`Token saved to: ${tokenPath}`);
    console.log('You can now use the GTM MCP server.');
  } catch (error: any) {
    console.error('\n❌ Authentication failed:', error.message);
    process.exit(1);
  }
}

main();

