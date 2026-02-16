/**
 * External Customers API Middleware for Local Development
 * 
 * This middleware handles requests to /api/external/customers during local development.
 * In production (Vercel), the serverless function in /api/external/customers.js handles this.
 */

const EXTERNAL_API_URL = 'http://trappedeg.com/api/data';
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_NUMBER = 1;
const API_TIMEOUT_MS = 15000;

// Validation helpers
const isValidNumber = (value, min = 1, max = 1000) => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= min && num <= max;
};

const isValidSortBy = (value) => {
    // External API only supports: firstname, lastname, phonenumber
    const allowed = ['firstname', 'lastname', 'phonenumber'];
    return !value || allowed.includes(value.toLowerCase());
};

const isValidBoolean = (value) => {
    return value === undefined || value === 'true' || value === 'false' || typeof value === 'boolean';
};

const sanitizeSearchTerm = (term) => {
    if (!term) return '';
    return String(term).replace(/[<>{}[\]\\]/g, '').substring(0, 100);
};

async function handleExternalCustomersRequest(req, res) {
    // Only handle GET requests
    if (req.method !== 'GET') {
        res.status(405).json({
            success: false,
            error: 'Method not allowed',
            message: 'Only GET requests are supported'
        });
        return;
    }

    try {
        // Parse query params
        const url = new URL(req.url, `http://${req.headers.host}`);
        const searchTerm = url.searchParams.get('searchTerm') || '';
        const pagesize = url.searchParams.get('pagesize') || DEFAULT_PAGE_SIZE;
        const pageNumber = url.searchParams.get('pageNumber') || DEFAULT_PAGE_NUMBER;
        // Default to firstname since createdAt is not supported by external API
        const sortBy = url.searchParams.get('sortBy') || 'firstname';
        const sortDescending = url.searchParams.get('sortDescending') || 'true';

        // Validate parameters
        if (!isValidNumber(pagesize, 1, 100)) {
            res.status(400).json({
                success: false,
                error: 'Invalid pagesize',
                message: 'pagesize must be a number between 1 and 100'
            });
            return;
        }

        if (!isValidNumber(pageNumber, 1, 10000)) {
            res.status(400).json({
                success: false,
                error: 'Invalid pageNumber',
                message: 'pageNumber must be a number between 1 and 10000'
            });
            return;
        }

        if (!isValidSortBy(sortBy)) {
            res.status(400).json({
                success: false,
                error: 'Invalid sortBy',
                message: 'sortBy must be one of: firstname, lastname, phonenumber'
            });
            return;
        }

        if (!isValidBoolean(sortDescending)) {
            res.status(400).json({
                success: false,
                error: 'Invalid sortDescending',
                message: 'sortDescending must be true or false'
            });
            return;
        }

        // Build API URL - use firstname as default
        const params = new URLSearchParams({
            pagesize: String(pagesize),
            pageNumber: String(pageNumber),
            sortBy: sortBy || 'firstname',
            sortDescending: String(sortDescending === 'true' || sortDescending === true)
        });

        const sanitizedSearch = sanitizeSearchTerm(searchTerm);
        if (sanitizedSearch) {
            params.append('searchTerm', sanitizedSearch);
        }

        const apiUrl = `${EXTERNAL_API_URL}?${params.toString()}`;

        // Fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error(`External API error: ${response.status} ${response.statusText}`);
                res.status(502).json({
                    success: false,
                    error: 'External API error',
                    message: 'Failed to fetch customer data from external service'
                });
                return;
            }

            const data = await response.json();

            res.status(200).json({
                success: true,
                data: data,
                meta: {
                    pageSize: parseInt(pagesize, 10),
                    pageNumber: parseInt(pageNumber, 10),
                    searchTerm: sanitizedSearch || null,
                    sortBy: sortBy || 'firstname',
                    sortDescending: sortDescending === 'true' || sortDescending === true,
                    fetchedAt: new Date().toISOString()
                }
            });
        } catch (fetchError) {
            clearTimeout(timeoutId);

            if (fetchError.name === 'AbortError') {
                res.status(504).json({
                    success: false,
                    error: 'Timeout',
                    message: 'External API request timed out'
                });
                return;
            }

            throw fetchError;
        }
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred while processing the request'
        });
    }
}

/**
 * Setup middleware for external customers API
 */
function setupExternalCustomersAPI(devServerConfig) {
    const originalSetupMiddlewares = devServerConfig.setupMiddlewares;

    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
        // Add API route handler BEFORE other middlewares
        devServer.app.get('/api/external/customers', async (req, res) => {
            await handleExternalCustomersRequest(req, res);
        });

        // Call original setup if exists
        if (originalSetupMiddlewares) {
            middlewares = originalSetupMiddlewares(middlewares, devServer);
        }

        return middlewares;
    };

    return devServerConfig;
}

module.exports = setupExternalCustomersAPI;
