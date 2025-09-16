// Hybrid AI Service - Combines smart templates with on-device AI models
// This service decides when to use templates vs AI models

import { SpiritualTeacher, SpiritualMessage, SpiritualContext } from '@/types/spiritual';
import IntentClassifier, { QuestionAnalysis } from './intentClassifier';
import SmartTemplateEngine from './smartTemplateEngine';
// import { InferenceSession } from 'onnxruntime-react-native'; // Will be used later for on-device models

export interface HybridAIResponse {
  response: string;
  followUpQuestions: string[];
  relatedTeachings: string[];
  practice?: string;
  source: 'template' | 'tiny_model' | 'fallback';
  confidence: number;
  processingTime: number;
}

export interface AIModelConfig {
  useOnDeviceModel: boolean;
  templateThreshold: number; // Confidence threshold for using templates (0.7 = use templates if confidence > 70%)
  fallbackToTemplates: boolean;
  maxResponseTime: number; // Max time to wait for AI model (ms)
}

class HybridAIService {
  private static instance: HybridAIService;
  private intentClassifier: IntentClassifier;
  private templateEngine: SmartTemplateEngine;
  private aiModelSession: any = null; // Will hold ONNX model session
  private isModelLoading: boolean = false;
  
  // Configuration
  private config: AIModelConfig = {
    useOnDeviceModel: false, // Start with templates only, enable model later
    templateThreshold: 0.7,
    fallbackToTemplates: true,
    maxResponseTime: 5000
  };

  // Statistics tracking
  private stats = {
    totalQuestions: 0,
    templateResponses: 0,
    modelResponses: 0,
    fallbackResponses: 0,
    averageResponseTime: 0,
    errors: 0
  };

  private constructor() {
    this.intentClassifier = IntentClassifier.getInstance();
    this.templateEngine = SmartTemplateEngine.getInstance();
  }

  static getInstance(): HybridAIService {
    if (!HybridAIService.instance) {
      HybridAIService.instance = new HybridAIService();
    }
    return HybridAIService.instance;
  }

  // Main method - generates response using hybrid approach
  async generateResponse(
    question: string,
    teacher: SpiritualTeacher,
    context: SpiritualContext,
    conversationHistory: SpiritualMessage[]
  ): Promise<HybridAIResponse> {
    const startTime = Date.now();
    this.stats.totalQuestions++;

    console.log('🤖 Hybrid AI - Processing question:', {
      question: question.substring(0, 50) + '...',
      teacherId: teacher.id,
      userLevel: context.userLevel
    });

    try {
      // Step 1: Classify the question
      const analysis = await this.intentClassifier.classifyQuestion(question);
      
      console.log('📊 Intent Analysis:', {
        category: analysis.intent.category,
        confidence: analysis.intent.confidence,
        isCommon: analysis.isCommonQuestion,
        complexity: analysis.intent.complexity,
        emotionalTone: analysis.emotionalTone
      });

      // Step 2: Decide which approach to use
      const useTemplate = this.shouldUseTemplate(analysis);
      
      let response: HybridAIResponse;

      if (useTemplate) {
        response = await this.generateTemplateResponse(question, teacher, context, analysis);
      } else {
        response = await this.generateAIResponse(question, teacher, context, analysis, conversationHistory);
      }

      // Step 3: Post-process and add metadata
      const processingTime = Date.now() - startTime;
      response.processingTime = processingTime;
      
      this.updateStats(response.source, processingTime);
      
      console.log('✅ Hybrid AI - Response generated:', {
        source: response.source,
        confidence: response.confidence,
        processingTime: processingTime + 'ms',
        responseLength: response.response.length
      });

      return response;

    } catch (error) {
      console.error('❌ Hybrid AI - Error generating response:', error);
      this.stats.errors++;
      
      // Fallback to simple template
      return this.generateFallbackResponse(question, teacher, context);
    }
  }

  private shouldUseTemplate(analysis: QuestionAnalysis): boolean {
    // Use templates if:
    // 1. It's a common question with high confidence
    // 2. Confidence is above threshold
    // 3. On-device model is not available/enabled
    
    if (analysis.isCommonQuestion && analysis.intent.confidence > 0.8) {
      return true;
    }
    
    if (analysis.intent.confidence > this.config.templateThreshold) {
      return true;
    }
    
    if (!this.config.useOnDeviceModel || !this.isModelAvailable()) {
      return true;
    }
    
    return false;
  }

  private async generateTemplateResponse(
    question: string,
    teacher: SpiritualTeacher,
    context: SpiritualContext,
    analysis: QuestionAnalysis
  ): Promise<HybridAIResponse> {
    console.log('📝 Using template response');
    
    const templateResponse = await this.templateEngine.generateTemplateResponse(
      teacher,
      analysis,
      context,
      question
    );

    return {
      response: templateResponse.response,
      followUpQuestions: templateResponse.followUpQuestions,
      relatedTeachings: templateResponse.relatedTeachings,
      practice: templateResponse.practice,
      source: 'template',
      confidence: templateResponse.confidence,
      processingTime: 0 // Will be set by caller
    };
  }

  private async generateAIResponse(
    question: string,
    teacher: SpiritualTeacher,
    context: SpiritualContext,
    analysis: QuestionAnalysis,
    conversationHistory: SpiritualMessage[]
  ): Promise<HybridAIResponse> {
    console.log('🧠 Using AI model response');
    
    // TODO: Implement on-device AI model inference
    // For now, fall back to enhanced template with AI-like processing
    
    if (this.config.fallbackToTemplates) {
      console.log('🔄 AI model not ready, falling back to enhanced template');
      return this.generateEnhancedTemplateResponse(question, teacher, context, analysis);
    }
    
    throw new Error('AI model not available and fallback disabled');
  }

  private async generateEnhancedTemplateResponse(
    question: string,
    teacher: SpiritualTeacher,
    context: SpiritualContext,
    analysis: QuestionAnalysis
  ): Promise<HybridAIResponse> {
    // Enhanced template processing with more sophisticated logic
    const templateResponse = await this.templateEngine.generateTemplateResponse(
      teacher,
      analysis,
      context,
      question
    );

    // Add AI-like enhancements
    const enhancedResponse = this.enhanceTemplateResponse(templateResponse.response, analysis, context);

    return {
      response: enhancedResponse,
      followUpQuestions: templateResponse.followUpQuestions,
      relatedTeachings: templateResponse.relatedTeachings,
      practice: templateResponse.practice,
      source: 'tiny_model', // Simulate AI model response
      confidence: Math.min(templateResponse.confidence * 1.1, 0.95), // Slightly higher confidence
      processingTime: 0
    };
  }

  private enhanceTemplateResponse(response: string, analysis: QuestionAnalysis, context: SpiritualContext): string {
    let enhanced = response;

    // Add context-specific insights
    if (analysis.intent.complexity === 'complex') {
      enhanced += " This is a profound question that touches the very essence of spiritual inquiry.";
    }

    // Add emotional resonance
    if (analysis.emotionalTone === 'troubled') {
      enhanced += " I sense you may be going through a difficult time. Remember, all difficulties are temporary.";
    } else if (analysis.emotionalTone === 'seeking') {
      enhanced += " Your sincere seeking is beautiful. Keep this flame of inquiry alive.";
    }

    // Add teacher-specific wisdom connections
    if (analysis.intent.keywords.length > 0) {
      const keyword = analysis.intent.keywords[0];
      enhanced += ` The concept of ${keyword} is central to understanding the deeper mysteries of existence.`;
    }

    return enhanced;
  }

  private async generateFallbackResponse(
    question: string,
    teacher: SpiritualTeacher,
    context: SpiritualContext
  ): Promise<HybridAIResponse> {
    console.log('🆘 Using fallback response');
    
    const fallbackResponses = {
      osho: "That's a beautiful question, friend. Life is full of mysteries, and sometimes the mystery itself is more important than the answer. What matters is that you're asking!",
      buddha: "Your question shows a sincere heart seeking truth. The path to understanding comes through mindful observation and compassionate inquiry.",
      krishnamurti: "You ask an important question. Don't look to me for the answer - look within yourself. The truth is not in words but in your own direct perception.",
      vivekananda: "Your question reflects a noble spirit seeking knowledge. Remember, you have infinite potential within you. Trust in your own divine nature."
    };

    const response = fallbackResponses[teacher.id as keyof typeof fallbackResponses] || 
                    "Thank you for your question. The path of spiritual inquiry is itself valuable, regardless of the answers we find.";

    return {
      response,
      followUpQuestions: [
        "Can you tell me more about what prompted this question?",
        "What aspect of this interests you most?",
        "How does this relate to your spiritual journey?"
      ],
      relatedTeachings: ["The Art of Questioning", "Spiritual Inquiry", "The Path of Seeking"],
      practice: "Contemplative Reflection (15 minutes)",
      source: 'fallback',
      confidence: 0.6,
      processingTime: 0
    };
  }

  // Model management methods
  async loadAIModel(modelPath: string): Promise<boolean> {
    if (this.isModelLoading) {
      console.log('⏳ Model already loading...');
      return false;
    }

    try {
      this.isModelLoading = true;
      console.log('📥 Loading AI model from:', modelPath);
      
      // TODO: Implement ONNX model loading
      // const session = await InferenceSession.create(modelPath);
      // this.aiModelSession = session;
      
      // For now, simulate model loading
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ AI model loaded successfully');
      this.config.useOnDeviceModel = true;
      return true;
      
    } catch (error) {
      console.error('❌ Failed to load AI model:', error);
      return false;
    } finally {
      this.isModelLoading = false;
    }
  }

  unloadAIModel(): void {
    if (this.aiModelSession) {
      // TODO: Dispose of ONNX session
      this.aiModelSession = null;
    }
    this.config.useOnDeviceModel = false;
    console.log('🗑️ AI model unloaded');
  }

  private isModelAvailable(): boolean {
    return this.config.useOnDeviceModel && this.aiModelSession !== null;
  }

  // Configuration methods
  updateConfig(newConfig: Partial<AIModelConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ AI config updated:', this.config);
  }

  getConfig(): AIModelConfig {
    return { ...this.config };
  }

  // Statistics and monitoring
  getStats() {
    return {
      ...this.stats,
      templateUsageRate: this.stats.totalQuestions > 0 ? 
        (this.stats.templateResponses / this.stats.totalQuestions) * 100 : 0,
      modelUsageRate: this.stats.totalQuestions > 0 ? 
        (this.stats.modelResponses / this.stats.totalQuestions) * 100 : 0,
      errorRate: this.stats.totalQuestions > 0 ? 
        (this.stats.errors / this.stats.totalQuestions) * 100 : 0
    };
  }

  resetStats(): void {
    this.stats = {
      totalQuestions: 0,
      templateResponses: 0,
      modelResponses: 0,
      fallbackResponses: 0,
      averageResponseTime: 0,
      errors: 0
    };
  }

  private updateStats(source: HybridAIResponse['source'], processingTime: number): void {
    switch (source) {
      case 'template':
        this.stats.templateResponses++;
        break;
      case 'tiny_model':
        this.stats.modelResponses++;
        break;
      case 'fallback':
        this.stats.fallbackResponses++;
        break;
    }

    // Update average response time
    const totalTime = this.stats.averageResponseTime * (this.stats.totalQuestions - 1) + processingTime;
    this.stats.averageResponseTime = totalTime / this.stats.totalQuestions;
  }

  // Method to simulate different AI model sizes for testing
  async simulateModelPerformance(modelSize: 'tiny' | 'small' | 'medium'): Promise<void> {
    const delays = {
      tiny: 500,      // 0.5 seconds
      small: 2000,    // 2 seconds  
      medium: 8000    // 8 seconds
    };

    console.log(`🎭 Simulating ${modelSize} model performance...`);
    await new Promise(resolve => setTimeout(resolve, delays[modelSize]));
  }

  // Debug method to test different question types
  async testQuestionTypes(): Promise<void> {
    const testQuestions = [
      "What is meditation?", // Common question
      "How do I deal with my anxiety about death?", // Complex personal question
      "Who are you?", // Personal question about teacher
      "What is the meaning of existence in quantum mechanics?", // Complex philosophical
      "Hello", // Simple greeting
      "I'm feeling lost and confused about my spiritual path" // Emotional, complex
    ];

    console.log('🧪 Testing question classification...');
    
    for (const question of testQuestions) {
      const analysis = await this.intentClassifier.classifyQuestion(question);
      const shouldUseTemplate = this.shouldUseTemplate(analysis);
      
      console.log(`Question: "${question}"`);
      console.log(`Category: ${analysis.intent.category}, Confidence: ${analysis.intent.confidence.toFixed(2)}`);
      console.log(`Use Template: ${shouldUseTemplate}, Is Common: ${analysis.isCommonQuestion}`);
      console.log('---');
    }
  }
}

export default HybridAIService;
