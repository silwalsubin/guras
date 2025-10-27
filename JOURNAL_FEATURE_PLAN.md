# Journal Feature Plan

## 🎉 Phase 1: Core Functionality (MVP) - COMPLETE ✅

### Backend Implementation ✅
- [x] Database migration for journal_entries table
- [x] Backend API endpoints (CRUD operations)
- [x] AI title generation service using OpenAI
- [x] Complete backend service implementation
- [x] Build and compile backend successfully
- [x] Configure OpenAI API key
- [x] Server running on localhost:5053

### Frontend Implementation ✅
- [x] Redux journal slice
- [x] JournalScreen with chronological entry list
- [x] JournalCreateScreen with basic form
- [x] MoodSelector component (1-10 scale with emojis)
- [x] Floating action button for quick entry creation
- [x] Basic styling and dark mode support
- [x] Pull-to-refresh functionality
- [x] Error handling with retry logic

### Navigation & Integration ✅
- [x] Add JournalScreen to navigation tabs
- [x] Integrate Journal tab into bottom navigation (edit-3 icon)
- [x] Export JournalScreen from screens/index.ts

### Authentication Fix ✅
- [x] Fix authentication in journalApi
- [x] Refactor journalApi to use centralized apiService
- [x] Removed custom authentication logic
- [x] Now follows same pattern as Audio, Meditation, etc.
- [x] All 5 API methods updated to use apiService.makeRequest()

### Testing Status
- [ ] Test all components and API integration

### Phase 2: Enhanced Features
- [ ] Entry detail view with edit capability
- [ ] Soft delete with undo
- [ ] Tag system for organization

### Phase 3: Advanced Features
- [ ] AI-powered mood insights
- [ ] Guided reflection prompts
- [ ] Export journal entries
- [ ] Voice-to-text entry creation

---

## Overview
A personal journal feature that allows users to record their thoughts, feelings, and reflections about their meditation practice and daily life. The journal will be integrated into the meditation/wellness app with a dedicated tab and support for browsing past entries.

## Feature Goals
- **Emotional Expression**: Allow users to freely express their feelings and thoughts
- **Reflection**: Support guided reflection prompts related to meditation sessions
- **Progress Tracking**: Track emotional patterns and growth over time
- **Privacy**: Ensure all journal entries are private and secure
- **Integration**: Connect journal entries with meditation sessions for holistic tracking

---

## 1. Database Schema

### New Table: `journal_entries`
```sql
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

    -- Content
    title VARCHAR(255) NOT NULL, -- AI-generated short title
    content TEXT NOT NULL,
    mood VARCHAR(50), -- e.g., 'happy', 'sad', 'anxious', 'calm', 'neutral'
    mood_score INTEGER, -- 1-10 scale for mood intensity

    -- Context
    tags TEXT[], -- Array of tags for categorization

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false -- Soft delete support
);

-- Indexes for common queries
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_user_recent ON journal_entries(user_id, created_at DESC);
```

---

## 2. Backend API Endpoints

### Journal Entry Management
- **POST** `/api/journal/entries` - Create new journal entry (AI generates title from content)
- **GET** `/api/journal/entries` - List user's journal entries (paginated, chronological)
- **GET** `/api/journal/entries/{id}` - Get specific journal entry
- **PUT** `/api/journal/entries/{id}` - Update journal entry
- **DELETE** `/api/journal/entries/{id}` - Soft delete journal entry

---

## 3. React Native UI Components

### New Screens
1. **JournalScreen** - Main journal tab with entry list and creation
2. **JournalEntryDetailScreen** - View/edit individual entry
3. **JournalCreateScreen** - Create new journal entry with optional meditation context

### New Components
1. **JournalEntryCard** - Display journal entry preview in list
2. **MoodSelector** - Interactive mood selection (1-10 scale with emoji/colors)
3. **TagInput** - Add/remove tags for entries
4. **JournalEntryForm** - Reusable form for creating/editing entries

### UI Features
- **Entry List**: Simple chronological list of journal entries with AI-generated short titles
- **Quick Create**: Floating action button for quick entry creation
- **Soft Delete**: Swipe to delete with undo option

---

## 4. Redux State Management

### New Slice: `journalSlice`
```typescript
interface JournalState {
  entries: JournalEntry[];
  selectedEntry: JournalEntry | null;
  isLoading: boolean;
  error: string | null;
}

// Actions
- fetchJournalEntries(userId)
- createJournalEntry(entry)
- updateJournalEntry(id, entry)
- deleteJournalEntry(id)
- selectEntry(id)
```

---

## 5. Integration Points

### With Redux Theme
- Ensure dark mode compatibility for all journal UI
- Use Redux theme state for consistent styling

---

---

## 7. Data Models

### TypeScript Interfaces
```typescript
interface JournalEntry {
  id: string;
  userId: string;
  title: string; // AI-generated short title
  content: string;
  mood: string; // 'happy', 'sad', 'anxious', 'calm', 'neutral'
  moodScore: number; // 1-10
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
```

---

## 8. User Experience Flow

1. **Create Entry**: User taps "+" button → Opens JournalCreateScreen
2. **Select Mood**: User selects mood on 1-10 scale
3. **Write Content**: User types journal entry content
4. **Add Tags**: User adds tags for categorization
5. **Save**: Entry saved to database, AI generates short title from content
6. **View History**: User scrolls through past entries chronologically with AI-generated titles
7. **Edit/Delete**: User can edit or soft-delete entries

---

## 9. Technical Considerations

### Performance
- Paginate journal entries (20 per page)
- Cache mood trends data
- Lazy load entry details
- Optimize database queries with proper indexing

### Security
- Ensure user_id validation on all endpoints
- Soft delete for data retention
- Encrypt sensitive content if needed
- Validate input to prevent injection attacks

### Accessibility
- Proper color contrast for mood indicators
- Keyboard navigation support
- Screen reader friendly labels
- Large touch targets for mood selection

### Testing
- Unit tests for Redux slice
- Integration tests for API endpoints
- Component tests for UI components
- E2E tests for user flows

---

## 10. Future Enhancements

- AI-powered mood insights and recommendations
- Journaling prompts based on meditation themes
- Social features (optional sharing with friends)
- Export to PDF or other formats
- Integration with calendar view
- Voice journaling support
- Sentiment analysis for mood prediction

---

## 11. Current Status & Recent Fixes

### Issue Fixed: Authentication Error
**Problem**: "Error fetching journal entries: Error: No authentication token available"

**Root Cause**: Journal API had custom authentication logic instead of using the centralized `apiService` that all other features use.

**Solution**: Refactored `react-native/src/api/journalApi.ts` to use `apiService.makeRequest()` for all 5 API methods:
- `getEntries()` - List entries
- `getEntry()` - Get single entry
- `createEntry()` - Create new entry
- `updateEntry()` - Update entry
- `deleteEntry()` - Delete entry

**Result**: ✅ Authentication now works consistently with other features (Audio, Meditation, etc.)

### API Endpoints Status
| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/journal/entries` | POST | ✅ Ready |
| `/api/journal/entries` | GET | ✅ Ready |
| `/api/journal/entries/{id}` | GET | ✅ Ready |
| `/api/journal/entries/{id}` | PUT | ✅ Ready |
| `/api/journal/entries/{id}` | DELETE | ✅ Ready |

### How to Test
1. Reload the React Native app
2. Navigate to Journal tab (edit-3 icon in bottom navigation)
3. Tap the green floating action button (+) to create an entry
4. Enter content, select mood (1-10), optionally add tags
5. Tap Save to create entry with AI-generated title
6. Verify entry appears in chronological list

### Files Modified
- `react-native/src/api/journalApi.ts` - Refactored to use apiService
- `react-native/src/screens/journal/index.tsx` - Fixed FAB positioning (bottom: 80 to account for nav bar)
- `react-native/src/screens/journal/JournalCreateScreen.tsx` - Redesigned UI with fixed Save button at bottom
- `JOURNAL_FEATURE_PLAN.md` - Updated progress tracking

### UI Improvements
- ✅ Fixed floating action button positioning (was hidden behind nav bar)
- ✅ Redesigned JournalCreateScreen with fixed Save button at bottom (no longer hidden)
- ✅ Better layout with header, scrollable content, and fixed button footer
- ✅ Changed from Modal to full-screen slide-up navigation (conditional rendering)
- ✅ Hidden bottom navigation when journal create screen is open (full-screen experience)
- ✅ Improved user experience for entry creation

### Files Modified (Latest)
- `react-native/src/store/bottomNavSlice.ts` - Added `journalCreateOpen` state
- `react-native/src/components/app/navigation/BottomNavigation.tsx` - Hide nav when journal create is open
- `react-native/src/screens/journal/index.tsx` - Dispatch actions to show/hide bottom nav
- `react-native/src/screens/journal/JournalCreateScreen.tsx` - Changed title to "Write", improved styling
- `react-native/src/components/journal/MoodSelector.tsx` - Replaced emojis with professional slider (1-5 scale)
- `react-native/src/screens/journal/JournalCreateScreen.tsx` - Changed title to "Write"
- `react-native/src/components/journal/MoodSelector.tsx` - Redesigned with professional mood labels instead of emojis

### Professional UI Improvements
- ✅ Changed title from "New Entry" to "Write" (more concise)
- ✅ Replaced emoji mood selector with clean text-based labels
- ✅ Simplified mood scale from 10 to 5 levels (Very Poor, Poor, Fair, Good, Very Good)
- ✅ Better visual hierarchy with subtle background colors
- ✅ More professional and mature appearance

