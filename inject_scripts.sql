-- INJECT 20 HIGH QUALITY SCRIPTS
-- Run this in your Supabase SQL Editor

-- NOTE: Ensure 'scripts' table exists. This script assumes the schema:
-- id, title, genre, quality, complexity, base_cost, description, tagline, required_cast, tone

INSERT INTO scripts (id, title, genre, quality, complexity, base_cost, description, tagline, required_cast, tone) VALUES 
-- ACTION
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'The Last Centurion', 'Action', 95, 85, 1200000, 'A disgraced Roman general creates an underground resistance to save the Empire from corruption.', 'Strength and Honor.', 4, 'Serious'),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Velocity Point', 'Action', 88, 70, 750000, 'An ex-racer must drive a prototype car with a bomb attached across Europe in under 12 hours.', 'Don''t slow down.', 3, 'High-Octane'),
('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'Shadow Protocol', 'Action', 92, 80, 850000, 'A CIA analyst discovers his entire division is a front for a terrorist organization.', 'Trust no one.', 3, 'Dark'),
('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'Steel Horizon', 'Action', 90, 90, 1500000, 'In a flooded future, a captain must defend the last oil rig from pirates.', 'Waterworld done right.', 5, 'Epic'),

-- DRAMA
('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'The Pianist''s Daughter', 'Drama', 98, 95, 350000, 'A deaf musical prodigy struggles to connect with her estranged, famous composer father.', 'Silence speaks volumes.', 2, 'Emotional'),
('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 'Wall Street Blues', 'Drama', 94, 85, 450000, 'A young trader uncovers massive fraud at his firm during the dot-com bubble burst.', 'Greed is still good?', 3, 'Cynical'),
('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'Sunday Morning', 'Drama', 96, 75, 250000, 'A multi-generational story of a family gathering for their matriarch''s final weekend.', 'Family is forever.', 6, 'Heartwarming'),
('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'State of Affairs', 'Drama', 91, 92, 550000, 'A White House press secretary manages a crisis that could start WWIII.', 'Spin or die.', 4, 'Tense'),

-- SCI-FI
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'Neural Net', 'Sci-Fi', 97, 98, 1100000, 'An AI researcher uploads his consciousness to the web, only to find something else is already there.', 'Hello World.', 2, 'Mind-Bending'),
('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 'Mars Colony One', 'Sci-Fi', 89, 85, 1800000, 'The first settlers on Mars discover ancient ruins that shouldn''t exist.', 'We weren''t first.', 5, 'Mysterious'),
('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 'Chrono Triggered', 'Sci-Fi', 93, 90, 900000, 'A detective solves crimes by sending his consciousness one hour into the past.', 'Time is the weapon.', 3, 'Noir'),

-- COMEDY
('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 'The Wedding Crasher 2', 'Comedy', 88, 60, 400000, 'Two divorce lawyers crash weddings to find clients, but end up falling in love.', 'Get ready to settle.', 2, 'Wacky'),
('a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d', 'Dude, Where''s My Server?', 'Comedy', 85, 55, 300000, 'IT technicians lose a server containing the company''s IPO data after a night out.', '404: Memory Not Found.', 3, 'Silly'),
('b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e', 'Presidential Suite', 'Comedy', 87, 65, 500000, 'A hotel maid is mistaken for a visiting diplomat and must negotiate a peace treaty.', 'Service with a smile.', 4, 'Lighthearted'),

-- HORROR
('c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f', 'The Silent Hall', 'Horror', 91, 75, 200000, 'A night watchman at a museum notices the exhibits moving closer when he isn''t looking.', 'Don''t blink.', 2, 'Terrifying'),
('d6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a', 'Frequency 666', 'Horror', 89, 70, 250000, 'A late-night radio host receives a call from the future... announcing his own death.', 'Dead air.', 1, 'Suspenseful'),
('e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9f0a1b', 'Camp Blood', 'Horror', 86, 60, 150000, 'Counselors at a summer camp realize the campfire stories are becoming real.', 'Based on a true nightmare.', 5, 'Gory'),

-- ROMANCE
('f8a9b0c1-d2e3-4f4a-5b6c-7d8e9f0a1b2c', 'Midnight in Paris', 'Romance', 94, 70, 300000, 'Two strangers stuck in an airport during a snowstorm find a connection.', 'Love is scheduled.', 2, 'Romantic'),
('a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d', 'Letters to Rose', 'Romance', 92, 65, 350000, 'A woman finds love letters from WWII in an antique desk and tracks down the author.', 'Words traverse time.', 2, 'Bittersweet'),
('b0c1d2e3-f4a5-4b6c-7d8e-9f0a1b2c3d4e', 'The Baker''s Choice', 'Romance', 88, 60, 450000, 'A celebrity chef falls for a small-town baker during a televised competition.', 'Recipe for love.', 2, 'Sweet');
