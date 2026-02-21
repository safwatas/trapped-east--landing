/**
 * Analytics API Middleware for Local Development
 * 
 * This middleware handles requests to /api/admin/analytics during local development.
 * In production (Vercel), the serverless function in /api/admin/analytics.js handles this.
 * 
 * For local dev, it returns mock data so the admin page works without PostHog/Supabase secrets.
 */

function handleAnalyticsRequest(req, res) {
    if (req.method !== 'GET') {
        res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
        return;
    }

    // Return mock data in development
    const mockData = {
        onlineNow: Math.floor(Math.random() * 5) + 1,
        visitsToday: Math.floor(Math.random() * 80) + 20,
        topPages: [
            { page: 'https://trapped-egypt.com/', views: Math.floor(Math.random() * 30) + 10 },
            { page: 'https://trapped-egypt.com/rooms', views: Math.floor(Math.random() * 20) + 5 },
            { page: 'https://trapped-egypt.com/rooms/the-heist', views: Math.floor(Math.random() * 15) + 3 },
            { page: 'https://trapped-egypt.com/rooms/haunted-mansion', views: Math.floor(Math.random() * 12) + 2 },
            { page: 'https://trapped-egypt.com/book/the-heist', views: Math.floor(Math.random() * 10) + 1 },
            { page: 'https://trapped-egypt.com/events', views: Math.floor(Math.random() * 8) + 1 },
            { page: 'https://trapped-egypt.com/contact', views: Math.floor(Math.random() * 5) + 1 },
        ],
        topReferrers: [
            { source: '(direct)', visitors: Math.floor(Math.random() * 20) + 10 },
            { source: 'instagram.com', visitors: Math.floor(Math.random() * 15) + 5 },
            { source: 'facebook.com', visitors: Math.floor(Math.random() * 10) + 3 },
            { source: 'google.com', visitors: Math.floor(Math.random() * 8) + 2 },
            { source: 'tiktok.com', visitors: Math.floor(Math.random() * 5) + 1 },
        ],
        leadsToday: {
            bookings: Math.floor(Math.random() * 8) + 1,
            eventLeads: Math.floor(Math.random() * 3),
            total: 0
        },
        conversionRate: 0,
        fetchedAt: new Date().toISOString(),
        posthogConfigured: false,
        supabaseConfigured: false,
        _devMock: true
    };

    // Calculate total and conversion
    mockData.leadsToday.total = mockData.leadsToday.bookings + mockData.leadsToday.eventLeads;
    mockData.conversionRate = mockData.visitsToday > 0
        ? parseFloat(((mockData.leadsToday.total / mockData.visitsToday) * 100).toFixed(2))
        : 0;

    res.status(200).json({
        success: true,
        data: mockData,
        cached: false
    });
}

/**
 * Setup middleware for analytics API
 */
function setupAnalyticsAPI(devServerConfig) {
    const originalSetupMiddlewares = devServerConfig.setupMiddlewares;

    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
        // Add analytics API route handler
        devServer.app.get('/api/admin/analytics', (req, res) => {
            handleAnalyticsRequest(req, res);
        });

        // Call original setup if exists
        if (originalSetupMiddlewares) {
            middlewares = originalSetupMiddlewares(middlewares, devServer);
        }

        return middlewares;
    };

    return devServerConfig;
}

module.exports = setupAnalyticsAPI;
