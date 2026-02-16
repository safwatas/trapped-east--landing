-- Event Leads Table for Special Events
-- Phase 6: Corporate, School Trips, Birthdays

CREATE TABLE IF NOT EXISTS event_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Event Classification
  event_type TEXT NOT NULL CHECK (event_type IN ('corporate', 'school', 'birthday')),
  
  -- Contact Info
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  branch TEXT DEFAULT 'New Cairo',
  
  -- Status Management
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Closed', 'Booked', 'Cancelled')),
  internal_notes TEXT,
  
  -- Full Form Data (JSON)
  form_payload JSONB NOT NULL DEFAULT '{}',
  
  -- Attribution
  utm_source TEXT,
  utm_campaign TEXT,
  utm_medium TEXT,
  utm_content TEXT,
  fbclid TEXT,
  event_id UUID -- For tracking deduplication
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_event_leads_type ON event_leads(event_type);
CREATE INDEX IF NOT EXISTS idx_event_leads_status ON event_leads(status);
CREATE INDEX IF NOT EXISTS idx_event_leads_created ON event_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_leads_branch ON event_leads(branch);

-- RLS Policies
ALTER TABLE event_leads ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins full access to event_leads"
ON event_leads FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Allow anonymous inserts for lead submission
CREATE POLICY "Allow anonymous event lead submissions"
ON event_leads FOR INSERT
TO anon
WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON event_leads TO authenticated;
GRANT INSERT ON event_leads TO anon;
