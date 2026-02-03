/**
 * Analytics utility for fire standardized events to GTM, Meta Pixel, and GA4.
 */

export const analytics = {
    /**
     * Fires a custom event to tracking platforms.
     * @param {string} eventName - Standard event name (e.g., 'ViewContent', 'AddToCart', 'Lead')
     * @param {Object} params - Event properties
     */
    track(eventName, params = {}) {
        // Get current language from localStorage
        const currentLanguage = localStorage.getItem('lang') || 'en';

        // Add default params
        const enrichedParams = {
            ...params,
            currency: 'EGP',
            hostname: window.location.hostname,
            page_path: window.location.pathname,
            timestamp: new Date().toISOString(),
            language: params.language || currentLanguage // Always include language
        };


        // 1. Google Tag Manager / GA4
        if (window.dataLayer) {
            window.dataLayer.push({
                event: eventName,
                ...enrichedParams
            });
        }

        // 2. Meta Pixel (Standard/Custom events)
        if (window.fbq) {
            const metaEventMap = {
                'ViewRoom': 'ViewContent',
                'AddToCart': 'AddToCart',
                'Lead': 'Lead'
            };

            const metaEventName = metaEventMap[eventName] || eventName;
            window.fbq('track', metaEventName, enrichedParams);
        }

        // 3. PostHog (if initialized)
        if (window.posthog) {
            window.posthog.capture(eventName, enrichedParams);
        }

        // 4. Meta CAPI (Server-side)
        // We'll call a serverless function/edge function if configured
        this.trackCAPI(eventName, enrichedParams);
    },

    /**
     * Forwards events to a server-side endpoint for Meta CAPI.
     */
    async trackCAPI(eventName, params) {
        if (!['AddToCart', 'Lead'].includes(eventName)) return;

        try {
            // Future implementation: call Supabase Edge Function
            // await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/meta-capi`, {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ eventName, params })
            // });
            console.log(`[CAPI Simulation] Routing ${eventName} to server...`);
        } catch (err) {
            console.error('CAPI forwarding failed:', err);
        }
    }
};
