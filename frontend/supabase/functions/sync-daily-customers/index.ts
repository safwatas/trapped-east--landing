/**
 * Supabase Edge Function: Sync Daily Customers
 * 
 * This function is designed to run daily (via cron) to:
 * 1. Fetch the latest customer data from the external Trapped API
 * 2. Record the max customer ID for today in the customer_id_snapshots table
 * 3. Store the total record count for tracking growth
 * 
 * This ensures the Customer Explorer's date filtering works reliably
 * without requiring an admin to manually open the page every day.
 * 
 * Deployment:
 *   supabase functions deploy sync-daily-customers
 * 
 * Cron setup (in Supabase Dashboard > Database > Extensions > pg_cron):
 *   SELECT cron.schedule(
 *     'daily-customer-sync',
 *     '0 3 * * *',  -- Run at 3 AM UTC daily
 *     $$SELECT net.http_post(
 *       url := 'https://dqggwdkhhffvxpvclnzx.supabase.co/functions/v1/sync-daily-customers',
 *       headers := jsonb_build_object(
 *         'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
 *         'Content-Type', 'application/json'
 *       ),
 *       body := '{}'
 *     );$$
 *   );
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXTERNAL_API_URL = 'http://trappedeg.com/api/data'
const API_TIMEOUT_MS = 30000 // 30 seconds for the sync job
const TABLE_NAME = 'customer_id_snapshots'

interface CustomerRecord {
    id?: number
    _id?: number
    firstName?: string
    lastName?: string
    [key: string]: unknown
}

interface APIResponse {
    data?: CustomerRecord[]
    totalRecords?: number
    totalCount?: number
    [key: string]: unknown
}

/**
 * Fetch the first page with a small page size just to get totalRecords,
 * then fetch the last page to determine the max ID.
 */
async function fetchMaxCustomerId(): Promise<{ maxId: number | null; totalRecords: number | null }> {
    // Step 1: Fetch page 1 to get totalRecords
    const firstPageParams = new URLSearchParams({
        pagesize: '1',
        pageNumber: '1',
        sortBy: 'firstname',
        sortDescending: 'true'
    })

    const controller1 = new AbortController()
    const timeout1 = setTimeout(() => controller1.abort(), API_TIMEOUT_MS)

    try {
        const response1 = await fetch(`${EXTERNAL_API_URL}?${firstPageParams}`, {
            headers: { 'Accept': 'application/json' },
            signal: controller1.signal
        })
        clearTimeout(timeout1)

        if (!response1.ok) {
            throw new Error(`External API returned ${response1.status}`)
        }

        const data1: APIResponse = await response1.json()
        const totalRecords = data1.totalRecords || data1.totalCount || null

        // Step 2: Fetch a larger page to find the highest ID
        // We fetch the last 100 records to find the max ID
        const bigPageParams = new URLSearchParams({
            pagesize: '100',
            pageNumber: '1',
            sortBy: 'firstname',
            sortDescending: 'true'
        })

        const controller2 = new AbortController()
        const timeout2 = setTimeout(() => controller2.abort(), API_TIMEOUT_MS)

        const response2 = await fetch(`${EXTERNAL_API_URL}?${bigPageParams}`, {
            headers: { 'Accept': 'application/json' },
            signal: controller2.signal
        })
        clearTimeout(timeout2)

        if (!response2.ok) {
            throw new Error(`External API returned ${response2.status} on second fetch`)
        }

        const data2: APIResponse = await response2.json()
        const customers: CustomerRecord[] = Array.isArray(data2)
            ? data2
            : (data2.data || [])

        // Find the max ID from the fetched customers
        let maxId: number | null = null
        for (const customer of customers) {
            const id = customer.id || customer._id
            if (typeof id === 'number' && (maxId === null || id > maxId)) {
                maxId = id
            }
        }

        // If we have totalRecords but couldn't find a numeric max ID, 
        // use totalRecords as a fallback proxy
        if (maxId === null && totalRecords) {
            maxId = totalRecords
        }

        return { maxId, totalRecords }
    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            throw new Error('External API request timed out')
        }
        throw error
    }
}

Deno.serve(async (req) => {
    // Allow only POST (from cron) and GET (manual trigger)
    if (req.method !== 'POST' && req.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    try {
        // Create Supabase client with service role for writing
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase environment variables')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Fetch max customer ID from external API
        console.log('[sync-daily-customers] Fetching customer data from external API...')
        const { maxId, totalRecords } = await fetchMaxCustomerId()

        if (maxId === null) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Could not determine max customer ID from external API'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

        // Upsert today's snapshot
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .upsert({
                snapshot_date: today,
                max_customer_id: maxId,
                total_records: totalRecords,
                recorded_at: new Date().toISOString()
            }, {
                onConflict: 'snapshot_date'
            })
            .select()
            .single()

        if (error) {
            console.error('[sync-daily-customers] Supabase error:', error)
            throw new Error(`Failed to save snapshot: ${error.message}`)
        }

        console.log(`[sync-daily-customers] Recorded snapshot for ${today}: maxId=${maxId}, totalRecords=${totalRecords}`)

        return new Response(JSON.stringify({
            success: true,
            message: `Daily snapshot recorded for ${today}`,
            snapshot: {
                date: today,
                maxCustomerId: maxId,
                totalRecords,
                recordedAt: data?.recorded_at
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('[sync-daily-customers] Error:', error)
        return new Response(JSON.stringify({
            success: false,
            error: (error as Error).message || 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
})
