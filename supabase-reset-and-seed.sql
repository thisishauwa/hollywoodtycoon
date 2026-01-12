-- =====================================================
-- HOLLYWOOD TYCOON - FULL RESET & SEED SCRIPT
-- Run this in Supabase SQL Editor to:
-- 1. Clear all game data
-- 2. Seed 40 actors with real UUIDs
-- 3. Reset clock to January 2003
-- 4. Set game speed to 2 minutes per month (for testing)
-- =====================================================

-- STEP 1: Clear all existing data
TRUNCATE TABLE game_events CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE owned_scripts CASCADE;
TRUNCATE TABLE bids CASCADE;
TRUNCATE TABLE scripts CASCADE;
TRUNCATE TABLE actor_contracts CASCADE;
TRUNCATE TABLE actors CASCADE;

-- Reset game_state for all users
UPDATE game_state SET
  balance = 5000000,
  reputation = 30,
  updated_at = NOW();

-- Reset global clock to January 2003, 2 minutes per month
UPDATE global_game_clock SET
  month = 1,
  year = 2003,
  advance_interval_hours = 0.0333, -- 2 minutes = 0.0333 hours
  last_advanced_at = NOW()
WHERE id = 1;

-- If no clock exists, insert one
INSERT INTO global_game_clock (id, month, year, advance_interval_hours, last_advanced_at)
SELECT 1, 1, 2003, 0.0333, NOW()
WHERE NOT EXISTS (SELECT 1 FROM global_game_clock WHERE id = 1);

-- STEP 2: Seed all 40 actors with UUIDs
INSERT INTO actors (name, age, gender, tier, salary, reputation, skill, genres, status, bio, visual_description, personality, relationships, gossip) VALUES
-- A-LIST (6 actors)
('Marcus Sterling', 42, 'Male', 'A-List', 2500000, 98, 92, ARRAY['Action', 'Drama'], 'Available',
 'Three-time Academy nominee known for intense method acting. Once lived in a monastery for 6 months to prepare for a role. Refuses to do press junkets.',
 'Salt-and-pepper hair, intense blue eyes, always wears black.',
 ARRAY['Method Actor', 'Reclusive', 'Perfectionist'], '{}', ARRAY[]::TEXT[]),

('Vivienne Cross', 34, 'Female', 'A-List', 2200000, 96, 90, ARRAY['Romance', 'Drama', 'Comedy'], 'Available',
 'America''s sweetheart turned serious actress. Started in teen comedies, now dominates awards season. Known for her infectious laugh and fierce contract negotiations.',
 'Radiant smile, auburn hair, designer everything.',
 ARRAY['Charismatic', 'Business-Savvy', 'Demanding'], '{}', ARRAY[]::TEXT[]),

('Damien Locke', 38, 'Male', 'A-List', 2100000, 94, 88, ARRAY['Sci-Fi', 'Action', 'Thriller'], 'Available',
 'Former stuntman turned leading man. Does all his own stunts and has broken 23 bones on set. Extremely superstitious—won''t start filming on Tuesdays.',
 'Rugged features, visible scars, athletic build.',
 ARRAY['Daredevil', 'Superstitious', 'Loyal'], '{}', ARRAY[]::TEXT[]),

('Celeste Monroe', 29, 'Female', 'A-List', 1900000, 95, 86, ARRAY['Action', 'Thriller', 'Sci-Fi'], 'Available',
 'The reigning action queen. Trained in three martial arts and speaks five languages. Tabloids love her mysterious personal life and rumored feuds.',
 'Striking features, always camera-ready, athletic.',
 ARRAY['Fierce', 'Private', 'Competitive'], '{}', ARRAY[]::TEXT[]),

('Harrison Blake', 55, 'Male', 'A-List', 2800000, 99, 94, ARRAY['Action', 'Drama', 'Sci-Fi'], 'Available',
 'Living legend. Four decades of iconic roles. Known for improvising his best lines. Once punched a director and somehow became more famous.',
 'Weathered charm, graying temples, sardonic grin.',
 ARRAY['Legendary', 'Unpredictable', 'Gruff'], '{}', ARRAY[]::TEXT[]),

('Natasha Vance', 31, 'Female', 'A-List', 2000000, 93, 91, ARRAY['Drama', 'Romance', 'Thriller'], 'Available',
 'Stage actress who conquered Hollywood. Tony winner at 24, Oscar winner at 28. Known for transformative performances and absolutely zero tolerance for mediocrity.',
 'Elegant, expressive eyes, theatrical presence.',
 ARRAY['Theatrical', 'Demanding', 'Brilliant'], '{}', ARRAY[]::TEXT[]),

-- B-LIST (8 actors)
('Derek Chambers', 45, 'Male', 'B-List', 800000, 75, 82, ARRAY['Action', 'Comedy'], 'Available',
 'Former action star trying to transition to comedy. Had a messy divorce that tanked his reputation. Currently on a redemption arc the tabloids love to cover.',
 'Still fit, dad jokes energy, trying too hard.',
 ARRAY['Insecure', 'Desperate', 'Actually Funny'], '{}', ARRAY[]::TEXT[]),

('Miranda Chen', 36, 'Female', 'B-List', 750000, 78, 85, ARRAY['Drama', 'Thriller', 'Horror'], 'Available',
 'Critically acclaimed but never quite breaks through to the A-list. Industry insiders say she''s ''one role away'' from superstardom. Has been ''one role away'' for five years.',
 'Understated elegance, always looks thoughtful.',
 ARRAY['Underrated', 'Patient', 'Quietly Ambitious'], '{}', ARRAY[]::TEXT[]),

('Tyler Finn', 27, 'Male', 'B-List', 650000, 80, 72, ARRAY['Romance', 'Comedy', 'Drama'], 'Available',
 'Teen heartthrob aging out of his niche. Trying to be taken seriously but keeps getting cast as ''the boyfriend.'' Has a problematic stan culture following him around.',
 'Pretty boy looks, perfect hair, puppy dog eyes.',
 ARRAY['Charming', 'Naive', 'People Pleaser'], '{}', ARRAY[]::TEXT[]),

('Josephine Hart', 48, 'Female', 'B-List', 700000, 82, 89, ARRAY['Drama', 'Thriller'], 'Available',
 'Character actress who steals every scene. Oscar-nominated for supporting roles three times. Directors fight to get her for ''the mom who reveals a dark secret.''',
 'Distinguished, maternal warmth hiding steel.',
 ARRAY['Scene-Stealer', 'Generous', 'Wise'], '{}', ARRAY[]::TEXT[]),

('Ricky Delgado', 33, 'Male', 'B-List', 600000, 73, 78, ARRAY['Comedy', 'Action', 'Romance'], 'Available',
 'SNL alumnus who made the jump to films. Known for explosive energy and absolutely chaotic talk show appearances. May or may not have a gambling problem.',
 'Animated expressions, wild energy, always moving.',
 ARRAY['Manic', 'Hilarious', 'Self-Destructive'], '{}', ARRAY[]::TEXT[]),

('Elizabeth Frost', 40, 'Female', 'B-List', 850000, 84, 87, ARRAY['Horror', 'Thriller', 'Drama'], 'Available',
 'Scream queen who''s evolved into a genre icon. Producers know if she''s in a horror film, it''s quality. Runs a popular horror podcast in her spare time.',
 'Striking, can go from girl-next-door to terrifying.',
 ARRAY['Genre-Savvy', 'Professional', 'Secretly Nerdy'], '{}', ARRAY[]::TEXT[]),

('Vincent Cole', 52, 'Male', 'B-List', 700000, 76, 84, ARRAY['Drama', 'Thriller', 'Sci-Fi'], 'Available',
 'Once A-list in the 80s, now a reliable character actor. Has made peace with his faded fame and genuinely enjoys the work. Kids don''t know him but their parents do.',
 'Distinguished, silver fox, carries gravitas.',
 ARRAY['Humble', 'Professional', 'Nostalgic'], '{}', ARRAY[]::TEXT[]),

('Simone Baptiste', 28, 'Female', 'B-List', 550000, 77, 80, ARRAY['Romance', 'Drama', 'Comedy'], 'Available',
 'Rising star from indie darling to mainstream recognition. Critics adore her, audiences are catching on. Known for choosing interesting projects over paychecks.',
 'Natural beauty, expressive, effortlessly cool.',
 ARRAY['Artistic', 'Selective', 'Authentic'], '{}', ARRAY[]::TEXT[]),

-- C-LIST (10 actors)
('Chuck Martinez', 44, 'Male', 'C-List', 250000, 55, 70, ARRAY['Action', 'Comedy'], 'Available',
 'The guy you recognize but can''t name. Been in 47 movies, usually as ''Cop #2'' or ''Guy in Bar.'' Somehow has a cult following for his cameos.',
 'Generic leading man look, forgettable but likeable.',
 ARRAY['Everyman', 'Hardworking', 'Self-Aware'], '{}', ARRAY[]::TEXT[]),

('Tiffany Marlowe', 26, 'Female', 'C-List', 200000, 60, 65, ARRAY['Horror', 'Romance'], 'Available',
 'Former model trying to break into acting. More famous for who she''s dated than her roles. Actually more talented than people give her credit for.',
 'Model gorgeous, knows her angles, underestimated.',
 ARRAY['Underestimated', 'Ambitious', 'Resilient'], '{}', ARRAY[]::TEXT[]),

('Bernard Walsh', 58, 'Male', 'C-List', 180000, 52, 75, ARRAY['Drama', 'Comedy'], 'Available',
 'Theater veteran who never made it big in Hollywood. Does one film a year to pay for his passion projects. Students study his stage work.',
 'Shakespearean bearing, voice like velvet.',
 ARRAY['Theatrical', 'Bitter', 'Talented'], '{}', ARRAY[]::TEXT[]),

('Crystal Powers', 31, 'Female', 'C-List', 220000, 58, 62, ARRAY['Action', 'Sci-Fi'], 'Available',
 'Former fitness influencer turned actress. Takes every action role she can get. Actually does train harder than most stunt doubles.',
 'Incredibly fit, Instagram-ready, determined.',
 ARRAY['Disciplined', 'Social Media Obsessed', 'Driven'], '{}', ARRAY[]::TEXT[]),

('Omar Hassan', 35, 'Male', 'C-List', 230000, 63, 78, ARRAY['Drama', 'Thriller'], 'Available',
 'British-trained actor struggling in Hollywood. Gets typecast constantly but delivers powerful performances anyway. One good role away from breaking out.',
 'Intense gaze, commanding presence, frustrated.',
 ARRAY['Frustrated', 'Talented', 'Determined'], '{}', ARRAY[]::TEXT[]),

('Penny Nguyen', 24, 'Female', 'C-List', 175000, 50, 68, ARRAY['Comedy', 'Romance'], 'Available',
 'YouTube comedian who got a movie deal. Natural comic timing but still learning the craft. Gen Z loves her, studio execs don''t understand her.',
 'Quirky, expressive, meme-able face.',
 ARRAY['Internet Famous', 'Quick-Witted', 'Anxious'], '{}', ARRAY[]::TEXT[]),

('Douglas Henderson', 62, 'Male', 'C-List', 200000, 48, 72, ARRAY['Action', 'Drama'], 'Available',
 'Washed-up 70s action star. Did too many direct-to-video sequels in the 90s. Trying to get one last theatrical role before retirement.',
 'Still imposing, weathered face, holds onto the past.',
 ARRAY['Nostalgic', 'Proud', 'Hoping for Comeback'], '{}', ARRAY[]::TEXT[]),

('Jasmine Okafor', 29, 'Female', 'C-List', 210000, 56, 74, ARRAY['Drama', 'Romance', 'Thriller'], 'Available',
 'Soap opera veteran trying to transition to film. Has the chops but Hollywood hasn''t noticed yet. Extremely dedicated to her craft.',
 'Soap opera glamorous, always camera ready.',
 ARRAY['Dedicated', 'Overlooked', 'Persistent'], '{}', ARRAY[]::TEXT[]),

('Kevin Johnson', 33, 'Male', 'C-List', 190000, 54, 60, ARRAY['Comedy', 'Action'], 'Available',
 'Former rapper turned actor. Movies keep flopping but he keeps getting cast. More charisma than talent. Genuinely nice guy though.',
 'Street fashion, big smile, magnetic energy.',
 ARRAY['Charismatic', 'Limited Range', 'Likeable'], '{}', ARRAY[]::TEXT[]),

('Margot Sullivan', 47, 'Female', 'C-List', 240000, 59, 80, ARRAY['Drama', 'Horror', 'Thriller'], 'Available',
 'Former sitcom star reinventing herself. The mom from that 90s show everyone loved. Tired of being recognized for one role, ready for dramatic work.',
 'Sitcom mom energy, but with edge now.',
 ARRAY['Reinventing', 'Determined', 'Typecast'], '{}', ARRAY[]::TEXT[]),

-- INDIE DARLING (8 actors)
('River Cassidy', 26, 'Male', 'Indie Darling', 150000, 68, 85, ARRAY['Drama', 'Romance'], 'Available',
 'Sundance darling who refuses studio work. Lives in a commune in Vermont. Critics call him a ''once-in-a-generation talent.'' Might be too weird for mainstream.',
 'Ethereal, haunted eyes, androgynous beauty.',
 ARRAY['Artistic', 'Pretentious', 'Genuinely Talented'], '{}', ARRAY[]::TEXT[]),

('Zoe Blackwood', 32, 'Female', 'Indie Darling', 175000, 72, 88, ARRAY['Drama', 'Horror', 'Thriller'], 'Available',
 'Fearless performer known for extreme transformations. Shaved her head twice, gained and lost 40 pounds for roles. Art-house favorite, mainstream hesitant.',
 'Chameleon, unrecognizable between roles.',
 ARRAY['Fearless', 'Method', 'Unconventional'], '{}', ARRAY[]::TEXT[]),

('Ezra Moon', 29, 'Male', 'Indie Darling', 140000, 65, 82, ARRAY['Sci-Fi', 'Drama', 'Fantasy'], 'Available',
 'Philosophy major who fell into acting. Every interview becomes a meditation on existence. Directors either love or hate working with him. No middle ground.',
 'Thoughtful, always seems elsewhere mentally.',
 ARRAY['Philosophical', 'Difficult', 'Magnetic'], '{}', ARRAY[]::TEXT[]),

('Luna Estrella', 24, 'Female', 'Indie Darling', 130000, 64, 79, ARRAY['Drama', 'Fantasy', 'Romance'], 'Available',
 'Cannes discovery at 19, been working steadily in European cinema. American studios keep calling but she keeps saying no. Mystique is her brand.',
 'European elegance, otherworldly presence.',
 ARRAY['Mysterious', 'Selective', 'International'], '{}', ARRAY[]::TEXT[]),

('Atlas Reed', 37, 'Male', 'Indie Darling', 165000, 70, 86, ARRAY['Drama', 'Comedy', 'Thriller'], 'Available',
 'Documentary filmmaker who started acting on a dare. Brings raw authenticity to every role. Hollywood keeps trying to polish him but he resists.',
 'Rugged, real, non-Hollywood energy.',
 ARRAY['Authentic', 'Anti-Hollywood', 'Grounded'], '{}', ARRAY[]::TEXT[]),

('Iris Valentine', 41, 'Female', 'Indie Darling', 180000, 74, 90, ARRAY['Drama', 'Thriller'], 'Available',
 'Theater legend who does one film a year. Terrifies young actors with her intensity. Roger Ebert called her ''the best actress most people haven''t seen.''',
 'Commanding, theatrical, intimidating.',
 ARRAY['Intimidating', 'Legendary', 'Exacting'], '{}', ARRAY[]::TEXT[]),

('Phoenix Wilder', 22, 'Male', 'Indie Darling', 120000, 58, 76, ARRAY['Drama', 'Horror'], 'Available',
 'Breakout from a critically acclaimed indie horror. Born into Hollywood royalty but rejected it. Estranged from famous parent. Tabloid fodder with actual talent.',
 'Haunted, beautiful, troubled.',
 ARRAY['Troubled', 'Talented', 'Running From Fame'], '{}', ARRAY[]::TEXT[]),

('Sage Morrison', 35, 'Female', 'Indie Darling', 155000, 67, 84, ARRAY['Comedy', 'Drama', 'Romance'], 'Available',
 'Improviser and playwright who acts in her own work. Creates ensemble pieces where she''s rarely the lead. More interested in the art than the fame.',
 'Warm, approachable, creative energy.',
 ARRAY['Collaborative', 'Creative', 'Ensemble Player'], '{}', ARRAY[]::TEXT[]),

-- NEWCOMER (8 actors)
('Jake Holloway', 21, 'Male', 'Newcomer', 75000, 35, 55, ARRAY['Action', 'Comedy'], 'Available',
 'Star quarterback who got discovered. Zero training, pure natural charisma. Agents are fighting over him. Might be the next big thing or flame out spectacularly.',
 'All-American, athletic, camera loves him.',
 ARRAY['Raw Talent', 'Cocky', 'Untested'], '{}', ARRAY[]::TEXT[]),

('Maya Santos', 19, 'Female', 'Newcomer', 65000, 40, 70, ARRAY['Drama', 'Romance'], 'Available',
 'Won a nationwide talent search. First role ever and she''s already getting Oscar buzz. Either the real deal or the most overhyped newcomer in years.',
 'Fresh-faced, innocent, surprising depth.',
 ARRAY['Promising', 'Overwhelmed', 'Natural'], '{}', ARRAY[]::TEXT[]),

('Brandon Liu', 24, 'Male', 'Newcomer', 80000, 38, 62, ARRAY['Sci-Fi', 'Action', 'Comedy'], 'Available',
 'Martial arts champion who wants to be an actor. Has the skills but still learning to emote. Working with an acting coach between training sessions.',
 'Athletic, focused, work in progress.',
 ARRAY['Dedicated', 'Stiff', 'Hardworking'], '{}', ARRAY[]::TEXT[]),

('Emma Thornton', 23, 'Female', 'Newcomer', 70000, 42, 68, ARRAY['Horror', 'Thriller', 'Drama'], 'Available',
 'Theater school valedictorian thrown into Hollywood. Classically trained but adapting to screen. Directors say she''s ''almost there.'' Whatever that means.',
 'Polished, trained, trying to unlearn technique.',
 ARRAY['Trained', 'Anxious', 'Adapting'], '{}', ARRAY[]::TEXT[]),

('Diego Reyes', 26, 'Male', 'Newcomer', 85000, 45, 58, ARRAY['Romance', 'Drama', 'Comedy'], 'Available',
 'Telenovela star trying to cross over. Huge following in Latin America, unknown in the US. Charming as hell but his English needs work.',
 'Soap opera handsome, magnetic, accent heavy.',
 ARRAY['Charming', 'Determined', 'Fish Out of Water'], '{}', ARRAY[]::TEXT[]),

('Lily Park', 20, 'Female', 'Newcomer', 60000, 32, 64, ARRAY['Comedy', 'Romance', 'Fantasy'], 'Available',
 'K-pop idol making the jump to Hollywood. Massive international fanbase but acting skeptics abound. More talented than people expect.',
 'Pop star polished, perfected image.',
 ARRAY['Trained', 'Disciplined', 'More Than Expected'], '{}', ARRAY[]::TEXT[]),

('Marcus Webb', 28, 'Male', 'Newcomer', 90000, 44, 72, ARRAY['Drama', 'Thriller'], 'Available',
 'Former marine with a face for drama. Discovered at a VA hospital by a casting director. Brings intense authenticity to military and trauma roles.',
 'Thousand-yard stare, intimidating presence.',
 ARRAY['Intense', 'Authentic', 'Haunted'], '{}', ARRAY[]::TEXT[]),

('Chloe Anderson', 22, 'Female', 'Newcomer', 55000, 30, 60, ARRAY['Comedy', 'Romance'], 'Available',
 'TikTok star with 10 million followers. Studios think she''s the key to Gen Z. Critics think she''s a gimmick. Truth is probably somewhere in between.',
 'Internet-ready, constant content creator.',
 ARRAY['Social Media Native', 'Self-Aware', 'Hustler'], '{}', ARRAY[]::TEXT[]);

-- Verify the seed
SELECT COUNT(*) as actor_count FROM actors;
SELECT month, year, advance_interval_hours FROM global_game_clock WHERE id = 1;
