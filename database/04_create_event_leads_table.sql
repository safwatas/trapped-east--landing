-- =====================================================
-- 04_create_event_leads_table.sql
-- Creates the event_leads table for storing special event inquiries
-- (Birthdays, Corporate Team Building, School Trips)
-- =====================================================

-- Create the event_leads table
CREATE TABLE IF NOT EXISTS event_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Event type: 'birthday', 'corporate', 'school'
    event_type TEXT NOT NULL,
    
    -- Contact information
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    
    -- Location/Branch
    branch TEXT DEFAULT 'New Cairo',
    
    -- Lead status: 'New', 'Contacted', 'Closed', 'Booked'
    status TEXT DEFAULT 'New',
    
    -- Structured fields for better querying
    preferred_date DATE,
    preferred_time TEXT,
    group_size TEXT,
    
    -- All additional form data as JSON
    form_payload JSONB DEFAULT '{}',
    
    -- Internal notes from staff
    internal_notes TEXT,
    
    -- UTM tracking parameters
    utm_source TEXT,
    utm_campaign TEXT,
    utm_medium TEXT,
    utm_content TEXT,
    fbclid TEXT,
    
    -- Analytics event ID (for Meta/GA tracking correlation)
    event_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_event_leads_event_type ON event_leads(event_type);
CREATE INDEX IF NOT EXISTS idx_event_leads_status ON event_leads(status);
CREATE INDEX IF NOT EXISTS idx_event_leads_created_at ON event_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_leads_branch ON event_leads(branch);
CREATE INDEX IF NOT EXISTS idx_event_leads_phone ON event_leads(phone);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on the table
ALTER TABLE event_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public/anonymous users to INSERT new leads (website form submissions)
CREATE POLICY "Allow public insert for event leads"
    ON event_leads
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to SELECT all leads (admin dashboard)
CREATE POLICY "Allow authenticated select for event leads"
    ON event_leads
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to UPDATE leads (admin status updates)
CREATE POLICY "Allow authenticated update for event leads"
    ON event_leads
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- Verification
-- =====================================================

-- After running this script, verify with:
-- SELECT * FROM event_leads LIMIT 5;
-- 
-- Test insert (you can delete this after testing):
-- INSERT INTO event_leads (event_type, name, phone, email, branch, form_payload)
-- VALUES ('birthday', 'Test User', '+201234567890', 'test@example.com', 'New Cairo', '{"childAge": 8}');
