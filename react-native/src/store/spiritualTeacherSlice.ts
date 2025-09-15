import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  SpiritualTeacher, 
  OshoProfile, 
  OshoTeaching, 
  OshoQuote, 
  OshoPractice,
  BuddhaProfile,
  BuddhaTeaching,
  BuddhaQuote,
  BuddhaPractice,
  BuddhaCategory,
  SpiritualGuidance,
  SpiritualConversation,
  SpiritualProfile,
  DailyGuidance,
  SpiritualProgress,
  OshoCategory,
  SpiritualContext
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
  selectedCategory: OshoCategory | BuddhaCategory | null;
  searchQuery: string;
  
  // Offline storage state
  isOfflineMode: boolean;
  lastSyncTime: number;
  pendingSyncCount: number;
}

const initialState: SpiritualTeacherState = {
  currentTeacher: initialOshoProfile,
  availableTeachers: [initialOshoProfile, initialBuddhaProfile],
  
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
    // TODO: Implement AI response generation
    const state = getState() as any;
    const currentTeacher = state.spiritualTeacher.currentTeacher;
    
    // Mock responses based on teacher
    let responses: string[] = [];
    
    if (currentTeacher?.id === 'buddha') {
      responses = [
        "The root of suffering is attachment. When we let go of our attachments, we find peace.",
        "The mind is everything. What you think you become. Cultivate positive thoughts.",
        "Hatred does not cease by hatred, but only by love; this is the eternal rule.",
        "Be present in this moment. The past is gone, the future is not yet born.",
        "Compassion for all beings brings inner peace and happiness.",
        "The Four Noble Truths show us the path to liberation from suffering.",
        "Right mindfulness is the key to understanding the nature of reality."
      ];
    } else {
      // Osho responses
      responses = [
        "Meditation is not concentration. It is awareness - total awareness of everything that is happening around you and within you.",
        "Love is the only religion. When you love, you don't need any other religion.",
        "Be here now. This moment is all there is. The past is gone, the future is not yet born.",
        "Freedom is the ultimate value. But freedom comes with responsibility - the responsibility to be yourself.",
        "Celebrate life! Life is a celebration, not a problem to be solved."
      ];
    }
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      id: `response_${Date.now()}`,
      question,
      response: randomResponse,
      teacher: currentTeacher?.name || 'Osho',
      timestamp: new Date().toISOString()
    };
  }
);

export const getDailyGuidance = createAsyncThunk(
  'spiritualTeacher/getDailyGuidance',
  async (userId: string) => {
    // TODO: Generate personalized daily guidance
    const today = new Date().toISOString().split('T')[0];
    
    return {
      id: `guidance_${today}`,
      userId,
      teacherId: 'osho',
      date: today,
      morningWisdom: 'Start your day with awareness. Be present in each moment.',
      eveningReflection: 'Reflect on your day. What did you learn? What are you grateful for?',
      dailyPractice: sampleOshoPractices[0], // Witnessing Meditation
      inspirationalQuote: sampleOshoQuotes[0], // Meditation quote
      theme: 'meditation' as OshoCategory,
      insights: ['Awareness is the key to transformation'],
      actionItems: ['Practice 20 minutes of witnessing meditation'],
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
        // Add to current conversation or create new one
        const message: SpiritualMessage = {
          id: `msg_${Date.now()}`,
          role: 'user',
          content: action.payload.question,
          timestamp: new Date().toISOString()
        };
        
        const response: SpiritualMessage = {
          id: `msg_${Date.now() + 1}`,
          role: 'teacher',
          content: action.payload.response,
          timestamp: new Date().toISOString()
        };
        
        if (state.currentConversation) {
          state.currentConversation.messages.push(message, response);
        } else {
          const newConversation: SpiritualConversation = {
            id: `conv_${Date.now()}`,
            userId: state.spiritualProfile?.userId || 'unknown',
            teacherId: state.currentTeacher?.id || 'osho',
            messages: [message, response],
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
