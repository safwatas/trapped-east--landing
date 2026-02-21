/**
 * Vercel Serverless Function: Admin Analytics API
 * 
 * Fetches analytics data from PostHog API and Supabase.
 * This runs server-side so the PostHog personal API key is never exposed.
 * 
 * Endpoint: GET /api/admin/analytics
 * 
 * Returns:
 *   - onlineNow: active users in last 5 minutes
 *   - visitsToday: unique sessions today
 *   - topPages: most visited pages in last 30 minutes
 *   - topReferrers: top traffic sources today
 *   - leadsToday: bookings + event_leads created today (from Supabase)
 *   - conversionRate: leads / visits
 * 
 * Caches results for 30 seconds to reduce load.
 * 
 * Required env vars (server-only):
 *   POSTHOG_PERSONAL_API_KEY - PostHog personal API key
 *   POSTHOG_PROJECT_ID - PostHog project ID
 *   POSTHOG_HOST - PostHog API host (default: https://us.posthog.com)
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (for server-side queries)
 */

import { createClient } from '@supabase/supabase-js';

// --- Cache ---
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

// --- PostHog Config ---
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://us.posthog.com';

// --- Supabase Config ---
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Make a request to the PostHog API
 */
async function posthogQuery(endpoint, options = {}) {
    if (!POSTHOG_PERSONAL_API_KEY || !POSTHOG_PROJECT_ID) {
        return null;
    }

    const url = `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}${endpoint}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: {
                'Authorization': `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`PostHog API error: ${response.status} ${response.statusText}`);
            return null;
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'AbortError') {
            console.error('PostHog API timeout');
        } else {
            console.error('PostHog API error:', err.message);
        }
        return null;
    }
}

/**
 * Get active users count (last 5 minutes) using PostHog events query
 */
async function getOnlineNow() {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const result = await posthogQuery('/query/', {
        method: 'POST',
        body: {
            query: {
                kind: 'HogQLQuery',
                query: `SELECT count(DISTINCT distinct_id) as active_users
                        FROM events 
                        WHERE timestamp >= '${fiveMinAgo}'`
            }
        }
    });

    if (result && result.results && result.results.length > 0) {
        return result.results[0][0] || 0;
    }
    return 0;
}

/**
 * Get unique sessions/visitors today
 */
async function getVisitsToday() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    const result = await posthogQuery('/query/', {
        method: 'POST',
        body: {
            query: {
                kind: 'HogQLQuery',
                query: `SELECT count(DISTINCT distinct_id) as unique_visitors
                        FROM events 
                        WHERE timestamp >= '${todayISO}'
                        AND event = '$pageview'`
            }
        }
    });

    if (result && result.results && result.results.length > 0) {
        return result.results[0][0] || 0;
    }
    return 0;
}

/**
 * Get top pages in the last 30 minutes
 */
async function getTopPages() {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const result = await posthogQuery('/query/', {
        method: 'POST',
        body: {
            query: {
                kind: 'HogQLQuery',
                query: `SELECT properties.$current_url as page,
                               count() as views
                        FROM events 
                        WHERE timestamp >= '${thirtyMinAgo}'
                        AND event = '$pageview'
                        GROUP BY page
                        ORDER BY views DESC
                        LIMIT 10`
            }
        }
    });

    if (result && result.results) {
        return result.results.map(row => ({
            page: row[0] || 'Unknown',
            views: row[1] || 0
        }));
    }
    return [];
}

/**
 * Get top referrers/sources today
 */
async function getTopReferrers() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    const result = await posthogQuery('/query/', {
        method: 'POST',
        body: {
            query: {
                kind: 'HogQLQuery',
                query: `SELECT 
                            coalesce(
                                properties.$utm_source,
                                properties.$referrer,
                                '(direct)'
                            ) as source,
                            count(DISTINCT distinct_id) as visitors
                        FROM events 
                        WHERE timestamp >= '${todayISO}'
                        AND event = '$pageview'
                        GROUP BY source
                        ORDER BY visitors DESC
                        LIMIT 10`
            }
        }
    });

    if (result && result.results) {
        return result.results.map(row => ({
            source: simplifyReferrer(row[0] || '(direct)'),
            visitors: row[1] || 0
        }));
    }
    return [];
}

/**
 * Simplify referrer URLs (e.g., "https://www.google.com/search?q=..." -> "google.com")
 */
function simplifyReferrer(ref) {
    if (!ref || ref === '(direct)' || ref === '') return '(direct)';
    try {
        const url = new URL(ref);
        return url.hostname.replace('www.', '');
    } catch {
        return ref;
    }
}

/**
 * Get leads count today from Supabase (bookings + event_leads)
 */
async function getLeadsToday() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return { bookings: 0, eventLeads: 0, total: 0 };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    try {
        // Count bookings created today
        const { count: bookingsCount, error: bookingsError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayISO);

        if (bookingsError) {
            console.error('Supabase bookings query error:', bookingsError.message);
        }

        // Count event_leads created today
        const { count: eventLeadsCount, error: eventLeadsError } = await supabase
            .from('event_leads')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayISO);

        if (eventLeadsError) {
            console.error('Supabase event_leads query error:', eventLeadsError.message);
        }

        const bookings = bookingsCount || 0;
        const eventLeads = eventLeadsCount || 0;

        return {
            bookings,
            eventLeads,
            total: bookings + eventLeads
        };
    } catch (err) {
        console.error('Supabase query error:', err.message);
        return { bookings: 0, eventLeads: 0, total: 0 };
    }
}

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    // Check cache
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_TTL_MS) {
        return res.status(200).json({
            success: true,
            data: cachedData,
            cached: true,
            cacheAge: Math.round((now - cacheTimestamp) / 1000)
        });
    }

    try {
        // Fetch all data in parallel
        const [onlineNow, visitsToday, topPages, topReferrers, leadsToday] = await Promise.all([
            getOnlineNow(),
            getVisitsToday(),
            getTopPages(),
            getTopReferrers(),
            getLeadsToday()
        ]);

        // Calculate conversion rate
        const conversionRate = visitsToday > 0
            ? ((leadsToday.total / visitsToday) * 100).toFixed(2)
            : '0.00';

        const data = {
            onlineNow,
            visitsToday,
            topPages,
            topReferrers,
            leadsToday,
            conversionRate: parseFloat(conversionRate),
            fetchedAt: new Date().toISOString(),
            posthogConfigured: !!(POSTHOG_PERSONAL_API_KEY && POSTHOG_PROJECT_ID),
            supabaseConfigured: !!(SUPABASE_URL && SUPABASE_SERVICE_KEY)
        };

        // Cache the result
        cachedData = data;
        cacheTimestamp = now;

        return res.status(200).json({
            success: true,
            data,
            cached: false
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to fetch analytics data'
        });
    }
}
