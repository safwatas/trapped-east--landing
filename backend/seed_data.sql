-- Seed Data for Trapped New Cairo
-- Run this AFTER supabase_schema.sql

-- Clear existing data (optional, be careful in prod)
TRUNCATE TABLE room_images, pricing_tiers, bookings, rooms, time_slots RESTART IDENTITY CASCADE;

-- Time Slots
-- Fixed daily: 3:00 PM, 4:30 PM, 6:00 PM, 7:30 PM, 9:00 PM, 10:30 PM, 12:00 AM, 1:30 AM
INSERT INTO time_slots (slot_time, is_active) VALUES
  ('01:30 AM', true),
  ('12:00 AM', true),
  ('10:30 PM', true),
  ('09:00 PM', true),
  ('08:30 PM', true),
  ('07:00 PM', true),
  ('06:30 PM', true),
  ('04:30 PM', true),
  ('03:00 PM', true)
ON CONFLICT (slot_time) DO UPDATE SET is_active = EXCLUDED.is_active;

-- Rooms
INSERT INTO rooms (slug, name, tagline, description, min_players, max_players, duration, difficulty, is_horror, horror_toggleable, active) VALUES
  ('namrood', 'Namrood', 'We have to stick together', 'The Nimrod! He is the greatest sorcerer of the Middle Ages, the embodiment of pure evil on Earth, and the king of black magic. Your curiosity has brought you to his doorstep, and entering his house is easy, but leaving won''t be so simple. You must either escape and find the spell that will free you from this house and save you from black magic… or it will be your last night seeing the light!', 2, 7, 60, 'Medium', true, true, true),
  ('bunker-38', 'Bunker 38', 'The Nuclear Story', 'It''s like an underground bunker you were locked in following an apocalypse and you have to get out before the oxygen runs out..', 2, 7, 60, 'Medium', false, false, true),
  ('detonation', 'Detonation', 'I''m not ready to blow up', 'It''s been a good hard year of gathering information on Danny Badd, a dangerous criminal, wanted by many different countries for various crimes, and now you''ve got the best lead with regards to his location but beware as Badd is notorious for blowing up anyone who attempts to track him down … Can you disarm the bomb and escape before you get detonated?', 2, 7, 60, 'Medium', false, false, true),
  ('cell-block-c', 'Cell Block C', 'The wrong conviction', 'You and your friends were wrongly convicted in a terrorism crime in a foreign country..this bombing crime was really executed by the international terrorist "Danny Badd", but you need to be free to prove that! You are now locked in the highest security prison called "Cell Block C" dedicated to the criminals who are deemed the most dangerous and in need of the tightest control. Can you outwit the system, clear your names, and thwart a global threat before it''s too late?', 2, 7, 60, 'Medium', false, false, true),
  ('dungeon-of-doom', 'The Dungeon Of Doom', 'Hurry something is coming!', 'Your friend has been wrongly accused of murder and sentenced to die. They''re locked in a medieval dungeon, and it''s up to you to break in and save them. Can you free your friend and escape the dungeon before the guards come back? You''ve only got 60 minutes, or you''ll face the same fate.', 3, 7, 60, 'Medium', true, true, true),
  ('sacrifice', 'Sacrifice', 'Hear their screams.. but move on', 'Kidnapped and divided into two rooms, you and your friends can see and hear each other but can''t reach. To escape, you must solve puzzles in each room and reunite before time runs out. Can you outwit your captors and reunite your group?', 4, 10, 60, 'Hard', false, false, true),
  ('the-experiments', 'The Experiments', 'The next scream will be yours', 'Imprisoned in the lair of a psychopathic doctor fixated on conducting drug tests using human body parts, your mission is clear: escape before you become her next gruesome experiment. Can you break free before it''s too late?', 2, 7, 60, 'Very Hard', true, true, true),
  ('vault', 'Vault', 'It''s not stealing if it''s yours', 'You''ve made the bold decision to break into a luxurious bank vault to reclaim the money that was taken from you by a deceitful casino. Now, surrounded by heavy security, your mission is to swiftly retrieve your cash before law enforcement arrives.', 2, 7, 60, 'Very Hard', false, false, true),
  ('quarantined', 'Quarantined', 'Not again', 'You''re stuck in a quarantined area filled with zombies due to a virus outbreak. Your goal: escape before you get infected and become one of them.', 3, 7, 60, 'Expert', true, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  min_players = EXCLUDED.min_players,
  max_players = EXCLUDED.max_players,
  duration = EXCLUDED.duration,
  difficulty = EXCLUDED.difficulty,
  is_horror = EXCLUDED.is_horror,
  horror_toggleable = EXCLUDED.horror_toggleable,
  active = EXCLUDED.active;

-- Pricing & Images
DO $$
DECLARE
  namrood_id UUID;
  bunker_id UUID;
  detonation_id UUID;
  cell_id UUID;
  dungeon_id UUID;
  sacrifice_id UUID;
  experiments_id UUID;
  vault_id UUID;
  quarantined_id UUID;
BEGIN
  SELECT id INTO namrood_id FROM rooms WHERE slug = 'namrood';
  SELECT id INTO bunker_id FROM rooms WHERE slug = 'bunker-38';
  SELECT id INTO detonation_id FROM rooms WHERE slug = 'detonation';
  SELECT id INTO cell_id FROM rooms WHERE slug = 'cell-block-c';
  SELECT id INTO dungeon_id FROM rooms WHERE slug = 'dungeon-of-doom';
  SELECT id INTO sacrifice_id FROM rooms WHERE slug = 'sacrifice';
  SELECT id INTO experiments_id FROM rooms WHERE slug = 'the-experiments';
  SELECT id INTO vault_id FROM rooms WHERE slug = 'vault';
  SELECT id INTO quarantined_id FROM rooms WHERE slug = 'quarantined';

  -- Pricing Logic
  -- 2: 470, 3: 460, 4: 450, 5: 440, 6: 430, 7+: 420
  
  -- Namrood (2-7)
  INSERT INTO pricing_tiers (room_id, player_count, price_per_person) VALUES
    (namrood_id, 2, 470), (namrood_id, 3, 460), (namrood_id, 4, 450), (namrood_id, 5, 440), (namrood_id, 6, 430), (namrood_id, 7, 420)
  ON CONFLICT (room_id, player_count) DO UPDATE SET price_per_person = EXCLUDED.price_per_person;

  -- Bunker 38 (2-7)
  INSERT INTO pricing_tiers (room_id, player_count, price_per_person) VALUES
    (bunker_id, 2, 470), (bunker_id, 3, 460), (bunker_id, 4, 450), (bunker_id, 5, 440), (bunker_id, 6, 430), (bunker_id, 7, 420)
  ON CONFLICT (room_id, player_count) DO UPDATE SET price_per_person = EXCLUDED.price_per_person;

  -- Detonation (2-7)
  INSERT INTO pricing_tiers (room_id, player_count, price_per_person) VALUES
    (detonation_id, 2, 470), (detonation_id, 3, 460), (detonation_id, 4, 450), (detonation_id, 5, 440), (detonation_id, 6, 430), (detonation_id, 7, 420)
  ON CONFLICT (room_id, player_count) DO UPDATE SET price_per_person = EXCLUDED.price_per_person;

  -- Cell Block C (2-7)
  INSERT INTO pricing_tiers (room_id, player_count, price_per_person) VALUES
    (cell_id, 2, 470), (cell_id, 3, 460), (cell_id, 4, 450), (cell_id, 5, 440), (cell_id, 6, 430), (cell_id, 7, 420)
  ON CONFLICT (room_id, player_count) DO UPDATE SET price_per_person = EXCLUDED.price_per_person;

  -- Dungeon of Doom (3-7)
  INSERT INTO pricing_tiers (room_id, player_count, price_per_person) VALUES
    (dungeon_id, 3, 460), (dungeon_id, 4, 450), (dungeon_id, 5, 440), (dungeon_id, 6, 430), (dungeon_id, 7, 420)
  ON CONFLICT (room_id, player_count) DO UPDATE SET price_per_person = EXCLUDED.price_per_person;

  -- Sacrifice (4-10) -> Assuming 8,9,10 are also 420? Mock says "default: 420" for 7+.
  INSERT INTO pricing_tiers (room_id, player_count, price_per_person) VALUES
    (sacrifice_id, 4, 450), (sacrifice_id, 5, 440), (sacrifice_id, 6, 430), (sacrifice_id, 7, 420), (sacrifice_id, 8, 420), (sacrifice_id, 9, 420), (sacrifice_id, 10, 420)
  ON CONFLICT (room_id, player_count) DO UPDATE SET price_per_person = EXCLUDED.price_per_person;

  -- The Experiments (2-7)
  INSERT INTO pricing_tiers (room_id, player_count, price_per_person) VALUES
    (experiments_id, 2, 470), (experiments_id, 3, 460), (experiments_id, 4, 450), (experiments_id, 5, 440), (experiments_id, 6, 430), (experiments_id, 7, 420)
  ON CONFLICT (room_id, player_count) DO UPDATE SET price_per_person = EXCLUDED.price_per_person;

  -- Vault (2-7)
  INSERT INTO pricing_tiers (room_id, player_count, price_per_person) VALUES
    (vault_id, 2, 470), (vault_id, 3, 460), (vault_id, 4, 450), (vault_id, 5, 440), (vault_id, 6, 430), (vault_id, 7, 420)
  ON CONFLICT (room_id, player_count) DO UPDATE SET price_per_person = EXCLUDED.price_per_person;

  -- Quarantined (3-7)
  INSERT INTO pricing_tiers (room_id, player_count, price_per_person) VALUES
    (quarantined_id, 3, 460), (quarantined_id, 4, 450), (quarantined_id, 5, 440), (quarantined_id, 6, 430), (quarantined_id, 7, 420)
  ON CONFLICT (room_id, player_count) DO UPDATE SET price_per_person = EXCLUDED.price_per_person;

  -- Room Images
  -- Using URLs from mock data
  INSERT INTO room_images (room_id, image_url, order_index) VALUES
    (namrood_id, 'https://trappedegypt.com/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-01-at-13.36.44_af1e3e29-e1730475779818.jpg', 0),
    (bunker_id, 'https://trappedegypt.com/wp-content/uploads/2025/02/BUNKER-POSTER-2-scaled-e1740163225168.jpg', 0),
    (detonation_id, 'https://trappedegypt.com/wp-content/uploads/2025/02/DETONATION-P2-scaled-e1740163417545.jpg', 0),
    (cell_id, 'https://trappedegypt.com/wp-content/uploads/2022/11/WhatsApp-Image-2022-11-01-at-8.29.53-PM-2.jpeg.webp', 0),
    (dungeon_id, 'https://trappedegypt.com/wp-content/uploads/2022/11/WhatsApp-Image-2022-11-01-at-8.29.53-PM-5.jpeg.webp', 0),
    (sacrifice_id, 'https://trappedegypt.com/wp-content/uploads/2022/12/sacri.jpg', 0),
    (experiments_id, 'https://trappedegypt.com/wp-content/uploads/2025/02/9.png', 0),
    (vault_id, 'https://trappedegypt.com/wp-content/uploads/2022/12/vaultt.jpg', 0),
    (quarantined_id, 'https://trappedegypt.com/wp-content/uploads/2022/11/WhatsApp-Image-2022-11-01-at-8.29.54-PM-2.jpeg.webp', 0)
  ON CONFLICT (room_id, image_url) DO NOTHING;
END $$;

SELECT 'Seed data v2 inserted successfully!' AS status;
