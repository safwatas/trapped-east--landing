-- Seed Data for Trapped New Cairo
-- Run this AFTER supabase_schema.sql

-- Time Slots
INSERT INTO time_slots (slot_time, is_active) VALUES
  ('12:00', true),
  ('14:00', true),
  ('16:00', true),
  ('18:00', true),
  ('20:00', true),
  ('22:00', true)
ON CONFLICT DO NOTHING;

-- Rooms
INSERT INTO rooms (slug, name, tagline, description, min_players, max_players, duration, difficulty, is_horror, horror_toggleable, active) VALUES
  ('the-pharaohs-curse', 'The Pharaoh''s Curse', 'Uncover ancient secrets before time runs out', 'You are archaeologists who have discovered a hidden tomb. But disturbing the Pharaoh''s rest has triggered an ancient curse. Solve the riddles of the ancients to escape before you become permanent residents of the tomb.', 2, 7, 60, 'Medium', false, false, true),
  ('prison-break', 'Prison Break', 'Plan your escape from maximum security', 'Wrongfully convicted, you have one hour while the guards are distracted to execute your escape plan. Work together, find the hidden tools, and break free before lockdown.', 2, 7, 60, 'Hard', false, false, true),
  ('the-haunted-mansion', 'The Haunted Mansion', 'Survive the night in a cursed estate', 'Legend says anyone who enters the mansion never leaves. You have one hour to uncover the dark secrets within and break the curse—or become part of the haunting forever.', 2, 7, 60, 'Hard', true, true, true),
  ('bank-heist', 'Bank Heist', 'Pull off the ultimate score', 'Your crew has been planning this heist for months. You have 60 minutes to crack the vault, grab the loot, and escape before the silent alarm brings the police.', 3, 7, 60, 'Very Hard', false, false, true)
ON CONFLICT (slug) DO NOTHING;

-- Pricing Tiers (per room, per player count)
-- Get room IDs first
DO $$
DECLARE
  pharaoh_id UUID;
  prison_id UUID;
  mansion_id UUID;
  heist_id UUID;
BEGIN
  SELECT id INTO pharaoh_id FROM rooms WHERE slug = 'the-pharaohs-curse';
  SELECT id INTO prison_id FROM rooms WHERE slug = 'prison-break';
  SELECT id INTO mansion_id FROM rooms WHERE slug = 'the-haunted-mansion';
  SELECT id INTO heist_id FROM rooms WHERE slug = 'bank-heist';

  -- Standard pricing for all rooms
  INSERT INTO pricing_tiers (room_id, player_count, price_per_person) VALUES
    (pharaoh_id, 2, 470), (pharaoh_id, 3, 460), (pharaoh_id, 4, 450), (pharaoh_id, 5, 440), (pharaoh_id, 6, 430), (pharaoh_id, 7, 420),
    (prison_id, 2, 470), (prison_id, 3, 460), (prison_id, 4, 450), (prison_id, 5, 440), (prison_id, 6, 430), (prison_id, 7, 420),
    (mansion_id, 2, 470), (mansion_id, 3, 460), (mansion_id, 4, 450), (mansion_id, 5, 440), (mansion_id, 6, 430), (mansion_id, 7, 420),
    (heist_id, 3, 460), (heist_id, 4, 450), (heist_id, 5, 440), (heist_id, 6, 430), (heist_id, 7, 420)
  ON CONFLICT (room_id, player_count) DO NOTHING;

  -- Room Images (placeholder URLs - replace with real ones)
  INSERT INTO room_images (room_id, image_url, order_index) VALUES
    (pharaoh_id, 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800', 0),
    (prison_id, 'https://images.unsplash.com/photo-1518398046578-8cca57782e17?w=800', 0),
    (mansion_id, 'https://images.unsplash.com/photo-1520450202524-87e5dd06a74b?w=800', 0),
    (heist_id, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', 0)
  ON CONFLICT DO NOTHING;
END $$;

-- Sample Promo Code
INSERT INTO promo_codes (code, discount_type, discount_value, min_players, active) VALUES
  ('WELCOME10', 'percentage', 10, 2, true),
  ('GROUP50', 'fixed', 50, 5, true)
ON CONFLICT (code) DO NOTHING;

SELECT 'Seed data inserted successfully!' AS status;
