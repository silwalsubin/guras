// In-memory storage for quotes - no AsyncStorage dependency
let fallbackStorage: { [key: string]: string } = {};

// Collection of meditation and mindfulness quotes
const MEDITATION_QUOTES = [
  {
    id: 1,
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    category: "inner-peace"
  },
  {
    id: 2,
    text: "The present moment is the only time over which we have any power.",
    author: "Thich Nhat Hanh",
    category: "mindfulness"
  },
  {
    id: 3,
    text: "Meditation is not about stopping thoughts, but recognizing that we are more than our thoughts.",
    author: "Arianna Huffington",
    category: "meditation"
  },
  {
    id: 4,
    text: "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.",
    author: "Rumi",
    category: "self-love"
  },
  {
    id: 5,
    text: "The quieter you become, the more you are able to hear.",
    author: "Ram Dass",
    category: "awareness"
  },
  {
    id: 6,
    text: "In the midst of movement and chaos, keep stillness inside of you.",
    author: "Deepak Chopra",
    category: "inner-peace"
  },
  {
    id: 7,
    text: "Mindfulness is about being fully awake in our lives.",
    author: "Jon Kabat-Zinn",
    category: "mindfulness"
  },
  {
    id: 8,
    text: "Wherever you are, be there totally.",
    author: "Eckhart Tolle",
    category: "presence"
  },
  {
    id: 9,
    text: "The way out is through the way in.",
    author: "Unknown",
    category: "inner-journey"
  },
  {
    id: 10,
    text: "Be yourself and you will find peace.",
    author: "Unknown",
    category: "authenticity"
  },
  {
    id: 11,
    text: "Breathing in, I calm body and mind. Breathing out, I smile.",
    author: "Thich Nhat Hanh",
    category: "breathing"
  },
  {
    id: 12,
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
    category: "thoughts"
  },
  {
    id: 13,
    text: "Let go of what has passed. Let go of what may come. Let go of what is happening now.",
    author: "Buddha",
    category: "letting-go"
  },
  {
    id: 14,
    text: "You are the sky, everything else is just the weather.",
    author: "Pema Chödrön",
    category: "perspective"
  },
  {
    id: 15,
    text: "The best way to take care of the future is to take care of the present moment.",
    author: "Thich Nhat Hanh",
    category: "present-moment"
  },
  {
    id: 16,
    text: "Meditation is the ultimate mobile device; you can use it anywhere, anytime, unobtrusively.",
    author: "Sharon Salzberg",
    category: "meditation"
  },
  {
    id: 17,
    text: "Inner peace begins the moment you choose not to allow another person or event to control your emotions.",
    author: "Pema Chödrön",
    category: "emotional-freedom"
  },
  {
    id: 18,
    text: "If you want to know your mind, sit down and observe it.",
    author: "Ajahn Chah",
    category: "self-awareness"
  },
  {
    id: 19,
    text: "The goal of meditation isn't to control your thoughts, it's to stop letting them control you.",
    author: "Unknown",
    category: "mental-freedom"
  },
  {
    id: 20,
    text: "Be present in all things and thankful for all things.",
    author: "Maya Angelou",
    category: "gratitude"
  },
  {
    id: 21,
    text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
    author: "Thich Nhat Hanh",
    category: "emotions"
  },
  {
    id: 22,
    text: "The cave you fear to enter holds the treasure you seek.",
    author: "Joseph Campbell",
    category: "courage"
  },
  {
    id: 23,
    text: "Surrender to what is. Let go of what was. Have faith in what will be.",
    author: "Sonia Ricotti",
    category: "surrender"
  },
  {
    id: 24,
    text: "Your calm mind is the ultimate weapon against your challenges.",
    author: "Bryant McGill",
    category: "resilience"
  }
];

export interface Quote {
  id: number;
  text: string;
  author: string;
  category: string;
}

// Storage keys
const STORAGE_KEYS = {
  CURRENT_QUOTE: 'current_quote',
  LAST_QUOTE_UPDATE: 'last_quote_update',
  QUOTE_HISTORY: 'quote_history',
  NOTIFICATION_PREFERENCES: 'notification_preferences'
};

export interface NotificationPreferences {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'twice-daily';
  quietHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
}

// Safe storage operations using only in-memory storage
const safeSetItem = async (key: string, value: string): Promise<void> => {
  try {
    fallbackStorage[key] = value;
    console.log(`✅ Stored ${key}:`, value.substring(0, 50) + '...');
  } catch (error) {
    console.error('Storage set error:', error);
    fallbackStorage[key] = value;
  }
};

const safeGetItem = async (key: string): Promise<string | null> => {
  try {
    const value = fallbackStorage[key] || null;
    if (value) {
      console.log(`✅ Retrieved ${key}:`, value.substring(0, 50) + '...');
    }
    return value;
  } catch (error) {
    console.error('Storage get error:', error);
    return fallbackStorage[key] || null;
  }
};

class QuotesService {
  private static instance: QuotesService;
  private initialized = false;

  static getInstance(): QuotesService {
    if (!QuotesService.instance) {
      QuotesService.instance = new QuotesService();
    }
    return QuotesService.instance;
  }

  // Initialize the service
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.initialized = true;
      console.log('✅ QuotesService initialized successfully (in-memory mode)');
    } catch (error) {
      console.warn('QuotesService initialization warning:', error);
      this.initialized = true; // Continue with fallback
    }
  }

  // Get a random quote
  getRandomQuote(): Quote {
    const randomIndex = Math.floor(Math.random() * MEDITATION_QUOTES.length);
    return MEDITATION_QUOTES[randomIndex];
  }

  // Get quote by category
  getQuotesByCategory(category: string): Quote[] {
    return MEDITATION_QUOTES.filter(quote => quote.category === category);
  }

  // Get current quote of the day/hour
  async getCurrentQuote(): Promise<Quote> {
    try {
      await this.initialize();
      const storedQuote = await safeGetItem(STORAGE_KEYS.CURRENT_QUOTE);
      if (storedQuote) {
        return JSON.parse(storedQuote);
      }
      
      // If no stored quote, get a random one and save it
      const newQuote = this.getRandomQuote();
      await this.setCurrentQuote(newQuote);
      return newQuote;
    } catch (error) {
      console.error('Error getting current quote:', error);
      return this.getRandomQuote();
    }
  }

  // Set current quote
  async setCurrentQuote(quote: Quote): Promise<void> {
    try {
      await this.initialize();
      await safeSetItem(STORAGE_KEYS.CURRENT_QUOTE, JSON.stringify(quote));
      await safeSetItem(STORAGE_KEYS.LAST_QUOTE_UPDATE, new Date().toISOString());
      
      // Add to history
      const history = await this.getQuoteHistory();
      const updatedHistory = [quote, ...history.slice(0, 9)]; // Keep last 10 quotes
      await safeSetItem(STORAGE_KEYS.QUOTE_HISTORY, JSON.stringify(updatedHistory));
      
      console.log('✅ Quote updated:', quote.text.substring(0, 30) + '...');
    } catch (error) {
      console.error('Error setting current quote:', error);
    }
  }

  // Get quote history
  async getQuoteHistory(): Promise<Quote[]> {
    try {
      await this.initialize();
      const history = await safeGetItem(STORAGE_KEYS.QUOTE_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting quote history:', error);
      return [];
    }
  }

  // Check if quote should be updated (hourly)
  async shouldUpdateQuote(): Promise<boolean> {
    try {
      await this.initialize();
      const lastUpdate = await safeGetItem(STORAGE_KEYS.LAST_QUOTE_UPDATE);
      if (!lastUpdate) return true;

      const lastUpdateTime = new Date(lastUpdate);
      const now = new Date();
      const timeDiff = now.getTime() - lastUpdateTime.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      return hoursDiff >= 1; // Update every hour
    } catch (error) {
      console.error('Error checking update status:', error);
      return true;
    }
  }

  // Update quote if needed
  async updateQuoteIfNeeded(): Promise<Quote> {
    const shouldUpdate = await this.shouldUpdateQuote();
    if (shouldUpdate) {
      const newQuote = this.getRandomQuote();
      await this.setCurrentQuote(newQuote);
      return newQuote;
    }
    return this.getCurrentQuote();
  }

  // Get notification preferences
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      await this.initialize();
      const preferences = await safeGetItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES);
      if (preferences) {
        return JSON.parse(preferences);
      }
      
      // Default preferences
      const defaultPrefs: NotificationPreferences = {
        enabled: true,
        frequency: 'hourly',
        quietHours: {
          start: '22:00',
          end: '08:00'
        }
      };
      
      await this.setNotificationPreferences(defaultPrefs);
      return defaultPrefs;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        enabled: true,
        frequency: 'hourly',
        quietHours: { start: '22:00', end: '08:00' }
      };
    }
  }

  // Set notification preferences
  async setNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await this.initialize();
      await safeSetItem(STORAGE_KEYS.NOTIFICATION_PREFERENCES, JSON.stringify(preferences));
      console.log('✅ Notification preferences saved:', preferences);
    } catch (error) {
      console.error('Error setting notification preferences:', error);
    }
  }

  // Check if current time is within quiet hours
  isQuietHours(preferences: NotificationPreferences): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { start, end } = preferences.quietHours;
    
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }
    
    // Handle same-day quiet hours (e.g., 13:00 to 14:00)
    return currentTime >= start && currentTime <= end;
  }

  // Get all available categories
  getCategories(): string[] {
    const categories = new Set(MEDITATION_QUOTES.map(quote => quote.category));
    return Array.from(categories);
  }
}

export default QuotesService.getInstance(); 