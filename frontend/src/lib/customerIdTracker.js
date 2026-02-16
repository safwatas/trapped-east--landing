/**
 * Customer ID Tracker Service
 * 
 * This service tracks the highest customer ID seen each day.
 * Since the external API doesn't have date filtering, we use customer IDs
 * as a proxy for time - newer customers have higher IDs.
 * 
 * By recording the max ID daily, we can:
 * 1. Know what ID range corresponds to what date range
 * 2. Filter customers by "registration date" using ID ranges
 */

import { supabase } from './supabase';

const TABLE_NAME = 'customer_id_snapshots';

/**
 * Record today's max customer ID from the external API
 * This should be called periodically (e.g., when loading the Customer Explorer)
 * 
 * @param {number} maxId - The highest customer ID seen
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function recordDailySnapshot(maxId) {
    if (!maxId || typeof maxId !== 'number') {
        return { success: false, error: 'Invalid maxId' };
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
        // Upsert: update if today's record exists, otherwise insert
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .upsert({
                snapshot_date: today,
                max_customer_id: maxId,
                recorded_at: new Date().toISOString()
            }, {
                onConflict: 'snapshot_date'
            })
            .select()
            .single();

        if (error) {
            console.error('Error recording snapshot:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err) {
        console.error('Snapshot recording error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Get all recorded snapshots
 * 
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export async function getSnapshots() {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('snapshot_date', { ascending: false });

        if (error) {
            console.error('Error fetching snapshots:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data: data || [] };
    } catch (err) {
        console.error('Snapshots fetch error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Get the ID range for a specific date range
 * 
 * @param {string} fromDate - Start date (YYYY-MM-DD)
 * @param {string} toDate - End date (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, minId?: number, maxId?: number, error?: string}>}
 */
export async function getIdRangeForDates(fromDate, toDate) {
    try {
        // Get snapshot for the day BEFORE fromDate (to get the min ID)
        const { data: beforeData } = await supabase
            .from(TABLE_NAME)
            .select('max_customer_id')
            .lt('snapshot_date', fromDate)
            .order('snapshot_date', { ascending: false })
            .limit(1)
            .single();

        // Get snapshot for toDate (to get the max ID)
        const { data: toData } = await supabase
            .from(TABLE_NAME)
            .select('max_customer_id')
            .lte('snapshot_date', toDate)
            .order('snapshot_date', { ascending: false })
            .limit(1)
            .single();

        // If we don't have data for the day before fromDate, minId starts from 0
        const minId = beforeData?.max_customer_id ? beforeData.max_customer_id + 1 : 0;
        const maxId = toData?.max_customer_id || null;

        return {
            success: true,
            minId,
            maxId,
            hasData: !!toData
        };
    } catch (err) {
        console.error('ID range fetch error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Get date range suggestions based on available snapshots
 * Returns the earliest and latest dates with recorded snapshots
 * 
 * @returns {Promise<{success: boolean, earliestDate?: string, latestDate?: string, totalSnapshots?: number}>}
 */
export async function getAvailableDateRange() {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('snapshot_date')
            .order('snapshot_date', { ascending: true });

        if (error || !data || data.length === 0) {
            return {
                success: true,
                earliestDate: null,
                latestDate: null,
                totalSnapshots: 0
            };
        }

        return {
            success: true,
            earliestDate: data[0].snapshot_date,
            latestDate: data[data.length - 1].snapshot_date,
            totalSnapshots: data.length
        };
    } catch (err) {
        console.error('Date range fetch error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Calculate the max ID from customer data
 * 
 * @param {Array} customers - Array of customer objects
 * @returns {number|null} - The maximum ID or null if no valid IDs found
 */
export function getMaxIdFromCustomers(customers) {
    if (!Array.isArray(customers) || customers.length === 0) {
        return null;
    }

    const ids = customers
        .map(c => c.id || c._id)
        .filter(id => typeof id === 'number' && !isNaN(id));

    if (ids.length === 0) return null;

    return Math.max(...ids);
}

/**
 * Filter customers by ID range
 * 
 * @param {Array} customers - Array of customer objects
 * @param {number|null} minId - Minimum ID (inclusive), null means no lower bound
 * @param {number|null} maxId - Maximum ID (inclusive), null means no upper bound
 * @returns {Array} - Filtered customers
 */
export function filterCustomersByIdRange(customers, minId, maxId) {
    if (!Array.isArray(customers)) return [];

    return customers.filter(customer => {
        const id = customer.id || customer._id;
        if (typeof id !== 'number') return false;

        if (minId !== null && id < minId) return false;
        if (maxId !== null && id > maxId) return false;

        return true;
    });
}
