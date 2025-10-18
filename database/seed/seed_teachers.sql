-- Seed data for teachers table
-- This script populates the teachers table with the spiritual teachers

-- Insert Osho
INSERT INTO teachers (
    name, display_name, full_name, birth_year, death_year, nationality, description,
    tradition_name, tradition_description, tradition_origin, era, avatar_url, background_url,
    core_teachings, teaching_approach, teaching_tone, teaching_focus, teaching_complexity,
    personality_traits, is_active
) VALUES (
    'osho',
    'Osho',
    'Bhagwan Shree Rajneesh (Osho)',
    1931,
    1990,
    'Indian',
    'A spiritual teacher who integrated Eastern and Western spiritual traditions',
    'Zen Buddhism & Mysticism',
    'Integration of Eastern and Western spiritual traditions',
    'India',
    '1931-1990',
    'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Osho',
    'https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=Mystical+Landscape',
    ARRAY[
        'Meditation is not concentration',
        'Be here now',
        'Love is the only religion',
        'Celebrate life',
        'Drop the mind, be the heart',
        'Freedom is the ultimate value',
        'Awareness is the key to transformation'
    ],
    'direct',
    'playful',
    'meditation',
    'intermediate',
    ARRAY['Wise', 'Playful', 'Provocative', 'Loving', 'Mystical', 'Revolutionary'],
    true
);

-- Insert Buddha
INSERT INTO teachers (
    name, display_name, full_name, birth_year, death_year, nationality, description,
    tradition_name, tradition_description, tradition_origin, era, avatar_url, background_url,
    core_teachings, teaching_approach, teaching_tone, teaching_focus, teaching_complexity,
    personality_traits, is_active
) VALUES (
    'buddha',
    'Buddha',
    'Siddhartha Gautama (Buddha)',
    -563,
    -483,
    'Indian',
    'The founder of Buddhism, known for his teachings on suffering and the path to enlightenment',
    'Buddhism',
    'The path to liberation from suffering through the Eightfold Path',
    'India',
    '563-483 BCE',
    'https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=Buddha',
    'https://via.placeholder.com/800x400/4ECDC4/FFFFFF?text=Bodhi+Tree',
    ARRAY[
        'The root of suffering is attachment',
        'Be present in this moment',
        'Compassion for all beings',
        'The Four Noble Truths',
        'Right mindfulness',
        'The Eightfold Path',
        'Hatred does not cease by hatred',
        'The mind is everything'
    ],
    'gentle',
    'compassionate',
    'mindfulness',
    'beginner',
    ARRAY['Wise', 'Compassionate', 'Gentle', 'Patient', 'Enlightened', 'Peaceful'],
    true
);

-- Insert Krishnamurti
INSERT INTO teachers (
    name, display_name, full_name, birth_year, death_year, nationality, description,
    tradition_name, tradition_description, tradition_origin, era, avatar_url, background_url,
    core_teachings, teaching_approach, teaching_tone, teaching_focus, teaching_complexity,
    personality_traits, is_active
) VALUES (
    'krishnamurti',
    'J. Krishnamurti',
    'Jiddu Krishnamurti',
    1895,
    1986,
    'Indian',
    'A philosopher and spiritual teacher who rejected all forms of authority and tradition',
    'Philosophy & Self-Inquiry',
    'Freedom from conditioning through direct inquiry and observation',
    'India',
    '1895-1986',
    'https://via.placeholder.com/300x300/45B7D1/FFFFFF?text=K',
    'https://via.placeholder.com/800x400/45B7D1/FFFFFF?text=Ojai+Valley',
    ARRAY[
        'The observer is the observed',
        'Freedom from conditioning',
        'Question everything',
        'No authority except yourself',
        'The ending of thought',
        'Choiceless awareness',
        'The mind is the problem',
        'Truth is a pathless land'
    ],
    'questioning',
    'intense',
    'self-inquiry',
    'advanced',
    ARRAY['Intense', 'Questioning', 'Revolutionary', 'Independent', 'Profound', 'Challenging'],
    true
);

-- Insert Vivekananda
INSERT INTO teachers (
    name, display_name, full_name, birth_year, death_year, nationality, description,
    tradition_name, tradition_description, tradition_origin, era, avatar_url, background_url,
    core_teachings, teaching_approach, teaching_tone, teaching_focus, teaching_complexity,
    personality_traits, is_active
) VALUES (
    'vivekananda',
    'Swami Vivekananda',
    'Swami Vivekananda (Narendranath Datta)',
    1863,
    1902,
    'Indian',
    'A Hindu monk and philosopher who introduced Vedanta to the Western world',
    'Vedanta & Yoga',
    'Hindu philosophy emphasizing the unity of all existence and the divinity of the soul',
    'India',
    '1863-1902',
    'https://via.placeholder.com/300x300/96CEB4/FFFFFF?text=SV',
    'https://via.placeholder.com/800x400/96CEB4/FFFFFF?text=Belur+Math',
    ARRAY[
        'Arise, awake, and stop not till the goal is reached',
        'You cannot believe in God until you believe in yourself',
        'The greatest sin is to think yourself weak',
        'All differences in this world are of degree, and not of kind',
        'Those who serve others, serve the Lord',
        'Education is the manifestation of the perfection already in man',
        'Each soul is potentially divine'
    ],
    'inspiring',
    'passionate',
    'service',
    'intermediate',
    ARRAY['Inspiring', 'Confident', 'Practical', 'Passionate', 'Empowering', 'Service-oriented'],
    true
);

-- Verify the insertions
SELECT 
    name, 
    display_name, 
    teaching_focus, 
    teaching_complexity,
    array_length(core_teachings, 1) as teaching_count,
    array_length(personality_traits, 1) as trait_count
FROM teachers 
WHERE is_active = true 
ORDER BY display_name;
