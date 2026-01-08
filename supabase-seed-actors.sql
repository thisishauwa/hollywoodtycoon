-- Seed 40 actors with meaningful relationships and personalized gossip
-- Relationships based on: co-stars, rivalries, mentorships, romances, genre connections

-- IMPORTANT: Delete existing actors first to avoid duplicates
DELETE FROM actors;

INSERT INTO actors (id, name, age, gender, tier, salary, reputation, skill, genres, status, bio, visual_description, personality, relationships, gossip) VALUES

-- ============================================
-- A-LIST (6 actors)
-- ============================================

-- Marcus Sterling - Method actor, Drama/Action
('a0000001-0000-0000-0000-000000000001', 'Marcus Sterling', 42, 'Male', 'A-List', 2500000, 98, 92,
 ARRAY['Action', 'Drama'], 'Available',
 'Three-time Academy nominee known for intense method acting. Won his first Oscar co-starring with Vivienne Cross in "The Crown''s Shadow". Notorious rivalry with Damon Reeves after losing Best Actor to him in 2019.',
 'Salt-and-pepper hair, intense blue eyes, always wears black.',
 ARRAY['Method Actor', 'Reclusive', 'Perfectionist'],
 '{"a0000001-0000-0000-0000-000000000002": 60, "a0000001-0000-0000-0000-000000000003": -40, "a0000002-0000-0000-0000-000000000003": 30}'::jsonb,
 ARRAY[
   'Insiders say he stayed in character for 8 MONTHS during "The Crown''s Shadow" shoot. Vivienne Cross reportedly had to call him "Your Majesty" even at craft services.',
   'Still hasn''t spoken to Damon Reeves since the 2019 Oscars. Sources say he left the Vanity Fair party when Reeves arrived.',
   'Spotted buying a remote cabin in Montana. Publicist insists it''s for "character research" but neighbors say he''s been there for months.',
   'Allegedly turned down $15M for a superhero role, calling comic book movies "theme park entertainment for adults who never grew up."'
 ]),

-- Vivienne Cross - British Theatre, Drama/Romance
('a0000001-0000-0000-0000-000000000002', 'Vivienne Cross', 38, 'Female', 'A-List', 2200000, 95, 94,
 ARRAY['Drama', 'Romance'], 'Available',
 'British theatre royalty who conquered Hollywood. Her on-screen chemistry with Marcus Sterling in "The Crown''s Shadow" is legendary. Close friends with Ingrid Larsson from the European festival circuit. Competitive tension with Scarlett Duval over prestige roles.',
 'Elegant, auburn hair often in an updo, striking green eyes.',
 ARRAY['Classical Training', 'Poised', 'Demanding'],
 '{"a0000001-0000-0000-0000-000000000001": 60, "a0000002-0000-0000-0000-000000000006": 45, "a0000001-0000-0000-0000-000000000006": -25}'::jsonb,
 ARRAY[
   'British tabloids OBSESSED with rumors she''s secretly dating minor royalty. Palace has issued three denials this year alone.',
   'Allegedly has a "no Scarlett Duval" clause in her contracts after both were up for the same Fincher film.',
   'Flew her dialect coach from London for a single line of American dialogue. The line was cut in editing.',
   'Sources say she refuses to audition anymore - "I don''t audition, I have conversations about roles."'
 ]),

-- Damon Reeves - Action King
('a0000001-0000-0000-0000-000000000003', 'Damon Reeves', 45, 'Male', 'A-List', 2800000, 97, 88,
 ARRAY['Action', 'Thriller'], 'Available',
 'The undisputed action king. His partnership with Chen Wei-Lin in the "Dragon Protocol" trilogy grossed $2B worldwide. Took Nadia Volkov under his wing after she was his stunt double. Public tension with Marcus Sterling since the 2019 Oscars.',
 'Chiseled jaw, perpetual stubble, muscular build.',
 ARRAY['Adrenaline Junkie', 'Charming', 'Competitive'],
 '{"a0000001-0000-0000-0000-000000000001": -40, "a0000001-0000-0000-0000-000000000005": 50, "a0000001-0000-0000-0000-000000000104": 35}'::jsonb,
 ARRAY[
   'Broke three ribs doing his own stunts on "Dragon Protocol 3" and KEPT FILMING. Insurance company reportedly furious.',
   'Has been spotted with three different models this month. His publicist''s "just friends" excuse is wearing thin.',
   'Finn McCarthy''s "soulless blockbusters" comment still bothers him - he''s been reading indie scripts according to his agent.',
   'The Marcus Sterling beef is REAL. They were both up for Batman in 2015. Neither got it. Neither has moved on.'
 ]),

-- Isabella Montoya - Versatile Latina Star
('a0000001-0000-0000-0000-000000000004', 'Isabella Montoya', 35, 'Female', 'A-List', 2100000, 93, 90,
 ARRAY['Comedy', 'Romance', 'Drama'], 'Available',
 'Latina powerhouse from telenovelas to Hollywood A-list. Best friends with Priya Sharma - they bonded over being "triple threats" in a leading-man industry. Did a beloved rom-com with Diego Reyes. Publicly clashed with Tiffany Vale after offensive comments.',
 'Dark curly hair, warm brown eyes, infectious smile.',
 ARRAY['Versatile', 'Family-Oriented', 'Philanthropist'],
 '{"a0000001-0000-0000-0000-000000000108": 40, "a0000002-0000-0000-0000-000000000007": 25, "a0000001-0000-0000-0000-000000000202": -15}'::jsonb,
 ARRAY[
   'Her clapback at Tiffany Vale went viral - "My accent won me three Emmys, what has yours done?" ICONIC.',
   'Reportedly turned down a role because the script called her character "spicy." Her exact words: "I''m not a condiment."',
   'Building a film school in her hometown in Mexico. Already has Chen Wei-Lin and Jasper Okonkwo signed up to teach masterclasses.',
   'She and Priya Sharma have a "revenge roles" pact - whenever one of them loses a part to a white actress, the other sends flowers with a card that just says "Next time."'
 ]),

-- Chen Wei-Lin - Martial Arts Legend
('a0000001-0000-0000-0000-000000000005', 'Chen Wei-Lin', 48, 'Male', 'A-List', 2400000, 91, 95,
 ARRAY['Action', 'Drama', 'Thriller'], 'Available',
 'Hong Kong cinema legend. The "Dragon Protocol" trilogy with Damon Reeves redefined action cinema. Currently mentoring Jordan Kim, seeing him as the future of martial arts film. Choreographed fight scenes for Nadia Volkov''s breakout role.',
 'Distinguished grey temples, fit physique despite age.',
 ARRAY['Disciplined', 'Humble', 'Mentor'],
 '{"a0000001-0000-0000-0000-000000000003": 50, "a0000001-0000-0000-0000-000000000303": 55, "a0000001-0000-0000-0000-000000000104": 30}'::jsonb,
 ARRAY[
   'Has a secret training compound in the mountains outside LA. Jordan Kim reportedly lives there during prep.',
   'Turned down SEVEN Marvel movies. Says he''s waiting for one "worthy of real martial arts, not wire-fu cartoons."',
   'Meditates for 3 hours before every fight scene. One AD made the mistake of interrupting him. Once.',
   'His handshake with Damon Reeves after filming wrapped on Dragon Protocol 3 made grown men cry. 47 takes of respect.'
 ]),

-- Scarlett Duval - Transformative Actress
('a0000001-0000-0000-0000-000000000006', 'Scarlett Duval', 40, 'Female', 'A-List', 2300000, 94, 91,
 ARRAY['Thriller', 'Sci-Fi', 'Drama'], 'Available',
 'Former model turned chameleon actress. Her collaboration with Luna Delacroix in "The Hollow" elevated horror to prestige. Respects Miranda Frost as the genre''s queen. Competing with Vivienne Cross for the same dramatic roles.',
 'Platinum blonde, statuesque, piercing grey eyes.',
 ARRAY['Chameleon', 'Private', 'Intense'],
 '{"a0000001-0000-0000-0000-000000000002": -25, "a0000002-0000-0000-0000-000000000004": 35, "a0000001-0000-0000-0000-000000000102": 20}'::jsonb,
 ARRAY[
   'Gained 40 pounds for one role, lost it in 3 months for the next. Nutritionists are baffled and concerned.',
   'The Vivienne Cross rivalry is an OPEN SECRET. They were both at the same Golden Globes table. Did not speak. For four hours.',
   'Reportedly has a "transformation journal" with detailed notes on every physical change she''s made for roles. It''s 300+ pages.',
   'Her model past haunts her - she walked out of an interview when they brought up her Victoria''s Secret days.'
 ]),

-- ============================================
-- B-LIST (8 actors)
-- ============================================

-- Trevor Nash - Comedy/SNL
('a0000001-0000-0000-0000-000000000101', 'Trevor Nash', 33, 'Male', 'B-List', 800000, 78, 82,
 ARRAY['Comedy', 'Action'], 'Available',
 'SNL alum and comedy golden boy. Inseparable from Danny Kowalski - they''re developing a buddy cop film together. Mentoring newcomer Marcus Webb. Made enemies with Chad Brogan after a brutal SNL roast.',
 'Boyish charm, messy brown hair, dimples.',
 ARRAY['Improviser', 'Class Clown', 'Insecure'],
 '{"a0000001-0000-0000-0000-000000000107": 55, "a0000001-0000-0000-0000-000000000305": 30, "a0000001-0000-0000-0000-000000000207": -20}'::jsonb,
 ARRAY[
   'The Chad Brogan SNL roast was supposed to be 3 minutes. Trevor went for 7. Chad''s publicist still sends angry emails.',
   'He and Danny Kowalski have a podcast that''s just them watching bad movies drunk. 2 million subscribers.',
   'Secretly takes drama classes. Someone leaked a photo of him doing Chekhov. The internet had a field day.',
   'His impression of Marcus Sterling went viral. Sterling apparently thought it was "adequate." Ouch.'
 ]),

-- Miranda Frost - Scream Queen
('a0000001-0000-0000-0000-000000000102', 'Miranda Frost', 41, 'Female', 'B-List', 750000, 75, 85,
 ARRAY['Horror', 'Thriller'], 'Available',
 'The reigning scream queen with a cult following. Her friendship with Yuki Tanaka spans decades - they did "Sisters of the Dark" together. Collaborated with Luna Delacroix on elevated horror. Scarlett Duval credits her as an inspiration.',
 'Pale complexion, dark hair, gothic aesthetic off-screen.',
 ARRAY['Horror Aficionado', 'Loyal', 'Superstitious'],
 '{"a0000001-0000-0000-0000-000000000208": 45, "a0000002-0000-0000-0000-000000000004": 35, "a0000001-0000-0000-0000-000000000006": 20}'::jsonb,
 ARRAY[
   'Will NOT work on any set where someone has died. She has a researcher who checks. It''s a whole thing.',
   'Her house is literally haunted according to three different paranormal investigation shows. She seems fine with it.',
   'She and Yuki Tanaka communicate in a mix of English, Japanese, and what they call "horror telepathy."',
   'Has turned down every "elevated horror" script since The Hollow. "I did my prestige horror. I''m going back to slashers where I belong."'
 ]),

-- Jaylen Brooks - Former Teen Heartthrob
('a0000001-0000-0000-0000-000000000103', 'Jaylen Brooks', 29, 'Male', 'B-List', 650000, 72, 79,
 ARRAY['Drama', 'Romance'], 'Available',
 'Former Disney star fighting the "teen heartthrob" label. Tabloid feud with Chad Brogan over model Sienna Hayes. Did a well-received romantic drama with newcomer Aaliyah Foster. Marcus Sterling publicly called his acting "shallow" - still stings.',
 'Perfect teeth, athletic build, always camera-ready.',
 ARRAY['Social Media Savvy', 'Eager to Please', 'Ambitious'],
 '{"a0000001-0000-0000-0000-000000000207": -35, "a0000001-0000-0000-0000-000000000304": 25, "a0000001-0000-0000-0000-000000000001": -20}'::jsonb,
 ARRAY[
   'The Sienna Hayes love triangle with Chad Brogan was on every tabloid for MONTHS. She ended up with neither of them.',
   'Has watched the video of Marcus Sterling calling him "shallow" 47 times. His therapist is concerned.',
   'Trying SO HARD to get cast in a Sundance film. Has reportedly cold-DMed every indie director on Instagram.',
   'His chemistry with Aaliyah Foster was so good, people think they''re dating. His publicist won''t confirm or deny.'
 ]),

-- Nadia Volkov - Action/Gymnast
('a0000001-0000-0000-0000-000000000104', 'Nadia Volkov', 36, 'Female', 'B-List', 700000, 76, 84,
 ARRAY['Action', 'Thriller'], 'Available',
 'Former Olympic gymnast turned action star. Started as Damon Reeves'' stunt double before he championed her for speaking roles. Chen Wei-Lin choreographed her breakout film. Close with Anastasia Petrov - both Eastern European dancers turned action stars.',
 'Athletic build, sharp cheekbones, intense gaze.',
 ARRAY['Disciplined', 'No-Nonsense', 'Workaholic'],
 '{"a0000001-0000-0000-0000-000000000003": 35, "a0000001-0000-0000-0000-000000000005": 30, "a0000001-0000-0000-0000-000000000210": 40}'::jsonb,
 ARRAY[
   'Did a backflip off a moving car for "real, no wires" and the director literally cried.',
   'Damon Reeves calls her "the future of action cinema" in every interview. She just nods. Says nothing. Queen behavior.',
   'Her and Anastasia Petrov''s gym sessions are LEGENDARY. Someone filmed them sparring. It has 50 million views.',
   'Olympic Committee wants her to be an ambassador. She said she''d do it if they "fixed the scoring corruption." Savage.'
 ]),

-- Rex Donovan - Character Actor
('a0000001-0000-0000-0000-000000000105', 'Rex Donovan', 52, 'Male', 'B-List', 600000, 70, 88,
 ARRAY['Drama', 'Comedy'], 'Available',
 'The ultimate "that guy" - been in everything, steals every scene. Taken newcomers Ethan Moore and Jamal Thompson under his wing. Old friends with Earl Washington from the theatre days. Everyone''s favorite on-set dad.',
 'Weathered face, kind eyes, dad-bod.',
 ARRAY['Scene Stealer', 'Team Player', 'Storyteller'],
 '{"a0000001-0000-0000-0000-000000000301": 45, "a0000001-0000-0000-0000-000000000307": 40, "a0000001-0000-0000-0000-000000000203": 30}'::jsonb,
 ARRAY[
   'Has been in 247 productions. Someone made a supercut of all his death scenes. It''s 4 hours long.',
   'The unofficial "set therapist." Multiple A-listers have credited him with talking them off ledges.',
   'His mentorship of young actors is so wholesome. Ethan Moore literally calls him "Film Dad" in interviews.',
   'Turned down a leading role once because "that''s not my job. My job is to make the lead look good."'
 ]),

-- Camille Baptiste - French-Haitian Rising Star
('a0000001-0000-0000-0000-000000000106', 'Camille Baptiste', 34, 'Female', 'B-List', 720000, 74, 81,
 ARRAY['Drama', 'Romance', 'Fantasy'], 'Available',
 'French-Haitian actress bringing bilingual brilliance to Hollywood. Dated Diego Reyes for two years - remained close friends after the split. Mentoring fellow rising star Zara Okafor. Connected with Jasper Okonkwo through African diaspora arts initiatives.',
 'Natural hair, radiant skin, expressive features.',
 ARRAY['Bilingual', 'Passionate', 'Advocate'],
 '{"a0000002-0000-0000-0000-000000000007": 50, "a0000002-0000-0000-0000-000000000008": 35, "a0000002-0000-0000-0000-000000000003": 25}'::jsonb,
 ARRAY[
   'Her and Diego are the HEALTHIEST celebrity exes. They''re actually producing a film together. We don''t deserve them.',
   'Accidentally switched to French mid-interview when talking about her grandmother. The interviewer didn''t notice for 3 minutes.',
   'Her advocacy for Haitian representation got a major studio to rewrite a stereotypical role. Power move.',
   'She and Zara Okafor have matching tattoos. Something in Creole. Neither will say what it means.'
 ]),

-- Danny Kowalski - Everyman Comedy
('a0000001-0000-0000-0000-000000000107', 'Danny Kowalski', 38, 'Male', 'B-List', 550000, 68, 77,
 ARRAY['Comedy', 'Action'], 'Available',
 'Blue-collar everyman who''s everyone''s best friend on screen. Comedy soulmate with Trevor Nash - they''re developing projects together. Helped Tyrell Jackson break into film. Did a surprisingly good action-comedy with Brock Harmon.',
 'Average height, stocky build, friendly face.',
 ARRAY['Reliable', 'Union Guy', 'Sports Fanatic'],
 '{"a0000001-0000-0000-0000-000000000101": 55, "a0000001-0000-0000-0000-000000000209": 30, "a0000001-0000-0000-0000-000000000201": 20}'::jsonb,
 ARRAY[
   'Lost $50K betting on the Eagles. Trevor Nash paid it off because "that''s what comedy brothers do."',
   'His SAG union speech went viral. "We''re not content, we''re WORKERS." Standing ovation.',
   'The podcast with Trevor gets more downloads than most Netflix shows. Studios are scared.',
   'Someone spotted him teaching Tyrell Jackson how to "fall funny" in a parking lot at 2am. Method coaching.'
 ]),

-- Priya Sharma - Bollywood Crossover
('a0000001-0000-0000-0000-000000000108', 'Priya Sharma', 31, 'Female', 'B-List', 680000, 73, 83,
 ARRAY['Drama', 'Comedy', 'Romance'], 'Available',
 'Bollywood''s gift to Hollywood. Best friends with Isabella Montoya - both triple threats fighting for representation. Bonded with Emma Zhang at a film festival. Had a public spat with Destiny Powers over ignorant comments about Indian cinema.',
 'Long dark hair, dancer posture, elegant hands.',
 ARRAY['Triple Threat', 'Graceful', 'Perfectionist'],
 '{"a0000001-0000-0000-0000-000000000004": 40, "a0000001-0000-0000-0000-000000000308": 30, "a0000001-0000-0000-0000-000000000204": -15}'::jsonb,
 ARRAY[
   'Destiny Powers asked if Bollywood films "have real scripts or just dancing." Priya''s response was a 12-tweet thread on Indian cinema history. Educational DESTRUCTION.',
   'Did her own choreography for a dance scene. The choreographer quit in embarrassment.',
   'She sends Isabella Montoya voice notes entirely in dramatic soap opera Spanish. Isabella responds in Hindi. Neither speaks the other''s language fluently.',
   'Turned down a role because the dance sequence was "Bollywood-inspired but geographically confused." Her words.'
 ]),

-- ============================================
-- C-LIST (10 actors)
-- ============================================

-- Brock Harmon - B-Movie Action
('a0000001-0000-0000-0000-000000000201', 'Brock Harmon', 44, 'Male', 'C-List', 180000, 55, 65,
 ARRAY['Action', 'Horror'], 'Available',
 'King of direct-to-video action. Did a surprisingly fun action-comedy with Danny Kowalski. Bonded with Hector Ramirez over stunt work. Secretly jealous of Damon Reeves'' success - they started at the same time.',
 'Bulky, crew cut, numerous small scars.',
 ARRAY['Tough Guy', 'Simple', 'Loyal'],
 '{"a0000001-0000-0000-0000-000000000107": 20, "a0000001-0000-0000-0000-000000000205": 25, "a0000001-0000-0000-0000-000000000003": -10}'::jsonb,
 ARRAY[
   'He and Damon Reeves both auditioned for the same action role in 2005. Damon got it. Brock has mentioned this in every interview since.',
   'His direct-to-video movies have a cult following. "Fist of Justice 3" has a subreddit with 50K members.',
   'Broke his nose 11 times. Refuses to get it fixed. "It''s my brand now."',
   'Gets recognized more at gas stations than red carpets. He prefers it that way. "Real Americans, you know?"'
 ]),

-- Tiffany Vale - Reality TV
('a0000001-0000-0000-0000-000000000202', 'Tiffany Vale', 28, 'Female', 'C-List', 150000, 52, 60,
 ARRAY['Horror', 'Comedy'], 'Available',
 'Reality TV villain trying to go legit. Bitter social media war with Destiny Powers - they were on the same show. Made offensive comments about Isabella Montoya''s accent. Briefly dated Chad Brogan. Shaded Mia Santos online.',
 'Blonde extensions, heavy makeup, designer everything.',
 ARRAY['Fame Hungry', 'Social Climber', 'Surprising Depth'],
 '{"a0000001-0000-0000-0000-000000000204": -30, "a0000001-0000-0000-0000-000000000004": -15, "a0000001-0000-0000-0000-000000000207": 20, "a0000001-0000-0000-0000-000000000302": -15}'::jsonb,
 ARRAY[
   'The Isabella Montoya feud started when Tiffany said "speak English" at a premiere. Isabella responded in four languages. Fluently.',
   'Her and Destiny Powers were besties on their reality show. Then the finale happened. Nobody knows exactly what went down.',
   'Surprised everyone with a genuinely good performance in a horror indie. Critics are confused.',
   'Has been manifesting an Oscar nomination for 3 years. Posts about it daily. The universe remains unconvinced.'
 ]),

-- Earl Washington - Veteran Character Actor
('a0000001-0000-0000-0000-000000000203', 'Earl Washington', 58, 'Male', 'C-List', 120000, 48, 72,
 ARRAY['Drama'], 'Available',
 'Has played a cop in 47 different productions. Old friends with Rex Donovan from regional theatre. Did a stage production with Jasper Okonkwo decades ago. Called Chad Brogan "not a real actor" in an interview.',
 'Distinguished, grey beard, commanding voice.',
 ARRAY['Old School', 'Professional', 'Grumpy'],
 '{"a0000001-0000-0000-0000-000000000105": 30, "a0000002-0000-0000-0000-000000000003": 25, "a0000001-0000-0000-0000-000000000207": -15}'::jsonb,
 ARRAY[
   'Someone made a supercut of him saying "We got a situation here" in 23 different films. He was not amused.',
   'The Chad Brogan quote was: "That boy couldn''t act his way out of a wet paper bag." Chad''s publicist demanded an apology. Earl sent a paper bag.',
   'He and Rex Donovan did Hamlet together in 1992. Earl was the ghost. Rex was a guard. Both still have the playbill.',
   'Real cops ask him for acting tips. This delights and concerns him equally.'
 ]),

-- Destiny Powers - TikTok Star
('a0000001-0000-0000-0000-000000000204', 'Destiny Powers', 25, 'Female', 'C-List', 140000, 50, 58,
 ARRAY['Comedy', 'Romance'], 'Available',
 'TikTok phenomenon with 40M followers. Vicious social media feud with Tiffany Vale from their reality show days. Made ignorant comments about Priya Sharma''s background. Gen-Z solidarity with fellow digital native Mia Santos.',
 'Constantly changing hair colors, trendy outfits.',
 ARRAY['Influencer', 'Gen-Z Energy', 'Surprisingly Hardworking'],
 '{"a0000001-0000-0000-0000-000000000202": -30, "a0000001-0000-0000-0000-000000000108": -15, "a0000001-0000-0000-0000-000000000302": 25}'::jsonb,
 ARRAY[
   'The Priya Sharma incident taught her a lesson. She''s been taking film classes. Like, actual ones.',
   'Her TikToks about audition rejections are weirdly relatable. 10M views on "they said I had too much personality."',
   'She and Tiffany Vale unfollow and refollow each other like every week. Nobody can keep track.',
   'Actually booked a real role through a casting TikTok. The industry is SHOOK.'
 ]),

-- Hector Ramirez - Stuntman Turned Actor
('a0000001-0000-0000-0000-000000000205', 'Hector Ramirez', 39, 'Male', 'C-List', 160000, 53, 68,
 ARRAY['Drama', 'Action', 'Thriller'], 'Available',
 'Former stuntman getting his moment. Was Damon Reeves'' stunt double for years. Brotherhood with Brock Harmon through the stunt community. Connected with Nadia Volkov through action choreography circles.',
 'Scarred hands, athletic, unassuming presence.',
 ARRAY['Physical Actor', 'Humble', 'Safety Conscious'],
 '{"a0000001-0000-0000-0000-000000000201": 25, "a0000001-0000-0000-0000-000000000003": 35, "a0000001-0000-0000-0000-000000000104": 20}'::jsonb,
 ARRAY[
   'Was Damon Reeves'' stunt double for 7 years. People thought they were brothers. Damon calls him "the real action star."',
   'His hands are insured for $2 million. The scars are from a car fire stunt in 2015. He finished the take.',
   'Teaches stunt safety workshops for free. Has probably saved actual lives.',
   'Directors are finally noticing he can ACT, not just fall off buildings. Vindication.'
 ]),

-- Gemma Liu - Voice Actress
('a0000001-0000-0000-0000-000000000206', 'Gemma Liu', 32, 'Female', 'C-List', 170000, 54, 70,
 ARRAY['Sci-Fi', 'Action'], 'Available',
 'Video game voice legend making the jump to on-camera. Connected with Jordan Kim through gaming/K-pop crossover fandoms. Fellow nerds with Emma Zhang. Bonds with Mia Santos over digital-native experiences.',
 'Petite, expressive face, colorful personal style.',
 ARRAY['Gamer', 'Voice Work Expert', 'Nervous On-Camera'],
 '{"a0000001-0000-0000-0000-000000000303": 30, "a0000001-0000-0000-0000-000000000308": 25, "a0000001-0000-0000-0000-000000000302": 20}'::jsonb,
 ARRAY[
   'Voiced the main character in "Eternal Realm" which won Game of the Year. The character has more fans than most actors.',
   'Showed up to an audition in full cosplay of her video game character. Got the role.',
   'Her and Jordan Kim stream games together. Their banter is chaos. Chat loves it.',
   'Genuinely nervous on camera despite being a voice acting legend. Working with a coach. The growth is real.'
 ]),

-- Chad Brogan - Pretty Boy Model
('a0000001-0000-0000-0000-000000000207', 'Chad Brogan', 30, 'Male', 'C-List', 130000, 47, 55,
 ARRAY['Comedy', 'Romance'], 'Available',
 'Underwear model who thinks he can act. Tabloid war with Jaylen Brooks over model Sienna Hayes. Was brutally roasted by Trevor Nash on SNL. Earl Washington called him "not a real actor". Briefly dated Tiffany Vale.',
 'Impossibly handsome, perfect abs, vacant expression.',
 ARRAY['Pretty Boy', 'Party Animal', 'Surprisingly Sweet'],
 '{"a0000001-0000-0000-0000-000000000103": -35, "a0000001-0000-0000-0000-000000000202": 20, "a0000001-0000-0000-0000-000000000101": -20, "a0000001-0000-0000-0000-000000000203": -15}'::jsonb,
 ARRAY[
   'The Trevor Nash SNL roast included the line "Chad has the emotional range of a Calvin Klein ad." It hurt because it was true.',
   'Received Earl Washington''s paper bag response and genuinely didn''t understand it. Asked his assistant to explain. Twice.',
   'But secretly? Takes acting classes every week. His coach says he''s actually improving. Character development.',
   'Volunteers at an animal shelter every weekend. Keeps it off social media. Might actually be a decent person???'
 ]),

-- Yuki Tanaka - J-Horror Legend
('a0000001-0000-0000-0000-000000000208', 'Yuki Tanaka', 45, 'Female', 'C-List', 145000, 51, 74,
 ARRAY['Drama', 'Horror'], 'Available',
 'Japanese horror icon. Longtime collaborator and friend of Miranda Frost - they did "Sisters of the Dark" together. Horror sisterhood with Luna Delacroix. Mutual respect with Chen Wei-Lin as Asian cinema legends.',
 'Ageless appearance, minimalist style, intense focus.',
 ARRAY['Method', 'Quiet', 'Unnerving Presence'],
 '{"a0000001-0000-0000-0000-000000000102": 45, "a0000002-0000-0000-0000-000000000004": 30, "a0000001-0000-0000-0000-000000000005": 20}'::jsonb,
 ARRAY[
   'Stayed in a "haunted" hotel for a month to prepare for a role. The staff reported weird occurrences. Yuki reported "good research."',
   'Her and Miranda Frost''s friendship is INTENSE. They finish each other''s sentences. In two different languages.',
   'American critics "discovered" her in 2018. Japanese critics: "We''ve known for 20 years."',
   'Her on-set presence is so unsettling that directors use it. "Just stand there. Don''t act. Perfect."'
 ]),

-- Tyrell Jackson - Stand-up Comic
('a0000001-0000-0000-0000-000000000209', 'Tyrell Jackson', 27, 'Male', 'C-List', 155000, 49, 62,
 ARRAY['Comedy', 'Drama'], 'Available',
 'Stand-up sensation breaking into film. Danny Kowalski championed him for his first role. Comedy circuit friends with Trevor Nash. Bonds with fellow comedian Marcus Webb over the hustle.',
 'Tall, lanky, expressive hands when talking.',
 ARRAY['Natural Comedian', 'Struggles With Drama', 'Authentic'],
 '{"a0000001-0000-0000-0000-000000000107": 30, "a0000001-0000-0000-0000-000000000101": 35, "a0000001-0000-0000-0000-000000000305": 20}'::jsonb,
 ARRAY[
   'His Netflix special was 90% true stories about failed auditions. Hollywood was uncomfortable. Audiences loved it.',
   'Danny Kowalski saw him at a club and called his agent FROM THE AUDIENCE. Legend behavior.',
   'Trying to do dramatic roles. The director of his last film said "stop being funny." He couldn''t.',
   'His Instagram is just videos of him making Marcus Webb laugh until he cries. Pure serotonin.'
 ]),

-- Anastasia Petrov - Ballet Dancer Turned Action Star
('a0000001-0000-0000-0000-000000000210', 'Anastasia Petrov', 33, 'Female', 'C-List', 165000, 56, 69,
 ARRAY['Action', 'Thriller'], 'Available',
 'Former Bolshoi ballerina reinvented as action star. Close with Nadia Volkov - both Eastern European dancers in Hollywood. European connection with Ingrid Larsson. Ethereal quality like Luna Delacroix.',
 'Tall, lean, moves like water.',
 ARRAY['Dancer Background', 'Cold Exterior', 'Secretly Warm'],
 '{"a0000001-0000-0000-0000-000000000104": 40, "a0000002-0000-0000-0000-000000000006": 25, "a0000002-0000-0000-0000-000000000004": 20}'::jsonb,
 ARRAY[
   'Left the Bolshoi under mysterious circumstances. Nobody talks about it. Russian press tried. They stopped.',
   'Her fight choreography incorporates ballet. It''s beautiful and terrifying. Directors call it "violent Swan Lake."',
   'Looks like she''s judging you constantly. She says she''s just thinking about dance. Nobody believes her.',
   'She and Nadia Volkov once did an impromptu sparring session at an industry party. Someone bid $10K to see it. For charity.'
 ]),

-- ============================================
-- INDIE DARLING (8 actors)
-- ============================================

-- Finn McCarthy - Sundance Darling
('a0000002-0000-0000-0000-000000000001', 'Finn McCarthy', 35, 'Male', 'Indie Darling', 250000, 67, 86,
 ARRAY['Drama', 'Comedy'], 'Available',
 'The face of American indie cinema. Former couple with Olive Chen - their chemistry launched both careers. Collaborates constantly with Samir Hassan. Publicly called Damon Reeves'' blockbusters "soulless" - created tension.',
 'Beard, flannel shirts, looks perpetually exhausted.',
 ARRAY['Artistic Integrity', 'Coffee Addict', 'Anti-Hollywood'],
 '{"a0000002-0000-0000-0000-000000000002": 65, "a0000002-0000-0000-0000-000000000005": 40, "a0000001-0000-0000-0000-000000000003": -25}'::jsonb,
 ARRAY[
   'The "soulless blockbusters" comment was after three whiskeys at Sundance. He stands by it. Damon''s team was NOT happy.',
   'He and Olive broke up so amicably that people think they''re still together. They''re not. But the chemistry? Still there.',
   'Turned down a Marvel role publicly. Then turned down the same role AGAIN when they doubled the offer.',
   'Lives in a Brooklyn apartment with no TV. Writes scripts on a typewriter. We get it, Finn.'
 ]),

-- Olive Chen - A24 Muse
('a0000002-0000-0000-0000-000000000002', 'Olive Chen', 29, 'Female', 'Indie Darling', 220000, 65, 84,
 ARRAY['Drama', 'Romance'], 'Available',
 'A24''s golden girl, known for devastating emotional performances. Former couple with Finn McCarthy - their films together are cult classics. Elevated horror work with Luna Delacroix. Mentoring rising star Zara Okafor.',
 'Minimal makeup, vintage clothing, haunted eyes.',
 ARRAY['Emotionally Available', 'Selective', 'Critical Darling'],
 '{"a0000002-0000-0000-0000-000000000001": 65, "a0000002-0000-0000-0000-000000000004": 45, "a0000002-0000-0000-0000-000000000008": 30}'::jsonb,
 ARRAY[
   'Her crying scenes have made critics cry. Actual professional critics. On camera during reviews.',
   'Reads every script with Finn before accepting. Even now. "He has good instincts" she says. They''re not back together. Promise.',
   'A24 has offered her a first-look deal four times. She keeps saying she wants "flexibility." Queen energy.',
   'Took Zara Okafor to her first film festival. Held her hand during the standing ovation. The photo went viral.'
 ]),

-- Jasper Okonkwo - Theatre Legend
('a0000002-0000-0000-0000-000000000003', 'Jasper Okonkwo', 42, 'Male', 'Indie Darling', 280000, 69, 89,
 ARRAY['Drama', 'Thriller'], 'Available',
 'Nigerian-British theatre titan crossing to film. Mutual respect with fellow method actor Marcus Sterling. Old theatre connection with Earl Washington. Mentoring Zara Okafor. Political activism bonds with Samir Hassan. Supports Camille Baptiste''s advocacy work.',
 'Regal bearing, deep voice, magnetic presence.',
 ARRAY['Stage Trained', 'Intellectual', 'Politically Active'],
 '{"a0000001-0000-0000-0000-000000000001": 30, "a0000001-0000-0000-0000-000000000203": 25, "a0000002-0000-0000-0000-000000000008": 35, "a0000002-0000-0000-0000-000000000005": 35, "a0000001-0000-0000-0000-000000000106": 25}'::jsonb,
 ARRAY[
   'His Hamlet at the National Theatre is still talked about 15 years later. People have the poster tattooed.',
   'He and Marcus Sterling exchanged method acting tips for 4 hours at a party. Everyone else left. They didn''t notice.',
   'When Zara Okafor won her first award, he cried harder than she did. "I''m not emotional," he claims. Evidence suggests otherwise.',
   'His political speeches at award shows make networks nervous and audiences cheer. Perfect ratio.'
 ]),

-- Luna Delacroix - Arthouse Horror Queen
('a0000002-0000-0000-0000-000000000004', 'Luna Delacroix', 31, 'Female', 'Indie Darling', 200000, 63, 82,
 ARRAY['Horror', 'Drama', 'Fantasy'], 'Available',
 'The ethereal face of elevated horror. Breakthrough film "The Hollow" with Scarlett Duval. Horror sisterhood with Miranda Frost and Yuki Tanaka. Collaborates with Olive Chen. Shares otherworldly quality with Anastasia Petrov.',
 'Ethereal, pale, otherworldly beauty.',
 ARRAY['Genre Elevated', 'Mysterious', 'Fiercely Private'],
 '{"a0000001-0000-0000-0000-000000000006": 35, "a0000001-0000-0000-0000-000000000102": 35, "a0000002-0000-0000-0000-000000000002": 45, "a0000001-0000-0000-0000-000000000208": 30, "a0000001-0000-0000-0000-000000000210": 20}'::jsonb,
 ARRAY[
   'Nobody knows where she lives. Her agent communicates through encrypted emails. She might be a ghost.',
   'The "horror sisterhood" group chat between her, Miranda, and Yuki is apparently just them sharing creepy locations they''ve found.',
   'Has never done a talk show. Refuses. "My work speaks." Directors love her. Publicists despair.',
   'Her on-set presence is so unsettling that the "Hollow" crew thought the set was actually haunted. It was just Luna.'
 ]),

-- Samir Hassan - Filmmaker-Actor
('a0000002-0000-0000-0000-000000000005', 'Samir Hassan', 38, 'Male', 'Indie Darling', 240000, 66, 85,
 ARRAY['Drama', 'Comedy'], 'Available',
 'Palestinian-American auteur who also acts. Constant collaborator with Finn McCarthy. Political activism connects him with Jasper Okonkwo. Festival circuit friendship with Ingrid Larsson.',
 'Thoughtful expression, casual dress, warm smile.',
 ARRAY['Storyteller', 'Advocate', 'Collaborative'],
 '{"a0000002-0000-0000-0000-000000000001": 40, "a0000002-0000-0000-0000-000000000003": 35, "a0000002-0000-0000-0000-000000000006": 30}'::jsonb,
 ARRAY[
   'He and Finn have made 4 films together. Critics call them "the new Cassavetes and Falk." They pretend to hate the comparison.',
   'His festival speeches are events. Someone counted - he''s thanked Palestine in 23 different acceptance speeches.',
   'Wrote a script in one weekend at Ingrid Larsson''s cabin. It got nominated for best screenplay.',
   'Studios want him to direct blockbusters. He says he''ll do it when they "let him tell real stories." Waiting game continues.'
 ]),

-- Ingrid Larsson - Swedish Art House
('a0000002-0000-0000-0000-000000000006', 'Ingrid Larsson', 44, 'Female', 'Indie Darling', 260000, 68, 88,
 ARRAY['Drama', 'Thriller'], 'Available',
 'Swedish cinema''s greatest export. European arthouse collaborator with Vivienne Cross. Festival circuit friend of Samir Hassan. Supports fellow Swedish newcomer Sofia Andersson. European connection with Anastasia Petrov.',
 'Striking bone structure, minimal styling, intense gaze.',
 ARRAY['European Sensibility', 'Selective', 'Transformative'],
 '{"a0000001-0000-0000-0000-000000000002": 45, "a0000001-0000-0000-0000-000000000210": 25, "a0000002-0000-0000-0000-000000000005": 30, "a0000002-0000-0000-0000-000000000003": 35, "a0000001-0000-0000-0000-000000000306": 20}'::jsonb,
 ARRAY[
   'Bergman''s granddaughter called her "the heir to Swedish cinema." Ingrid framed the letter.',
   'Her cabin where Samir wrote that script? No electricity. No internet. Writers fight to get invited.',
   'She and Vivienne Cross have a rule: one European film, one American film, alternating. Keeps them both grounded.',
   'Took Sofia Andersson to her first Swedish film premiere. "Someone did this for me. Now I do it for her."'
 ]),

-- Diego Reyes - Mexican Romantic Lead
('a0000002-0000-0000-0000-000000000007', 'Diego Reyes', 36, 'Male', 'Indie Darling', 230000, 64, 83,
 ARRAY['Drama', 'Romance'], 'Available',
 'Mexican cinema''s romantic poet. Dated Camille Baptiste for two years - remained best friends. Did a charming rom-com with Isabella Montoya. Mentored newcomer Aaliyah Foster in their film together.',
 'Soulful eyes, easy smile, effortless charm.',
 ARRAY['Romantic Lead', 'Poetic', 'Old Hollywood Vibe'],
 '{"a0000001-0000-0000-0000-000000000106": 50, "a0000001-0000-0000-0000-000000000004": 25, "a0000001-0000-0000-0000-000000000304": 30}'::jsonb,
 ARRAY[
   'His breakup with Camille was so mature that tabloids couldn''t spin drama. They tried. There was no drama.',
   'Wrote a poem about working with Isabella Montoya. She read it on her Instagram. 5 million likes.',
   'He''s teaching Aaliyah Foster Spanish between takes. She''s teaching him TikTok dances. Cross-generational bonding.',
   'Old Hollywood energy is REAL - he sends handwritten thank you notes after every project. On actual paper.'
 ]),

-- Zara Okafor - Rising British-Nigerian Star
('a0000002-0000-0000-0000-000000000008', 'Zara Okafor', 27, 'Female', 'Indie Darling', 190000, 61, 80,
 ARRAY['Drama', 'Comedy'], 'Available',
 'Every film festival''s new favorite. Jasper Okonkwo is her mentor. Close with Camille Baptiste through diaspora connections. Olive Chen is helping guide her career choices.',
 'Natural beauty, infectious laugh, commanding presence.',
 ARRAY['Rising Star', 'Grounded', 'Scene Stealer'],
 '{"a0000002-0000-0000-0000-000000000003": 35, "a0000001-0000-0000-0000-000000000106": 35, "a0000002-0000-0000-0000-000000000002": 30}'::jsonb,
 ARRAY[
   'Cried when Jasper Okonkwo agreed to mentor her. He also cried. It was A LOT of crying.',
   'Festival circuits call her "the scene thief." She steals focus in every frame. Directors love/fear this.',
   'Her and Camille''s matching tattoos are apparently a Yoruba proverb. Neither will translate it.',
   'Said no to three studio films to do a small indie with Olive Chen. Career moves built different.'
 ]),

-- ============================================
-- NEWCOMER (8 actors)
-- ============================================

-- Ethan Moore - Juilliard Graduate
('a0000001-0000-0000-0000-000000000301', 'Ethan Moore', 23, 'Male', 'Newcomer', 45000, 35, 55,
 ARRAY['Drama', 'Romance'], 'Available',
 'Fresh out of Juilliard with a theatre background. Rex Donovan took him under his wing after seeing his off-Broadway work. Idolizes Marcus Sterling''s method approach. Bonded with Aaliyah Foster as fellow newcomers.',
 'Young, eager, still has baby face.',
 ARRAY['Theatre Kid', 'Nervous', 'Quick Learner'],
 '{"a0000001-0000-0000-0000-000000000105": 45, "a0000001-0000-0000-0000-000000000001": 25, "a0000001-0000-0000-0000-000000000304": 20}'::jsonb,
 ARRAY[
   'Calls Rex Donovan "Film Dad" in interviews. Rex pretends to be embarrassed. He''s not.',
   'Tried method acting for one role. Got so into character he forgot his own name. Rex had to intervene.',
   'He and Aaliyah have a "newcomer support group." It''s just them texting each other panic attacks.',
   'Still uses his Juilliard email signature. His agent has asked him to stop. Multiple times.'
 ]),

-- Mia Santos - YouTube Star
('a0000001-0000-0000-0000-000000000302', 'Mia Santos', 21, 'Female', 'Newcomer', 40000, 32, 52,
 ARRAY['Comedy', 'Horror'], 'Available',
 'YouTube sensation making the leap to film. Gen-Z solidarity with Destiny Powers. Fellow digital native with Gemma Liu. Got shaded by Tiffany Vale online - the start of a rivalry.',
 'Girl-next-door looks, expressive, always on phone.',
 ARRAY['Digital Native', 'Self-Promoter', 'Genuine Talent'],
 '{"a0000001-0000-0000-0000-000000000204": 25, "a0000001-0000-0000-0000-000000000206": 20, "a0000001-0000-0000-0000-000000000202": -15}'::jsonb,
 ARRAY[
   'The Tiffany Vale shade was "Imagine thinking YouTube is acting." Mia''s response video has 20M views. Tiffany''s had 200K.',
   'Her YouTube channel is how she got discovered - a director saw her "reacting to my own rejection letters" video.',
   'Documents everything. Has 47 hours of behind-the-scenes footage from her first film. Editor is STRESSED.',
   'Keeps accidentally breaking character to check her phone. Working on it. Progress is slow.'
 ]),

-- Jordan Kim - K-pop Trained
('a0000001-0000-0000-0000-000000000303', 'Jordan Kim', 24, 'Male', 'Newcomer', 50000, 38, 58,
 ARRAY['Action', 'Sci-Fi'], 'Available',
 'Former K-pop trainee pivoting to action cinema. Chen Wei-Lin is personally mentoring him in martial arts filmmaking. Gaming/K-pop crossover connection with Gemma Liu. Athletic bond with Jamal Thompson.',
 'Sculpted features, fit, great hair.',
 ARRAY['Dedicated', 'Perfectionist', 'Fan Favorite'],
 '{"a0000001-0000-0000-0000-000000000005": 55, "a0000001-0000-0000-0000-000000000206": 30, "a0000001-0000-0000-0000-000000000307": 20}'::jsonb,
 ARRAY[
   'K-pop fans found out Chen Wei-Lin is mentoring him. The fan edits started IMMEDIATELY.',
   'His training regime includes 4am martial arts practice. Chen Wei-Lin supervised via video call. From Hong Kong.',
   'The gaming streams with Gemma are chaotic. They once played for 14 hours. Neither remembers why.',
   'Still gets recognized more for K-pop than acting. He''s working on it. The fans are patient.'
 ]),

-- Aaliyah Foster - Talent Search Winner
('a0000001-0000-0000-0000-000000000304', 'Aaliyah Foster', 22, 'Female', 'Newcomer', 42000, 33, 54,
 ARRAY['Drama', 'Romance'], 'Available',
 'Small town girl who won a nationwide talent competition. Did a romantic drama with Jaylen Brooks - rumors of real chemistry. Diego Reyes mentored her in their film together. Fellow newcomer bond with Ethan Moore.',
 'All-American beauty, genuine smile, wide-eyed.',
 ARRAY['Natural', 'Overwhelmed', 'Determined'],
 '{"a0000001-0000-0000-0000-000000000103": 25, "a0000002-0000-0000-0000-000000000007": 30, "a0000001-0000-0000-0000-000000000301": 20}'::jsonb,
 ARRAY[
   'The Jaylen Brooks chemistry rumors are "complicated." Neither denies it. Neither confirms it. Publicists are monitoring.',
   'Diego Reyes taught her how to cry on cue. It took 3 hours. She nailed it. He was proud.',
   'Still lives with her mom when not filming. "She keeps me grounded." Wholesome content.',
   'The talent show that launched her career? She almost didn''t audition. Her mom drove 6 hours to get there.'
 ]),

-- Marcus Webb - Improv Comic
('a0000001-0000-0000-0000-000000000305', 'Marcus Webb', 26, 'Male', 'Newcomer', 48000, 36, 56,
 ARRAY['Comedy', 'Drama'], 'Available',
 'Improv prodigy getting film opportunities. Trevor Nash is actively mentoring him. Comedy community bond with Tyrell Jackson. Learning the ropes from Danny Kowalski.',
 'Average looking, rubber face, great timing.',
 ARRAY['Funny', 'Insecure About Looks', 'Hard Worker'],
 '{"a0000001-0000-0000-0000-000000000101": 30, "a0000001-0000-0000-0000-000000000209": 20, "a0000001-0000-0000-0000-000000000107": 15}'::jsonb,
 ARRAY[
   'Trevor Nash saw him at UCB and bought him dinner. Then introduced him to his agent. Then to Danny. Comedy godfather energy.',
   'His "rubber face" is so expressive that a director used it instead of CGI for a reaction shot.',
   'Insecurity about his looks is real - he almost quit when a producer said he "doesn''t have leading man face." Trevor talked him back.',
   'He and Tyrell have a "jealousy-free zone" pact. Whoever books celebrates. No weirdness. It''s working.'
 ]),

-- Sofia Andersson - Swedish Model
('a0000001-0000-0000-0000-000000000306', 'Sofia Andersson', 20, 'Female', 'Newcomer', 38000, 30, 50,
 ARRAY['Horror', 'Thriller'], 'Available',
 'Swedish Instagram model transitioning to acting. Ingrid Larsson has taken her under her wing. Model world connection with Chad Brogan. Competing for same roles as Tiffany Vale.',
 'Striking, model-esque, learning the craft.',
 ARRAY['Model Background', 'Humble', 'Eager'],
 '{"a0000002-0000-0000-0000-000000000006": 20, "a0000001-0000-0000-0000-000000000207": 15, "a0000001-0000-0000-0000-000000000202": -10}'::jsonb,
 ARRAY[
   'Ingrid Larsson called her after seeing one self-tape. "You have something. Come to Sweden. We train."',
   'The Tiffany Vale competition is REAL. Same castings, same looks. Sofia got the last one. Tiffany posted passive-aggressively.',
   'Unlike most model-to-actor transitions, she''s actually studying. Meisner technique. The teachers are impressed.',
   'Chad Brogan DMs her model advice. It''s mostly about skincare. Unexpectedly wholesome.'
 ]),

-- Jamal Thompson - Former Athlete
('a0000001-0000-0000-0000-000000000307', 'Jamal Thompson', 25, 'Male', 'Newcomer', 52000, 40, 60,
 ARRAY['Drama', 'Action'], 'Available',
 'Former college football star discovered in a local play. Rex Donovan believes in him completely. Damon Reeves sees star potential. Athletic connection with Jordan Kim.',
 'Athletic build, natural charisma, untrained.',
 ARRAY['Athletic', 'Charismatic', 'Coachable'],
 '{"a0000001-0000-0000-0000-000000000105": 40, "a0000001-0000-0000-0000-000000000303": 20, "a0000001-0000-0000-0000-000000000003": 25}'::jsonb,
 ARRAY[
   'Damon Reeves saw his community theatre show. In OHIO. Damon was there for a charity event. Fate.',
   'Rex Donovan says he has "the thing." Won''t elaborate. "You know it when you see it."',
   'Still trains like a football player. 5am workouts. Action directors are circling.',
   'His first audition he was so nervous he tackled the reader. Literally. He apologized. Still got a callback.'
 ]),

-- Emma Zhang - Film School Graduate
('a0000001-0000-0000-0000-000000000308', 'Emma Zhang', 23, 'Female', 'Newcomer', 44000, 34, 53,
 ARRAY['Comedy', 'Romance'], 'Available',
 'NYU film graduate who also acts. Bonded with Priya Sharma at a festival. Fellow nerds with Gemma Liu. Admires Olive Chen''s work and career choices.',
 'Thoughtful, alternative style, director''s eye.',
 ARRAY['Film Nerd', 'Writer-Actor', 'Behind Camera Interest'],
 '{"a0000001-0000-0000-0000-000000000108": 30, "a0000001-0000-0000-0000-000000000206": 25, "a0000002-0000-0000-0000-000000000002": 20}'::jsonb,
 ARRAY[
   'Her thesis film got her an agent. AND a directing meeting. She''s doing both tracks.',
   'Priya Sharma told her to "always know where the camera is." She color-codes her scripts now. Obsessive but effective.',
   'She and Gemma Liu have a film club. Just them. They watch one classic film a week. Discussion is intense.',
   'Asked Olive Chen one question at a festival. Olive answered for 45 minutes. Emma took notes. Future filmmaker energy.'
 ])

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  age = EXCLUDED.age,
  gender = EXCLUDED.gender,
  tier = EXCLUDED.tier,
  salary = EXCLUDED.salary,
  reputation = EXCLUDED.reputation,
  skill = EXCLUDED.skill,
  genres = EXCLUDED.genres,
  status = EXCLUDED.status,
  bio = EXCLUDED.bio,
  visual_description = EXCLUDED.visual_description,
  personality = EXCLUDED.personality,
  relationships = EXCLUDED.relationships,
  gossip = EXCLUDED.gossip;
