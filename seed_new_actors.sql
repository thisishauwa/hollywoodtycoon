-- Seed 8 New Actors (4 Newcomer + 4 Indie)
-- Complete schema with bio, visual description, personality, relationships, and gossip

INSERT INTO actors (name, age, gender, tier, salary, reputation, skill, genres, status, bio, visual_description, personality, relationships, gossip) VALUES

-- ============================================
-- NEWCOMER (4 new actors)
-- ============================================

-- Emma Rodriguez - Fresh Latina Talent
('Emma Rodriguez', 22, 'Female', 'Newcomer', 50000, 15, 35,
 ARRAY['Drama', 'Romance'], 'Available',
 'Recent drama school graduate from Miami with raw talent and determination. Working three jobs while auditioning. Her self-tape for a student film went viral on TikTok, catching the attention of several casting directors.',
 'Dark curly hair, warm brown eyes, expressive features, infectious energy.',
 ARRAY['Determined', 'Authentic', 'Nervous Energy'],
 '{}'::jsonb,
 ARRAY[
   'Worked as a barista at the same coffee shop where Finn McCarthy writes. He gave her script advice once. She framed the napkin.',
   'Her viral self-tape has 2M views. Half the comments are casting directors, half are people saying she should be famous.',
   'Turned down a reality TV offer to focus on serious acting. Her agent was NOT happy.',
   'Still lives with her abuela who doesn''t understand what she does but supports her anyway.'
 ]),

-- Marcus Chen - Tech Kid Turned Actor
('Marcus Chen', 24, 'Male', 'Newcomer', 55000, 18, 38,
 ARRAY['Sci-Fi', 'Thriller'], 'Available',
 'Former software engineer who quit his six-figure job to pursue acting. His analytical approach to character work is unconventional but effective. Bonded with Gemma Liu over their shared gaming background.',
 'Clean-cut, glasses, fit from rock climbing, thoughtful expression.',
 ARRAY['Analytical', 'Tech-Savvy', 'Method Learner'],
 '{}'::jsonb,
 ARRAY[
   'His parents think he''s still a software engineer. He''s been lying for 2 years. The guilt is real.',
   'Streams on Twitch to pay rent. 50K followers have no idea he''s trying to be an actor.',
   'Wrote an algorithm to analyze successful audition tapes. It actually works. Other actors want it.',
   'Gemma Liu invited him to voice a character in a game. He cried. Professional actors don''t cry at video game roles. He did.'
 ]),

-- Sofia Patel - British-Indian Rising Star
('Sofia Patel', 21, 'Female', 'Newcomer', 45000, 12, 32,
 ARRAY['Comedy', 'Drama'], 'Available',
 'London-born actress with impeccable comic timing and dramatic depth. Her one-woman show at Edinburgh Fringe got rave reviews. Moved to LA three months ago with nothing but talent and student debt.',
 'Petite, expressive eyes, natural beauty, vintage style.',
 ARRAY['Quick-Witted', 'Observant', 'Self-Deprecating'],
 '{}'::jsonb,
 ARRAY[
   'Her Edinburgh show was about her immigrant parents not understanding acting. They were in the audience. They still don''t understand.',
   'Accidentally photobombed a Priya Sharma red carpet photo. Priya saw it, laughed, and followed her on Instagram.',
   'Works at a British pub in LA. Americans think her accent is fake. She''s stopped correcting them.',
   'Her student debt is £60K. She jokes about it. The jokes hide pain.'
 ]),

-- James O''Connor - Irish Method Actor
('James O''Connor', 25, 'Male', 'Newcomer', 60000, 20, 40,
 ARRAY['Drama', 'Thriller'], 'Available',
 'Dublin-raised method actor with intense commitment to craft. Studied at the Gaiety School of Acting before moving to LA. His short film performance caught the eye of Jasper Okonkwo at a festival.',
 'Red hair, intense blue eyes, lean build, always in character.',
 ARRAY['Method Actor', 'Intense', 'Poetic'],
 '{}'::jsonb,
 ARRAY[
   'Stayed in character as a homeless man for a month. His roommate thought he''d actually become homeless.',
   'Jasper Okonkwo told him he has \"the fire.\" James has this written on his bathroom mirror.',
   'Writes poetry between takes. It''s actually good. Nobody knows this.',
   'His Dublin accent gets thicker when he''s nervous. Casting directors think it''s a choice. It''s not.'
 ]),

-- ============================================
-- INDIE DARLING (4 new actors)
-- ============================================

-- Maya Johnson - Sundance Breakout
('Maya Johnson', 28, 'Female', 'Indie Darling', 150000, 35, 52,
 ARRAY['Drama', 'Romance'], 'Available',
 'Her debut feature at Sundance won the Grand Jury Prize. Critics compare her naturalistic style to early Michelle Williams. Olive Chen called her performance \"devastating.\" Now fielding offers from A24 and major studios.',
 'Natural beauty, minimal makeup, haunted eyes, vintage dresses.',
 ARRAY['Naturalistic', 'Vulnerable', 'Selective'],
 '{}'::jsonb,
 ARRAY[
   'The Sundance standing ovation lasted 7 minutes. She cried the entire time. So did half the audience.',
   'Olive Chen DM''d her after seeing the film. They had coffee. Maya still has the receipt.',
   'Turned down a Marvel role to do another indie. Her agent quit. She got a new agent.',
   'Lives in a studio apartment in Echo Park. Studios keep offering her money. She keeps saying no.'
 ]),

-- Carlos Rivera - Mexican Auteur
('Carlos Rivera', 30, 'Male', 'Indie Darling', 165000, 38, 55,
 ARRAY['Drama', 'Thriller'], 'Available',
 'Mexican filmmaker who also acts in his own features. His second film premiered at Cannes. Samir Hassan called him \"the future of political cinema.\" Splits time between Mexico City and LA.',
 'Thoughtful expression, casual style, warm presence, filmmaker hands.',
 ARRAY['Auteur', 'Political', 'Collaborative'],
 '{}'::jsonb,
 ARRAY[
   'His Cannes film was about the border. It made people uncomfortable. That was the point.',
   'Samir Hassan invited him to a screenwriters retreat. They wrote for 3 days straight. Both scripts got funded.',
   'Refuses to shoot in LA. \"Real stories happen in real places.\" Studios are learning to travel.',
   'His mom still asks when he''s getting a \"real job.\" He''s been to Cannes twice.'
 ]),

-- Hannah Lee - Korean-American Indie Queen
('Hannah Lee', 27, 'Female', 'Indie Darling', 140000, 32, 50,
 ARRAY['Drama', 'Comedy'], 'Available',
 'Second-generation Korean-American telling diaspora stories. Her semi-autobiographical feature won SXSW. Priya Sharma praised her \"cultural specificity.\" Mentoring younger Asian actors about representation.',
 'Long black hair, expressive features, modern style, filmmaker energy.',
 ARRAY['Storyteller', 'Advocate', 'Funny'],
 '{}'::jsonb,
 ARRAY[
   'Her SXSW film was about her grandmother. Her grandmother saw it. Cried. Said it was wrong. Then said it was perfect.',
   'Priya Sharma invited her to a representation panel. They bonded over \"being the only one in the room.\"',
   'Writes all her own material. Studios want to buy her scripts. She wants to direct them. Standoff continues.',
   'Her parents wanted her to be a doctor. She made a film about it. They''re in it. They''re still processing.'
 ]),

-- Nathan Brooks - Southern Gothic Specialist  
('Nathan Brooks', 31, 'Male', 'Indie Darling', 175000, 40, 58,
 ARRAY['Drama', 'Thriller', 'Horror'], 'Available',
 'Alabama-born actor specializing in Southern Gothic narratives. His performance in an indie thriller caught Finn McCarthy''s attention. Known for bringing authenticity to complex, morally ambiguous characters.',
 'Rugged features, southern drawl, intense presence, weathered hands.',
 ARRAY['Authentic', 'Intense', 'Southern Roots'],
 '{}'::jsonb,
 ARRAY[
   'Finn McCarthy saw his film at a tiny festival in Alabama. Drove 6 hours to meet him. Offered him a role on the spot.',
   'His accent is real. Casting directors keep asking him to \"do it more.\" He can''t. It''s already at 100%.',
   'Turned down a role because the Southern character was a stereotype. The director rewrote it. Character development.',
   'Still goes home to Alabama between projects. His hometown has a population of 847. They all know he''s famous.'
 ]);
