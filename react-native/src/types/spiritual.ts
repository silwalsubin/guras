// Spiritual Teacher Types
export interface SpiritualTeacher {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tradition: SpiritualTradition;
  era: string;
  avatar: string;
  background: string;
  coreTeachings: string[];
  teachingStyle: TeachingStyle;
  personality: TeacherPersonality;
  isAvailable: boolean;
  popularity: number;
  userRating: number;
}

export interface SpiritualTradition {
  name: string;
  description: string;
  origin: string;
  keyConcepts: string[];
  practices: string[];
  philosophy: string;
}

export interface TeachingStyle {
  approach: 'direct' | 'metaphorical' | 'questioning' | 'storytelling' | 'practical';
  tone: 'gentle' | 'firm' | 'playful' | 'serious' | 'mystical';
  focus: 'meditation' | 'philosophy' | 'daily_life' | 'enlightenment' | 'love';
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'master';
}

export interface TeacherPersonality {
  traits: string[];
  communication: string;
  humor: string;
  compassion: string;
}

// Osho-specific types
export interface OshoProfile extends SpiritualTeacher {
  id: 'osho';
  name: 'Osho';
  displayName: 'Osho';
  fullName: 'Bhagwan Shree Rajneesh (Osho)';
  birthYear: 1931;
  deathYear: 1990;
  nationality: 'Indian';
  philosophy: OshoPhilosophy;
  teachingStyle: OshoTeachingStyle;
  personality: OshoPersonality;
}

export interface OshoPhilosophy {
  essence: string;
  keyPrinciples: string[];
  approach: string;
  focus: string;
}

export interface OshoTeachingStyle {
  communication: {
    tone: 'playful' | 'provocative' | 'loving' | 'direct';
    method: 'storytelling' | 'questioning' | 'paradox' | 'practical guidance';
    humor: string;
    compassion: string;
  };
  content: {
    topics: string[];
    complexity: 'intermediate' | 'advanced';
    depth: 'profound' | 'practical';
  };
  interaction: {
    questioning: string;
    guidance: string;
    support: string;
    challenge: string;
  };
}

export interface OshoPersonality {
  traits: string[];
  communication: string;
  humor: string;
  compassion: string;
}

// Teaching categories
export type OshoCategory = 
  | 'meditation' 
  | 'love' 
  | 'freedom' 
  | 'awareness' 
  | 'celebration' 
  | 'mysticism' 
  | 'daily_life' 
  | 'death';

export interface OshoTeachingCategory {
  name: string;
  description: string;
  color: string;
  icon: string;
  keyConcepts: string[];
}

// Teaching content
export interface OshoTeaching {
  id: string;
  title: string;
  content: string;
  source: {
    type: 'book' | 'lecture' | 'interview' | 'discourse';
    title: string;
    year?: number;
    page?: number;
  };
  category: OshoCategory;
  tags: string[];
  spiritualLevel: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  keyConcepts: string[];
  teachingValue: number; // 1-10
  memorability: number; // 1-10
}

export interface OshoQuote {
  id: string;
  text: string;
  source: {
    type: 'book' | 'lecture' | 'interview' | 'discourse';
    title: string;
    year?: number;
    page?: number;
  };
  category: OshoCategory;
  tags: string[];
  spiritualLevel: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  keyConcepts: string[];
  teachingValue: number; // 1-10
  memorability: number; // 1-10
  context?: string;
  explanation?: string;
  relatedQuotes: string[];
  practices: string[];
}

export interface OshoPractice {
  id: string;
  name: string;
  type: 'meditation' | 'breathing' | 'movement' | 'contemplation' | 'exercise';
  category: OshoCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: {
    minimum: number; // minutes
    recommended: number; // minutes
    maximum: number; // minutes
  };
  description: string;
  instructions: string[];
  preparation: string[];
  benefits: string[];
  warnings?: string[];
  whenToUse: string[];
  prerequisites: string[];
  relatedPractices: string[];
  teaching: string; // Source teaching
  popularity: number;
  effectiveness: number; // 1-10
  userRating: number;
  completionRate: number;
}

// Buddha-specific types
export interface BuddhaProfile extends SpiritualTeacher {
  id: 'buddha';
  name: 'Buddha';
  displayName: 'Buddha';
  fullName: 'Siddhartha Gautama (Buddha)';
  birthYear: 563;
  deathYear: 483;
  nationality: 'Indian';
  philosophy: BuddhaPhilosophy;
  teachingStyle: BuddhaTeachingStyle;
  personality: BuddhaPersonality;
}

export interface BuddhaPhilosophy {
  essence: string;
  keyPrinciples: string[];
  approach: string;
  focus: string;
}

export interface BuddhaTeachingStyle {
  communication: {
    tone: 'gentle' | 'wise' | 'compassionate' | 'direct';
    method: 'storytelling' | 'analogy' | 'practical guidance' | 'meditation';
    humor: string;
    compassion: string;
  };
  content: {
    topics: string[];
    complexity: 'beginner' | 'intermediate' | 'advanced';
    depth: 'practical' | 'profound';
  };
  interaction: {
    questioning: string;
    guidance: string;
    support: string;
    challenge: string;
  };
}

export interface BuddhaPersonality {
  traits: string[];
  communication: string;
  humor: string;
  compassion: string;
}

// Buddha teaching categories
export type BuddhaCategory = 
  | 'four_noble_truths'
  | 'eightfold_path'
  | 'meditation'
  | 'mindfulness'
  | 'compassion'
  | 'wisdom'
  | 'suffering'
  | 'enlightenment';

export interface BuddhaTeachingCategory {
  name: string;
  description: string;
  color: string;
  icon: string;
  keyConcepts: string[];
}

// Buddha teaching content
export interface BuddhaTeaching {
  id: string;
  title: string;
  content: string;
  source: {
    type: 'sutta' | 'sutra' | 'discourse' | 'teaching';
    title: string;
    collection?: string;
    number?: string;
  };
  category: BuddhaCategory;
  tags: string[];
  spiritualLevel: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  keyConcepts: string[];
  teachingValue: number; // 1-10
  memorability: number; // 1-10
}

export interface BuddhaQuote {
  id: string;
  text: string;
  source: {
    type: 'sutta' | 'sutra' | 'discourse' | 'teaching';
    title: string;
    collection?: string;
    number?: string;
  };
  category: BuddhaCategory;
  tags: string[];
  spiritualLevel: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  keyConcepts: string[];
  teachingValue: number; // 1-10
  memorability: number; // 1-10
  context?: string;
  explanation?: string;
  relatedQuotes: string[];
  practices: string[];
}

export interface BuddhaPractice {
  id: string;
  name: string;
  type: 'meditation' | 'mindfulness' | 'breathing' | 'contemplation' | 'loving_kindness';
  category: BuddhaCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: {
    minimum: number; // minutes
    recommended: number; // minutes
    maximum: number; // minutes
  };
  description: string;
  instructions: string[];
  preparation: string[];
  benefits: string[];
  warnings?: string[];
  whenToUse: string[];
  prerequisites: string[];
  relatedPractices: string[];
  teaching: string; // Source teaching
  popularity: number;
  effectiveness: number; // 1-10
  userRating: number;
  completionRate: number;
}

// Spiritual guidance
export interface SpiritualGuidance {
  id: string;
  userId: string;
  teacherId: string;
  sessionType: GuidanceType;
  question?: string;
  guidance: string;
  teaching?: OshoTeaching;
  practice?: OshoPractice;
  quote?: OshoQuote;
  timestamp: string;
  userSatisfaction?: number;
  followUpQuestions: string[];
  relatedTeachings: string[];
}

export interface GuidanceType {
  type: 'daily_guidance' | 'question_answer' | 'teaching_session' | 'meditation_guidance' | 'life_advice';
  context: string;
  urgency: 'low' | 'medium' | 'high';
  depth: 'surface' | 'moderate' | 'deep' | 'profound';
}

// Spiritual conversation
export interface SpiritualConversation {
  id: string;
  userId: string;
  teacherId: string;
  messages: SpiritualMessage[];
  context: SpiritualContext;
  insights: SpiritualInsight[];
  practices: RecommendedPractice[];
  timestamp: string;
}

export interface SpiritualMessage {
  id: string;
  role: 'user' | 'teacher';
  content: string;
  teaching?: OshoTeaching;
  practice?: OshoPractice;
  quote?: OshoQuote;
  timestamp: string;
  emotionalTone?: string;
  spiritualLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface SpiritualContext {
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  currentChallenges: string[];
  spiritualGoals: string[];
  recentInsights: string[];
  practiceHistory: string[];
  favoriteTeachings: string[];
  oshoContext: {
    familiarConcepts: string[];
    exploredCategories: OshoCategory[];
    completedPractices: string[];
    currentMeditation: string;
    spiritualQuestions: string[];
  };
  emotionalState: {
    mood: string;
    energy: number; // 1-10
    stress: number; // 1-10
    openness: number; // 1-10
  };
  lifeContext: {
    currentSituation: string;
    challenges: string[];
    relationships: string[];
    work: string;
    health: string;
  };
}

export interface SpiritualInsight {
  id: string;
  userId: string;
  content: string;
  category: OshoCategory;
  source: 'conversation' | 'teaching' | 'practice' | 'reflection';
  timestamp: string;
  importance: 'low' | 'medium' | 'high';
  actionItems: string[];
  relatedTeachings: string[];
}

export interface RecommendedPractice {
  id: string;
  practice: OshoPractice;
  reason: string;
  timing: string;
  expectedOutcome: string;
  priority: 'low' | 'medium' | 'high';
}

// User spiritual profile
export interface SpiritualProfile {
  userId: string;
  currentTeacher: string;
  spiritualLevel: 'beginner' | 'intermediate' | 'advanced' | 'master';
  interests: OshoCategory[];
  goals: SpiritualGoal[];
  practices: OshoPractice[];
  insights: SpiritualInsight[];
  journey: SpiritualJourney;
  preferences: SpiritualPreferences;
}

export interface SpiritualGoal {
  id: string;
  description: string;
  category: 'meditation' | 'compassion' | 'awareness' | 'enlightenment' | 'service';
  priority: 'high' | 'medium' | 'low';
  targetDate: string;
  progress: number; // 0-100
  milestones: SpiritualMilestone[];
}

export interface SpiritualMilestone {
  id: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
  celebration: string;
}

export interface SpiritualJourney {
  startDate: string;
  currentPhase: string;
  majorInsights: string[];
  challenges: string[];
  breakthroughs: string[];
  practices: string[];
  teachers: string[];
  evolution: SpiritualEvolution[];
}

export interface SpiritualEvolution {
  phase: string;
  startDate: string;
  endDate?: string;
  keyInsights: string[];
  practices: string[];
  challenges: string[];
  growth: number; // 0-100
}

export interface SpiritualPreferences {
  teachingStyle: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  practiceTypes: string[];
  readingLevel: 'light' | 'moderate' | 'deep';
  notificationFrequency: 'daily' | 'weekly' | 'monthly';
  reminderTimes: string[];
  favoriteCategories: OshoCategory[];
}

// Daily guidance
export interface DailyGuidance {
  id: string;
  userId: string;
  teacherId: string;
  date: string;
  morningWisdom: string;
  eveningReflection: string;
  dailyPractice: OshoPractice;
  inspirationalQuote: OshoQuote;
  theme: OshoCategory;
  insights: string[];
  actionItems: string[];
  completed: boolean;
  satisfaction?: number; // 1-10
}

// Spiritual progress tracking
export interface SpiritualProgress {
  userId: string;
  overallProgress: number; // 0-100
  goalProgress: GoalProgress[];
  emotionalTrends: EmotionalTrend[];
  practiceEffectiveness: PracticeEffectiveness[];
  milestones: SpiritualMilestone[];
  insights: SpiritualInsight[];
  recommendations: SpiritualRecommendation[];
}

export interface GoalProgress {
  goalId: string;
  description: string;
  progress: number; // 0-100
  milestones: SpiritualMilestone[];
  lastUpdated: string;
}

export interface EmotionalTrend {
  date: string;
  mood: number; // 1-10
  energy: number; // 1-10
  stress: number; // 1-10
  spiritualSatisfaction: number; // 1-10
  practiceMinutes: number;
  insights: number;
}

export interface PracticeEffectiveness {
  practiceId: string;
  name: string;
  effectiveness: number; // 1-10
  frequency: number; // times per week
  satisfaction: number; // 1-10
  benefits: string[];
  challenges: string[];
}

export interface SpiritualRecommendation {
  id: string;
  type: 'teaching' | 'practice' | 'reflection' | 'community';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: OshoCategory;
  expectedOutcome: string;
  timeRequired: number; // minutes
  difficulty: 'easy' | 'moderate' | 'challenging';
}

// Krishnamurti-specific types
export interface KrishnamurtiProfile extends SpiritualTeacher {
  id: 'krishnamurti';
  name: 'Krishnamurti';
  displayName: 'J. Krishnamurti';
  fullName: 'Jiddu Krishnamurti';
  birthYear: 1895;
  deathYear: 1986;
  nationality: 'Indian';
  philosophy: KrishnamurtiPhilosophy;
  teachingStyle: KrishnamurtiTeachingStyle;
  personality: KrishnamurtiPersonality;
}

export interface KrishnamurtiPhilosophy {
  essence: string;
  keyPrinciples: string[];
  approach: string;
  focus: string;
}

export interface KrishnamurtiTeachingStyle {
  approach: 'inquiry' | 'dialogue' | 'observation' | 'self-investigation';
  tone: 'serious' | 'gentle' | 'direct' | 'questioning';
  focus: 'awareness' | 'freedom' | 'inquiry' | 'observation';
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

export interface KrishnamurtiPersonality {
  traits: string[];
  communication: string;
  humor: string;
  compassion: string;
}

// Krishnamurti teaching categories
export type KrishnamurtiCategory = 
  | 'awareness'
  | 'freedom'
  | 'inquiry'
  | 'observation'
  | 'conditioning'
  | 'relationship'
  | 'fear'
  | 'love';

export interface KrishnamurtiTeachingCategory {
  name: string;
  description: string;
  color: string;
  icon: string;
  keyConcepts: string[];
}

// Krishnamurti teaching content
export interface KrishnamurtiTeaching {
  id: string;
  title: string;
  content: string;
  source: {
    type: 'talk' | 'discussion' | 'dialogue' | 'interview' | 'writing';
    title: string;
    location?: string;
    date?: string;
  };
  category: KrishnamurtiCategory;
  tags: string[];
  spiritualLevel: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  keyConcepts: string[];
  teachingValue: number; // 1-10
  memorability: number; // 1-10
}

export interface KrishnamurtiQuote {
  id: string;
  text: string;
  source: {
    type: 'talk' | 'discussion' | 'dialogue' | 'interview' | 'writing';
    title: string;
    location?: string;
    date?: string;
  };
  category: KrishnamurtiCategory;
  tags: string[];
  spiritualLevel: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  keyConcepts: string[];
  teachingValue: number; // 1-10
  memorability: number; // 1-10
  context?: string;
  explanation?: string;
  relatedQuotes: string[];
  practices: string[];
}

export interface KrishnamurtiPractice {
  id: string;
  name: string;
  type: 'inquiry' | 'observation' | 'awareness' | 'dialogue' | 'reflection';
  category: KrishnamurtiCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: {
    minimum: number; // minutes
    recommended: number; // minutes
    maximum: number; // minutes
  };
  description: string;
  instructions: string[];
  preparation: string[];
  benefits: string[];
  challenges: string[];
  tips: string[];
  variations: string[];
  spiritualLevel: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  userRating: number;
  completionRate: number;
}

// Swami Vivekananda-specific types
export interface VivekanandaProfile extends SpiritualTeacher {
  id: 'vivekananda';
  name: 'Vivekananda';
  displayName: 'Swami Vivekananda';
  fullName: 'Swami Vivekananda (Narendranath Datta)';
  birthYear: 1863;
  deathYear: 1902;
  nationality: 'Indian';
  philosophy: VivekanandaPhilosophy;
  teachingStyle: VivekanandaTeachingStyle;
  personality: VivekanandaPersonality;
}

export interface VivekanandaPhilosophy {
  essence: string;
  keyPrinciples: string[];
  approach: string;
  focus: string;
}

export interface VivekanandaTeachingStyle {
  communication: {
    tone: 'inspiring' | 'passionate' | 'practical' | 'direct';
    method: 'lecture' | 'storytelling' | 'practical guidance' | 'service';
    humor: string;
    compassion: string;
  };
  content: {
    topics: string[];
    complexity: 'beginner' | 'intermediate' | 'advanced';
    depth: 'practical' | 'profound';
  };
  interaction: {
    questioning: string;
    guidance: string;
    support: string;
    challenge: string;
  };
}

export interface VivekanandaPersonality {
  traits: string[];
  communication: string;
  humor: string;
  compassion: string;
}

// Vivekananda teaching categories
export type VivekanandaCategory = 
  | 'karma_yoga'
  | 'bhakti_yoga'
  | 'jnana_yoga'
  | 'raja_yoga'
  | 'service'
  | 'education'
  | 'nationalism'
  | 'universal_religion';

export interface VivekanandaTeachingCategory {
  name: string;
  description: string;
  color: string;
  icon: string;
  keyConcepts: string[];
}

// Vivekananda teaching content
export interface VivekanandaTeaching {
  id: string;
  title: string;
  content: string;
  source: {
    type: 'lecture' | 'writing' | 'discourse' | 'speech';
    title: string;
    location?: string;
    date?: string;
  };
  category: VivekanandaCategory;
  tags: string[];
  spiritualLevel: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  keyConcepts: string[];
  teachingValue: number; // 1-10
  memorability: number; // 1-10
}

export interface VivekanandaQuote {
  id: string;
  text: string;
  source: {
    type: 'lecture' | 'writing' | 'discourse' | 'speech';
    title: string;
    location?: string;
    date?: string;
  };
  category: VivekanandaCategory;
  tags: string[];
  spiritualLevel: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  keyConcepts: string[];
  teachingValue: number; // 1-10
  memorability: number; // 1-10
  context?: string;
  explanation?: string;
  relatedQuotes: string[];
  practices: string[];
}

export interface VivekanandaPractice {
  id: string;
  name: string;
  type: 'meditation' | 'service' | 'study' | 'contemplation' | 'yoga';
  category: VivekanandaCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: {
    minimum: number; // minutes
    recommended: number; // minutes
    maximum: number; // minutes
  };
  description: string;
  instructions: string[];
  preparation: string[];
  benefits: string[];
  warnings?: string[];
  whenToUse: string[];
  prerequisites: string[];
  relatedPractices: string[];
  teaching: string; // Source teaching
  popularity: number;
  effectiveness: number; // 1-10
  userRating: number;
  completionRate: number;
}
