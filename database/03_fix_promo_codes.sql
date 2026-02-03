-- ============================================
-- OPTIONAL: Add created_at column to promo_codes table
-- (If you want ordering by creation date in admin)
-- ============================================

-- Add created_at column with default value
ALTER TABLE promo_codes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at column as well
ALTER TABLE promo_codes 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'promo_codes';
