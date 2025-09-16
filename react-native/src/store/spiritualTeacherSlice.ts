import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  SpiritualTeacher, 
  SpiritualContext,
  OshoProfile, 
  OshoTeaching, 
  OshoQuote, 
  OshoPractice,
  BuddhaProfile,
  BuddhaTeaching,
  BuddhaQuote,
  BuddhaPractice,
  BuddhaCategory,
  KrishnamurtiProfile,
  KrishnamurtiTeaching,
  KrishnamurtiQuote,
  KrishnamurtiPractice,
  KrishnamurtiCategory,
  VivekanandaProfile,
  VivekanandaTeaching,
  VivekanandaQuote,
  VivekanandaPractice,
  VivekanandaCategory,
  SpiritualGuidance,
  SpiritualConversation,
  SpiritualProfile,
  DailyGuidance,
  SpiritualProgress,
  OshoCategory
} from '@/types/spiritual';

// Initial Osho profile
const initialOshoProfile: OshoProfile = {
  id: 'osho',
  name: 'Osho',
  displayName: 'Osho',
  fullName: 'Bhagwan Shree Rajneesh (Osho)',
  birthYear: 1931,
  deathYear: 1990,
  nationality: 'Indian',
  description: 'A spiritual teacher who integrated Eastern and Western spiritual traditions',
  tradition: {
    name: 'Zen Buddhism & Mysticism',
    description: 'Integration of Eastern and Western spiritual traditions',
    origin: 'India',
    keyConcepts: ['Meditation', 'Awareness', 'Love', 'Freedom', 'Celebration'],
    practices: ['Dynamic Meditation', 'Vipassana', 'Zazen', 'Dancing Meditation'],
    philosophy: 'Integration of Eastern and Western spiritual traditions'
  },
  era: '1931-1990',
  avatar: 'osho_avatar',
  background: 'mystical_landscape',
  coreTeachings: [
    'Meditation is not concentration',
    'Be here now',
    'Love is the only religion',
    'Celebrate life',
    'Drop the mind, be the heart',
    'Freedom is the ultimate value',
    'Awareness is the key to transformation'
  ],
  teachingStyle: {
    approach: 'direct',
    tone: 'playful',
    focus: 'meditation',
    complexity: 'intermediate'
  },
  personality: {
    traits: ['Wise', 'Playful', 'Provocative', 'Loving', 'Mystical'],
    communication: 'Direct and often paradoxical',
    humor: 'Present and insightful',
    compassion: 'Deep and unconditional'
  },
  philosophy: {
    essence: 'Integration of Eastern and Western spiritual traditions',
    keyPrinciples: [
      'Meditation is not concentration',
      'Be here now',
      'Love is the only religion',
      'Celebrate life',
      'Drop the mind, be the heart',
      'Freedom is the ultimate value',
      'Awareness is the key to transformation'
    ],
    approach: 'Direct, often paradoxical, and playful',
    focus: 'Meditation, awareness, love, and celebration of life'
  },
  teachingStyle: {
    communication: {
      tone: 'playful',
      method: 'storytelling',
      humor: 'Present and insightful',
      compassion: 'Deep and unconditional'
    },
    content: {
      topics: [
        'Meditation and awareness',
        'Love and relationships',
        'Freedom and responsibility',
        'Death and life',
        'Mind and consciousness',
        'Celebration and joy',
        'Mysticism and spirituality'
      ],
      complexity: 'intermediate',
      depth: 'profound'
    },
    interaction: {
      questioning: 'Socratic method with spiritual focus',
      guidance: 'Direct and often challenging',
      support: 'Unconditional love and acceptance',
      challenge: 'Gentle but firm pushing of boundaries'
    }
  },
  isAvailable: true,
  popularity: 9,
  userRating: 4.8
};

// Initial Buddha profile
const initialBuddhaProfile: BuddhaProfile = {
  id: 'buddha',
  name: 'Buddha',
  displayName: 'Buddha',
  fullName: 'Siddhartha Gautama (Buddha)',
  birthYear: 563,
  deathYear: 483,
  nationality: 'Indian',
  description: 'The founder of Buddhism, known for his teachings on the Four Noble Truths and the Eightfold Path',
  tradition: {
    name: 'Buddhism',
    description: 'A spiritual tradition focused on liberation from suffering through wisdom and compassion',
    origin: 'India',
    keyConcepts: ['Four Noble Truths', 'Eightfold Path', 'Meditation', 'Compassion', 'Wisdom'],
    practices: ['Vipassana', 'Metta', 'Mindfulness', 'Walking Meditation'],
    philosophy: 'Liberation from suffering through understanding the nature of reality'
  },
  era: '563-483 BCE',
  avatar: 'buddha_avatar',
  background: 'peaceful_temple',
  coreTeachings: [
    'The Four Noble Truths',
    'The Eightfold Path',
    'Impermanence of all things',
    'Compassion for all beings',
    'Mindfulness in daily life',
    'The Middle Way',
    'Non-attachment'
  ],
  teachingStyle: {
    approach: 'practical',
    tone: 'gentle',
    focus: 'meditation',
    complexity: 'beginner'
  },
  personality: {
    traits: ['Wise', 'Compassionate', 'Gentle', 'Patient', 'Loving'],
    communication: 'Clear and practical',
    humor: 'Subtle and kind',
    compassion: 'Universal and unconditional'
  },
  philosophy: {
    essence: 'Liberation from suffering through understanding the nature of reality',
    keyPrinciples: [
      'The Four Noble Truths',
      'The Eightfold Path',
      'Impermanence of all things',
      'Compassion for all beings',
      'Mindfulness in daily life',
      'The Middle Way',
      'Non-attachment'
    ],
    approach: 'Gentle, practical, and compassionate',
    focus: 'Meditation, mindfulness, and compassionate living'
  },
  teachingStyle: {
    communication: {
      tone: 'gentle',
      method: 'storytelling',
      humor: 'Subtle and kind',
      compassion: 'Universal and unconditional'
    },
    content: {
      topics: [
        'The Four Noble Truths',
        'The Eightfold Path',
        'Meditation and mindfulness',
        'Compassion and loving-kindness',
        'Wisdom and understanding',
        'Suffering and its causes',
        'Enlightenment and liberation'
      ],
      complexity: 'beginner',
      depth: 'practical'
    },
    interaction: {
      questioning: 'Gentle inquiry into the nature of experience',
      guidance: 'Practical and compassionate',
      support: 'Unconditional love and understanding',
      challenge: 'Gentle encouragement to look deeper'
    }
  },
  isAvailable: true,
  popularity: 10,
  userRating: 4.9
};

// Initial Krishnamurti profile
const initialKrishnamurtiProfile: KrishnamurtiProfile = {
  id: 'krishnamurti',
  name: 'Krishnamurti',
  displayName: 'J. Krishnamurti',
  fullName: 'Jiddu Krishnamurti',
  birthYear: 1895,
  deathYear: 1986,
  nationality: 'Indian',
  description: 'A philosopher and spiritual teacher who emphasized freedom from conditioning and self-inquiry',
  tradition: {
    name: 'Philosophy & Self-Inquiry',
    description: 'A unique approach to freedom through self-observation and inquiry',
    origin: 'India',
    keyConcepts: ['Freedom', 'Awareness', 'Inquiry', 'Observation', 'Conditioning'],
    practices: ['Self-Inquiry', 'Observation', 'Dialogue', 'Awareness', 'Reflection'],
    philosophy: 'Freedom from conditioning through self-observation and inquiry'
  },
  era: '1895-1986',
  avatar: 'krishnamurti_avatar',
  background: 'philosophical_landscape',
  coreTeachings: [
    'Freedom is not from something but from the very idea of freedom',
    'The observer is the observed',
    'Inquiry begins when we stop looking for answers',
    'Awareness without choice is the highest form of intelligence',
    'The mind that is free from conditioning can see clearly',
    'Truth is a pathless land',
    'Self-knowledge is the beginning of wisdom'
  ],
  teachingStyle: {
    approach: 'inquiry',
    tone: 'serious',
    focus: 'awareness',
    complexity: 'advanced'
  },
  personality: {
    traits: ['Wise', 'Serious', 'Questioning', 'Direct', 'Profound'],
    communication: 'Direct and questioning, often paradoxical',
    humor: 'Subtle and thoughtful',
    compassion: 'Deep understanding of human suffering'
  },
  philosophy: {
    essence: 'Freedom from conditioning through self-observation and inquiry',
    keyPrinciples: [
      'Freedom is not from something but from the very idea of freedom',
      'The observer is the observed',
      'Inquiry begins when we stop looking for answers',
      'Awareness without choice is the highest form of intelligence',
      'The mind that is free from conditioning can see clearly',
      'Truth is a pathless land',
      'Self-knowledge is the beginning of wisdom'
    ],
    approach: 'Self-inquiry and observation',
    focus: 'Freedom from conditioning and psychological freedom'
  },
  teachingStyle: {
    communication: {
      tone: 'serious',
      method: 'inquiry',
      humor: 'Subtle and thoughtful',
      compassion: 'Deep understanding of human suffering'
    },
    content: {
      topics: [
        'Freedom and conditioning',
        'Self-inquiry and observation',
        'Awareness and consciousness',
        'Fear and psychological security',
        'Relationship and love',
        'Education and learning',
        'The nature of the mind'
      ],
      complexity: 'advanced',
      depth: 'philosophical'
    },
    interaction: {
      questioning: 'Deep inquiry into the nature of consciousness',
      guidance: 'Direct and challenging',
      support: 'Intellectual and philosophical',
      challenge: 'Questions that break down assumptions'
    }
  },
  isAvailable: true,
  popularity: 8,
  userRating: 4.7
};

// Initial Swami Vivekananda profile
const initialVivekanandaProfile: VivekanandaProfile = {
  id: 'vivekananda',
  name: 'Vivekananda',
  displayName: 'Swami Vivekananda',
  fullName: 'Swami Vivekananda (Narendranath Datta)',
  birthYear: 1863,
  deathYear: 1902,
  nationality: 'Indian',
  description: 'A Hindu monk and philosopher who introduced Vedanta to the Western world. Disciple of Sri Ramakrishna, he founded the Ramakrishna Mission and delivered the famous speech at the Parliament of World Religions in Chicago in 1893, beginning with "Sisters and Brothers of America." He emphasized the divinity of man, self-confidence, and service to humanity as the highest form of worship.',
  tradition: {
    name: 'Vedanta & Yoga',
    description: 'Hindu philosophy emphasizing the unity of all existence and the divinity of the soul',
    origin: 'India',
    keyConcepts: ['Vedanta', 'Yoga', 'Service', 'Education', 'Universal Religion', 'Self-Realization'],
    practices: ['Karma Yoga', 'Bhakti Yoga', 'Jnana Yoga', 'Raja Yoga', 'Service', 'Meditation'],
    philosophy: 'Unity of all religions and the divinity of the human soul'
  },
  era: '1863-1902',
  avatar: 'vivekananda_avatar',
  background: 'spiritual_landscape',
  coreTeachings: [
    'Arise, awake, and stop not till the goal is reached',
    'You cannot believe in God until you believe in yourself',
    'The greatest sin is to think yourself weak',
    'All differences in this world are of degree, and not of kind',
    'Those who serve others, serve the Lord',
    'Education is the manifestation of the perfection already in man',
    'Each soul is potentially divine'
  ],
  teachingStyle: {
    approach: 'inspiring',
    tone: 'passionate',
    focus: 'service',
    complexity: 'intermediate'
  },
  personality: {
    traits: ['Inspiring', 'Confident', 'Practical', 'Compassionate', 'Wise', 'Courageous'],
    communication: 'Inspiring and direct, emphasizing self-confidence and practical application',
    humor: 'Present but subtle, often in the form of gentle wisdom',
    compassion: 'Deep love for humanity and service to others'
  },
  philosophy: {
    essence: 'Divinity of man and unity of all religions through self-realization',
    keyPrinciples: [
      'Arise, awake, and stop not till the goal is reached',
      'You cannot believe in God until you believe in yourself',
      'The greatest sin is to think yourself weak',
      'All differences in this world are of degree, and not of kind',
      'Those who serve others, serve the Lord',
      'Education is the manifestation of the perfection already in man',
      'Each soul is potentially divine'
    ],
    approach: 'Practical spirituality through self-confidence, service, and self-realization',
    focus: 'Self-confidence, service to humanity, education, and universal religion'
  },
  teachingStyle: {
    communication: {
      tone: 'inspiring',
      method: 'lecture',
      humor: 'Present but subtle, often in the form of gentle wisdom',
      compassion: 'Deep love for humanity and service to others'
    },
    content: {
      topics: [
        'Self-confidence and self-realization',
        'Karma Yoga and selfless service',
        'Bhakti Yoga and devotion',
        'Jnana Yoga and knowledge',
        'Raja Yoga and meditation',
        'Education and character building',
        'Universal religion and tolerance'
      ],
      complexity: 'intermediate',
      depth: 'profound'
    },
    interaction: {
      questioning: 'Encouraging self-inquiry and practical application',
      guidance: 'Inspiring and practical, focused on service',
      support: 'Compassionate and encouraging',
      challenge: 'Motivating to rise above limitations and serve others'
    }
  },
  isAvailable: true,
  popularity: 9,
  userRating: 4.8
};

// Osho teaching categories
const oshoCategories: Record<OshoCategory, any> = {
  meditation: {
    name: 'Meditation & Awareness',
    description: 'Core teachings on meditation, awareness, and consciousness',
    color: '#FF6B35',
    icon: '🧘‍♂️',
    keyConcepts: ['Awareness', 'Witnessing', 'Present moment', 'Consciousness']
  },
  love: {
    name: 'Love & Relationships',
    description: 'Teachings on love, relationships, and human connection',
    color: '#E91E63',
    icon: '💖',
    keyConcepts: ['Unconditional love', 'Intimacy', 'Freedom in love', 'Celebration']
  },
  freedom: {
    name: 'Freedom & Responsibility',
    description: 'Wisdom on freedom, responsibility, and authentic living',
    color: '#9C27B0',
    icon: '🕊️',
    keyConcepts: ['Freedom', 'Responsibility', 'Authenticity', 'Individuality']
  },
  awareness: {
    name: 'Awareness & Consciousness',
    description: 'Deep insights into awareness, consciousness, and being',
    color: '#2196F3',
    icon: '👁️',
    keyConcepts: ['Awareness', 'Consciousness', 'Being', 'Presence']
  },
  celebration: {
    name: 'Celebration & Joy',
    description: 'Teachings on celebrating life, joy, and living fully',
    color: '#FFC107',
    icon: '🎉',
    keyConcepts: ['Celebration', 'Joy', 'Dancing', 'Laughter', 'Life']
  },
  mysticism: {
    name: 'Mysticism & Spirituality',
    description: 'Mystical experiences, spirituality, and transcendence',
    color: '#673AB7',
    icon: '✨',
    keyConcepts: ['Mysticism', 'Transcendence', 'Spirituality', 'Divine']
  },
  daily_life: {
    name: 'Daily Life & Practical Wisdom',
    description: 'Practical guidance for everyday living and challenges',
    color: '#4CAF50',
    icon: '🌱',
    keyConcepts: ['Practical wisdom', 'Daily life', 'Challenges', 'Growth']
  },
  death: {
    name: 'Death & Life',
    description: 'Insights on death, life, and the eternal cycle',
    color: '#607D8B',
    icon: '🕯️',
    keyConcepts: ['Death', 'Life', 'Eternal', 'Cycle', 'Transformation']
  }
};

// Buddha teaching categories
const buddhaCategories: Record<BuddhaCategory, any> = {
  four_noble_truths: {
    name: 'Four Noble Truths',
    description: 'The fundamental teachings on the nature of suffering and its cessation',
    color: '#FF9800',
    icon: '🧘‍♂️',
    keyConcepts: ['Suffering', 'Cause of suffering', 'Cessation', 'Path']
  },
  eightfold_path: {
    name: 'Eightfold Path',
    description: 'The practical path to liberation from suffering',
    color: '#4CAF50',
    icon: '🛤️',
    keyConcepts: ['Right View', 'Right Intention', 'Right Speech', 'Right Action', 'Right Livelihood', 'Right Effort', 'Right Mindfulness', 'Right Concentration']
  },
  meditation: {
    name: 'Meditation & Mindfulness',
    description: 'Core practices for developing awareness and concentration',
    color: '#2196F3',
    icon: '🧘‍♀️',
    keyConcepts: ['Vipassana', 'Samatha', 'Mindfulness', 'Concentration']
  },
  mindfulness: {
    name: 'Mindfulness',
    description: 'Present-moment awareness in daily life',
    color: '#9C27B0',
    icon: '👁️',
    keyConcepts: ['Present moment', 'Awareness', 'Attention', 'Observation']
  },
  compassion: {
    name: 'Compassion & Loving-Kindness',
    description: 'Cultivating love and compassion for all beings',
    color: '#E91E63',
    icon: '💖',
    keyConcepts: ['Metta', 'Karuna', 'Mudita', 'Upekkha']
  },
  wisdom: {
    name: 'Wisdom & Understanding',
    description: 'Insight into the nature of reality and existence',
    color: '#FFC107',
    icon: '💡',
    keyConcepts: ['Prajna', 'Insight', 'Understanding', 'Realization']
  },
  suffering: {
    name: 'Suffering & Its Causes',
    description: 'Understanding the nature of suffering and its origins',
    color: '#607D8B',
    icon: '😔',
    keyConcepts: ['Dukkha', 'Attachment', 'Craving', 'Ignorance']
  },
  enlightenment: {
    name: 'Enlightenment & Liberation',
    description: 'The ultimate goal of spiritual practice',
    color: '#673AB7',
    icon: '✨',
    keyConcepts: ['Nirvana', 'Bodhi', 'Liberation', 'Awakening']
  }
};

// Vivekananda teaching categories
const vivekanandaCategories: Record<VivekanandaCategory, any> = {
  karma_yoga: {
    name: 'Karma Yoga',
    description: 'The path of selfless action and service',
    color: '#FF5722',
    icon: '🤝',
    keyConcepts: ['Selfless service', 'Action without attachment', 'Duty', 'Work as worship']
  },
  bhakti_yoga: {
    name: 'Bhakti Yoga',
    description: 'The path of devotion and love for the divine',
    color: '#E91E63',
    icon: '💖',
    keyConcepts: ['Devotion', 'Love', 'Surrender', 'Divine love']
  },
  jnana_yoga: {
    name: 'Jnana Yoga',
    description: 'The path of knowledge and wisdom',
    color: '#2196F3',
    icon: '🧠',
    keyConcepts: ['Knowledge', 'Wisdom', 'Discrimination', 'Self-realization']
  },
  raja_yoga: {
    name: 'Raja Yoga',
    description: 'The royal path of meditation and control of mind',
    color: '#9C27B0',
    icon: '🧘‍♂️',
    keyConcepts: ['Meditation', 'Mind control', 'Concentration', 'Samadhi']
  },
  service: {
    name: 'Service to Humanity',
    description: 'Selfless service to others as a spiritual practice',
    color: '#4CAF50',
    icon: '🌍',
    keyConcepts: ['Service', 'Humanity', 'Compassion', 'Social reform']
  },
  education: {
    name: 'Education & Character',
    description: 'Education as the manifestation of perfection',
    color: '#FFC107',
    icon: '📚',
    keyConcepts: ['Education', 'Character', 'Manifestation', 'Perfection']
  },
  nationalism: {
    name: 'Nationalism & Pride',
    description: 'Love for one\'s country and cultural heritage',
    color: '#FF9800',
    icon: '🏛️',
    keyConcepts: ['Nationalism', 'Pride', 'Heritage', 'Cultural identity']
  },
  universal_religion: {
    name: 'Universal Religion',
    description: 'Unity of all religions and universal brotherhood',
    color: '#607D8B',
    icon: '🌐',
    keyConcepts: ['Unity', 'Universal religion', 'Tolerance', 'Brotherhood']
  }
};

// Sample Buddha teachings
const sampleBuddhaTeachings: BuddhaTeaching[] = [
  {
    id: 'four-noble-truths-1',
    title: 'The First Noble Truth: Suffering Exists',
    content: 'The first noble truth is that suffering exists. Birth is suffering, aging is suffering, illness is suffering, death is suffering. Sorrow, lamentation, pain, grief, and despair are suffering. Association with the unbeloved is suffering, separation from the loved is suffering, not getting what one wants is suffering.',
    source: {
      type: 'sutta',
      title: 'Dhammacakkappavattana Sutta',
      collection: 'Samyutta Nikaya'
    },
    category: 'four_noble_truths',
    tags: ['suffering', 'dukkha', 'first noble truth'],
    spiritualLevel: 'beginner',
    popularity: 10,
    keyConcepts: ['Suffering', 'Dukkha', 'First Noble Truth'],
    teachingValue: 10,
    memorability: 9
  },
  {
    id: 'eightfold-path-1',
    title: 'Right Mindfulness',
    content: 'Right mindfulness is the seventh factor of the Eightfold Path. It means being aware of the present moment, observing the body, feelings, mind, and mental objects without judgment. This awareness leads to understanding and liberation.',
    source: {
      type: 'sutta',
      title: 'Satipatthana Sutta',
      collection: 'Majjhima Nikaya'
    },
    category: 'eightfold_path',
    tags: ['mindfulness', 'eightfold path', 'awareness'],
    spiritualLevel: 'beginner',
    popularity: 9,
    keyConcepts: ['Mindfulness', 'Present moment', 'Awareness'],
    teachingValue: 9,
    memorability: 8
  },
  {
    id: 'meditation-1',
    title: 'Vipassana Meditation',
    content: 'Vipassana means insight meditation. It is the practice of observing the mind and body with awareness, seeing things as they really are. Through this practice, one develops wisdom and understanding of the true nature of existence.',
    source: {
      type: 'sutta',
      title: 'Anapanasati Sutta',
      collection: 'Majjhima Nikaya'
    },
    category: 'meditation',
    tags: ['vipassana', 'insight', 'meditation'],
    spiritualLevel: 'intermediate',
    popularity: 8,
    keyConcepts: ['Vipassana', 'Insight', 'Meditation'],
    teachingValue: 8,
    memorability: 7
  }
];

// Sample Buddha quotes
const sampleBuddhaQuotes: BuddhaQuote[] = [
  {
    id: 'suffering-quote-1',
    text: 'The root of suffering is attachment.',
    source: {
      type: 'sutta',
      title: 'Dhammapada',
      collection: 'Khuddaka Nikaya'
    },
    category: 'suffering',
    tags: ['suffering', 'attachment'],
    spiritualLevel: 'beginner',
    popularity: 10,
    keyConcepts: ['Suffering', 'Attachment'],
    teachingValue: 10,
    memorability: 10,
    relatedQuotes: ['mindfulness-quote-1'],
    practices: ['vipassana-meditation']
  },
  {
    id: 'mindfulness-quote-1',
    text: 'The mind is everything. What you think you become.',
    source: {
      type: 'sutta',
      title: 'Dhammapada',
      collection: 'Khuddaka Nikaya'
    },
    category: 'mindfulness',
    tags: ['mind', 'thoughts', 'becoming'],
    spiritualLevel: 'beginner',
    popularity: 9,
    keyConcepts: ['Mind', 'Thoughts', 'Becoming'],
    teachingValue: 9,
    memorability: 9,
    relatedQuotes: ['suffering-quote-1'],
    practices: ['mindfulness-meditation']
  },
  {
    id: 'compassion-quote-1',
    text: 'Hatred does not cease by hatred, but only by love; this is the eternal rule.',
    source: {
      type: 'sutta',
      title: 'Dhammapada',
      collection: 'Khuddaka Nikaya'
    },
    category: 'compassion',
    tags: ['hatred', 'love', 'compassion'],
    spiritualLevel: 'beginner',
    popularity: 8,
    keyConcepts: ['Hatred', 'Love', 'Compassion'],
    teachingValue: 8,
    memorability: 8,
    relatedQuotes: ['wisdom-quote-1'],
    practices: ['loving-kindness-meditation']
  }
];

// Sample Buddha practices
const sampleBuddhaPractices: BuddhaPractice[] = [
  {
    id: 'vipassana-meditation',
    name: 'Vipassana Meditation',
    type: 'meditation',
    category: 'meditation',
    difficulty: 'intermediate',
    duration: { minimum: 20, recommended: 45, maximum: 120 },
    description: 'Insight meditation practice for developing awareness and understanding',
    instructions: [
      'Sit comfortably with eyes closed',
      'Focus on the breath at the nostrils',
      'Observe sensations in the body',
      'Notice thoughts and emotions without judgment',
      'Return to the breath when distracted'
    ],
    preparation: ['Find a quiet space', 'Sit comfortably', 'Set a timer'],
    benefits: ['Awareness development', 'Stress reduction', 'Insight into reality', 'Emotional balance'],
    whenToUse: ['Morning', 'Evening', 'Stressful periods'],
    prerequisites: ['Basic sitting posture'],
    relatedPractices: ['mindfulness-meditation'],
    teaching: 'meditation-1',
    popularity: 8,
    effectiveness: 9,
    userRating: 4.7,
    completionRate: 0.70
  },
  {
    id: 'loving-kindness-meditation',
    name: 'Loving-Kindness Meditation (Metta)',
    type: 'loving_kindness',
    category: 'compassion',
    difficulty: 'beginner',
    duration: { minimum: 10, recommended: 20, maximum: 60 },
    description: 'Cultivating love and compassion for all beings',
    instructions: [
      'Sit comfortably and close your eyes',
      'Begin by sending love to yourself',
      'Extend love to loved ones',
      'Send love to neutral people',
      'Include difficult people',
      'Extend love to all beings everywhere'
    ],
    preparation: ['Find a quiet space', 'Sit comfortably', 'Set a timer'],
    benefits: ['Compassion development', 'Emotional healing', 'Relationship improvement', 'Inner peace'],
    whenToUse: ['Morning', 'Before sleep', 'Conflict situations'],
    prerequisites: ['Basic sitting posture'],
    relatedPractices: ['compassion-meditation'],
    teaching: 'compassion-1',
    popularity: 9,
    effectiveness: 8,
    userRating: 4.6,
    completionRate: 0.80
  }
];

// Sample Osho teachings
const sampleOshoTeachings: OshoTeaching[] = [
  {
    id: 'meditation-awareness-1',
    title: 'Meditation is Not Concentration',
    content: 'Meditation is not concentration. Concentration is a state of mind where you focus on one thing and exclude everything else. Meditation is awareness - total awareness. In concentration, you are doing something. In meditation, you are not doing anything - you are simply being.',
    source: {
      type: 'book',
      title: 'The Book of Secrets',
      year: 1974
    },
    category: 'meditation',
    tags: ['meditation', 'awareness', 'concentration'],
    spiritualLevel: 'beginner',
    popularity: 9,
    keyConcepts: ['Meditation', 'Awareness', 'Concentration'],
    teachingValue: 9,
    memorability: 8
  },
  {
    id: 'love-religion-1',
    title: 'Love is the Only Religion',
    content: 'Love is the only religion. All other religions are just politics. When you love, you don\'t need any religion. When you love, you don\'t need any God. When you love, you don\'t need any prayer. Love itself is the prayer, love itself is the God, love itself is the religion.',
    source: {
      type: 'lecture',
      title: 'Love, Freedom, Aloneness',
      year: 1976
    },
    category: 'love',
    tags: ['love', 'religion', 'politics'],
    spiritualLevel: 'intermediate',
    popularity: 8,
    keyConcepts: ['Love', 'Religion', 'Politics'],
    teachingValue: 8,
    memorability: 9
  },
  {
    id: 'present-moment-1',
    title: 'Be Here Now',
    content: 'Be here now. This moment is all there is. The past is gone, the future is not yet born. Only this moment exists. If you can be totally in this moment, you will find the door to the divine. This moment is the door to eternity.',
    source: {
      type: 'book',
      title: 'Awareness: The Key to Living in Balance',
      year: 1978
    },
    category: 'awareness',
    tags: ['present moment', 'awareness', 'being'],
    spiritualLevel: 'beginner',
    popularity: 10,
    keyConcepts: ['Present moment', 'Awareness', 'Being'],
    teachingValue: 10,
    memorability: 10
  }
];

// Sample Osho quotes
const sampleOshoQuotes: OshoQuote[] = [
  {
    id: 'meditation-quote-1',
    text: 'Meditation is not concentration. Meditation is awareness.',
    source: {
      type: 'book',
      title: 'The Book of Secrets',
      year: 1974
    },
    category: 'meditation',
    tags: ['meditation', 'awareness'],
    spiritualLevel: 'beginner',
    popularity: 9,
    keyConcepts: ['Meditation', 'Awareness'],
    teachingValue: 9,
    memorability: 8,
    relatedQuotes: ['awareness-quote-1'],
    practices: ['witnessing-meditation']
  },
  {
    id: 'love-quote-1',
    text: 'Love is the only religion. All other religions are just politics.',
    source: {
      type: 'lecture',
      title: 'Love, Freedom, Aloneness',
      year: 1976
    },
    category: 'love',
    tags: ['love', 'religion'],
    spiritualLevel: 'intermediate',
    popularity: 8,
    keyConcepts: ['Love', 'Religion'],
    teachingValue: 8,
    memorability: 9,
    relatedQuotes: ['freedom-quote-1'],
    practices: ['loving-kindness-meditation']
  },
  {
    id: 'awareness-quote-1',
    text: 'Be here now. This moment is all there is.',
    source: {
      type: 'book',
      title: 'Awareness: The Key to Living in Balance',
      year: 1978
    },
    category: 'awareness',
    tags: ['present moment', 'awareness'],
    spiritualLevel: 'beginner',
    popularity: 10,
    keyConcepts: ['Present moment', 'Awareness'],
    teachingValue: 10,
    memorability: 10,
    relatedQuotes: ['meditation-quote-1'],
    practices: ['witnessing-meditation']
  }
];

// Sample Osho practices
const sampleOshoPractices: OshoPractice[] = [
  {
    id: 'witnessing-meditation',
    name: 'Witnessing Meditation',
    type: 'meditation',
    category: 'meditation',
    difficulty: 'beginner',
    duration: { minimum: 10, recommended: 20, maximum: 60 },
    description: 'Simple awareness practice of witnessing thoughts, feelings, and sensations',
    instructions: [
      'Sit comfortably with eyes closed',
      'Breathe naturally and relax',
      'Simply witness whatever arises - thoughts, feelings, sensations',
      'Don\'t judge or analyze, just observe',
      'When you notice you\'re lost in thought, gently return to witnessing'
    ],
    preparation: ['Find a quiet space', 'Sit comfortably', 'Set a timer'],
    benefits: ['Awareness development', 'Mind quieting', 'Present moment awareness', 'Stress reduction'],
    whenToUse: ['Morning', 'Evening', 'Stressful moments', 'Before sleep'],
    prerequisites: ['Basic sitting posture'],
    relatedPractices: ['dynamic-meditation'],
    teaching: 'meditation-awareness-1',
    popularity: 8,
    effectiveness: 8,
    userRating: 4.5,
    completionRate: 0.75
  },
  {
    id: 'dynamic-meditation',
    name: 'Dynamic Meditation',
    type: 'meditation',
    category: 'meditation',
    difficulty: 'intermediate',
    duration: { minimum: 60, recommended: 60, maximum: 90 },
    description: 'A powerful meditation technique involving chaotic breathing, catharsis, and celebration',
    instructions: [
      'Stage 1: Chaotic breathing for 10 minutes',
      'Stage 2: Catharsis and expression for 10 minutes',
      'Stage 3: Jumping and celebration for 10 minutes',
      'Stage 4: Freeze and witness for 15 minutes',
      'Stage 5: Dancing and celebration for 15 minutes'
    ],
    preparation: ['Wear loose clothing', 'Find a spacious area', 'Set aside 60-90 minutes'],
    benefits: ['Stress release', 'Emotional cleansing', 'Energy activation', 'Awareness development'],
    warnings: ['Not suitable for pregnant women', 'Avoid if you have heart conditions'],
    whenToUse: ['Morning', 'High stress periods', 'Emotional blockages'],
    prerequisites: ['Basic fitness level', 'Open space'],
    relatedPractices: ['witnessing-meditation'],
    teaching: 'meditation-awareness-1',
    popularity: 9,
    effectiveness: 9,
    userRating: 4.8,
    completionRate: 0.65
  }
];

// Sample Vivekananda teachings
const sampleVivekanandaTeachings: VivekanandaTeaching[] = [
  {
    id: 'karma-yoga-1',
    title: 'Karma Yoga: The Path of Selfless Action',
    content: 'Karma Yoga is the path of selfless action. Work without attachment to the fruits of action. Do your duty without expecting any reward. This is the highest form of yoga - to work for the sake of work itself, not for any personal gain.',
    source: {
      type: 'lecture',
      title: 'Karma Yoga',
      location: 'New York',
      date: '1895'
    },
    category: 'karma_yoga',
    tags: ['karma yoga', 'selfless action', 'duty', 'work'],
    spiritualLevel: 'beginner',
    popularity: 9,
    keyConcepts: ['Selfless action', 'Duty', 'Work without attachment', 'Service'],
    teachingValue: 9,
    memorability: 8
  },
  {
    id: 'education-1',
    title: 'Education as Manifestation of Perfection',
    content: 'Education is the manifestation of the perfection already in man. Every soul is potentially divine. The goal is to manifest this divinity within by controlling nature, external and internal. Do this either by work, or worship, or psychic control, or philosophy.',
    source: {
      type: 'lecture',
      title: 'Education',
      location: 'Madras',
      date: '1897'
    },
    category: 'education',
    tags: ['education', 'perfection', 'divinity', 'manifestation'],
    spiritualLevel: 'intermediate',
    popularity: 8,
    keyConcepts: ['Education', 'Perfection', 'Divinity', 'Manifestation'],
    teachingValue: 8,
    memorability: 9
  },
  {
    id: 'universal-religion-1',
    title: 'Universal Religion and Unity',
    content: 'All religions are true. The time has come when every human being should be able to say, "I am a Hindu, I am a Christian, I am a Muslim, I am a Jew." That is the basis of universal religion. The whole world is one family.',
    source: {
      type: 'speech',
      title: 'Address at the Parliament of Religions',
      location: 'Chicago',
      date: '1893'
    },
    category: 'universal_religion',
    tags: ['universal religion', 'unity', 'tolerance', 'brotherhood'],
    spiritualLevel: 'beginner',
    popularity: 10,
    keyConcepts: ['Universal religion', 'Unity', 'Tolerance', 'Brotherhood'],
    teachingValue: 10,
    memorability: 10
  }
];

// Sample Vivekananda quotes
const sampleVivekanandaQuotes: VivekanandaQuote[] = [
  {
    id: 'arise-awake-quote',
    text: 'Arise, awake, and stop not until the goal is reached.',
    source: {
      type: 'lecture',
      title: 'Karma Yoga',
      location: 'New York',
      date: '1895'
    },
    category: 'karma_yoga',
    tags: ['arise', 'awake', 'goal', 'determination'],
    spiritualLevel: 'beginner',
    popularity: 10,
    keyConcepts: ['Determination', 'Goal', 'Awakening', 'Action'],
    teachingValue: 10,
    memorability: 10,
    relatedQuotes: ['children-of-god-quote'],
    practices: ['karma-yoga-practice']
  },
  {
    id: 'self-confidence-quote',
    text: 'You cannot believe in God until you believe in yourself.',
    source: {
      type: 'lecture',
      title: 'Raja Yoga',
      location: 'New York',
      date: '1895'
    },
    category: 'jnana_yoga',
    tags: ['self-confidence', 'belief', 'god', 'yourself'],
    spiritualLevel: 'beginner',
    popularity: 9,
    keyConcepts: ['Self-confidence', 'Belief', 'Self-realization', 'Divinity'],
    teachingValue: 9,
    memorability: 9,
    relatedQuotes: ['arise-awake-quote'],
    practices: ['jnana-yoga-practice']
  },
  {
    id: 'service-quote',
    text: 'Those who serve others, serve the Lord.',
    source: {
      type: 'lecture',
      title: 'Karma Yoga',
      location: 'New York',
      date: '1895'
    },
    category: 'service',
    tags: ['service', 'others', 'lord', 'selfless'],
    spiritualLevel: 'beginner',
    popularity: 9,
    keyConcepts: ['Service', 'Selfless action', 'Divine service', 'Humanity'],
    teachingValue: 9,
    memorability: 9,
    relatedQuotes: ['arise-awake-quote'],
    practices: ['karma-yoga-practice']
  }
];

// Sample Vivekananda practices
const sampleVivekanandaPractices: VivekanandaPractice[] = [
  {
    id: 'karma-yoga-practice',
    name: 'Karma Yoga Practice',
    type: 'service',
    category: 'karma_yoga',
    difficulty: 'beginner',
    duration: { minimum: 30, recommended: 60, maximum: 120 },
    description: 'Practice selfless service without attachment to results',
    instructions: [
      'Choose a service activity that helps others',
      'Perform the service with full attention and dedication',
      'Do not expect any reward or recognition',
      'Focus on the quality of your work, not the outcome',
      'Dedicate your actions to the divine or humanity'
    ],
    preparation: ['Identify a service opportunity', 'Set aside time', 'Prepare mentally for selfless action'],
    benefits: ['Reduces ego', 'Develops compassion', 'Builds character', 'Brings inner peace'],
    whenToUse: ['Daily', 'When feeling selfish', 'During community service', 'When seeking purpose'],
    prerequisites: ['Willingness to serve', 'Basic understanding of selfless action'],
    relatedPractices: ['bhakti-yoga-practice'],
    teaching: 'karma-yoga-1',
    popularity: 8,
    effectiveness: 8,
    userRating: 4.6,
    completionRate: 0.7
  },
  {
    id: 'raja-yoga-meditation',
    name: 'Raja Yoga Meditation',
    type: 'meditation',
    category: 'raja_yoga',
    difficulty: 'intermediate',
    duration: { minimum: 20, recommended: 45, maximum: 90 },
    description: 'Meditation practice for controlling the mind and achieving concentration',
    instructions: [
      'Sit in a comfortable position with spine straight',
      'Close your eyes and focus on your breathing',
      'Gradually withdraw your senses from external objects',
      'Focus your mind on a single point or idea',
      'Maintain this concentration for the duration of practice'
    ],
    preparation: ['Find a quiet space', 'Sit comfortably', 'Set a timer'],
    benefits: ['Mind control', 'Concentration', 'Inner peace', 'Self-realization'],
    whenToUse: ['Morning', 'Evening', 'Before important tasks', 'During stress'],
    prerequisites: ['Basic meditation experience', 'Ability to sit still'],
    relatedPractices: ['karma-yoga-practice'],
    teaching: 'raja-yoga-1',
    popularity: 7,
    effectiveness: 8,
    userRating: 4.5,
    completionRate: 0.6
  },
  {
    id: 'jnana-yoga-study',
    name: 'Jnana Yoga Study',
    type: 'study',
    category: 'jnana_yoga',
    difficulty: 'advanced',
    duration: { minimum: 30, recommended: 60, maximum: 120 },
    description: 'Study and contemplation of spiritual texts and philosophy',
    instructions: [
      'Choose a spiritual text or philosophical work',
      'Read slowly and thoughtfully',
      'Contemplate the deeper meanings',
      'Apply the teachings to your life',
      'Reflect on how the knowledge affects your understanding'
    ],
    preparation: ['Select appropriate texts', 'Create a study space', 'Set aside dedicated time'],
    benefits: ['Wisdom development', 'Self-knowledge', 'Spiritual understanding', 'Discrimination'],
    whenToUse: ['Daily study time', 'When seeking understanding', 'During contemplation periods'],
    prerequisites: ['Basic reading ability', 'Interest in philosophy', 'Contemplative nature'],
    relatedPractices: ['raja-yoga-meditation'],
    teaching: 'jnana-yoga-1',
    popularity: 6,
    effectiveness: 7,
    userRating: 4.3,
    completionRate: 0.5
  }
];

// Spiritual Teacher State
export interface SpiritualTeacherState {
  // Current teacher
  currentTeacher: SpiritualTeacher | null;
  availableTeachers: SpiritualTeacher[];
  
  // Osho-specific data
  oshoProfile: OshoProfile;
  oshoTeachings: OshoTeaching[];
  oshoQuotes: OshoQuote[];
  oshoPractices: OshoPractice[];
  oshoCategories: Record<OshoCategory, any>;
  
  // Buddha-specific data
  buddhaProfile: BuddhaProfile;
  buddhaTeachings: BuddhaTeaching[];
  buddhaQuotes: BuddhaQuote[];
  buddhaPractices: BuddhaPractice[];
  buddhaCategories: Record<BuddhaCategory, any>;
  
  // Krishnamurti-specific data
  krishnamurtiProfile: KrishnamurtiProfile;
  krishnamurtiTeachings: KrishnamurtiTeaching[];
  krishnamurtiQuotes: KrishnamurtiQuote[];
  krishnamurtiPractices: KrishnamurtiPractice[];
  krishnamurtiCategories: Record<KrishnamurtiCategory, any>;
  
  // Vivekananda-specific data
  vivekanandaProfile: VivekanandaProfile;
  vivekanandaTeachings: VivekanandaTeaching[];
  vivekanandaQuotes: VivekanandaQuote[];
  vivekanandaPractices: VivekanandaPractice[];
  vivekanandaCategories: Record<VivekanandaCategory, any>;
  
  // User interactions
  conversations: SpiritualConversation[];
  currentConversation: SpiritualConversation | null;
  guidance: SpiritualGuidance[];
  dailyGuidance: DailyGuidance | null;
  
  // User profile
  spiritualProfile: SpiritualProfile | null;
  progress: SpiritualProgress | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  selectedCategory: OshoCategory | BuddhaCategory | KrishnamurtiCategory | VivekanandaCategory | null;
  searchQuery: string;
  
  // Offline storage state
  isOfflineMode: boolean;
  lastSyncTime: number;
  pendingSyncCount: number;
}

const initialState: SpiritualTeacherState = {
  currentTeacher: initialOshoProfile,
  availableTeachers: [initialOshoProfile, initialBuddhaProfile, initialKrishnamurtiProfile, initialVivekanandaProfile],
  
  oshoProfile: initialOshoProfile,
  oshoTeachings: sampleOshoTeachings,
  oshoQuotes: sampleOshoQuotes,
  oshoPractices: sampleOshoPractices,
  oshoCategories: oshoCategories,
  
  buddhaProfile: initialBuddhaProfile,
  buddhaTeachings: sampleBuddhaTeachings,
  buddhaQuotes: sampleBuddhaQuotes,
  buddhaPractices: sampleBuddhaPractices,
  buddhaCategories: buddhaCategories,
  
  krishnamurtiProfile: initialKrishnamurtiProfile,
  krishnamurtiTeachings: [],
  krishnamurtiQuotes: [],
  krishnamurtiPractices: [],
  krishnamurtiCategories: {},
  
  vivekanandaProfile: initialVivekanandaProfile,
  vivekanandaTeachings: sampleVivekanandaTeachings,
  vivekanandaQuotes: sampleVivekanandaQuotes,
  vivekanandaPractices: sampleVivekanandaPractices,
  vivekanandaCategories: vivekanandaCategories,
  
  conversations: [],
  currentConversation: null,
  guidance: [],
  dailyGuidance: null,
  
  spiritualProfile: null,
  progress: null,
  
  isLoading: false,
  error: null,
  selectedCategory: null,
  searchQuery: '',
  
  isOfflineMode: false,
  lastSyncTime: 0,
  pendingSyncCount: 0
};

// Async thunks
export const loadSpiritualProfile = createAsyncThunk(
  'spiritualTeacher/loadProfile',
  async (userId: string) => {
    // TODO: Load from API or local storage
    return {
      userId,
      currentTeacher: 'osho',
      spiritualLevel: 'beginner' as const,
      interests: ['meditation', 'awareness'] as OshoCategory[],
      goals: [],
      practices: [],
      insights: [],
      journey: {
        startDate: new Date().toISOString(),
        currentPhase: 'exploration',
        majorInsights: [],
        challenges: [],
        breakthroughs: [],
        practices: [],
        teachers: ['osho'],
        evolution: []
      },
      preferences: {
        teachingStyle: ['direct', 'playful'],
        complexity: 'beginner' as const,
        practiceTypes: ['meditation'],
        readingLevel: 'light' as const,
        notificationFrequency: 'daily' as const,
        reminderTimes: ['08:00', '20:00'],
        favoriteCategories: ['meditation', 'awareness'] as OshoCategory[]
      }
    } as SpiritualProfile;
  }
);

export const askSpiritualQuestion = createAsyncThunk(
  'spiritualTeacher/askQuestion',
  async (question: string, { getState }) => {
    const state = getState() as any;
    const { currentTeacher, conversations, spiritualProfile } = state.spiritualTeacher;
    
    if (!currentTeacher) {
      throw new Error('No teacher selected');
    }

    // Import AI service dynamically to avoid circular dependencies
    const SpiritualAIService = (await import('@/services/spiritualAIService')).default;
    const aiService = SpiritualAIService.getInstance();

    // Create spiritual context from user profile
    const context: SpiritualContext = {
      userLevel: spiritualProfile?.spiritualLevel || 'beginner',
      currentChallenges: spiritualProfile?.journey?.challenges || [],
      spiritualGoals: spiritualProfile?.goals?.map((g: any) => g.description) || [],
      recentInsights: spiritualProfile?.insights?.map((i: any) => i.content) || [],
      practiceHistory: spiritualProfile?.practices?.map((p: any) => p.name) || [],
      favoriteTeachings: spiritualProfile?.preferences?.favoriteCategories || [],
      oshoContext: {
        familiarConcepts: spiritualProfile?.preferences?.favoriteCategories || [],
        exploredCategories: spiritualProfile?.preferences?.favoriteCategories || [],
        completedPractices: spiritualProfile?.practices?.map((p: any) => p.name) || [],
        currentMeditation: '',
        spiritualQuestions: []
      },
      emotionalState: {
        mood: 'neutral',
        energy: 5,
        stress: 5,
        openness: 7
      },
      lifeContext: {
        currentSituation: 'normal',
        challenges: spiritualProfile?.journey?.challenges || [],
        relationships: [],
        work: '',
        health: ''
      }
    };

    // Get recent conversation history
    const recentConversation = conversations[conversations.length - 1];
    const conversationHistory = recentConversation?.messages || [];

    // Generate AI response
    const aiResponse = await aiService.generateResponse(
      question,
      currentTeacher,
      context,
      conversationHistory
    );

    // Create user message
    const userMessage: SpiritualMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };

    // Create teacher response message
    const teacherMessage: SpiritualMessage = {
      id: `teacher_${Date.now()}`,
      role: 'teacher',
      content: aiResponse.response,
      timestamp: new Date().toISOString(),
      teaching: aiResponse.relatedTeachings.length > 0 ? {
        id: `teaching_${Date.now()}`,
        title: aiResponse.relatedTeachings[0],
        content: aiResponse.response,
        source: 'AI Generated',
        category: 'general' as any,
        level: context.userLevel,
        tags: [],
        relatedPractices: aiResponse.practice ? [aiResponse.practice] : []
      } : undefined,
      practice: aiResponse.practice ? {
        id: `practice_${Date.now()}`,
        name: aiResponse.practice,
        description: `Practice suggested by ${currentTeacher.displayName}`,
        duration: 15,
        instructions: ['Follow the guidance of your teacher'],
        benefits: ['Spiritual growth', 'Deeper understanding'],
        difficulty: 'beginner' as any,
        teacher: currentTeacher.displayName
      } : undefined
    };

    return {
      userMessage,
      teacherMessage,
      followUpQuestions: aiResponse.followUpQuestions,
      relatedTeachings: aiResponse.relatedTeachings,
      practice: aiResponse.practice
    };
  }
);

export const getDailyGuidance = createAsyncThunk(
  'spiritualTeacher/getDailyGuidance',
  async (userId: string, { getState }) => {
    const state = getState() as any;
    const { currentTeacher, spiritualProfile } = state.spiritualTeacher;
    
    if (!currentTeacher) {
      throw new Error('No teacher selected');
    }

    // Import AI service dynamically to avoid circular dependencies
    const SpiritualAIService = (await import('@/services/spiritualAIService')).default;
    const aiService = SpiritualAIService.getInstance();

    // Create spiritual context from user profile
    const context: SpiritualContext = {
      userLevel: spiritualProfile?.spiritualLevel || 'beginner',
      currentChallenges: spiritualProfile?.journey?.challenges || [],
      spiritualGoals: spiritualProfile?.goals?.map((g: any) => g.description) || [],
      recentInsights: spiritualProfile?.insights?.map((i: any) => i.content) || [],
      practiceHistory: spiritualProfile?.practices?.map((p: any) => p.name) || [],
      favoriteTeachings: spiritualProfile?.preferences?.favoriteCategories || [],
      oshoContext: {
        familiarConcepts: spiritualProfile?.preferences?.favoriteCategories || [],
        exploredCategories: spiritualProfile?.preferences?.favoriteCategories || [],
        completedPractices: spiritualProfile?.practices?.map((p: any) => p.name) || [],
        currentMeditation: '',
        spiritualQuestions: []
      },
      emotionalState: {
        mood: 'neutral',
        energy: 5,
        stress: 5,
        openness: 7
      },
      lifeContext: {
        currentSituation: 'normal',
        challenges: spiritualProfile?.journey?.challenges || [],
        relationships: [],
        work: '',
        health: ''
      }
    };

    // Generate AI-powered daily guidance
    const aiGuidance = await aiService.generateDailyGuidance(currentTeacher, context);
    
    const today = new Date().toISOString().split('T')[0];
    
    return {
      id: `guidance_${today}`,
      userId,
      teacherId: currentTeacher.id,
      date: today,
      morningWisdom: aiGuidance.morningWisdom,
      eveningReflection: aiGuidance.eveningReflection,
      dailyPractice: {
        id: `practice_${Date.now()}`,
        name: aiGuidance.dailyPractice,
        description: `Daily practice recommended by ${currentTeacher.displayName}`,
        duration: 15,
        instructions: ['Follow the guidance of your teacher'],
        benefits: ['Spiritual growth', 'Daily wisdom'],
        difficulty: 'beginner' as any,
        teacher: currentTeacher.displayName
      },
      inspirationalQuote: {
        id: `quote_${Date.now()}`,
        text: aiGuidance.inspirationalQuote,
        source: {
          type: 'ai_generated' as any,
          title: `${currentTeacher.displayName} AI`,
          year: new Date().getFullYear()
        },
        category: 'general' as any,
        tags: ['daily', 'inspiration'],
        spiritualLevel: context.userLevel,
        popularity: 5,
        keyConcepts: ['wisdom', 'daily'],
        emotionalTone: 'inspiring',
        teachingValue: 8,
        memorability: 7
      },
      theme: 'meditation' as OshoCategory,
      insights: ['AI-generated personalized guidance'],
      actionItems: [`Practice: ${aiGuidance.dailyPractice}`],
      completed: false
    } as DailyGuidance;
  }
);

// Slice
const spiritualTeacherSlice = createSlice({
  name: 'spiritualTeacher',
  initialState,
  reducers: {
    setCurrentTeacher: (state, action: PayloadAction<SpiritualTeacher>) => {
      state.currentTeacher = action.payload;
    },
    
    setSelectedCategory: (state, action: PayloadAction<OshoCategory | BuddhaCategory | null>) => {
      state.selectedCategory = action.payload;
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    addConversation: (state, action: PayloadAction<SpiritualConversation>) => {
      state.conversations.unshift(action.payload);
      state.currentConversation = action.payload;
    },
    
    addMessage: (state, action: PayloadAction<{ conversationId: string; message: SpiritualMessage }>) => {
      const { conversationId, message } = action.payload;
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.messages.push(message);
      }
    },
    
    addGuidance: (state, action: PayloadAction<SpiritualGuidance>) => {
      state.guidance.unshift(action.payload);
    },
    
    updateSpiritualProfile: (state, action: PayloadAction<Partial<SpiritualProfile>>) => {
      if (state.spiritualProfile) {
        state.spiritualProfile = { ...state.spiritualProfile, ...action.payload };
      }
    },
    
    addInsight: (state, action: PayloadAction<SpiritualInsight>) => {
      if (state.spiritualProfile) {
        state.spiritualProfile.insights.push(action.payload);
      }
    },
    
    setOfflineMode: (state, action: PayloadAction<boolean>) => {
      state.isOfflineMode = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(loadSpiritualProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadSpiritualProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.spiritualProfile = action.payload;
      })
      .addCase(loadSpiritualProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load spiritual profile';
      })
      
      .addCase(askSpiritualQuestion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(askSpiritualQuestion.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add to current conversation or create new one using the new AI response format
        const userMessage = action.payload.userMessage;
        const teacherMessage = action.payload.teacherMessage;
        
        if (state.currentConversation) {
          state.currentConversation.messages.push(userMessage, teacherMessage);
        } else {
          const newConversation: SpiritualConversation = {
            id: `conv_${Date.now()}`,
            userId: state.spiritualProfile?.userId || 'unknown',
            teacherId: state.currentTeacher?.id || 'osho',
            messages: [userMessage, teacherMessage],
            context: {
              userLevel: 'beginner',
              currentChallenges: [],
              spiritualGoals: [],
              recentInsights: [],
              practiceHistory: [],
              favoriteTeachings: [],
              oshoContext: {
                familiarConcepts: [],
                exploredCategories: [],
                completedPractices: [],
                currentMeditation: '',
                spiritualQuestions: []
              },
              emotionalState: {
                mood: 'neutral',
                energy: 5,
                stress: 5,
                openness: 7
              },
              lifeContext: {
                currentSituation: '',
                challenges: [],
                relationships: [],
                work: '',
                health: ''
              }
            },
            insights: [],
            practices: [],
            timestamp: new Date().toISOString()
          };
          state.conversations.unshift(newConversation);
          state.currentConversation = newConversation;
        }
      })
      .addCase(askSpiritualQuestion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to get spiritual guidance';
      })
      
      .addCase(getDailyGuidance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDailyGuidance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailyGuidance = action.payload;
      })
      .addCase(getDailyGuidance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to get daily guidance';
      });
  }
});

export const {
  setCurrentTeacher,
  setSelectedCategory,
  setSearchQuery,
  addConversation,
  addMessage,
  addGuidance,
  updateSpiritualProfile,
  addInsight,
  setOfflineMode,
  clearError
} = spiritualTeacherSlice.actions;

export default spiritualTeacherSlice.reducer;
