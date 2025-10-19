# AI Test Guide

## Overview
We've created a simple AI test system to verify connectivity between the React Native app and the server-side AI service.

## What's Been Added

### 1. Server-Side AI Test Controller
- **File**: `server/apis/Controllers/AITestController.cs`
- **Endpoints**:
  - `POST /api/aitest/chat` - Send a message to AI
  - `GET /api/aitest/health` - Check AI service health
  - `GET /api/aitest/ping` - Simple connectivity test

### 2. React Native AI Test Button
- **File**: `react-native/src/components/shared/AITestButton.tsx`
- **Features**:
  - Global "Test AI" button in the app header
  - Full-screen chat interface
  - Connectivity testing
  - Real-time AI chat
  - Chat history

### 3. Updated API Service
- **File**: `react-native/src/services/api.ts`
- **New Methods**:
  - `testAIChat(message)` - Send message to AI
  - `testAIHealth()` - Check AI service status
  - `testAIPing()` - Test server connectivity

## How to Test

### Step 1: Configure OpenAI API Key
1. Open `server/apis/appsettings.Development.json`
2. Add your OpenAI API key:
```json
{
  "AIServices": {
    "OpenAIApiKey": "sk-your-actual-openai-api-key-here"
  }
}
```

### Step 2: Start the Server
```bash
cd server
dotnet build
dotnet run --project apis
```

### Step 3: Start the React Native App
```bash
cd react-native
npm start
# In another terminal:
npx react-native run-ios
```

### Step 4: Test AI Connectivity
1. **Open the app** - you'll see a "Test AI" button in the top-right corner
2. **Tap "Test AI"** - opens the AI test interface
3. **Tap "Test Connectivity"** - verifies server and AI service are working
4. **Send a message** - try asking "What is meditation?" or "Tell me about mindfulness"

## Expected Results

### ✅ Success Indicators
- **Ping Test**: "AI Test Controller is alive!"
- **Health Check**: "AI service is working!"
- **AI Chat**: Real responses from OpenAI GPT-4

### ❌ Common Issues
- **Server not running**: "Server not responding"
- **Missing API key**: "AI service not available"
- **Network issues**: Check your internet connection

## Test Messages to Try
- "What is meditation?"
- "Tell me about mindfulness"
- "How can I reduce stress?"
- "What are the benefits of meditation?"
- "Explain the concept of enlightenment"

## Debugging
- Check server logs for detailed error messages
- Use the "Test Connectivity" button to diagnose issues
- Verify your OpenAI API key is valid and has credits

## Next Steps
Once the basic AI test is working, we can:
1. Integrate with the spiritual teachers system
2. Add conversation memory
3. Implement RAG (Retrieval-Augmented Generation)
4. Add more sophisticated AI features

---

**Note**: This is a test system - the AI responses are not yet integrated with the spiritual teachers or personalized for the user's journey.
