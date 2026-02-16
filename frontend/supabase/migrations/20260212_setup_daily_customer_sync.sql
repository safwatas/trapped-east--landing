-- Enable pg_cron and pg_net extensions (via Supabase Dashboard > Database > Extensions)
-- These are required for automated daily customer sync

-- STEP 1: Enable pg_cron extension (if not already enabled)
-- Go to Supabase Dashboard > Database > Extensions > Search "pg_cron" > Enable
-- Go to Supabase Dashboard > Database > Extensions > Search "pg_net" > Enable

-- STEP 2: Schedule the daily sync job
-- This calls the Edge Function every day at 3 AM UTC (5 AM Cairo time)
-- Run this SQL in the Supabase SQL Editor:

SELECT cron.schedule(
    'daily-customer-sync',         -- Job name
    '0 3 * * *',                   -- Cron expression: 3 AM UTC daily
    $$
    SELECT net.http_post(
        url := 'https://dqggwdkhhffvxpvclnzx.supabase.co/functions/v1/sync-daily-customers',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || current_setting('supabase.service_role_key'),
            'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
    );
    $$
);

-- STEP 3: Verify the schedule
-- SELECT * FROM cron.job;

-- STEP 4: To manually test the sync, you can also run:
-- SELECT net.http_post(
--     url := 'https://dqggwdkhhffvxpvclnzx.supabase.co/functions/v1/sync-daily-customers',
--     headers := jsonb_build_object(
--         'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
--         'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
-- );

-- To unschedule the job:
-- SELECT cron.unschedule('daily-customer-sync');
