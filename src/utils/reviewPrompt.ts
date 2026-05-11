/**
 * reviewPrompt.ts
 * 
 * Handles the logic for prompting the user to review the app via
 * Apple's native SKStoreReviewController (through Capacitor plugin).
 * 
 * Logic (all four conditions must be true):
 *   a) 90+ days since last prompt (or never prompted)
 *   b) User is free AND free for 7+ days
 *   c) App first opened 3+ days ago
 *   d) 3+ app sessions since last prompt
 * 
 * This ensures we only ask engaged, happy users at psychologically
 * positive moments — never too early, never too often.
 */

import { Capacitor } from '@capacitor/core';

const STORAGE_KEYS = {
  firstOpened: 'review_app_first_opened',
  sessions: 'review_sessions',
  lastPrompted: 'review_last_prompted',
} as const;

const DAYS_MS = 24 * 60 * 60 * 1000;

/** Minimum days since last prompt before we can ask again */
const COOLDOWN_DAYS = 90;

/** Minimum days the user must have been free */
const MIN_FREE_DAYS = 7;

/** Minimum days since app was first opened */
const MIN_APP_AGE_DAYS = 3;

/** Minimum number of app sessions since last prompt */
const MIN_SESSIONS = 3;

/**
 * Call this every time the Ticker view mounts.
 * 
 * @param isFree  - whether user is in 'vapaa' (free) state
 * @param startTime - the timestamp when user started their current streak
 */
export async function checkAndPromptReview(
  isFree: boolean,
  startTime: number
): Promise<void> {
  // Only run on native iOS — no point on web
  if (Capacitor.getPlatform() !== 'ios') {
    return;
  }

  const now = Date.now();

  // --- Step 1: Initialize app_first_opened if missing ---
  let firstOpened = getStoredTimestamp(STORAGE_KEYS.firstOpened);
  if (firstOpened === null) {
    firstOpened = now;
    localStorage.setItem(STORAGE_KEYS.firstOpened, now.toString());
  }

  // --- Step 2: Increment session counter ---
  const sessions = (getStoredNumber(STORAGE_KEYS.sessions) || 0) + 1;
  localStorage.setItem(STORAGE_KEYS.sessions, sessions.toString());

  // --- Step 3: Check all four conditions ---

  // a) Cooldown: 90+ days since last prompt (or never prompted)
  const lastPrompted = getStoredTimestamp(STORAGE_KEYS.lastPrompted);
  if (lastPrompted !== null) {
    const daysSincePrompt = (now - lastPrompted) / DAYS_MS;
    if (daysSincePrompt < COOLDOWN_DAYS) {
      return; // Too soon since last prompt
    }
  }

  // b) User must be free AND free for 7+ days
  if (!isFree) {
    return; // User is in "hooked" (red) state
  }
  const freeDays = (now - startTime) / DAYS_MS;
  if (freeDays < MIN_FREE_DAYS) {
    return; // Not free long enough
  }

  // c) App must have been installed 3+ days ago
  const appAgeDays = (now - firstOpened) / DAYS_MS;
  if (appAgeDays < MIN_APP_AGE_DAYS) {
    return; // App too new
  }

  // d) Must have 3+ sessions since last prompt
  if (sessions < MIN_SESSIONS) {
    return; // Not enough engagement
  }

  // --- Step 4: All conditions passed — show review prompt ---
  try {
    const { CapgoInAppReview } = await import('@capgo/capacitor-in-app-review');
    await CapgoInAppReview.requestReview();

    // Save timestamp and reset session counter
    localStorage.setItem(STORAGE_KEYS.lastPrompted, now.toString());
    localStorage.setItem(STORAGE_KEYS.sessions, '0');

    console.log('[ReviewPrompt] Review prompt triggered successfully');
  } catch (error) {
    console.warn('[ReviewPrompt] Failed to show review prompt:', error);
  }
}

// --- Helper functions ---

function getStoredTimestamp(key: string): number | null {
  const value = localStorage.getItem(key);
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

function getStoredNumber(key: string): number | null {
  const value = localStorage.getItem(key);
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}
