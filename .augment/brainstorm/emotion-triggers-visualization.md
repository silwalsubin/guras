# Emotion Triggers Visualization Feature - Brainstorm

## Overview
A feature that analyzes user journal entries to identify patterns and triggers that lead to specific emotions. This helps users gain self-awareness by visualizing what situations, activities, people, or topics consistently evoke particular emotional responses.

## Core Concept
- **Input**: Historical journal entries with auto-detected moods
- **Analysis**: Extract and categorize triggers (people, activities, locations, topics, time patterns)
- **Visualization**: Show what causes what emotions in an intuitive, explorable way
- **Insight**: Help users understand their emotional patterns and make better decisions

## Key Features to Consider

### 1. Emotion Trigger Mapping
- For each emotion (happy, sad, anxious, calm, etc.), show:
  - Most common triggers
  - Frequency of occurrence
  - Intensity correlation (does this trigger always lead to strong emotion?)
  - Time patterns (when does this trigger occur?)

### 2. Trigger Categories
- **People**: Mentions of specific people or relationships
- **Activities**: What the user was doing (work, exercise, socializing, etc.)
- **Locations**: Where they were (home, office, outdoors, etc.)
- **Topics**: What they were thinking/talking about (career, relationships, health, etc.)
- **Time Patterns**: Time of day, day of week, season
- **External Factors**: Weather, events, news

### 3. Visualization Options
- **Emotion Wheel**: Central emotion with radiating triggers (size = frequency)
- **Trigger Cards**: Clickable cards showing "X triggers Y emotion Z% of the time"
- **Timeline View**: Show how triggers and emotions correlate over time
- **Heatmap**: Trigger intensity vs emotion strength
- **Network Graph**: Show relationships between triggers and emotions
- **Comparison View**: Compare two emotions to see different triggers

### 4. Data Extraction Strategy
- **NLP Analysis**: Extract entities (people, places, activities) from journal text
- **Keyword Matching**: Look for common trigger words/phrases
- **Sentiment Analysis**: Already have mood, but could detect intensity
- **Pattern Recognition**: Identify recurring themes across entries
- **Temporal Analysis**: When do certain triggers appear?

### 5. User Interactions
- **Filter by Date Range**: "Show me triggers from last 3 months"
- **Filter by Emotion**: "What triggers my anxiety?"
- **Drill Down**: Click a trigger to see all related journal entries
- **Exclude Triggers**: "Don't show me work-related triggers"
- **Compare Emotions**: "Show me what's different between happy and calm days"

### 6. Insights & Recommendations
- "You mention [person] in 80% of your happy entries"
- "Your anxiety spikes when you work late"
- "[Activity] consistently makes you feel better"
- "You're happiest on [day of week]"
- "Talking about [topic] usually leads to [emotion]"

## Technical Considerations

### Data Processing
- Use existing mood detection (already auto-detecting mood)
- Implement entity extraction (people, places, activities)
- Build trigger frequency counter
- Calculate correlation scores between triggers and emotions

### Storage
- Could cache trigger analysis results to avoid re-processing all entries
- Store trigger-emotion correlations in database
- Track analysis timestamp for cache invalidation

### Performance
- Analyze entries in background (don't block UI)
- Implement pagination for large datasets
- Cache visualization data

### Privacy
- All analysis happens locally or on user's data only
- No sharing of personal triggers without explicit consent
- Clear data handling for sensitive information

## UI/UX Considerations
- Make it feel like a personal dashboard, not clinical
- Use warm, inviting colors and typography
- Show confidence levels ("This pattern is based on X entries")
- Provide context for each insight
- Allow exploration without overwhelming the user
- Mobile-first design (thumb-friendly interactions)

## Potential Screens/Sections

### 1. Emotion Triggers Dashboard
- Overview of all emotions and their top triggers
- Quick stats ("You've logged X entries, Y unique triggers identified")

### 2. Emotion Deep Dive
- Select an emotion → see detailed trigger breakdown
- Visualize trigger frequency and intensity
- See related journal entries

### 3. Trigger Explorer
- Browse all identified triggers
- See which emotions they're associated with
- Filter and search

### 4. Insights Feed
- Personalized insights and patterns
- Recommendations based on data
- Trends over time

### 5. Comparison View
- Compare two emotions side-by-side
- See what's unique to each emotion
- Identify common triggers

## Questions to Answer
1. Should this be a separate tab or part of the Past/Progress section?
I am thinking on the home tab. 
2. How many entries are needed before showing insights (minimum threshold)?
one entry minimum
3. Should users be able to manually tag triggers, or only AI-detected?
manually as well 
4. How often should the analysis refresh?
after new entry, and daily.
5. Should we show confidence levels for detected triggers?
yes
6. What's the minimum frequency threshold to show a trigger?
not sure

## MVP Scope
- Basic emotion-to-trigger mapping
- Simple visualization (cards or list)
- Top 5-10 triggers per emotion
- Filter by date range
- Click to see related entries

## Implementation Decisions (Based on Answers)
- **Location**: Home tab (not separate tab or Past section)
- **Minimum Entries**: 1 entry minimum (show insights immediately)
- **Trigger Input**: Both AI-detected AND manually tagged by users
- **Analysis Refresh**: After new entry + daily refresh
- **Confidence Levels**: Yes, show confidence for detected triggers
- **Frequency Threshold**: TBD (to be determined during implementation)

## Implementation Roadmap (Frontend-First Approach)

### Phase 1: UI Design & Mock Data ✅ COMPLETE

- [x] **Task 1.1**: Create mock data structure for emotion triggers
  - ✅ Created `react-native/src/data/mockEmotionTriggersData.ts`
  - ✅ Defined mock emotion-to-triggers mapping with 4 emotions (Happy, Calm, Anxious, Sad)
  - ✅ Created sample data with various confidence levels (68-98%)
  - ✅ Included edge cases (empty state, single entry, multiple emotions)
  - ✅ Documented mock data schema with TypeScript interfaces

- [x] **Task 1.2**: Design & build Emotion Triggers widget for Home tab
  - ✅ Created `react-native/src/components/home/EmotionTriggersWidget.tsx`
  - ✅ Compact card showing top emotion + donut chart visualization
  - ✅ Donut chart shows emotion distribution with legend
  - ✅ Confidence levels shown as percentage badges
  - ✅ Tappable to navigate to full view
  - ✅ Empty state with helpful prompt
  - ✅ Integrated into home screen
  - ✅ Uses mock data
  - ✅ Removed emojis, replaced with abstract icons (arrow-up, pulse, leaf, etc.)
  - ✅ Improved spacing and visual hierarchy
  - ✅ Better color consistency (primary green throughout)

- [x] **Task 1.3**: Build full Emotion Triggers screen
  - ✅ Created `react-native/src/screens/home/EmotionTriggersScreen.tsx`
  - ✅ Shows all emotions with their top triggers
  - ✅ Displays confidence scores for each trigger
  - ✅ Shows entry count basis ("Based on X entries")
  - ✅ Implemented tap-to-expand for each emotion
  - ✅ Added smooth animations for expanding/collapsing
  - ✅ Uses mock data
  - ✅ Integrated into home screen with navigation
  - ✅ Removed emojis, replaced with abstract icons
  - ✅ Improved trigger icons and styling
  - ✅ READY FOR TESTING & FEEDBACK

- [x] **Task 1.4**: Add donut chart visualization
  - ✅ Installed `react-native-svg-charts` library
  - ✅ Created `react-native/src/components/home/EmotionDonutChart.tsx`
  - ✅ Displays emotion distribution as donut chart
  - ✅ Shows emotion count in center
  - ✅ Color-coded legend below chart
  - ✅ Integrated into widget
  - ✅ Responsive and dark mode compatible

### Phase 2: Interactivity & Drill-Down UI
- [ ] **Task 2.1**: Implement trigger detail view
  - Show all entries containing this trigger
  - Display emotion distribution for this trigger
  - Show confidence score and sample size
  - Link back to full journal entries
  - Use mock data for entries

- [ ] **Task 2.2**: Add manual trigger tagging UI
  - Create UI to add/edit triggers on journal entries
  - Allow users to categorize manual triggers
  - Show distinction between AI-detected and manual triggers (visual indicator)
  - Implement add/remove trigger interactions
  - Use mock data

### Phase 3: Polish & Refine UI/UX
- [ ] **Task 3.1**: Improve visual design & interactions
  - Add loading states during analysis (skeleton screens)
  - Implement smooth animations for expanding/collapsing
  - Add helpful tooltips explaining confidence scores
  - Ensure mobile-first, thumb-friendly interactions
  - Test layout with various data volumes
  - Refine colors and typography for home tab consistency

- [ ] **Task 3.2**: Iterate based on feedback
  - Gather feedback on visualization clarity
  - Adjust spacing, sizing, and visual hierarchy
  - Refine animations and transitions
  - Ensure accessibility (contrast, touch targets)

### Phase 4: Backend Foundation & Data Processing
- [ ] **Task 4.1**: Design database schema for storing triggers
  - Create `triggers` table (id, user_id, trigger_text, category, created_at)
  - Create `entry_triggers` junction table (entry_id, trigger_id, is_manual, confidence_score)
  - Add migration scripts

- [ ] **Task 4.2**: Implement trigger extraction service
  - Build NLP entity extraction (people, activities, topics)
  - Implement keyword matching for common triggers
  - Create trigger categorization logic
  - Return extracted triggers with confidence scores

- [ ] **Task 4.3**: Implement trigger-emotion correlation engine
  - Calculate frequency of each trigger per emotion
  - Calculate confidence scores (based on sample size)
  - Build correlation matrix (trigger → emotion → frequency/confidence)
  - Cache results for performance

### Phase 5: Backend API & Integration
- [ ] **Task 5.1**: Create API endpoints for trigger analysis
  - GET `/api/triggers/analysis` - returns emotion-to-triggers mapping
  - GET `/api/triggers/emotion/:emotion` - detailed breakdown for one emotion
  - POST `/api/entries/:id/triggers` - manually add/edit triggers for an entry
  - GET `/api/triggers/:id/entries` - get entries for a specific trigger

- [ ] **Task 5.2**: Implement analysis refresh logic
  - Create background job that runs after new journal entry
  - Create daily scheduled job for full re-analysis
  - Implement cache invalidation strategy
  - Handle edge cases (no entries, single entry, etc.)

- [ ] **Task 5.3**: Connect frontend to real APIs
  - Replace mock data with API calls
  - Implement proper loading and error states
  - Add retry logic for failed requests
  - Handle real data edge cases

### Phase 6: Testing & Optimization
- [ ] **Task 6.1**: Write comprehensive tests
  - Unit tests for trigger extraction logic
  - Unit tests for correlation calculations
  - Integration tests for API endpoints
  - UI component tests with mock data

- [ ] **Task 6.2**: Performance optimization
  - Optimize database queries for large entry sets
  - Implement pagination for large trigger lists
  - Profile and optimize NLP extraction
  - Monitor API response times

- [ ] **Task 6.3**: Final user testing & refinement
  - Test with real user data
  - Gather feedback on visualization clarity
  - Refine confidence score thresholds
  - Adjust frequency threshold based on real data

## Phase 1 Completion Summary ✅ COMPLETE

### What Was Built
1. **Mock Data Structure** (`mockEmotionTriggersData.ts`)
   - Realistic emotion-to-trigger mapping with 4 emotions (Happy, Calm, Anxious, Sad)
   - Confidence scores for each trigger (68-98%)
   - Manual vs AI-detected trigger distinction
   - Edge cases: empty state, single entry, multiple emotions
   - TypeScript interfaces for type safety

2. **Home Tab Widget** (`EmotionTriggersWidget.tsx`)
   - Compact card showing top emotion + top 3 triggers
   - Percentage frequency badge (e.g., "42%")
   - Confidence indicators on each trigger (e.g., "95%")
   - Category icons for each trigger (people, activities, locations, etc.)
   - Empty state with helpful prompt
   - Integrated into home screen between greeting and recommendations
   - Dark mode support

3. **Full Screen View** (`EmotionTriggersScreen.tsx`)
   - All emotions displayed with expandable sections
   - Trigger details with category icons and labels
   - Confidence scores and manual/AI distinction
   - Stats showing total entries and emotion count
   - Smooth expand/collapse animations
   - Pull-to-refresh functionality
   - Back button navigation
   - Dark mode support

### Files Created
- `react-native/src/data/mockEmotionTriggersData.ts` - Mock data (TypeScript)
- `react-native/src/components/home/EmotionTriggersWidget.tsx` - Home tab widget (React Native)
- `react-native/src/screens/home/EmotionTriggersScreen.tsx` - Full screen view (React Native)

### Files Modified
- `react-native/src/screens/home/index.tsx` - Integrated widget and screen navigation

### UI Features Implemented
✅ Responsive design for mobile
✅ Dark mode support
✅ Smooth animations and transitions
✅ Category icons for trigger types
✅ Confidence score indicators
✅ Empty state handling
✅ Pull-to-refresh
✅ Expandable emotion cards
✅ Manual vs AI-detected trigger distinction

### Status
✅ **Phase 1 Complete** - All components built and integrated
✅ **No TypeScript errors** - Code compiles successfully
✅ **Ready for Testing** - Can now test on device/simulator

### Ready for Feedback
The UI is now ready for visual review and iteration. You can:
- Test the widget appearance on the home tab
- Review the full screen view by tapping the widget
- Provide feedback on layout, colors, spacing, animations
- Suggest changes before implementing real APIs
- Test with different mock data scenarios

### Next Steps
Once you've reviewed the UI and provided feedback:
1. Make any UI/UX adjustments based on your feedback
2. Move to Phase 2: Interactivity & Drill-Down UI
3. Then implement backend APIs in Phase 4-5

## Future Enhancements
- Advanced visualizations (network graphs, heatmaps)
- Predictive insights ("If you do X, you'll likely feel Y")
- Trigger recommendations ("Try doing X to feel better")
- Social features (compare patterns with others, anonymously)
- Integration with other data (sleep, exercise, weather)
- Trigger exclusion/customization
- Export insights
- Comparison view between emotions

