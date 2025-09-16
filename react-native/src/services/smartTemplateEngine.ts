// Smart Template Engine - Enhanced template system with personalization and context awareness

import { SpiritualTeacher, SpiritualContext } from '@/types/spiritual';
import { Intent, QuestionAnalysis } from './intentClassifier';

interface TemplateResponse {
  response: string;
  followUpQuestions: string[];
  relatedTeachings: string[];
  practice?: string;
  confidence: number;
}

interface TeacherTemplates {
  [category: string]: {
    responses: string[];
    followUps: string[];
    teachings: string[];
    practices: string[];
  };
}

class SmartTemplateEngine {
  private static instance: SmartTemplateEngine;
  
  // Enhanced templates with personalization placeholders
  private teacherTemplates: Record<string, TeacherTemplates> = {
    osho: {
      meditation: {
        responses: [
          "Meditation is not concentration, {name}. It is awareness - total awareness of everything happening around you and within you. {personalization}",
          "When you meditate, you are not trying to achieve anything. You are simply being present with whatever is. {personalization}",
          "Meditation is the art of doing nothing, {name}. Just sit and watch the mind like you watch clouds in the sky. {personalization}",
          "The beauty of meditation is in its simplicity. Don't make it complicated. {personalization}",
          "Meditation happens when you are not doing it. It is a state of being, not doing. {personalization}"
        ],
        followUps: [
          "How can I make meditation a daily practice?",
          "What should I do when my mind wanders during meditation?",
          "How long should I meditate each day?",
          "What is the difference between concentration and meditation?"
        ],
        teachings: [
          "The Art of Witnessing",
          "Dynamic Meditation Technique",
          "Meditation: The First and Last Freedom",
          "The Science of Enlightenment"
        ],
        practices: [
          "Witnessing Meditation (20 minutes)",
          "Dynamic Meditation (60 minutes)",
          "Breathing Awareness (15 minutes)",
          "Walking Meditation (30 minutes)"
        ]
      },
      love: {
        responses: [
          "Love is the only religion, {name}. When you love, you don't need any other religion. {personalization}",
          "Love is not a relationship, it is a state of being. You are love itself. {personalization}",
          "True love is unconditional - it doesn't depend on the other person. {personalization}",
          "Love yourself first, {name}, and then that love will overflow to others. {personalization}",
          "Love is not something you do, it is something you are. {personalization}"
        ],
        followUps: [
          "How can I love without attachment?",
          "What is the difference between love and attachment?",
          "How can I love myself more?",
          "How do I love difficult people?"
        ],
        teachings: [
          "Love, Freedom, Aloneness",
          "The Book of Understanding",
          "Intimacy: Trusting Oneself and the Other",
          "The Art of Loving"
        ],
        practices: [
          "Heart Opening Meditation (20 minutes)",
          "Loving-Kindness Practice (15 minutes)",
          "Self-Love Meditation (25 minutes)",
          "Compassion Meditation (30 minutes)"
        ]
      },
      personal: {
        responses: [
          "I am Osho, {name} - a spiritual rebel who celebrates life in all its colors. I am here to provoke you into awakening. {personalization}",
          "I am not a teacher, I am a catalytic agent. I don't give you the truth, I help you discover your own truth. {personalization}",
          "I am Osho - lover of life, celebrant of existence, and friend to all seekers like you, {name}. {personalization}",
          "I am a finger pointing to the moon, {name}. Don't get caught up with the finger - look at the moon! {personalization}"
        ],
        followUps: [
          "What is your philosophy?",
          "How did you become enlightened?",
          "What is your teaching method?",
          "What makes you different from other teachers?"
        ],
        teachings: [
          "Autobiography of a Spiritually Incorrect Mystic",
          "The Rebellious Spirit",
          "My Way: The Way of the White Clouds",
          "The Philosophy of Celebration"
        ],
        practices: [
          "Dynamic Meditation (60 minutes)",
          "Celebration Dance (30 minutes)",
          "Laughter Meditation (20 minutes)",
          "Freedom Expression (45 minutes)"
        ]
      },
      general: {
        responses: [
          "Life is a mystery to be lived, not a problem to be solved, {name}. {personalization}",
          "The meaning of life is life itself. Stop searching and start living! {personalization}",
          "You are already perfect, {name}. You just need to remember it. {personalization}",
          "Don't take life so seriously. It's just a cosmic joke! {personalization}"
        ],
        followUps: [
          "How can I find my purpose?",
          "What is the meaning of existence?",
          "How do I live more fully?",
          "What is enlightenment?"
        ],
        teachings: [
          "The Book of Wisdom",
          "Everyday Osho",
          "Living on Your Own Terms",
          "The Path of Love"
        ],
        practices: [
          "Life Celebration Practice (30 minutes)",
          "Present Moment Awareness (15 minutes)",
          "Gratitude Meditation (20 minutes)",
          "Joy Cultivation (25 minutes)"
        ]
      }
    },
    
    buddha: {
      meditation: {
        responses: [
          "Right mindfulness is the key to meditation, {name}. Be present with your breath and observe without judgment. {personalization}",
          "Meditation is not about stopping thoughts, but about observing them with awareness. {personalization}",
          "Through meditation, we develop the wisdom to see the true nature of reality. {personalization}",
          "The mind is like a monkey, {name}. Meditation helps tame this restless mind. {personalization}"
        ],
        followUps: [
          "How do I practice mindfulness?",
          "What is Vipassana meditation?",
          "How do I deal with distractions?",
          "What is the goal of meditation?"
        ],
        teachings: [
          "The Foundations of Mindfulness",
          "The Noble Eightfold Path",
          "Vipassana: Insight Meditation",
          "The Art of Living"
        ],
        practices: [
          "Mindfulness of Breathing (20 minutes)",
          "Vipassana Meditation (45 minutes)",
          "Walking Meditation (30 minutes)",
          "Body Scan Meditation (25 minutes)"
        ]
      },
      suffering: {
        responses: [
          "The root of suffering is attachment, {name}. When we let go of our attachments, we find peace. {personalization}",
          "Suffering is caused by craving and aversion. The middle way leads to liberation. {personalization}",
          "Pain is inevitable, but suffering is optional. {personalization}",
          "Understanding the Four Noble Truths leads to the end of suffering, {name}. {personalization}"
        ],
        followUps: [
          "What are the Four Noble Truths?",
          "How do I let go of attachment?",
          "What is the middle way?",
          "How do I deal with difficult emotions?"
        ],
        teachings: [
          "The Four Noble Truths",
          "The Dhammapada",
          "The Heart of Buddhist Wisdom",
          "Liberation from Suffering"
        ],
        practices: [
          "Loving-Kindness Meditation (30 minutes)",
          "Compassion Practice (25 minutes)",
          "Equanimity Meditation (20 minutes)",
          "Forgiveness Practice (35 minutes)"
        ]
      },
      personal: {
        responses: [
          "I am the Buddha, {name} - the awakened one who found the path to liberation from suffering. {personalization}",
          "I am Siddhartha Gautama, who became the Buddha through understanding the nature of suffering and its cessation. {personalization}",
          "I am your friend on the path, {name}, showing you the way to enlightenment through compassion and wisdom. {personalization}",
          "I am the one who discovered that enlightenment is possible for all beings. You too can awaken, {name}. {personalization}"
        ],
        followUps: [
          "How did you become enlightened?",
          "What is the Eightfold Path?",
          "What is your core teaching?",
          "How can I follow your path?"
        ],
        teachings: [
          "The Life of the Buddha",
          "The Dhammapada",
          "Buddhist Wisdom",
          "The Path to Enlightenment"
        ],
        practices: [
          "Buddhist Meditation (40 minutes)",
          "Compassion Cultivation (30 minutes)",
          "Mindfulness Practice (25 minutes)",
          "Noble Silence (60 minutes)"
        ]
      },
      general: {
        responses: [
          "The path to peace begins with understanding, {name}. All suffering can be overcome through wisdom and compassion. {personalization}",
          "Life is precious, {name}. Every moment is an opportunity for awakening and growth. {personalization}",
          "The Four Noble Truths guide us to liberation from all forms of suffering. {personalization}",
          "Compassion for all beings, including yourself, is the foundation of happiness. {personalization}"
        ],
        followUps: [
          "What are the Four Noble Truths?",
          "How can I develop compassion?",
          "What is the path to enlightenment?",
          "How do I find inner peace?"
        ],
        teachings: [
          "The Four Noble Truths",
          "The Eightfold Path",
          "Buddhist Wisdom",
          "Compassionate Living"
        ],
        practices: [
          "Mindfulness Meditation (20 minutes)",
          "Loving-Kindness Practice (25 minutes)",
          "Compassion Meditation (30 minutes)",
          "Peace Cultivation (15 minutes)"
        ]
      }
    },

    krishnamurti: {
      awareness: {
        responses: [
          "Awareness is the ending of the observer and the observed, {name}. True awareness is without choice, without judgment. {personalization}",
          "The revolution in consciousness begins with total awareness of what is. {personalization}",
          "Don't accept what I'm saying, {name}. Find out for yourself what awareness truly means. {personalization}",
          "Awareness is not concentration. It is the complete attention to the whole of life. {personalization}"
        ],
        followUps: [
          "What is the difference between awareness and attention?",
          "How do I develop choiceless awareness?",
          "What does it mean that the observer is the observed?",
          "How do I break free from conditioning?"
        ],
        teachings: [
          "Freedom from the Known",
          "The Awakening of Intelligence",
          "Think on These Things",
          "The Revolution in Consciousness"
        ],
        practices: [
          "Choiceless Awareness (30 minutes)",
          "Self-Inquiry Practice (45 minutes)",
          "Observation Without Judgment (25 minutes)",
          "Breaking Conditioning Exercise (35 minutes)"
        ]
      },
      freedom: {
        responses: [
          "Freedom is not a reaction, {name}. Freedom is not from something, but the total understanding of life. {personalization}",
          "You are conditioned by society, religion, education. True freedom is breaking free from all conditioning. {personalization}",
          "Freedom comes when you understand the nature of your own mind, {name}. {personalization}",
          "Don't seek freedom - you ARE freedom. You just need to stop creating bondage. {personalization}"
        ],
        followUps: [
          "How do I break free from conditioning?",
          "What is psychological freedom?",
          "How do I live without authority?",
          "What is the nature of choice?"
        ],
        teachings: [
          "Freedom from the Known",
          "The Ending of Time",
          "Truth and Actuality",
          "The Network of Thought"
        ],
        practices: [
          "Self-Inquiry Meditation (40 minutes)",
          "Questioning Exercise (30 minutes)",
          "Freedom Contemplation (35 minutes)",
          "Authority Rejection Practice (25 minutes)"
        ]
      },
      personal: {
        responses: [
          "I am Krishnamurti, {name} - one who dissolved the World Teacher organization because truth is a pathless land. {personalization}",
          "I am not your guru or teacher. I am pointing out what is. You must see for yourself. {personalization}",
          "I am Krishnamurti, who spent his life questioning everything - including himself. Question me too, {name}! {personalization}",
          "I am the one who said 'truth is a pathless land.' Don't follow me - find your own way, {name}. {personalization}"
        ],
        followUps: [
          "Why did you dissolve the World Teacher organization?",
          "What is your teaching method?",
          "Why do you reject all authority?",
          "What is your core message?"
        ],
        teachings: [
          "The Dissolution of the Order",
          "Truth is a Pathless Land",
          "The Art of Listening",
          "Questioning Everything"
        ],
        practices: [
          "Radical Inquiry (45 minutes)",
          "Authority Questioning (30 minutes)",
          "Truth Investigation (40 minutes)",
          "Freedom Exploration (35 minutes)"
        ]
      }
    },

    vivekananda: {
      practice: {
        responses: [
          "Arise, awake, and stop not till the goal is reached, {name}! Strength is what you need for spiritual practice. {personalization}",
          "You are divine, {name}. Your practice should help you realize this divinity within. {personalization}",
          "Work is worship. Make your spiritual practice a service to humanity. {personalization}",
          "Be practical in your spirituality, {name}. Realize God through service and strength. {personalization}"
        ],
        followUps: [
          "How do I develop spiritual strength?",
          "What is Karma Yoga?",
          "How do I serve others?",
          "What is practical Vedanta?"
        ],
        teachings: [
          "Karma Yoga: The Path of Action",
          "Raja Yoga: The Science of Self-Control",
          "Bhakti Yoga: The Path of Devotion",
          "Practical Vedanta"
        ],
        practices: [
          "Karma Yoga Service (60 minutes)",
          "Strength Meditation (30 minutes)",
          "Devotional Practice (40 minutes)",
          "Self-Realization Meditation (45 minutes)"
        ]
      },
      personal: {
        responses: [
          "I am Swami Vivekananda, {name} - disciple of Sri Ramakrishna and servant of humanity. {personalization}",
          "I am Narendranath Datta, who became Vivekananda to serve God in man. {personalization}",
          "I am the one who brought Vedanta to the West, {name}. You too are divine - realize it! {personalization}",
          "I am Vivekananda, who believes in the strength of the human spirit and the divinity within all. {personalization}"
        ],
        followUps: [
          "What is your message to the world?",
          "How did you meet Ramakrishna?",
          "What is Vedanta?",
          "How do I realize my divinity?"
        ],
        teachings: [
          "The Life of Vivekananda",
          "Lectures from Colombo to Almora",
          "The Four Yogas",
          "Practical Vedanta"
        ],
        practices: [
          "Divine Realization Meditation (45 minutes)",
          "Strength Cultivation (30 minutes)",
          "Service Practice (60 minutes)",
          "Unity Meditation (35 minutes)"
        ]
      }
    }
  };

  // Personalization patterns based on user context
  private personalizationPatterns = {
    beginner: [
      "As a beginner, start with small steps",
      "Be patient with yourself on this journey",
      "Every master was once a beginner like you",
      "Take your time to understand this deeply"
    ],
    intermediate: [
      "Your practice is deepening beautifully",
      "You're ready for deeper understanding",
      "Trust your growing inner wisdom",
      "Your journey is unfolding perfectly"
    ],
    advanced: [
      "Your advanced understanding allows for subtler insights",
      "You can now explore the deeper mysteries",
      "Your maturity in practice shows",
      "The path becomes clearer with your experience"
    ],
    troubled: [
      "In your current difficulties, remember this",
      "Though you face challenges, know that",
      "Your struggles are part of the path",
      "This difficult time will pass, and"
    ],
    seeking: [
      "Your sincere seeking will be rewarded",
      "Your earnest question deserves a deep answer",
      "Your spiritual hunger is beautiful",
      "Keep seeking with this intensity"
    ],
    curious: [
      "Your curiosity is the beginning of wisdom",
      "Such questions show a awakening mind",
      "Your intellectual inquiry is valuable",
      "Question everything, including this answer"
    ]
  };

  static getInstance(): SmartTemplateEngine {
    if (!SmartTemplateEngine.instance) {
      SmartTemplateEngine.instance = new SmartTemplateEngine();
    }
    return SmartTemplateEngine.instance;
  }

  async generateTemplateResponse(
    teacher: SpiritualTeacher,
    analysis: QuestionAnalysis,
    context: SpiritualContext,
    question: string
  ): Promise<TemplateResponse> {
    console.log('📝 Template Engine - Generating response for:', {
      teacherId: teacher.id,
      category: analysis.intent.category,
      isCommon: analysis.isCommonQuestion,
      confidence: analysis.intent.confidence
    });

    const teacherTemplates = this.teacherTemplates[teacher.id];
    if (!teacherTemplates) {
      throw new Error(`No templates found for teacher: ${teacher.id}`);
    }

    const categoryTemplates = teacherTemplates[analysis.intent.category] || teacherTemplates['general'];
    if (!categoryTemplates) {
      throw new Error(`No templates found for category: ${analysis.intent.category}`);
    }

    // Select response based on context and randomization
    const response = this.selectResponse(categoryTemplates.responses, context, analysis);
    const personalizedResponse = this.personalizeResponse(response, context, analysis, teacher);

    // Generate follow-up questions
    const followUpQuestions = this.selectFollowUps(categoryTemplates.followUps, analysis);

    // Select related teachings
    const relatedTeachings = this.selectTeachings(categoryTemplates.teachings, analysis);

    // Select practice if appropriate
    const practice = this.selectPractice(categoryTemplates.practices, context, analysis);

    const result: TemplateResponse = {
      response: personalizedResponse,
      followUpQuestions,
      relatedTeachings,
      practice,
      confidence: analysis.isCommonQuestion ? 0.95 : 0.8
    };

    console.log('✅ Template Engine - Response generated successfully');
    return result;
  }

  private selectResponse(responses: string[], context: SpiritualContext, analysis: QuestionAnalysis): string {
    // For now, use random selection
    // TODO: Implement smarter selection based on user history, preferences, etc.
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  private personalizeResponse(
    response: string, 
    context: SpiritualContext, 
    analysis: QuestionAnalysis,
    teacher: SpiritualTeacher
  ): string {
    let personalized = response;

    // Replace {name} placeholder
    personalized = personalized.replace(/{name}/g, 'friend'); // Could be personalized with actual name

    // Replace {personalization} with context-appropriate message
    const personalizationKey = this.getPersonalizationKey(context, analysis);
    const personalizationOptions = this.personalizationPatterns[personalizationKey] || this.personalizationPatterns.beginner;
    const randomPersonalization = personalizationOptions[Math.floor(Math.random() * personalizationOptions.length)];
    
    personalized = personalized.replace(/{personalization}/g, randomPersonalization + '.');

    // Add teacher-specific flourishes
    personalized = this.addTeacherFlourish(personalized, teacher, analysis);

    return personalized;
  }

  private getPersonalizationKey(context: SpiritualContext, analysis: QuestionAnalysis): keyof typeof SmartTemplateEngine.prototype.personalizationPatterns {
    // Priority order: emotional tone, then spiritual level
    if (analysis.emotionalTone === 'troubled') return 'troubled';
    if (analysis.emotionalTone === 'seeking') return 'seeking';
    if (analysis.emotionalTone === 'curious') return 'curious';
    
    return context.userLevel as keyof typeof SmartTemplateEngine.prototype.personalizationPatterns;
  }

  private addTeacherFlourish(response: string, teacher: SpiritualTeacher, analysis: QuestionAnalysis): string {
    const flourishes = {
      osho: [
        " 😄 Life is too beautiful to be serious all the time!",
        " Remember, you are here to celebrate existence!",
        " Don't make it a philosophy - live it!",
        " And don't forget to laugh at yourself sometimes!"
      ],
      buddha: [
        " May this bring you peace and understanding.",
        " Walk the path with compassion for yourself.",
        " Remember, you have the Buddha nature within.",
        " May all beings be happy and free from suffering."
      ],
      krishnamurti: [
        " But don't accept this - investigate it yourself!",
        " Question everything, including what I just said!",
        " Truth cannot be given - it must be discovered.",
        " Don't become a follower - be a light unto yourself!"
      ],
      vivekananda: [
        " You are divine - never forget this truth!",
        " Strength and courage are your birthright!",
        " Serve others and you serve God!",
        " Arise, awake, and realize your potential!"
      ]
    };

    const teacherFlourishes = flourishes[teacher.id as keyof typeof flourishes] || [];
    
    // Add flourish randomly (30% chance)
    if (Math.random() < 0.3 && teacherFlourishes.length > 0) {
      const randomFlourish = teacherFlourishes[Math.floor(Math.random() * teacherFlourishes.length)];
      response += randomFlourish;
    }

    return response;
  }

  private selectFollowUps(followUps: string[], analysis: QuestionAnalysis): string[] {
    // Select 2-3 relevant follow-up questions
    const shuffled = [...followUps].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(3, followUps.length));
  }

  private selectTeachings(teachings: string[], analysis: QuestionAnalysis): string[] {
    // Select 2-3 relevant teachings
    const shuffled = [...teachings].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(3, teachings.length));
  }

  private selectPractice(practices: string[], context: SpiritualContext, analysis: QuestionAnalysis): string | undefined {
    if (practices.length === 0) return undefined;
    
    // Select practice based on user level and available time
    // For now, random selection
    const randomIndex = Math.floor(Math.random() * practices.length);
    return practices[randomIndex];
  }

  // Method to add new templates dynamically
  addTemplate(teacherId: string, category: string, template: {
    responses?: string[];
    followUps?: string[];
    teachings?: string[];
    practices?: string[];
  }) {
    if (!this.teacherTemplates[teacherId]) {
      this.teacherTemplates[teacherId] = {};
    }
    
    if (!this.teacherTemplates[teacherId][category]) {
      this.teacherTemplates[teacherId][category] = {
        responses: [],
        followUps: [],
        teachings: [],
        practices: []
      };
    }

    const categoryTemplates = this.teacherTemplates[teacherId][category];
    if (template.responses) categoryTemplates.responses.push(...template.responses);
    if (template.followUps) categoryTemplates.followUps.push(...template.followUps);
    if (template.teachings) categoryTemplates.teachings.push(...template.teachings);
    if (template.practices) categoryTemplates.practices.push(...template.practices);
  }

  // Get template statistics
  getTemplateStats() {
    const stats = {
      teachers: Object.keys(this.teacherTemplates).length,
      totalCategories: 0,
      totalResponses: 0,
      byTeacher: {} as Record<string, any>
    };

    for (const [teacherId, templates] of Object.entries(this.teacherTemplates)) {
      const categories = Object.keys(templates).length;
      const responses = Object.values(templates).reduce((sum, cat) => sum + cat.responses.length, 0);
      
      stats.totalCategories += categories;
      stats.totalResponses += responses;
      stats.byTeacher[teacherId] = { categories, responses };
    }

    return stats;
  }
}

export default SmartTemplateEngine;
