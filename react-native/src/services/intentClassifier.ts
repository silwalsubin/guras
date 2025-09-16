// Intent Classification Service - Determines the intent of user questions
// This will be enhanced with a tiny ML model later

export interface Intent {
  category: 'meditation' | 'love' | 'awareness' | 'suffering' | 'enlightenment' | 'freedom' | 'general' | 'personal' | 'practice';
  confidence: number; // 0-1
  keywords: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface QuestionAnalysis {
  intent: Intent;
  isCommonQuestion: boolean;
  requiresPersonalization: boolean;
  emotionalTone: 'neutral' | 'seeking' | 'troubled' | 'curious' | 'philosophical';
  teacherSuitability: {
    osho: number;
    buddha: number;
    krishnamurti: number;
    vivekananda: number;
  };
}

class IntentClassifier {
  private static instance: IntentClassifier;
  
  // Common question patterns - these will use templates
  private commonQuestions = new Map([
    // Meditation questions
    ['what is meditation', { category: 'meditation', confidence: 0.95, isCommon: true }],
    ['how to meditate', { category: 'meditation', confidence: 0.95, isCommon: true }],
    ['meditation techniques', { category: 'meditation', confidence: 0.9, isCommon: true }],
    ['how do i start meditation', { category: 'meditation', confidence: 0.9, isCommon: true }],
    
    // Love questions
    ['what is love', { category: 'love', confidence: 0.95, isCommon: true }],
    ['how to love', { category: 'love', confidence: 0.9, isCommon: true }],
    ['love and relationships', { category: 'love', confidence: 0.9, isCommon: true }],
    
    // Awareness questions
    ['what is awareness', { category: 'awareness', confidence: 0.95, isCommon: true }],
    ['how to be aware', { category: 'awareness', confidence: 0.9, isCommon: true }],
    ['consciousness', { category: 'awareness', confidence: 0.85, isCommon: true }],
    
    // Personal questions
    ['who are you', { category: 'personal', confidence: 0.95, isCommon: true }],
    ['tell me about yourself', { category: 'personal', confidence: 0.9, isCommon: true }],
    ['introduce yourself', { category: 'personal', confidence: 0.9, isCommon: true }],
    
    // General spiritual questions
    ['meaning of life', { category: 'general', confidence: 0.8, isCommon: true }],
    ['purpose of life', { category: 'general', confidence: 0.8, isCommon: true }],
    ['how to find peace', { category: 'general', confidence: 0.85, isCommon: true }],
  ]);

  // Keyword patterns for intent classification
  private keywordPatterns = {
    meditation: [
      'meditat', 'mindful', 'breath', 'focus', 'concentrat', 'zen', 'vipassana',
      'silent', 'sit', 'watch', 'observ', 'witness', 'present moment'
    ],
    love: [
      'love', 'heart', 'relationship', 'partner', 'marriage', 'romance',
      'compassion', 'kindness', 'caring', 'affection', 'devotion'
    ],
    awareness: [
      'aware', 'consciousness', 'awake', 'enlighten', 'realize', 'understand',
      'perceiv', 'insight', 'clarity', 'wisdom', 'knowing'
    ],
    suffering: [
      'suffer', 'pain', 'hurt', 'sad', 'depress', 'anxious', 'fear',
      'worry', 'stress', 'difficult', 'problem', 'struggle', 'grief'
    ],
    enlightenment: [
      'enlighten', 'awaken', 'liberation', 'moksha', 'nirvana', 'samadhi',
      'self-realization', 'transcend', 'ultimate', 'divine', 'god'
    ],
    freedom: [
      'freedom', 'free', 'liberat', 'independent', 'choice', 'will',
      'bondage', 'prison', 'trap', 'escape', 'release'
    ],
    practice: [
      'practice', 'technique', 'method', 'exercise', 'ritual', 'discipline',
      'routine', 'habit', 'training', 'cultivation'
    ],
    personal: [
      'who are you', 'tell me about', 'introduce', 'yourself', 'biography',
      'life story', 'background', 'history'
    ]
  };

  static getInstance(): IntentClassifier {
    if (!IntentClassifier.instance) {
      IntentClassifier.instance = new IntentClassifier();
    }
    return IntentClassifier.instance;
  }

  // Main classification method
  async classifyQuestion(question: string): Promise<QuestionAnalysis> {
    const normalizedQuestion = question.toLowerCase().trim();
    
    // Check for exact common question matches first
    const commonMatch = this.findCommonQuestionMatch(normalizedQuestion);
    if (commonMatch) {
      return this.buildAnalysisFromCommon(question, commonMatch);
    }

    // Use pattern matching for classification
    const intent = this.classifyByPatterns(normalizedQuestion);
    const complexity = this.determineComplexity(question);
    const emotionalTone = this.analyzeEmotionalTone(normalizedQuestion);
    const teacherSuitability = this.calculateTeacherSuitability(intent, emotionalTone);
    
    return {
      intent: {
        ...intent,
        complexity
      },
      isCommonQuestion: false,
      requiresPersonalization: this.requiresPersonalization(intent, complexity),
      emotionalTone,
      teacherSuitability
    };
  }

  private findCommonQuestionMatch(question: string) {
    // Direct match
    if (this.commonQuestions.has(question)) {
      return this.commonQuestions.get(question);
    }

    // Partial match - check if question contains common patterns
    for (const [pattern, data] of this.commonQuestions.entries()) {
      if (question.includes(pattern) || this.calculateSimilarity(question, pattern) > 0.8) {
        return { ...data, confidence: data.confidence * 0.9 }; // Slightly lower confidence for partial matches
      }
    }

    return null;
  }

  private classifyByPatterns(question: string): Intent {
    const scores: Record<string, number> = {};
    const foundKeywords: Record<string, string[]> = {};

    // Score each category based on keyword matches
    for (const [category, keywords] of Object.entries(this.keywordPatterns)) {
      scores[category] = 0;
      foundKeywords[category] = [];

      for (const keyword of keywords) {
        if (question.includes(keyword)) {
          scores[category] += 1;
          foundKeywords[category].push(keyword);
        }
      }

      // Normalize score by keyword count
      scores[category] = scores[category] / keywords.length;
    }

    // Find the highest scoring category
    const topCategory = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0] as Intent['category'];

    const confidence = Math.min(scores[topCategory] * 2, 1); // Scale to 0-1

    return {
      category: confidence > 0.3 ? topCategory : 'general',
      confidence: Math.max(confidence, 0.5), // Minimum confidence for general category
      keywords: foundKeywords[topCategory] || [],
      complexity: 'moderate' // Will be refined in determineComplexity
    };
  }

  private determineComplexity(question: string): 'simple' | 'moderate' | 'complex' {
    const wordCount = question.split(' ').length;
    const hasPhilosophicalWords = /why|meaning|purpose|existence|reality|truth|ultimate/.test(question.toLowerCase());
    const hasPersonalContext = /i|me|my|myself|personal/.test(question.toLowerCase());
    
    if (wordCount <= 5 && !hasPhilosophicalWords) {
      return 'simple';
    } else if (wordCount > 15 || hasPhilosophicalWords || hasPersonalContext) {
      return 'complex';
    } else {
      return 'moderate';
    }
  }

  private analyzeEmotionalTone(question: string): QuestionAnalysis['emotionalTone'] {
    const seekingWords = /how|help|guide|teach|learn|understand|find/;
    const troubledWords = /problem|difficult|struggle|pain|hurt|sad|depress|anxious|fear|worry/;
    const curiousWords = /what|why|curious|wonder|interest|fascinate/;
    const philosophicalWords = /meaning|purpose|existence|reality|truth|ultimate|divine|god/;

    if (troubledWords.test(question)) return 'troubled';
    if (seekingWords.test(question)) return 'seeking';
    if (philosophicalWords.test(question)) return 'philosophical';
    if (curiousWords.test(question)) return 'curious';
    
    return 'neutral';
  }

  private calculateTeacherSuitability(intent: Intent, emotionalTone: QuestionAnalysis['emotionalTone']) {
    const base = {
      osho: 0.5,
      buddha: 0.5,
      krishnamurti: 0.5,
      vivekananda: 0.5
    };

    // Adjust based on intent category
    switch (intent.category) {
      case 'meditation':
        base.osho += 0.3;
        base.buddha += 0.4;
        break;
      case 'love':
        base.osho += 0.4;
        base.buddha += 0.3;
        break;
      case 'awareness':
        base.krishnamurti += 0.4;
        base.osho += 0.3;
        break;
      case 'suffering':
        base.buddha += 0.4;
        base.osho += 0.2;
        break;
      case 'freedom':
        base.krishnamurti += 0.4;
        base.osho += 0.3;
        break;
      case 'practice':
        base.vivekananda += 0.3;
        base.buddha += 0.3;
        break;
    }

    // Adjust based on emotional tone
    switch (emotionalTone) {
      case 'troubled':
        base.buddha += 0.2; // Buddha is more compassionate
        break;
      case 'philosophical':
        base.krishnamurti += 0.2; // Krishnamurti loves philosophical inquiry
        break;
      case 'seeking':
        base.vivekananda += 0.2; // Vivekananda is inspiring for seekers
        break;
    }

    // Normalize to 0-1 range
    return {
      osho: Math.min(base.osho, 1),
      buddha: Math.min(base.buddha, 1),
      krishnamurti: Math.min(base.krishnamurti, 1),
      vivekananda: Math.min(base.vivekananda, 1)
    };
  }

  private requiresPersonalization(intent: Intent, complexity: 'simple' | 'moderate' | 'complex'): boolean {
    return complexity === 'complex' || 
           intent.category === 'personal' || 
           intent.confidence < 0.7;
  }

  private buildAnalysisFromCommon(question: string, commonMatch: any): QuestionAnalysis {
    const complexity = this.determineComplexity(question);
    const emotionalTone = this.analyzeEmotionalTone(question.toLowerCase());
    
    const intent: Intent = {
      category: commonMatch.category,
      confidence: commonMatch.confidence,
      keywords: [],
      complexity
    };

    return {
      intent,
      isCommonQuestion: true,
      requiresPersonalization: false, // Common questions use templates
      emotionalTone,
      teacherSuitability: this.calculateTeacherSuitability(intent, emotionalTone)
    };
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Method to add new common questions dynamically
  addCommonQuestion(question: string, category: Intent['category'], confidence: number) {
    this.commonQuestions.set(question.toLowerCase(), {
      category,
      confidence,
      isCommon: true
    });
  }

  // Method to get statistics about classification patterns
  getClassificationStats() {
    return {
      commonQuestionsCount: this.commonQuestions.size,
      categories: Object.keys(this.keywordPatterns),
      totalKeywords: Object.values(this.keywordPatterns).reduce((sum, keywords) => sum + keywords.length, 0)
    };
  }
}

export default IntentClassifier;
