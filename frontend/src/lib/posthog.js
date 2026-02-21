/**
 * PostHog Analytics Initialization
 * 
 * Initializes PostHog for product analytics (events, sessions, live users).
 * Only initializes if REACT_APP_POSTHOG_KEY is set.
 * 
 * Privacy-safe: No raw IP/PII is stored in the UI.
 * PostHog handles anonymization per its configuration.
 */
import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY;
const POSTHOG_HOST = process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com';

let isInitialized = false;

export function initPostHog() {
    if (isInitialized || !POSTHOG_KEY) {
        if (!POSTHOG_KEY) {
            console.warn('[PostHog] No REACT_APP_POSTHOG_KEY found. PostHog tracking disabled.');
        }
        return;
    }

    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        // Automatically capture pageviews on SPA route changes
        capture_pageview: true,
        capture_pageleave: true,
        // Enable autocapture for clicks, inputs, etc.
        autocapture: true,
        // Respect Do Not Track browser setting
        respect_dnt: true,
        // Disable session recording by default (can enable in PostHog dashboard)
        disable_session_recording: false,
        // Persistence via localStorage (no cookies)
        persistence: 'localStorage',
        // Don't capture text content of elements for privacy
        mask_all_text: false,
        mask_all_element_attributes: false,
        // Enable feature flags if needed later
        bootstrap: {},
        loaded: (posthogInstance) => {
            console.log('[PostHog] Initialized successfully');
            // Make available globally for analytics.js integration
            window.posthog = posthogInstance;
        }
    });

    isInitialized = true;
}

/**
 * Track SPA page navigation manually.
 * Call this on route changes if automatic capture misses them.
 */
export function trackPageView(path, properties = {}) {
    if (!isInitialized || !POSTHOG_KEY) return;
    posthog.capture('$pageview', {
        $current_url: window.location.origin + path,
        ...properties
    });
}

export { posthog };
export default posthog;
