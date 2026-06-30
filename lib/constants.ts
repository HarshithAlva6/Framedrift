// Polling interval for live session data in the admin dashboard (ms)
// Set to 5000 during a live presentation, 86400000 otherwise
export const POLL_INTERVAL_MS = 86400000;

// Minimum unique sessions before real data is considered sufficient
export const MIN_SESSIONS_FOR_LIVE = 3;

// Simulated sessions per variant per persona
export const SIM_SESSIONS_PER_BUCKET = 50;

// Cookie name and max age for variant assignment
export const VARIANT_COOKIE_NAME = 'fd_variant';
export const VARIANT_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

// Scoring weights (must sum to 1)
export const WEIGHT_CONVERSION = 0.45;
export const WEIGHT_ENGAGEMENT = 0.35;
export const WEIGHT_RETENTION = 0.20;
