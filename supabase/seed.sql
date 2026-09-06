-- ==============================================================================
-- BharatLingo Seed Data
-- Run this in SQL Editor after running schema.sql
-- ==============================================================================

-- 1. Languages
INSERT INTO public.languages (id, name, native_name, script, locale, voice_code, translation_code, flag_emoji, is_active)
VALUES
  ('hi', 'Hindi', 'हिन्दी', 'Devanagari', 'hi-IN', 'hi-IN', 'hin_Deva', '🇮🇳', true),
  ('mr', 'Marathi', 'मराठी', 'Devanagari', 'mr-IN', 'mr-IN', 'mar_Deva', '🇮🇳', true),
  ('ta', 'Tamil', 'தமிழ்', 'Tamil', 'ta-IN', 'ta-IN', 'tam_Taml', '🇮🇳', true),
  ('te', 'Telugu', 'తెలుగు', 'Telugu', 'te-IN', 'te-IN', 'tel_Telu', '🇮🇳', true),
  ('bn', 'Bengali', 'বাংলা', 'Bengali', 'bn-IN', 'bn-IN', 'ben_Beng', '🇮🇳', true),
  ('pa', 'Punjabi', 'ਪੰਜਾਬੀ', 'Gurmukhi', 'pa-IN', 'pa-IN', 'pan_Guru', '🇮🇳', true),
  ('gu', 'Gujarati', 'ગુજરાતી', 'Gujarati', 'gu-IN', 'gu-IN', 'guj_Gujr', '🇮🇳', true),
  ('en', 'English', 'English', 'Latin', 'en-US', 'en-US', 'eng_Latn', '🇬🇧', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  native_name = EXCLUDED.native_name,
  script = EXCLUDED.script,
  voice_code = EXCLUDED.voice_code;

-- 2. Courses
INSERT INTO public.courses (id, source_language_id, target_language_id, title, description, level)
VALUES
  ('en-hi', 'en', 'hi', 'Learn Hindi from English', 'Master spoken and written Hindi starting from basics.', 'beginner'),
  ('en-mr', 'en', 'mr', 'Learn Marathi from English', 'Learn conversational Marathi step by step.', 'beginner'),
  ('en-ta', 'en', 'ta', 'Learn Tamil from English', 'Learn classical and modern Tamil easily.', 'beginner'),
  ('en-te', 'en', 'te', 'Learn Telugu from English', 'Speak fluent Telugu with practical lessons.', 'beginner'),
  ('en-bn', 'en', 'bn', 'Learn Bengali from English', 'Sweet and poetic Bengali for everyday communication.', 'beginner'),
  ('en-pa', 'en', 'pa', 'Learn Punjabi from English', 'Learn energetic Punjabi and Gurmukhi basics.', 'beginner'),
  ('en-gu', 'en', 'gu', 'Learn Gujarati from English', 'Explore Gujarat culture and master conversational Gujarati.', 'beginner'),
  ('hi-mr', 'hi', 'mr', 'हिन्दी से मराठी सीखें', 'हिन्दी भाषियों के लिए आसान मराठी पाठ।', 'beginner'),
  ('hi-ta', 'hi', 'ta', 'हिन्दी से तमिल सीखें', 'हिन्दी के माध्यम से तमिल बोलना सीखें।', 'beginner'),
  ('mr-hi', 'mr', 'hi', 'मराठीतून हिन्दी शिका', 'मराठी भाषिकांसाठी सोपे आणि प्रभावी हिन्दी धडे.', 'beginner')
ON CONFLICT (id) DO NOTHING;

-- 3. Units
INSERT INTO public.units (id, course_id, unit_number, title, title_native, description, color_theme, icon)
VALUES
  ('hi-unit-1', 'en-hi', 1, 'Unit 1: Essentials', 'इकाई 1: मूल बातें', 'Greetings, introductions, and everyday essential words', '#0B8F62', 'sparkles'),
  ('hi-unit-2', 'en-hi', 2, 'Unit 2: Daily Life', 'इकाई 2: दैनिक जीवन', 'Food, family, numbers, and basic sentences', '#F39A45', 'coffee'),
  ('hi-unit-3', 'en-hi', 3, 'Unit 3: Travel & Places', 'इकाई 3: यात्रा और स्थान', 'Directions, markets, transport, and practical phrases', '#3B82F6', 'map-pin'),
  ('mr-unit-1', 'en-mr', 1, 'Unit 1: Essentials', 'विभाग १: मूलभूत गोष्टी', 'Greetings, introductions, and common Marathi words', '#0B8F62', 'sparkles'),
  ('mr-unit-2', 'en-mr', 2, 'Unit 2: Daily Life', 'विभाग २: दैनंदिन जीवन', 'Food, family, relations, and conversational phrases', '#F39A45', 'coffee'),
  ('ta-unit-1', 'en-ta', 1, 'Unit 1: Essentials', 'அலகு 1: அடிப்படைகள்', 'Greetings, introductions, and core Tamil vocabulary', '#0B8F62', 'sparkles'),
  ('te-unit-1', 'en-te', 1, 'Unit 1: Essentials', 'యూనిట్ 1: ప్రాథమికాలు', 'Greetings, daily Telugu words, and basic questions', '#0B8F62', 'sparkles'),
  ('bn-unit-1', 'en-bn', 1, 'Unit 1: Essentials', 'ইউনিট ১: মূল ভিত্তি', 'Greetings, family words, and everyday Bengali terms', '#0B8F62', 'sparkles'),
  ('pa-unit-1', 'en-pa', 1, 'Unit 1: Essentials', 'ਯੂਨਿਟ 1: ਮੁੱਢਲੀਆਂ ਗੱਲਾਂ', 'Greetings, everyday Punjabi words, and simple sentences', '#0B8F62', 'sparkles'),
  ('gu-unit-1', 'en-gu', 1, 'Unit 1: Essentials', 'યુનિટ 1: મૂળભૂત વાતો', 'Greetings, everyday Gujarati words, and numbers', '#0B8F62', 'sparkles')
ON CONFLICT (id) DO NOTHING;

-- 4. Lessons
INSERT INTO public.lessons (id, unit_id, language_id, lesson_order, name, name_native, category, xp_reward, hearts_cost)
VALUES
  ('hi-greetings', 'hi-unit-1', 'hi', 1, 'Greetings', 'अभिवादन', 'Everyday Essentials', 25, 1),
  ('hi-everyday', 'hi-unit-1', 'hi', 2, 'Everyday Words', 'दैनिक शब्द', 'Everyday Essentials', 25, 1),
  ('hi-numbers', 'hi-unit-1', 'hi', 3, 'Numbers 1-10', 'संख्या १-१०', 'Everyday Essentials', 30, 1),
  ('hi-food', 'hi-unit-2', 'hi', 4, 'Food & Drink', 'खान-पान', 'Daily Life', 30, 1),
  ('hi-family', 'hi-unit-2', 'hi', 5, 'Family & Relations', 'परिवार और रिश्ते', 'Daily Life', 35, 1),
  ('hi-travel', 'hi-unit-3', 'hi', 6, 'Travel & Directions', 'यात्रा और दिशाएं', 'Travel & Places', 40, 1),

  ('mr-greetings', 'mr-unit-1', 'mr', 1, 'Greetings', 'नमस्कार', 'Everyday Essentials', 25, 1),
  ('mr-everyday', 'mr-unit-1', 'mr', 2, 'Everyday Words', 'दैनिक शब्द', 'Everyday Essentials', 25, 1),
  ('mr-numbers', 'mr-unit-1', 'mr', 3, 'Numbers 1-10', 'संख्या १-१०', 'Everyday Essentials', 30, 1),
  ('mr-food', 'mr-unit-2', 'mr', 4, 'Food & Drink', 'अन्न व पेय', 'Daily Life', 30, 1),
  ('mr-family', 'mr-unit-2', 'mr', 5, 'Family', 'कुटुंब', 'Daily Life', 35, 1),

  ('ta-greetings', 'ta-unit-1', 'ta', 1, 'Greetings', 'வணக்கம்', 'Everyday Essentials', 25, 1),
  ('ta-everyday', 'ta-unit-1', 'ta', 2, 'Everyday Words', 'தினசரி சொற்கள்', 'Everyday Essentials', 25, 1),
  ('te-greetings', 'te-unit-1', 'te', 1, 'Greetings', 'నమస్కారం', 'Everyday Essentials', 25, 1),
  ('te-everyday', 'te-unit-1', 'te', 2, 'Everyday Words', 'రోజువారీ పదాలు', 'Everyday Essentials', 25, 1),
  ('bn-greetings', 'bn-unit-1', 'bn', 1, 'Greetings', 'নমস্কার / সালাম', 'Everyday Essentials', 25, 1),
  ('bn-everyday', 'bn-unit-1', 'bn', 2, 'Everyday Words', 'দৈনন্দিন শব্দ', 'Everyday Essentials', 25, 1),
  ('pa-greetings', 'pa-unit-1', 'pa', 1, 'Greetings', 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ', 'Everyday Essentials', 25, 1),
  ('pa-everyday', 'pa-unit-1', 'pa', 2, 'Everyday Words', 'ਰੋਜ਼ਾਨਾ ਸ਼ਬਦ', 'Everyday Essentials', 25, 1),
  ('gu-greetings', 'gu-unit-1', 'gu', 1, 'Greetings', 'નમસ્તે', 'Everyday Essentials', 25, 1),
  ('gu-everyday', 'gu-unit-1', 'gu', 2, 'Everyday Words', 'રોજિંદા શબ્દો', 'Everyday Essentials', 25, 1)
ON CONFLICT (id) DO NOTHING;

-- 5. Achievements
INSERT INTO public.achievements (id, title, title_native, description, icon, xp_reward, category, criteria_type, criteria_value)
VALUES
  ('first_step', 'First Step', 'पहला कदम', 'Complete your very first lesson', '🎯', 50, 'progress', 'first_step', 1),
  ('streak_3', 'On Fire (3 Days)', '३ दिन की लकीर', 'Maintain a 3-day learning streak', '🔥', 75, 'streak', 'streak', 3),
  ('streak_7', 'Week Champion (7 Days)', 'सप्ताह विजेता', 'Maintain a 7-day learning streak', '⚡', 150, 'streak', 'streak', 7),
  ('streak_30', 'Dedicated Learner (30 Days)', 'समर्पित शिक्षार्थी', 'Maintain a 30-day learning streak', '👑', 500, 'streak', 'streak', 30),
  ('perfect_lesson', 'Perfectionist', 'सटीक उत्तर', 'Complete a lesson with 100% accuracy and zero mistakes', '⭐', 50, 'accuracy', 'perfect_lesson', 1),
  ('xp_100', 'Centurion', 'शतकवीर', 'Earn 100 total XP', '💎', 50, 'xp', 'xp', 100),
  ('xp_500', 'Rising Star', 'उभरता सितारा', 'Earn 500 total XP', '🌟', 150, 'xp', 'xp', 500),
  ('multilingual', 'Bharat Yatri', 'भारत यात्री', 'Explore lessons in 3 or more Indian languages', '🇮🇳', 200, 'exploration', 'multilingual', 3)
ON CONFLICT (id) DO NOTHING;

-- 6. Leaderboard Mock Entries (for rich competitive leagues)
INSERT INTO public.leaderboard_entries (id, user_name, avatar_url, xp, league, rank, streak)
VALUES
  (uuid_generate_v4(), 'Aarav Sharma', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav', 1240, 'Diamond', 1, 14),
  (uuid_generate_v4(), 'Priya Patel', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', 1150, 'Diamond', 2, 12),
  (uuid_generate_v4(), 'Rohan Deshmukh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan', 980, 'Gold', 3, 9),
  (uuid_generate_v4(), 'Ananya Iyer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya', 860, 'Gold', 4, 7),
  (uuid_generate_v4(), 'Gurpreet Singh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gurpreet', 740, 'Silver', 5, 5),
  (uuid_generate_v4(), 'Tanvi Roy', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvi', 620, 'Silver', 6, 4),
  (uuid_generate_v4(), 'Karthik Rao', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik', 450, 'Bronze', 7, 3)
ON CONFLICT DO NOTHING;
