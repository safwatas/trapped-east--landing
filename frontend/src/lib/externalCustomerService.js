/**
 * External Customer Service
 * 
 * Service module for interacting with the external customers API proxy.
 * This service handles fetching, searching, and exporting customer data
 * from the Trapped external API.
 * 
 * IMPORTANT: This API provides CUSTOMER DATA ONLY.
 * It does NOT include booking, availability, or slot data.
 */

const API_BASE_URL = '/api/external/customers';

/**
 * Fetch customers from the external API proxy
 * 
 * @param {Object} options - Fetch options
 * @param {string} options.searchTerm - Search term (name/phone)
 * @param {number} options.pageSize - Number of results per page (1-100)
 * @param {number} options.pageNumber - Page number (1-based)
 * @param {string} options.sortBy - Sort field ('newest', 'oldest', or field name)
 * @returns {Promise<{success: boolean, data: Array, meta: Object}>}
 */
export async function fetchCustomers({
    searchTerm = '',
    pageSize = 20,
    pageNumber = 1,
    sortBy = 'newest'
} = {}) {
    try {
        // Map user-friendly sort options to API params
        // External API only supports: firstname, lastname, phonenumber
        let sortDescending = true;
        let sortField = 'firstname';

        if (sortBy === 'newest' || sortBy === 'id_desc') {
            // Use descending first name as proxy since API doesn't support date/ID sorting
            // Client-side ID sorting is applied after fetch when sortBy is 'id_desc'
            sortDescending = true;
            sortField = 'firstname';
        } else if (sortBy === 'oldest' || sortBy === 'id_asc') {
            // Use ascending first name as proxy
            // Client-side ID sorting is applied after fetch when sortBy is 'id_asc'
            sortDescending = false;
            sortField = 'firstname';
        } else if (sortBy === 'name') {
            sortDescending = false;
            sortField = 'firstname';
        } else if (['firstname', 'lastname', 'phonenumber'].includes(sortBy)) {
            sortField = sortBy;
            sortDescending = false;
        } else {
            sortField = 'firstname';
        }

        const params = new URLSearchParams({
            pagesize: String(pageSize),
            pageNumber: String(pageNumber),
            sortBy: sortField,
            sortDescending: String(sortDescending)
        });

        if (searchTerm?.trim()) {
            params.append('searchTerm', searchTerm.trim());
        }

        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch customers`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching external customers:', error);
        throw error;
    }
}

/**
 * Fetch all customers (paginated behind the scenes)
 * Used for full export functionality
 * 
 * @param {Object} options - Fetch options
 * @param {string} options.searchTerm - Search term (name/phone)
 * @param {string} options.sortBy - Sort field
 * @param {Function} options.onProgress - Progress callback (current, total)
 * @returns {Promise<Array>} - All customer records
 */
export async function fetchAllCustomers({
    searchTerm = '',
    sortBy = 'newest',
    onProgress = () => { }
} = {}) {
    const allCustomers = [];
    let pageNumber = 1;
    const pageSize = 100; // Max allowed
    let hasMore = true;

    while (hasMore) {
        const result = await fetchCustomers({
            searchTerm,
            pageSize,
            pageNumber,
            sortBy
        });

        if (!result.success || !result.data) {
            hasMore = false;
            break;
        }

        // Handle different response structures
        // External API returns: { data: { data: [...customers], totalRecords: X } }
        // Our proxy wraps it: { success: true, data: { ...original } }
        const customers = Array.isArray(result.data)
            ? result.data
            : (result.data.data || result.data.customers || result.data.items || result.data.records || []);

        if (customers.length === 0) {
            hasMore = false;
        } else {
            allCustomers.push(...customers);
            pageNumber++;

            // Progress callback
            onProgress(allCustomers.length, result.data.totalCount || allCustomers.length);

            // Safety check: don't fetch more than 10000 records
            if (allCustomers.length >= 10000 || customers.length < pageSize) {
                hasMore = false;
            }
        }
    }

    return allCustomers;
}

/**
 * Mask a phone number for privacy display
 * Example: 01012345678 -> 010****5678
 * 
 * @param {string} phone - Phone number to mask
 * @returns {string} - Masked phone number
 */
export function maskPhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') return '---';

    const cleaned = phone.replace(/\s+/g, '');

    if (cleaned.length < 7) {
        return cleaned.substring(0, 2) + '****';
    }

    const start = cleaned.substring(0, 3);
    const end = cleaned.substring(cleaned.length - 4);
    return `${start}****${end}`;
}

/**
 * Normalize a phone number to E.164 format for Meta Ads
 * Assumes Egyptian numbers if no country code is present
 * 
 * @param {string} phone - Phone number to normalize
 * @returns {string} - Normalized phone number
 */
export function normalizePhoneForMeta(phone) {
    if (!phone) return '';

    // Remove all non-digit characters except the leading +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Handle Egyptian numbers
    if (cleaned.startsWith('0')) {
        // Egyptian local format -> E.164
        cleaned = '+20' + cleaned.substring(1);
    } else if (cleaned.startsWith('20') && !cleaned.startsWith('+')) {
        // Egyptian format without + -> Add +
        cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+') && cleaned.length >= 10) {
        // Assume Egyptian if no country code and valid length
        cleaned = '+20' + cleaned;
    } else if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    }

    return cleaned;
}

/**
 * Generate CSV content from customer data
 * 
 * @param {Array} customers - Array of customer objects
 * @param {Object} options - Export options
 * @param {boolean} options.metaFormat - Whether to format for Meta Ads
 * @returns {string} - CSV content
 */
export function generateCustomerCSV(customers, { metaFormat = false } = {}) {
    if (!customers || customers.length === 0) {
        return '';
    }

    // Discover all fields from the first few customers
    const sampleSize = Math.min(customers.length, 10);
    const allFields = new Set();
    for (let i = 0; i < sampleSize; i++) {
        Object.keys(customers[i] || {}).forEach(key => allFields.add(key));
    }

    // Define column order - include both camelCase and lowercase variants
    const priorityFields = ['firstName', 'lastName', 'phoneNumber', 'countryCode', 'firstname', 'lastname', 'phonenumber', 'phone', 'email', 'dateOfBirth', 'createdAt'];
    const orderedFields = [
        ...priorityFields.filter(f => allFields.has(f)),
        ...Array.from(allFields).filter(f => !priorityFields.includes(f)).sort()
    ];

    // Meta Ads format: specific columns for Custom Audiences
    if (metaFormat) {
        const metaHeaders = ['phone', 'email', 'fn', 'ln'];
        const metaRows = customers.map(customer => {
            const firstName = customer.firstname || customer.firstName || customer.first_name || '';
            const lastName = customer.lastname || customer.lastName || customer.last_name || '';
            const phone = normalizePhoneForMeta(customer.phonenumber || customer.phone || customer.phoneNumber || '');
            const email = (customer.email || '').toLowerCase().trim();

            return [phone, email, firstName, lastName]
                .map(escapeCSVField)
                .join(',');
        });

        return [metaHeaders.join(','), ...metaRows].join('\n');
    }

    // Standard format with all discovered fields
    const headerRow = orderedFields.join(',');
    const dataRows = customers.map(customer => {
        return orderedFields.map(field => {
            let value = customer[field];

            // Format dates
            if (field.toLowerCase().includes('date') || field === 'createdAt') {
                if (value) {
                    try {
                        value = new Date(value).toISOString().split('T')[0];
                    } catch (e) {
                        // Keep original value if date parsing fails
                    }
                }
            }

            return escapeCSVField(value);
        }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape a field value for CSV
 */
function escapeCSVField(value) {
    if (value === null || value === undefined) return '';

    const stringValue = String(value);

    // If field contains comma, newline, or quote, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
}

/**
 * Download CSV file
 * 
 * @param {string} csvContent - CSV content
 * @param {string} filename - File name (without extension)
 */
export function downloadCSV(csvContent, filename = 'customers') {
    // Add BOM for Excel compatibility with UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Get safe display value for a customer field
 * Handles undefined, null, and various field types
 */
export function getCustomerDisplayValue(customer, field) {
    if (!customer) return '---';

    const value = customer[field];

    if (value === null || value === undefined || value === '') {
        return '---';
    }

    // Handle date fields
    if (field.toLowerCase().includes('date') || field === 'createdAt') {
        try {
            return new Date(value).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return String(value);
        }
    }

    return String(value);
}

/**
 * Get customer full name from various field combinations
 */
export function getCustomerName(customer) {
    if (!customer) return 'Unknown';

    const firstName = customer.firstname || customer.firstName || customer.first_name || '';
    const lastName = customer.lastname || customer.lastName || customer.last_name || '';

    if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
    }

    return customer.name || customer.customerName || 'Unknown';
}

/**
 * Get customer phone from various field names
 */
export function getCustomerPhone(customer) {
    if (!customer) return '';
    return customer.phonenumber || customer.phone || customer.phoneNumber || customer.phone_number || '';
}
