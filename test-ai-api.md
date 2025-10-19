# AI API Integration Test Guide

## 🎯 **What We've Implemented**

### **Server Side (C# .NET)**
✅ **AI Service** (`services.ai`) with OpenAI integration  
✅ **Spiritual AI Controller** with REST API endpoints  
✅ **Configuration** for OpenAI API settings  
✅ **Error handling** with fallback to templates  

### **Client Side (React Native)**
✅ **API Service** updated with AI methods  
✅ **Spiritual AI Service** updated to call real API  
✅ **Fallback system** to templates if API fails  

## 🚀 **API Endpoints Available**

### **1. Generate AI Response**
```
POST /api/spiritualai/generate-response
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "What is meditation?",
  "teacherId": "osho",
  "userLevel": "beginner",
  "currentChallenges": ["anxiety"],
  "spiritualGoals": ["peace"],
  "recentInsights": [],
  "practiceHistory": [],
  "emotionalState": "seeking",
  "conversationHistory": []
}
```

### **2. Daily Guidance**
```
POST /api/spiritualai/daily-guidance?teacherId=osho&userId=user123
Authorization: Bearer <token>
```

### **3. Health Check**
```
GET /api/spiritualai/health
```

### **4. Service Stats**
```
GET /api/spiritualai/stats
Authorization: Bearer <token>
```

## 🔧 **Setup Required**

### **1. Add OpenAI API Key**
Update `server/apis/appsettings.Development.json`:
```json
{
  "AIServices": {
    "OpenAIApiKey": "sk-your-actual-openai-api-key-here",
    "OpenAIBaseUrl": "https://api.openai.com/v1",
    "DefaultModel": "gpt-4",
    "MaxTokens": 500,
    "Temperature": 0.7,
    "TimeoutSeconds": 30,
    "EnableFallback": true
  }
}
```

### **2. Build and Run Server**
```bash
cd server
dotnet build
dotnet run --project apis
```

### **3. Test API Endpoints**
```bash
# Health check
curl http://localhost:5000/api/spiritualai/health

# Generate response (with auth token)
curl -X POST http://localhost:5000/api/spiritualai/generate-response \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "question": "What is meditation?",
    "teacherId": "osho",
    "userLevel": "beginner",
    "currentChallenges": [],
    "spiritualGoals": [],
    "recentInsights": [],
    "practiceHistory": [],
    "emotionalState": "seeking",
    "conversationHistory": []
  }'
```

## 🧪 **Testing in React Native App**

1. **Start the server** with your OpenAI API key
2. **Run the React Native app**
3. **Go to Spiritual Teacher section**
4. **Ask a question** - it should now use real AI!

## 🔍 **What to Look For**

### **Console Logs**
- `🤖 Spiritual AI - Generating response for:` - Shows the request
- `✅ Spiritual AI - Real AI response generated:` - Shows successful API call
- `❌ Spiritual AI - Error with real AI API:` - Shows fallback to templates

### **Response Quality**
- **Real AI responses** should be more contextual and personalized
- **Template fallback** should work if API fails
- **Error handling** should be graceful

## 🐛 **Troubleshooting**

### **Common Issues**
1. **"OpenAI API error: 401"** - Invalid API key
2. **"OpenAI API error: 429"** - Rate limit exceeded
3. **"No response from OpenAI API"** - API timeout or error
4. **Fallback responses** - API not working, using templates

### **Debug Steps**
1. Check server logs for AI service errors
2. Verify OpenAI API key is correct
3. Test API endpoints directly with curl
4. Check React Native console for error messages

## 🎉 **Success Criteria**

✅ **Server starts** without errors  
✅ **API endpoints** respond correctly  
✅ **React Native app** calls real AI API  
✅ **AI responses** are contextual and teacher-specific  
✅ **Fallback system** works when API fails  
✅ **Error handling** is graceful  

## 📝 **Next Steps**

1. **Add your OpenAI API key** to the configuration
2. **Test the implementation** with real questions
3. **Monitor API usage** and costs
4. **Consider implementing RAG** for even better responses
5. **Add conversation memory** for better context

---

**🎯 You now have REAL AI instead of mock data!** 🎉
