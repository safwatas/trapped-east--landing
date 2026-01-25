-- Admin Setup Script
-- Run this AFTER the schema is applied

-- IMPORTANT: Replace 'YOUR_SUPABASE_USER_ID' with the actual UUID of your user from Supabase Auth
-- You can find this in Supabase Dashboard > Authentication > Users

-- Example: If your admin email is 'admin@trappedegypt.com', first create a user via:
-- 1. Supabase Dashboard > Authentication > Users > Invite user (or Add user)
-- 2. Then get the user's UUID from the user list

-- Insert admin user (replace with actual values)
-- INSERT INTO admin_users (id, email, role) VALUES
--   ('YOUR_SUPABASE_USER_ID', 'admin@trappedegypt.com', 'admin');

-- Helper query to see existing auth users (run in SQL Editor):
-- SELECT id, email FROM auth.users;

-- Once you have the user ID, uncomment and run:
-- INSERT INTO admin_users (id, email, role) VALUES
--   ('replace-with-uuid', 'your-admin@email.com', 'admin')
-- ON CONFLICT (id) DO NOTHING;

SELECT 'Run the INSERT command above with your actual admin user ID' AS instruction;
