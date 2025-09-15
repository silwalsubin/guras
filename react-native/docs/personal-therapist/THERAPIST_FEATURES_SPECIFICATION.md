# Personal Therapist Features Specification

> **Location**: `react-native/docs/THERAPIST_FEATURES_SPECIFICATION.md`  
> **Last Updated**: December 2024  
> **Status**: Technical Specification  
> **Version**: 1.0

## Overview

This document provides detailed technical specifications for implementing personal therapist features in the Guras meditation app. It includes data models, API specifications, UI/UX requirements, and implementation guidelines.

## Table of Contents

1. [Core Data Models](#core-data-models)
2. [API Specifications](#api-specifications)
3. [UI/UX Components](#uiux-components)
4. [AI/ML Integration](#aiml-integration)
5. [Implementation Guidelines](#implementation-guidelines)
6. [Testing Specifications](#testing-specifications)

## Core Data Models

### 1. Emotional State Management

```typescript
// Enhanced mood tracking with multi-dimensional emotions
interface EmotionalState {
  id: string;
  userId: string;
  timestamp: string;
  
  // Primary emotional data
  primaryEmotion: PrimaryEmotion;
  intensity: number; // 1-10 scale
  secondaryEmotions: SecondaryEmotion[];
  
  // Contextual information
  context: EmotionalContext;
  triggers: string[];
  physicalSymptoms: PhysicalSymptom[];
  
  // Associated data
  meditationSession?: {
    sessionId: string;
    duration: number;
    type: string;
    effectiveness: number; // 1-10 scale
  };
  
  // User input
  notes?: string;
  voiceNote?: string;
  
  // Metadata
  source: 'manual' | 'ai_analysis' | 'inferred';
  confidence: number; // 0-1 scale
}

interface PrimaryEmotion {
  type: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'neutral';
  intensity: number;
  description: string;
}

interface SecondaryEmotion {
  type: string;
  intensity: number;
  description: string;
}

interface EmotionalContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  socialSituation?: 'alone' | 'with_family' | 'with_friends' | 'at_work' | 'in_public';
  recentEvents: string[];
  location?: 'home' | 'work' | 'outdoors' | 'traveling' | 'other';
}

interface PhysicalSymptom {
  type: 'headache' | 'fatigue' | 'tension' | 'nausea' | 'rapid_heartbeat' | 'sweating' | 'other';
  intensity: number; // 1-10 scale
  description?: string;
}
```

### 2. Therapeutic Conversation System

```typescript
interface TherapeuticConversation {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  
  // Conversation data
  userMessage: string;
  therapistResponse: string;
  
  // Analysis
  emotionalTone: EmotionalTone;
  therapeuticTechnique: TherapeuticTechnique;
  intent: ConversationIntent;
  
  // Context
  conversationContext: ConversationContext;
  followUpQuestions: string[];
  sessionGoals: string[];
  
  // Metadata
  responseTime: number; // milliseconds
  userSatisfaction?: number; // 1-5 scale
  effectiveness?: number; // 1-10 scale
}

interface EmotionalTone {
  primary: string;
  secondary: string[];
  intensity: number;
  confidence: number;
}

interface TherapeuticTechnique {
  name: string;
  type: 'active_listening' | 'reflection' | 'questioning' | 'validation' | 'challenge' | 'support';
  description: string;
  effectiveness: number;
}

interface ConversationIntent {
  primary: 'support' | 'guidance' | 'crisis' | 'reflection' | 'goal_setting' | 'celebration';
  secondary: string[];
  confidence: number;
}

interface ConversationContext {
  previousMessages: string[];
  currentMood: EmotionalState;
  userGoals: string[];
  recentSessions: string[];
  crisisLevel: 'low' | 'medium' | 'high' | 'critical';
}
```

### 3. Treatment Planning System

```typescript
interface TreatmentPlan {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  
  // Plan structure
  goals: TherapeuticGoal[];
  currentPhase: TreatmentPhase;
  techniques: AssignedTechnique[];
  
  // Progress tracking
  progress: TreatmentProgress;
  milestones: Milestone[];
  adjustments: PlanAdjustment[];
  
  // Next steps
  nextSession: SessionPlan;
  recommendations: Recommendation[];
  
  // Metadata
  status: 'active' | 'paused' | 'completed' | 'archived';
  effectiveness: number; // 0-100 scale
}

interface TherapeuticGoal {
  id: string;
  description: string;
  category: GoalCategory;
  priority: 'high' | 'medium' | 'low';
  targetDate: string;
  progress: number; // 0-100
  milestones: Milestone[];
  status: 'active' | 'completed' | 'paused' | 'cancelled';
}

interface GoalCategory {
  type: 'anxiety' | 'depression' | 'stress' | 'sleep' | 'relationships' | 'self_esteem' | 'trauma' | 'addiction';
  subcategory?: string;
  severity: 'mild' | 'moderate' | 'severe';
}

interface TreatmentPhase {
  name: 'assessment' | 'intervention' | 'maintenance' | 'relapse_prevention';
  description: string;
  duration: number; // days
  techniques: string[];
  goals: string[];
}

interface AssignedTechnique {
  id: string;
  name: string;
  type: TechniqueType;
  description: string;
  instructions: string[];
  duration: number; // minutes
  frequency: string;
  effectiveness: number;
  assignedDate: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'skipped';
}

interface TechniqueType {
  category: 'breathing' | 'visualization' | 'reflection' | 'cognitive' | 'behavioral' | 'mindfulness';
  subcategory: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
```

### 4. Crisis Detection and Intervention

```typescript
interface CrisisDetection {
  id: string;
  userId: string;
  timestamp: string;
  
  // Risk assessment
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  warningSigns: WarningSign[];
  
  // Intervention
  interventionProtocol: CrisisIntervention;
  emergencyContacts: EmergencyContact[];
  safetyPlan: SafetyPlan;
  
  // Status
  status: 'detected' | 'intervening' | 'resolved' | 'escalated';
  resolution?: CrisisResolution;
}

interface RiskFactor {
  type: 'suicidal_ideation' | 'self_harm' | 'substance_abuse' | 'isolation' | 'trauma' | 'other';
  severity: number; // 1-10 scale
  description: string;
  detectedAt: string;
  source: 'user_input' | 'ai_analysis' | 'pattern_detection';
}

interface WarningSign {
  type: 'language_patterns' | 'behavioral_changes' | 'emotional_state' | 'social_withdrawal';
  description: string;
  confidence: number;
  detectedAt: string;
}

interface CrisisIntervention {
  immediateActions: string[];
  calmingTechniques: Technique[];
  professionalResources: Resource[];
  followUpPlan: FollowUpPlan;
  escalationCriteria: string[];
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  isPrimary: boolean;
  lastContacted?: string;
}

interface SafetyPlan {
  id: string;
  userId: string;
  warningSigns: string[];
  copingStrategies: string[];
  socialSupports: string[];
  professionalSupports: string[];
  emergencyContacts: string[];
  safeEnvironments: string[];
  lastUpdated: string;
}
```

### 5. Therapeutic Journaling System

```typescript
interface TherapeuticJournal {
  id: string;
  userId: string;
  entries: JournalEntry[];
  prompts: JournalPrompt[];
  themes: EmotionalTheme[];
  insights: PersonalInsight[];
  growthAreas: GrowthArea[];
}

interface JournalEntry {
  id: string;
  userId: string;
  timestamp: string;
  
  // Entry content
  prompt: JournalPrompt;
  content: string;
  voiceNote?: string;
  images?: string[];
  
  // Analysis
  emotionalTone: EmotionalTone;
  themes: string[];
  insights: string[];
  
  // Follow-up
  followUpQuestions: string[];
  actionItems: string[];
  
  // Metadata
  wordCount: number;
  readingTime: number; // minutes
  privacy: 'private' | 'shared_with_therapist' | 'anonymous';
}

interface JournalPrompt {
  id: string;
  category: 'daily_reflection' | 'gratitude' | 'challenges' | 'goals' | 'emotions' | 'relationships';
  title: string;
  description: string;
  questions: string[];
  suggestedLength: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  therapeuticValue: number; // 1-10 scale
}

interface EmotionalTheme {
  name: string;
  description: string;
  frequency: number;
  intensity: number;
  associatedEmotions: string[];
  patterns: string[];
}

interface PersonalInsight {
  id: string;
  userId: string;
  timestamp: string;
  content: string;
  source: 'journal_entry' | 'conversation' | 'pattern_analysis' | 'user_input';
  confidence: number;
  themes: string[];
  actionItems: string[];
  status: 'new' | 'acknowledged' | 'actioned' | 'resolved';
}
```

## API Specifications

### 1. Emotional State API

```typescript
// POST /api/emotional-state
interface CreateEmotionalStateRequest {
  primaryEmotion: PrimaryEmotion;
  intensity: number;
  secondaryEmotions?: SecondaryEmotion[];
  context: EmotionalContext;
  triggers?: string[];
  physicalSymptoms?: PhysicalSymptom[];
  notes?: string;
  voiceNote?: string;
}

interface CreateEmotionalStateResponse {
  success: boolean;
  emotionalState: EmotionalState;
  insights: string[];
  recommendations: string[];
}

// GET /api/emotional-state/history
interface GetEmotionalStateHistoryRequest {
  userId: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

interface GetEmotionalStateHistoryResponse {
  success: boolean;
  emotionalStates: EmotionalState[];
  patterns: PatternAnalysis;
  totalCount: number;
}

// GET /api/emotional-state/patterns
interface GetEmotionalPatternsRequest {
  userId: string;
  timeframe: 'week' | 'month' | 'quarter' | 'year';
}

interface GetEmotionalPatternsResponse {
  success: boolean;
  patterns: {
    weeklyCycles: MoodCycle[];
    seasonalPatterns: SeasonalMood[];
    triggerCorrelations: TriggerCorrelation[];
    meditationEffectiveness: MeditationImpact[];
  };
  insights: TherapeuticInsight[];
  recommendations: PersonalizedRecommendation[];
}
```

### 2. Therapeutic Conversation API

```typescript
// POST /api/conversation
interface StartConversationRequest {
  userId: string;
  initialMessage: string;
  context?: ConversationContext;
  sessionType?: 'check-in' | 'crisis' | 'goal-setting' | 'reflection' | 'intervention';
}

interface StartConversationResponse {
  success: boolean;
  conversation: TherapeuticConversation;
  sessionId: string;
  suggestedTechniques: TherapeuticTechnique[];
}

// POST /api/conversation/{conversationId}/message
interface SendMessageRequest {
  message: string;
  context?: ConversationContext;
  emotionalState?: EmotionalState;
}

interface SendMessageResponse {
  success: boolean;
  response: TherapeuticConversation;
  followUpQuestions: string[];
  recommendedActions: string[];
  crisisLevel?: 'low' | 'medium' | 'high' | 'critical';
}

// GET /api/conversation/{conversationId}
interface GetConversationRequest {
  conversationId: string;
  includeAnalysis?: boolean;
}

interface GetConversationResponse {
  success: boolean;
  conversation: TherapeuticConversation;
  analysis?: ConversationAnalysis;
  insights?: string[];
  recommendations?: string[];
}
```

### 3. Treatment Planning API

```typescript
// POST /api/treatment-plan
interface CreateTreatmentPlanRequest {
  userId: string;
  goals: TherapeuticGoal[];
  currentPhase: TreatmentPhase;
  techniques: AssignedTechnique[];
  preferences: UserPreferences;
}

interface CreateTreatmentPlanResponse {
  success: boolean;
  treatmentPlan: TreatmentPlan;
  nextSteps: string[];
  estimatedTimeline: string;
}

// PUT /api/treatment-plan/{planId}
interface UpdateTreatmentPlanRequest {
  planId: string;
  updates: Partial<TreatmentPlan>;
  reason: string;
  effectiveness?: number;
}

interface UpdateTreatmentPlanResponse {
  success: boolean;
  updatedPlan: TreatmentPlan;
  adjustments: PlanAdjustment[];
  recommendations: string[];
}

// GET /api/treatment-plan/{planId}/progress
interface GetTreatmentProgressRequest {
  planId: string;
  timeframe?: 'week' | 'month' | 'quarter';
}

interface GetTreatmentProgressResponse {
  success: boolean;
  progress: TreatmentProgress;
  milestones: Milestone[];
  insights: string[];
  recommendations: string[];
}
```

### 4. Crisis Detection API

```typescript
// POST /api/crisis/detect
interface DetectCrisisRequest {
  userId: string;
  emotionalState: EmotionalState;
  conversationHistory: TherapeuticConversation[];
  recentSessions: Session[];
}

interface DetectCrisisResponse {
  success: boolean;
  crisisLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  warningSigns: WarningSign[];
  interventionProtocol: CrisisIntervention;
  immediateActions: string[];
}

// POST /api/crisis/intervene
interface CrisisInterventionRequest {
  crisisId: string;
  interventionType: 'immediate' | 'calming' | 'professional' | 'follow_up';
  actions: string[];
  notes?: string;
}

interface CrisisInterventionResponse {
  success: boolean;
  intervention: CrisisIntervention;
  nextSteps: string[];
  followUpRequired: boolean;
  escalationNeeded: boolean;
}
```

## UI/UX Components

### 1. Enhanced Mood Tracker

```typescript
interface MoodTrackerComponent {
  // Multi-dimensional emotion selection
  emotionSelector: {
    primaryEmotions: EmotionOption[];
    secondaryEmotions: EmotionOption[];
    intensitySlider: IntensitySlider;
  };
  
  // Context capture
  contextCapture: {
    timeOfDay: TimeSelector;
    socialSituation: SocialSituationSelector;
    recentEvents: EventInput;
    location: LocationSelector;
  };
  
  // Physical symptoms
  physicalSymptoms: {
    symptomChecklist: SymptomChecklist;
    intensityRatings: IntensityRating[];
  };
  
  // Notes and voice
  additionalInput: {
    textNotes: TextInput;
    voiceNote: VoiceRecorder;
    imageCapture: ImageCapture;
  };
}
```

### 2. Therapeutic Chat Interface

```typescript
interface TherapeuticChatComponent {
  // Chat interface
  chatInterface: {
    messageList: MessageList;
    inputField: MessageInput;
    sendButton: SendButton;
    voiceInput: VoiceInput;
  };
  
  // Therapeutic features
  therapeuticFeatures: {
    techniqueIndicator: TechniqueIndicator;
    moodIndicator: MoodIndicator;
    progressTracker: ProgressTracker;
    goalReminder: GoalReminder;
  };
  
  // Crisis support
  crisisSupport: {
    crisisButton: CrisisButton;
    safetyPlan: SafetyPlanDisplay;
    emergencyContacts: EmergencyContactsList;
  };
}
```

### 3. Treatment Plan Dashboard

```typescript
interface TreatmentPlanDashboard {
  // Plan overview
  planOverview: {
    currentPhase: PhaseIndicator;
    goalProgress: GoalProgressChart;
    techniqueStatus: TechniqueStatusList;
    nextSession: NextSessionCard;
  };
  
  // Progress tracking
  progressTracking: {
    progressChart: ProgressChart;
    milestoneTracker: MilestoneTracker;
    insightDisplay: InsightDisplay;
    recommendationList: RecommendationList;
  };
  
  // Plan management
  planManagement: {
    goalEditor: GoalEditor;
    techniqueAssigner: TechniqueAssigner;
    phaseTransition: PhaseTransition;
    planAdjuster: PlanAdjuster;
  };
}
```

### 4. Crisis Intervention Interface

```typescript
interface CrisisInterventionInterface {
  // Crisis detection
  crisisDetection: {
    riskIndicator: RiskIndicator;
    warningSigns: WarningSignsList;
    interventionPrompt: InterventionPrompt;
  };
  
  // Immediate support
  immediateSupport: {
    calmingTechniques: CalmingTechniquesList;
    breathingExercises: BreathingExerciseGuide;
    groundingTechniques: GroundingTechniquesList;
  };
  
  // Professional resources
  professionalResources: {
    therapistContacts: TherapistContactsList;
    crisisHotlines: CrisisHotlinesList;
    emergencyServices: EmergencyServicesList;
  };
  
  // Safety planning
  safetyPlanning: {
    safetyPlanDisplay: SafetyPlanDisplay;
    emergencyContacts: EmergencyContactsList;
    safeEnvironments: SafeEnvironmentsList;
  };
}
```

## AI/ML Integration

### 1. Emotion Recognition Engine

```typescript
interface EmotionRecognitionEngine {
  // Text analysis
  analyzeText(text: string): Promise<EmotionalAnalysis>;
  
  // Voice analysis
  analyzeVoice(audioData: AudioData): Promise<EmotionalAnalysis>;
  
  // Context analysis
  analyzeContext(context: UserContext): Promise<EmotionalState>;
  
  // Trend analysis
  trackEmotionalTrends(history: MoodEntry[]): Promise<EmotionalTrend>;
}

interface EmotionalAnalysis {
  primaryEmotion: PrimaryEmotion;
  secondaryEmotions: SecondaryEmotion[];
  intensity: number;
  confidence: number;
  context: EmotionalContext;
  triggers: string[];
  physicalSymptoms: PhysicalSymptom[];
}
```

### 2. Pattern Recognition System

```typescript
interface PatternRecognitionSystem {
  // Mood pattern analysis
  identifyMoodCycles(data: MoodEntry[]): Promise<MoodCycle[]>;
  
  // Trigger detection
  detectTriggers(data: UserData): Promise<Trigger[]>;
  
  // Meditation effectiveness
  analyzeMeditationEffectiveness(sessions: Session[]): Promise<EffectivenessAnalysis>;
  
  // Mood prediction
  predictMoodPatterns(history: MoodEntry[]): Promise<MoodPrediction>;
}

interface MoodCycle {
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  pattern: number[];
  confidence: number;
  description: string;
  recommendations: string[];
}
```

### 3. Recommendation Engine

```typescript
interface RecommendationEngine {
  // Meditation recommendations
  suggestMeditation(userState: UserState): Promise<MeditationRecommendation>;
  
  // Timing recommendations
  recommendTiming(userPatterns: UserPatterns): Promise<TimingRecommendation>;
  
  // Technique recommendations
  suggestTechniques(emotionalState: EmotionalState): Promise<TechniqueRecommendation>;
  
  // Content personalization
  personalizeContent(content: Content, userProfile: UserProfile): Promise<PersonalizedContent>;
}

interface MeditationRecommendation {
  type: string;
  duration: number;
  techniques: string[];
  timing: string;
  reasoning: string;
  expectedOutcome: string;
  confidence: number;
}
```

### 4. Natural Language Processing

```typescript
interface NLPEngine {
  // Sentiment analysis
  analyzeSentiment(text: string): Promise<SentimentAnalysis>;
  
  // Emotion extraction
  extractEmotions(text: string): Promise<EmotionExtraction>;
  
  // Response generation
  generateResponse(context: ConversationContext): Promise<TherapeuticResponse>;
  
  // Intent classification
  classifyIntent(message: string): Promise<IntentClassification>;
}

interface SentimentAnalysis {
  polarity: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: string[];
  intensity: number;
}
```

## Implementation Guidelines

### 1. Data Privacy and Security

```typescript
interface PrivacyConfiguration {
  // Data encryption
  encryption: {
    algorithm: 'AES-256';
    keyManagement: 'HSM';
    dataAtRest: boolean;
    dataInTransit: boolean;
  };
  
  // Access control
  accessControl: {
    authentication: 'multi-factor';
    authorization: 'role-based';
    auditLogging: boolean;
    dataRetention: 'configurable';
  };
  
  // Compliance
  compliance: {
    gdpr: boolean;
    hipaa: boolean;
    ccpa: boolean;
    dataMinimization: boolean;
  };
}
```

### 2. Performance Requirements

```typescript
interface PerformanceRequirements {
  // Response times
  responseTimes: {
    aiResponse: 2000; // milliseconds
    dataRetrieval: 500; // milliseconds
    patternAnalysis: 5000; // milliseconds
    crisisDetection: 1000; // milliseconds
  };
  
  // Scalability
  scalability: {
    concurrentUsers: 10000;
    dataProcessing: 'real-time';
    storageCapacity: 'unlimited';
    backupFrequency: 'hourly';
  };
  
  // Reliability
  reliability: {
    uptime: 99.9;
    errorRate: 0.1;
    dataConsistency: 'strong';
    disasterRecovery: '4-hour';
  };
}
```

### 3. Testing Specifications

```typescript
interface TestingSpecifications {
  // Unit testing
  unitTesting: {
    coverage: 90;
    frameworks: ['Jest', 'React Native Testing Library'];
    mockServices: boolean;
    testData: 'synthetic';
  };
  
  // Integration testing
  integrationTesting: {
    apis: 'all';
    databases: 'all';
    externalServices: 'all';
    performance: 'load';
  };
  
  // User acceptance testing
  userAcceptanceTesting: {
    scenarios: 'comprehensive';
    userTypes: ['patients', 'therapists', 'administrators'];
    devices: ['iOS', 'Android'];
    accessibility: 'WCAG 2.1 AA';
  };
}
```

## Conclusion

This specification provides a comprehensive technical foundation for implementing personal therapist features in the Guras meditation app. The modular design allows for incremental implementation while maintaining system integrity and user experience quality.

The focus on privacy, security, and therapeutic effectiveness ensures that the app meets the highest standards for mental health applications while providing meaningful support to users seeking therapeutic assistance.

---

**Document Status**: Technical Specification  
**Next Review Date**: January 2025  
**Stakeholders**: Development Team, Clinical Advisors, Product Team  
**Approval**: Pending Technical Review
