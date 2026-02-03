-- ============================================
-- STEP 1: Add Arabic Translation Columns to Rooms Table
-- Run this in Supabase SQL Editor
-- ============================================

-- Add Arabic name column
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS name_ar TEXT;

-- Add Arabic tagline column  
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS tagline_ar TEXT;

-- Add Arabic description column
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rooms' 
AND column_name IN ('name_ar', 'tagline_ar', 'description_ar');
