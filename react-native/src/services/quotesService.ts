import { API_CONFIG } from '@/config/api';

// API endpoints for quotes
const QUOTES_API_ENDPOINTS = {
  ALL_QUOTES: '/api/quotes',
  RANDOM_QUOTE: '/api/quotes/random',
  QUOTES_BY_CATEGORY: '/api/quotes/category',
  QUOTE_BY_CATEGORY: '/api/quotes/category',
};

// Fallback quotes in case API is unavailable
const FALLBACK_QUOTES = [
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
  }
];

export interface Quote {
  text: string;
  author: string;
  category: string;
}

// API helper function
const makeApiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...options,
  };

  return fetch(url, defaultOptions);
};

class QuotesService {
  private static instance: QuotesService;
  private initialized = false;
  private cachedQuotes: Quote[] = [];
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
      console.log('✅ QuotesService initialized successfully (API mode)');
    } catch (error) {
      console.warn('QuotesService initialization warning:', error);
      this.initialized = true; // Continue with fallback
    }
  }

  // Check if cache is still valid
  private isCacheValid(): boolean {
    return Date.now() - this.lastFetchTime < this.CACHE_DURATION;
  }

  // Get all quotes from API
  async getAllQuotes(): Promise<Quote[]> {
    try {
      await this.initialize();
      
      // Return cached quotes if still valid
      if (this.cachedQuotes.length > 0 && this.isCacheValid()) {
        console.log('✅ Returning cached quotes');
        return this.cachedQuotes;
      }

      const response = await makeApiRequest(QUOTES_API_ENDPOINTS.ALL_QUOTES);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const quotes = await response.json();
      this.cachedQuotes = quotes;
      this.lastFetchTime = Date.now();
      
      console.log('✅ Retrieved quotes from API:', quotes.length);
      return quotes;
    } catch (error) {
      console.error('Error fetching quotes from API:', error);
      console.log('⚠️ Falling back to local quotes');
      return FALLBACK_QUOTES;
    }
  }

  // Get a random quote
  async getRandomQuote(): Promise<Quote> {
    try {
      await this.initialize();
      
      const response = await makeApiRequest(QUOTES_API_ENDPOINTS.RANDOM_QUOTE);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const quote = await response.json();
      console.log('✅ Retrieved random quote from API');
      return quote;
    } catch (error) {
      console.error('Error fetching random quote from API:', error);
      console.log('⚠️ Falling back to local random quote');
      const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
      return FALLBACK_QUOTES[randomIndex];
    }
  }

  // Get quotes by category
  async getQuotesByCategory(category: string): Promise<Quote[]> {
    try {
      await this.initialize();
      
      const response = await makeApiRequest(`${QUOTES_API_ENDPOINTS.QUOTES_BY_CATEGORY}/${category}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const quotes = await response.json();
      console.log('✅ Retrieved quotes by category from API:', category, quotes.length);
      return quotes;
    } catch (error) {
      console.error('Error fetching quotes by category from API:', error);
      console.log('⚠️ Falling back to local quotes by category');
      return FALLBACK_QUOTES.filter(quote => quote.category === category);
    }
  }

  // Get current quote (alias for random quote for now)
  async getCurrentQuote(): Promise<Quote> {
    return this.getRandomQuote();
  }

  // Update quote if needed (always get a new one for now)
  async updateQuoteIfNeeded(): Promise<Quote> {
    return this.getRandomQuote();
  }

  // Get all available categories
  async getCategories(): Promise<string[]> {
    try {
      const quotes = await this.getAllQuotes();
      const categories = new Set(quotes.map(quote => quote.category));
      return Array.from(categories);
    } catch (error) {
      console.error('Error getting categories:', error);
      // Return categories from fallback quotes
      const categories = new Set(FALLBACK_QUOTES.map(quote => quote.category));
      return Array.from(categories);
    }
  }
}

export default QuotesService.getInstance(); 