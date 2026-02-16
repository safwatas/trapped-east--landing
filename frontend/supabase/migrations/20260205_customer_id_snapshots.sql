-- Customer ID Snapshots Table
-- This table stores daily snapshots of the maximum customer ID
-- Used to enable date-based filtering in the Customer Explorer
-- Since the external API doesn't support date filtering, we track ID ranges by date

CREATE TABLE IF NOT EXISTS customer_id_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    snapshot_date DATE NOT NULL UNIQUE,
    max_customer_id INTEGER NOT NULL,
    total_records INTEGER,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster date-based lookups
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON customer_id_snapshots(snapshot_date);

-- Enable RLS
ALTER TABLE customer_id_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read and insert
CREATE POLICY "Allow authenticated read" ON customer_id_snapshots
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON customer_id_snapshots
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON customer_id_snapshots
    FOR UPDATE TO authenticated USING (true);

-- Comment for documentation
COMMENT ON TABLE customer_id_snapshots IS 'Stores daily snapshots of max customer ID for date-based filtering in Customer Explorer';
