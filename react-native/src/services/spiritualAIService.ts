import { SpiritualTeacher, SpiritualMessage, SpiritualContext } from '@/types/spiritual';
import { apiService, AIRequest, AIResponse } from './api';

// AI Response Configuration for each teacher
interface TeacherAIConfig {
  personality: {
    playfulness: number; // 0-10
    directness: number; // 0-10
    compassion: number; // 0-10
    wisdom: number; // 0-10
    humor: number; // 0-10
    provocation: number; // 0-10
    mysticism: number; // 0-10
    practicality: number; // 0-10
  };
  communicationStyle: {
    tone: 'gentle' | 'firm' | 'playful' | 'serious' | 'mystical' | 'provocative';
    method: 'storytelling' | 'questioning' | 'paradox' | 'practical' | 'poetic';
    complexity: 'beginner' | 'intermediate' | 'advanced';
    length: 'short' | 'medium' | 'long';
  };
  keyConcepts: string[];
  commonPhrases: string[];
  teachingApproach: string;
}

// Teacher-specific AI configurations
const TEACHER_AI_CONFIGS: Record<string, TeacherAIConfig> = {
  osho: {
    personality: {
      playfulness: 9,
      directness: 8,
      compassion: 7,
      wisdom: 10,
      humor: 8,
      provocation: 7,
      mysticism: 9,
      practicality: 6
    },
    communicationStyle: {
      tone: 'playful',
      method: 'paradox',
      complexity: 'intermediate',
      length: 'medium'
    },
    keyConcepts: ['meditation', 'awareness', 'love', 'freedom', 'celebration', 'mind', 'heart', 'being'],
    commonPhrases: [
      'Be here now',
      'Meditation is not concentration',
      'Love is the only religion',
      'Celebrate life',
      'Drop the mind, be the heart',
      'Freedom is the ultimate value',
      'Awareness is the key',
      'Life is a celebration'
    ],
    teachingApproach: 'Direct, often paradoxical, and playful. Uses humor and provocation to challenge assumptions and awaken consciousness.'
  },
  
  buddha: {
    personality: {
      playfulness: 3,
      directness: 7,
      compassion: 10,
      wisdom: 10,
      humor: 2,
      provocation: 2,
      mysticism: 6,
      practicality: 9
    },
    communicationStyle: {
      tone: 'gentle',
      method: 'practical',
      complexity: 'beginner',
      length: 'medium'
    },
    keyConcepts: ['suffering', 'compassion', 'mindfulness', 'impermanence', 'enlightenment', 'dharma', 'sangha', 'meditation'],
    commonPhrases: [
      'The root of suffering is attachment',
      'Be present in this moment',
      'Compassion for all beings',
      'The Four Noble Truths',
      'Right mindfulness',
      'The Eightfold Path',
      'Hatred does not cease by hatred',
      'The mind is everything'
    ],
    teachingApproach: 'Gentle, practical, and compassionate. Focuses on understanding suffering and the path to liberation through mindfulness and compassion.'
  },
  
  krishnamurti: {
    personality: {
      playfulness: 2,
      directness: 10,
      compassion: 8,
      wisdom: 10,
      humor: 1,
      provocation: 8,
      mysticism: 4,
      practicality: 7
    },
    communicationStyle: {
      tone: 'firm',
      method: 'questioning',
      complexity: 'advanced',
      length: 'long'
    },
    keyConcepts: ['freedom', 'awareness', 'conditioning', 'observation', 'inquiry', 'revolution', 'transformation', 'truth'],
    commonPhrases: [
      'Freedom from the known',
      'The observer is the observed',
      'Question everything',
      'Be a light unto yourself',
      'Freedom is not a reaction',
      'The ending of thought',
      'Revolution in consciousness',
      'Truth is a pathless land'
    ],
    teachingApproach: 'Direct questioning and inquiry. Challenges all authority and conditioning, encouraging radical self-inquiry and freedom from psychological dependence.'
  },
  
  vivekananda: {
    personality: {
      playfulness: 4,
      directness: 8,
      compassion: 9,
      wisdom: 10,
      humor: 3,
      provocation: 5,
      mysticism: 8,
      practicality: 8
    },
    communicationStyle: {
      tone: 'firm',
      method: 'practical',
      complexity: 'intermediate',
      length: 'medium'
    },
    keyConcepts: ['self-realization', 'service', 'strength', 'divinity', 'unity', 'practicality', 'renunciation', 'work'],
    commonPhrases: [
      'Arise, awake, and stop not till the goal is reached',
      'You are divine',
      'Work is worship',
      'Strength is life, weakness is death',
      'Serve humanity',
      'All religions lead to the same goal',
      'Be practical',
      'The divine is within you'
    ],
    teachingApproach: 'Inspiring and practical. Emphasizes self-realization through service, strength, and practical application of spiritual principles.'
  }
};

// Response templates for different types of questions
const RESPONSE_TEMPLATES = {
  meditation: {
    osho: [
      "Meditation is not concentration. It is awareness - total awareness of everything that is happening around you and within you. {personalization}",
      "When you meditate, you are not trying to achieve anything. You are simply being present with whatever is. {personalization}",
      "Meditation is the art of doing nothing. Just sit and watch the mind. {personalization}"
    ],
    buddha: [
      "Right mindfulness is the key to meditation. Be present with your breath and observe without judgment. {personalization}",
      "Meditation is not about stopping thoughts, but about observing them with awareness. {personalization}",
      "Through meditation, we develop the wisdom to see the true nature of reality. {personalization}"
    ],
    krishnamurti: [
      "Meditation is not a technique. It is the understanding of the mind and its conditioning. {personalization}",
      "True meditation is the observation of thought without the observer. {personalization}",
      "Meditation is the ending of thought, not the control of thought. {personalization}"
    ],
    vivekananda: [
      "Meditation is the path to self-realization. Through regular practice, you discover your divine nature. {personalization}",
      "In meditation, you connect with the infinite within you. {personalization}",
      "Meditation is not escape from life, but the highest form of living. {personalization}"
    ]
  },
  
  love: {
    osho: [
      "Love is the only religion. When you love, you don't need any other religion. {personalization}",
      "Love is not a relationship, it is a state of being. {personalization}",
      "True love is unconditional - it doesn't depend on the other person. {personalization}"
    ],
    buddha: [
      "Compassion for all beings brings inner peace and happiness. {personalization}",
      "Love and compassion are the foundation of all spiritual practice. {personalization}",
      "When you love without attachment, you find true freedom. {personalization}"
    ],
    krishnamurti: [
      "Love is not a feeling, it is a state of being that comes with freedom from the self. {personalization}",
      "True love is without motive, without cause. {personalization}",
      "Love is the absence of the self. {personalization}"
    ],
    vivekananda: [
      "Love is the highest form of worship. Serve others with love and devotion. {personalization}",
      "Through love, we realize our unity with all beings. {personalization}",
      "Love is the divine force that transforms everything it touches. {personalization}"
    ]
  },
  
  awareness: {
    osho: [
      "Awareness is the key to transformation. Be aware of everything that is happening within and without. {personalization}",
      "When you are aware, you are no longer asleep. {personalization}",
      "Awareness is meditation in action. {personalization}"
    ],
    buddha: [
      "Right awareness leads to right understanding. {personalization}",
      "Through awareness, we see the true nature of suffering and its causes. {personalization}",
      "Mindfulness is the path to enlightenment. {personalization}"
    ],
    krishnamurti: [
      "Awareness is the ending of the observer and the observed. {personalization}",
      "True awareness is without choice, without judgment. {personalization}",
      "Awareness is the revolution in consciousness. {personalization}"
    ],
    vivekananda: [
      "Self-awareness is the beginning of self-realization. {personalization}",
      "Through awareness, you discover your divine nature. {personalization}",
      "Awareness is the light that dispels the darkness of ignorance. {personalization}"
    ]
  }
};

// Personalization patterns based on user context
const PERSONALIZATION_PATTERNS = {
  beginner: [
    "Start with small steps",
    "Be patient with yourself",
    "This is a journey, not a destination",
    "Every master was once a beginner"
  ],
  intermediate: [
    "You are making good progress",
    "Deeper understanding comes with practice",
    "Trust your inner wisdom",
    "The path becomes clearer as you walk it"
  ],
  advanced: [
    "Your understanding is deepening",
    "You are ready for deeper truths",
    "The mystery reveals itself to the prepared mind",
    "Your practice is bearing fruit"
  ],
  struggling: [
    "This too shall pass",
    "Challenges are opportunities for growth",
    "You are stronger than you know",
    "Every difficulty is a teacher"
  ],
  celebrating: [
    "Celebrate this moment of understanding",
    "Your joy is a sign of progress",
    "Rejoice in your spiritual growth",
    "This is a beautiful moment of awakening"
  ]
};

class SpiritualAIService {
  private static instance: SpiritualAIService;
  private hybridAI: any = null; // Will be loaded dynamically
  
  static getInstance(): SpiritualAIService {
    if (!SpiritualAIService.instance) {
      SpiritualAIService.instance = new SpiritualAIService();
    }
    return SpiritualAIService.instance;
  }

  // Generate AI response using real AI API
  async generateResponse(
    question: string,
    teacher: SpiritualTeacher,
    context: SpiritualContext,
    conversationHistory: SpiritualMessage[]
  ): Promise<{
    response: string;
    followUpQuestions: string[];
    relatedTeachings: string[];
    practice?: string;
  }> {
    console.log('🤖 Spiritual AI - Generating response for:', {
      question: question.substring(0, 50) + '...',
      teacherId: teacher.id,
      teacherName: teacher.displayName,
      userLevel: context.userLevel
    });

    try {
      // Prepare AI request
      const aiRequest: AIRequest = {
        question,
        teacherId: teacher.id,
        userLevel: context.userLevel,
        currentChallenges: context.currentChallenges || [],
        spiritualGoals: context.spiritualGoals || [],
        recentInsights: context.recentInsights || [],
        practiceHistory: context.practiceHistory || [],
        emotionalState: context.emotionalState?.mood || 'neutral',
        conversationHistory: conversationHistory.map(msg => `${msg.role}: ${msg.content}`)
      };

      // Call real AI API
      const apiResponse = await apiService.generateAIResponse(aiRequest);

      if (apiResponse.success && apiResponse.data) {
        console.log('✅ Spiritual AI - Real AI response generated:', {
          source: apiResponse.data.source,
          confidence: apiResponse.data.confidence,
          processingTime: apiResponse.data.processingTimeMs + 'ms'
        });

        return {
          response: apiResponse.data.response,
          followUpQuestions: apiResponse.data.followUpQuestions,
          relatedTeachings: apiResponse.data.relatedTeachings,
          practice: apiResponse.data.practice
        };
      } else {
        throw new Error(apiResponse.error?.message || 'Failed to get AI response');
      }

    } catch (error) {
      console.error('❌ Spiritual AI - Error with real AI API:', error);
      
      // Fallback to template system
      return this.generateFallbackResponse(question, teacher, context);
    }
  }

  private async generateFallbackResponse(
    question: string,
    teacher: SpiritualTeacher,
    context: SpiritualContext
  ): Promise<{
    response: string;
    followUpQuestions: string[];
    relatedTeachings: string[];
    practice?: string;
  }> {
    console.log('🆘 Using fallback response system');

    const teacherConfig = TEACHER_AI_CONFIGS[teacher.id];
    if (!teacherConfig) {
      throw new Error(`No AI configuration found for teacher: ${teacher.id}`);
    }

    // Use original logic as fallback
    const topic = this.analyzeQuestionTopic(question);
    const baseResponse = this.getBaseResponse(topic, teacher.id, teacherConfig);
    const personalizedResponse = this.personalizeResponse(baseResponse, context, teacherConfig, []);
    const followUpQuestions = this.generateFollowUpQuestions(topic, teacherConfig, context);
    const relatedTeachings = this.suggestRelatedTeachings(topic, teacherConfig);
    const practice = this.suggestPractice(topic, teacherConfig, context);

    return {
      response: personalizedResponse,
      followUpQuestions,
      relatedTeachings,
      practice
    };
  }

  // Analyze question to determine topic
  private analyzeQuestionTopic(question: string): string {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('meditation') || lowerQuestion.includes('meditate')) {
      return 'meditation';
    } else if (lowerQuestion.includes('love') || lowerQuestion.includes('relationship')) {
      return 'love';
    } else if (lowerQuestion.includes('awareness') || lowerQuestion.includes('consciousness')) {
      return 'awareness';
    } else if (lowerQuestion.includes('suffering') || lowerQuestion.includes('pain')) {
      return 'suffering';
    } else if (lowerQuestion.includes('enlightenment') || lowerQuestion.includes('awakening')) {
      return 'enlightenment';
    } else if (lowerQuestion.includes('freedom') || lowerQuestion.includes('liberation')) {
      return 'freedom';
    } else {
      return 'general';
    }
  }

  // Get base response template
  private getBaseResponse(topic: string, teacherId: string, config: TeacherAIConfig): string {
    const templates = RESPONSE_TEMPLATES[topic as keyof typeof RESPONSE_TEMPLATES];
    if (!templates || !templates[teacherId as keyof typeof templates]) {
      // Fallback to general response
      return this.generateGeneralResponse(teacherId, config);
    }
    
    const teacherTemplates = templates[teacherId as keyof typeof templates];
    const randomTemplate = teacherTemplates[Math.floor(Math.random() * teacherTemplates.length)];
    
    return randomTemplate;
  }

  // Generate general response when no specific template exists
  private generateGeneralResponse(teacherId: string, config: TeacherAIConfig): string {
    const phrases = config.commonPhrases;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    // Add teacher-specific elaboration
    const elaborations = {
      osho: "This is a profound truth that can transform your life if you understand it deeply.",
      buddha: "This teaching can guide you on the path to liberation from suffering.",
      krishnamurti: "This requires deep inquiry and understanding, not mere intellectual acceptance.",
      vivekananda: "This is the essence of all spiritual teachings - realize your divine nature."
    };
    
    return `${randomPhrase} ${elaborations[teacherId as keyof typeof elaborations]}`;
  }

  // Personalize response based on context
  private personalizeResponse(
    baseResponse: string,
    context: SpiritualContext,
    config: TeacherAIConfig,
    conversationHistory: SpiritualMessage[]
  ): string {
    let personalizedResponse = baseResponse;
    
    // Add personalization based on user level
    const levelPatterns = PERSONALIZATION_PATTERNS[context.userLevel as keyof typeof PERSONALIZATION_PATTERNS] || [];
    if (levelPatterns.length > 0) {
      const randomPattern = levelPatterns[Math.floor(Math.random() * levelPatterns.length)];
      personalizedResponse = personalizedResponse.replace('{personalization}', randomPattern);
    } else {
      personalizedResponse = personalizedResponse.replace('{personalization}', '');
    }
    
    // Add context-specific elements
    if (context.currentChallenges && context.currentChallenges.length > 0) {
      const challenge = context.currentChallenges[0];
      personalizedResponse += ` Regarding your current challenge with ${challenge}, remember that every difficulty is an opportunity for growth.`;
    }
    
    // Add teacher-specific personality elements
    if (config.personality.humor > 7) {
      personalizedResponse += this.addHumorElement(teacherId);
    }
    
    if (config.personality.provocation > 7) {
      personalizedResponse += this.addProvocativeElement(teacherId);
    }
    
    return personalizedResponse;
  }

  // Add humor element (Osho-style)
  private addHumorElement(teacherId: string): string {
    const humorElements = {
      osho: " 😄 Life is too serious to be taken seriously!",
      buddha: " May this bring a smile to your heart.",
      krishnamurti: " (Though I know you might not find this amusing!)",
      vivekananda: " Let joy be your companion on this journey."
    };
    return humorElements[teacherId as keyof typeof humorElements] || "";
  }

  // Add provocative element (Krishnamurti-style)
  private addProvocativeElement(teacherId: string): string {
    const provocativeElements = {
      osho: " Question everything, even this!",
      buddha: " Investigate this for yourself.",
      krishnamurti: " Don't accept this - find out for yourself!",
      vivekananda: " Test this truth in your own experience."
    };
    return provocativeElements[teacherId as keyof typeof provocativeElements] || "";
  }

  // Generate follow-up questions
  private generateFollowUpQuestions(topic: string, config: TeacherAIConfig, context: SpiritualContext): string[] {
    const followUpQuestions = {
      meditation: [
        "How can I make meditation a daily practice?",
        "What should I do when my mind wanders during meditation?",
        "How long should I meditate each day?",
        "What is the difference between concentration and meditation?"
      ],
      love: [
        "How can I love without attachment?",
        "What is the difference between love and attachment?",
        "How can I love myself more?",
        "How can I show love to difficult people?"
      ],
      awareness: [
        "How can I be more aware in daily life?",
        "What is the difference between awareness and attention?",
        "How can I develop continuous awareness?",
        "What blocks my awareness?"
      ]
    };
    
    const topicQuestions = followUpQuestions[topic as keyof typeof followUpQuestions] || [
      "Can you tell me more about this?",
      "How can I apply this in my daily life?",
      "What is the next step in my spiritual journey?"
    ];
    
    // Return 2-3 random questions
    return topicQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(3, topicQuestions.length));
  }

  // Suggest related teachings
  private suggestRelatedTeachings(topic: string, config: TeacherAIConfig): string[] {
    const teachingSuggestions = {
      meditation: [
        "The Art of Witnessing",
        "Breathing Techniques",
        "Mindfulness in Daily Life",
        "The Nature of Mind"
      ],
      love: [
        "Unconditional Love",
        "Love and Relationships",
        "Self-Love and Acceptance",
        "Compassion for All Beings"
      ],
      awareness: [
        "Present Moment Awareness",
        "The Observer and the Observed",
        "Consciousness and Reality",
        "The Nature of Awareness"
      ]
    };
    
    return teachingSuggestions[topic as keyof typeof teachingSuggestions] || [
      "Core Teachings",
      "Spiritual Practices",
      "Wisdom Quotes"
    ];
  }

  // Suggest practice
  private suggestPractice(topic: string, config: TeacherAIConfig, context: SpiritualContext): string | undefined {
    const practiceSuggestions = {
      meditation: [
        "Witnessing Meditation (20 minutes)",
        "Breathing Awareness (10 minutes)",
        "Walking Meditation (15 minutes)",
        "Loving-Kindness Meditation (15 minutes)"
      ],
      love: [
        "Metta Meditation (20 minutes)",
        "Heart Opening Practice (15 minutes)",
        "Compassion Meditation (20 minutes)",
        "Self-Love Practice (10 minutes)"
      ],
      awareness: [
        "Mindfulness of Breath (15 minutes)",
        "Body Scan Meditation (20 minutes)",
        "Awareness of Thoughts (10 minutes)",
        "Present Moment Practice (5 minutes)"
      ]
    };
    
    const practices = practiceSuggestions[topic as keyof typeof practiceSuggestions];
    if (practices && practices.length > 0) {
      return practices[Math.floor(Math.random() * practices.length)];
    }
    
    return undefined;
  }

  // Generate daily guidance using real AI API
  async generateDailyGuidance(
    teacher: SpiritualTeacher,
    context: SpiritualContext
  ): Promise<{
    morningWisdom: string;
    eveningReflection: string;
    dailyPractice: string;
    inspirationalQuote: string;
  }> {
    try {
      // Get user ID from context (you might need to pass this differently)
      const userId = 'current-user'; // This should come from the context or auth
      
      // Call real AI API for daily guidance
      const apiResponse = await apiService.getDailyGuidance(teacher.id, userId);

      if (apiResponse.success && apiResponse.data) {
        // Parse the AI response to extract different parts
        const aiResponse = apiResponse.data.response;
        
        // For now, use the AI response for all parts
        // In a more sophisticated implementation, you could ask for specific parts
        return {
          morningWisdom: aiResponse,
          eveningReflection: aiResponse,
          dailyPractice: apiResponse.data.practice || "Meditation (20 minutes)",
          inspirationalQuote: apiResponse.data.relatedTeachings[0] || "Wisdom comes from within"
        };
      } else {
        throw new Error(apiResponse.error?.message || 'Failed to get daily guidance');
      }
    } catch (error) {
      console.error('❌ Spiritual AI - Error getting daily guidance:', error);
      
      // Fallback to template system
      const teacherConfig = TEACHER_AI_CONFIGS[teacher.id];
      if (!teacherConfig) {
        throw new Error(`No AI configuration found for teacher: ${teacher.id}`);
      }

      const morningWisdom = this.generateMorningWisdom(teacherConfig, context);
      const eveningReflection = this.generateEveningReflection(teacherConfig, context);
      const dailyPractice = this.generateDailyPractice(teacherConfig, context);
      const inspirationalQuote = this.generateInspirationalQuote(teacherConfig);

      return {
        morningWisdom,
        eveningReflection,
        dailyPractice,
        inspirationalQuote
      };
    }
  }

  private generateMorningWisdom(config: TeacherAIConfig, context: SpiritualContext): string {
    const morningMessages = {
      osho: [
        "Start your day with awareness. Be present in each moment as it unfolds.",
        "This morning, celebrate being alive. Life is a gift to be cherished.",
        "Begin your day with gratitude and watch how it transforms everything."
      ],
      buddha: [
        "Start your day with mindfulness. Be aware of your breath and your thoughts.",
        "This morning, cultivate compassion for yourself and all beings.",
        "Begin your day with right intention and watch your actions follow."
      ],
      krishnamurti: [
        "This morning, observe your mind without judgment. See what is, not what should be.",
        "Start your day with fresh awareness, free from yesterday's conditioning.",
        "Begin your day with inquiry - question everything you think you know."
      ],
      vivekananda: [
        "Arise with strength and determination. This day is yours to make divine.",
        "Start your day with the knowledge that you are divine. Act accordingly.",
        "Begin your day with service to others and watch your own growth unfold."
      ]
    };
    
    const messages = morningMessages[config as any] || morningMessages.osho;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private generateEveningReflection(config: TeacherAIConfig, context: SpiritualContext): string {
    const eveningMessages = {
      osho: [
        "Reflect on your day. What moments brought you joy? What taught you something new?",
        "As you end your day, be grateful for all the experiences that shaped you.",
        "Evening is a time for celebration. Celebrate the day that was, the growth that happened."
      ],
      buddha: [
        "Reflect on your day with compassion. What did you learn about yourself?",
        "As you end your day, send loving-kindness to all beings, including yourself.",
        "Evening is a time for mindfulness. Be present with your thoughts and feelings."
      ],
      krishnamurti: [
        "Reflect on your day without judgment. What patterns did you observe in yourself?",
        "As you end your day, question your assumptions and beliefs.",
        "Evening is a time for inquiry. What did you discover about your conditioning?"
      ],
      vivekananda: [
        "Reflect on your day with strength. How did you serve others? How did you grow?",
        "As you end your day, remember your divine nature and your purpose.",
        "Evening is a time for gratitude. Be thankful for the opportunities to grow and serve."
      ]
    };
    
    const messages = eveningMessages[config as any] || eveningMessages.osho;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private generateDailyPractice(config: TeacherAIConfig, context: SpiritualContext): string {
    const practices = [
      "Witnessing Meditation (20 minutes)",
      "Breathing Awareness (15 minutes)",
      "Mindfulness of Thoughts (10 minutes)",
      "Loving-Kindness Practice (15 minutes)",
      "Body Scan Meditation (20 minutes)",
      "Walking Meditation (15 minutes)",
      "Gratitude Practice (10 minutes)",
      "Present Moment Awareness (5 minutes)"
    ];
    
    return practices[Math.floor(Math.random() * practices.length)];
  }

  private generateInspirationalQuote(config: TeacherAIConfig): string {
    const quotes = config.commonPhrases;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
}

export default SpiritualAIService;
