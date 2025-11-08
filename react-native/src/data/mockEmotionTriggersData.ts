/**
 * Mock data for Emotion Triggers Visualization feature
 * This data is used during development and testing before real APIs are implemented
 */

export interface Trigger {
  id: string;
  text: string;
  category: 'people' | 'activities' | 'locations' | 'topics' | 'time-patterns' | 'external-factors';
  isManual: boolean; // true if user manually tagged, false if AI-detected
  confidenceScore: number; // 0-100, how confident we are this is a trigger
}

export interface EmotionTriggerData {
  emotion: string;
  moodScore: number; // 1-5
  emoji: string;
  triggers: Trigger[];
  entryCount: number; // How many entries this emotion appears in
  frequency: number; // Percentage of entries with this emotion
}

export interface EmotionTriggersAnalysis {
  userId: string;
  totalEntries: number;
  analysisDate: string;
  emotions: EmotionTriggerData[];
}

// Mock data with realistic patterns
export const mockEmotionTriggersData: EmotionTriggersAnalysis = {
  userId: 'user-123',
  totalEntries: 12,
  analysisDate: new Date().toISOString(),
  emotions: [
    {
      emotion: 'Happy',
      moodScore: 5,
      emoji: '😄',
      entryCount: 5,
      frequency: 42,
      triggers: [
        {
          id: 'trigger-1',
          text: 'Time with family',
          category: 'people',
          isManual: false,
          confidenceScore: 95,
        },
        {
          id: 'trigger-2',
          text: 'Exercise/Workout',
          category: 'activities',
          isManual: false,
          confidenceScore: 88,
        },
        {
          id: 'trigger-3',
          text: 'Coffee with friends',
          category: 'activities',
          isManual: true,
          confidenceScore: 92,
        },
        {
          id: 'trigger-4',
          text: 'Sunny weather',
          category: 'external-factors',
          isManual: false,
          confidenceScore: 75,
        },
        {
          id: 'trigger-5',
          text: 'Completed a project',
          category: 'topics',
          isManual: false,
          confidenceScore: 85,
        },
      ],
    },
    {
      emotion: 'Calm',
      moodScore: 4,
      emoji: '😌',
      entryCount: 4,
      frequency: 33,
      triggers: [
        {
          id: 'trigger-6',
          text: 'Meditation',
          category: 'activities',
          isManual: false,
          confidenceScore: 98,
        },
        {
          id: 'trigger-7',
          text: 'Morning routine',
          category: 'time-patterns',
          isManual: false,
          confidenceScore: 82,
        },
        {
          id: 'trigger-8',
          text: 'Nature/Outdoors',
          category: 'locations',
          isManual: true,
          confidenceScore: 90,
        },
        {
          id: 'trigger-9',
          text: 'Reading',
          category: 'activities',
          isManual: false,
          confidenceScore: 80,
        },
      ],
    },
    {
      emotion: 'Anxious',
      moodScore: 2,
      emoji: '😰',
      entryCount: 2,
      frequency: 17,
      triggers: [
        {
          id: 'trigger-10',
          text: 'Work deadlines',
          category: 'topics',
          isManual: false,
          confidenceScore: 94,
        },
        {
          id: 'trigger-11',
          text: 'Late evening',
          category: 'time-patterns',
          isManual: false,
          confidenceScore: 76,
        },
        {
          id: 'trigger-12',
          text: 'Difficult conversations',
          category: 'activities',
          isManual: true,
          confidenceScore: 88,
        },
      ],
    },
    {
      emotion: 'Sad',
      moodScore: 2,
      emoji: '😔',
      entryCount: 1,
      frequency: 8,
      triggers: [
        {
          id: 'trigger-13',
          text: 'Missing loved ones',
          category: 'people',
          isManual: false,
          confidenceScore: 92,
        },
        {
          id: 'trigger-14',
          text: 'Rainy weather',
          category: 'external-factors',
          isManual: false,
          confidenceScore: 68,
        },
      ],
    },
  ],
};

// Mock data for empty state (no entries yet)
export const mockEmptyEmotionTriggersData: EmotionTriggersAnalysis = {
  userId: 'user-123',
  totalEntries: 0,
  analysisDate: new Date().toISOString(),
  emotions: [],
};

// Mock data for single entry (minimum threshold)
export const mockSingleEntryEmotionTriggersData: EmotionTriggersAnalysis = {
  userId: 'user-123',
  totalEntries: 1,
  analysisDate: new Date().toISOString(),
  emotions: [
    {
      emotion: 'Happy',
      moodScore: 4,
      emoji: '😊',
      entryCount: 1,
      frequency: 100,
      triggers: [
        {
          id: 'trigger-1',
          text: 'Great day at work',
          category: 'topics',
          isManual: false,
          confidenceScore: 85,
        },
        {
          id: 'trigger-2',
          text: 'Lunch with Sarah',
          category: 'people',
          isManual: false,
          confidenceScore: 78,
        },
      ],
    },
  ],
};

