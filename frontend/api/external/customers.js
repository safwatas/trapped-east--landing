/**
 * Vercel Serverless Function: External Customers API Proxy
 * 
 * This proxy handles requests to the external Trapped customer data API.
 * It provides:
 * - Input validation
 * - Default pagination values
 * - Timeout handling
 * - Graceful error handling
 * 
 * IMPORTANT: This API provides CUSTOMER DATA ONLY.
 * It does NOT include booking, availability, or slot data.
 */

const EXTERNAL_API_URL = 'http://trappedeg.com/api/data';
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_NUMBER = 1;
const API_TIMEOUT_MS = 15000; // 15 seconds

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
    // Remove potentially harmful characters, allow alphanumeric, spaces, and common phone chars
    return String(term).replace(/[<>{}[\]\\]/g, '').substring(0, 100);
};

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed',
            message: 'Only GET requests are supported'
        });
    }

    try {
        // Extract and validate query parameters
        const {
            searchTerm = '',
            pagesize = DEFAULT_PAGE_SIZE,
            pageNumber = DEFAULT_PAGE_NUMBER,
            sortBy = 'firstname',
            sortDescending = 'true'
        } = req.query;

        // Validate pagesize
        if (!isValidNumber(pagesize, 1, 100)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid pagesize',
                message: 'pagesize must be a number between 1 and 100'
            });
        }

        // Validate pageNumber
        if (!isValidNumber(pageNumber, 1, 10000)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid pageNumber',
                message: 'pageNumber must be a number between 1 and 10000'
            });
        }

        // Validate sortBy
        if (!isValidSortBy(sortBy)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid sortBy',
                message: 'sortBy must be one of: firstname, lastname, phonenumber'
            });
        }

        // Validate sortDescending
        if (!isValidBoolean(sortDescending)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid sortDescending',
                message: 'sortDescending must be true or false'
            });
        }

        // Build query parameters for external API
        const params = new URLSearchParams({
            pagesize: String(pagesize),
            pageNumber: String(pageNumber),
            sortBy: sortBy || 'firstname',
            sortDescending: String(sortDescending === 'true' || sortDescending === true)
        });

        // Add search term if provided
        const sanitizedSearch = sanitizeSearchTerm(searchTerm);
        if (sanitizedSearch) {
            params.append('searchTerm', sanitizedSearch);
        }

        const apiUrl = `${EXTERNAL_API_URL}?${params.toString()}`;

        // Create abort controller for timeout
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
                return res.status(502).json({
                    success: false,
                    error: 'External API error',
                    message: 'Failed to fetch customer data from external service'
                });
            }

            const data = await response.json();

            // Add metadata to the response
            return res.status(200).json({
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
                console.error('External API timeout');
                return res.status(504).json({
                    success: false,
                    error: 'Timeout',
                    message: 'External API request timed out'
                });
            }

            throw fetchError;
        }

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred while processing the request'
        });
    }
}
