/**
 * Authentication helper for Google OAuth2
 * Provides utilities for handling OAuth flow
 */

import { OAuth2Client } from 'google-auth-library';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

const SCOPES = [
  'https://www.googleapis.com/auth/tagmanager.edit.containers',
  'https://www.googleapis.com/auth/tagmanager.publish',
];

/**
 * Get authorization URL and handle the OAuth flow
 */
export async function authorize(
  credentialsPath: string,
  tokenPath: string
): Promise<OAuth2Client> {
  let credentials: any = null;

  // Load existing token
  if (existsSync(tokenPath)) {
    try {
      credentials = JSON.parse(readFileSync(tokenPath, 'utf8'));
    } catch (error) {
      console.warn('Failed to load existing token:', error);
    }
  }

  // Load client secrets
  if (!existsSync(credentialsPath)) {
    throw new Error(
      `Credentials file not found: ${credentialsPath}. ` +
        'Please download OAuth 2.0 credentials from Google Cloud Console.'
    );
  }

  const clientSecrets = JSON.parse(readFileSync(credentialsPath, 'utf8'));
  const { client_id, client_secret, redirect_uris } =
    clientSecrets.installed || clientSecrets.web;

  const oAuth2Client = new OAuth2Client(
    client_id,
    client_secret,
    redirect_uris?.[0] || 'http://localhost'
  );

  // Set credentials if available
  if (credentials) {
    oAuth2Client.setCredentials(credentials);
  }

  // Check if we need to refresh or get new token
  if (!credentials || !oAuth2Client.credentials.access_token) {
    // Check if we're in an interactive environment
    if (process.stdin.isTTY && process.stdout.isTTY) {
      return getNewToken(oAuth2Client, tokenPath);
    } else {
      throw new Error(
        'Authentication required. Please run "npm run auth" to authenticate first.'
      );
    }
  }

  // Refresh token if expired
  const expiryDate = oAuth2Client.credentials.expiry_date;
  if (expiryDate && expiryDate <= Date.now()) {
    try {
      await oAuth2Client.refreshAccessToken();
      saveToken(tokenPath, oAuth2Client.credentials);
    } catch (error) {
      // If refresh fails, get a new token
      return getNewToken(oAuth2Client, tokenPath);
    }
  }

  return oAuth2Client;
}

/**
 * Get a new token after prompting for user authorization
 */
function getNewToken(
  oAuth2Client: OAuth2Client,
  tokenPath: string
): Promise<OAuth2Client> {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.error('Authorize this app by visiting this url:', authUrl);
    console.error('Waiting for authorization code...');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', async (code) => {
      rl.close();
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        saveToken(tokenPath, tokens);
        resolve(oAuth2Client);
      } catch (error: any) {
        reject(
          new Error(`Error while trying to retrieve access token: ${error.message}`)
        );
      }
    });
  });
}

/**
 * Store token to disk
 */
function saveToken(tokenPath: string, token: any): void {
  writeFileSync(tokenPath, JSON.stringify(token, null, 2));
  console.error('Token stored to', tokenPath);
}

