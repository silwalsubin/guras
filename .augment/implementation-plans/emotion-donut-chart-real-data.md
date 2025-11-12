# Implementation Plan: Populate Emotion Donut Chart with Real Data

## Overview
Replace the hardcoded emotion data in the home page donut chart with real emotion statistics aggregated from the user's journal entries.

## Current State
- Donut chart displays mock data: Happy (42%), Calm (33%), Anxious (17%), Sad (8%)
- Chart shows "Based on 12 entries" (hardcoded)
- No connection to actual journal data

## Desired State
- Chart displays real emotion distribution from user's journal entries
- Statistics update dynamically based on journal data
- Shows accurate entry count
- Only displays emotions that exist in user's entries

## Implementation Plan

### 1. Backend Changes

#### 1.1 Update Journal Service
**File**: `server/services/services.journal/Services/JournalEntryService.cs`

- Add method: `GetUserEmotionCountsAsync(Guid userId)`
- Returns `List<EmotionCount>` with emotionId and count only
- Delegates to repository method

#### 1.2 Add Repository Method
**File**: `server/services/services.journal/Repositories/IJournalEntryRepository.cs`

- Add method: `GetUserEmotionCountsAsync(Guid userId)`
- Returns aggregated emotion counts from `journal_entry_emotions` table
- Only returns emotionId and count (no emotion details)

**Return Type**: `EmotionCount`
```csharp
public class EmotionCount
{
    public string EmotionId { get; set; }
    public int Count { get; set; }
}
```

#### 1.3 Create Emotion Details Service
**File**: `server/services/services.emotions/Services/EmotionService.cs`

- Add method: `GetEmotionsByIdsAsync(List<string> emotionIds)`
- Returns `List<EmotionResponse>` with emotion details (id, name, color)

#### 1.4 Update Orchestration Service
**File**: `server/orchestration/orchestration.journals/Services/JournalOrchestrationService.cs`

- Add method: `GetUserEmotionStatisticsAsync(Guid userId)`
- Calls `JournalEntryService.GetUserEmotionCountsAsync(userId)` to get emotion counts
- Calls `EmotionService.GetEmotionsByIdsAsync(emotionIds)` to get emotion details
- Assembles data into `EmotionStatisticsResponse`

**Return Type**: `EmotionStatisticsResponse`
```csharp
public class EmotionStatisticsResponse
{
    public List<EmotionDetailResponse> Emotions { get; set; } = new();
    public int TotalEntries { get; set; }
    public DateTime CalculatedAt { get; set; }
}

public class EmotionDetailResponse
{
    public string EmotionId { get; set; }
    public string EmotionName { get; set; }
    public string EmotionColor { get; set; }
    public int Count { get; set; }
}
```

#### 1.5 Create Orchestration Endpoint
**File**: `server/orchestration/orchestration.journals/Controllers/JournalOrchestrationController.cs`

- New endpoint: `GET /api/journal-orchestration/statistics/emotions`
- Returns `EmotionStatisticsResponse` for authenticated user
- Calls `JournalOrchestrationService.GetUserEmotionStatisticsAsync(userId)`

### 2. React Native Changes

#### 2.1 Create API Hook
**File**: `react-native/src/api/journalApi.ts`

- Add function: `getEmotionStatistics()`
- Calls `GET /api/journal-orchestration/statistics/emotions`
- Returns emotion statistics data

#### 2.2 Create Redux Slice
**File**: `react-native/src/store/emotionStatisticsSlice.ts` (new file)

- State shape:
  ```typescript
  {
    emotions: EmotionCountDto[];
    totalEntries: number;
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
  }
  ```
- Thunk: `fetchEmotionStatistics(userId)`
- Actions: `setEmotionStatistics`, `setLoading`, `setError`

#### 2.3 Update Home Screen Component
**File**: `react-native/src/screens/HomeScreen.tsx`

- Import emotion statistics from Redux
- Add `useEffect` to fetch emotion statistics on mount
- Pass real data to donut chart component
- Handle loading and error states

#### 2.4 Update Donut Chart Component
**File**: `react-native/src/components/home/EmotionDonutChart.tsx` (or similar)

- Accept emotion statistics as props instead of hardcoded data
- Dynamically render emotion segments based on real data
- Update legend with real emotion names and percentages
- Update center text to show actual total entries count
- Handle empty state (no emotions/entries)

### 3. Data Flow

```
HomeScreen (useEffect)
    ↓
Redux Thunk: fetchEmotionStatistics(userId)
    ↓
journalApi.getEmotionStatistics()
    ↓
GET /api/journal-orchestration/statistics/emotions
    ↓
JournalOrchestrationController
    ↓
JournalOrchestrationService.GetUserEmotionStatisticsAsync()
    ├─→ JournalEntryService.GetUserEmotionCountsAsync()
    │   └─→ JournalEntryRepository.GetUserEmotionCountsAsync()
    │       └─→ Database Query (emotion counts only)
    │
    └─→ EmotionService.GetEmotionsByIdsAsync(emotionIds)
        └─→ Database Query (emotion details)

    ↓ (Assembles data together)
    ↓
EmotionStatisticsResponse returned to frontend
    ↓
Redux store updated
    ↓
DonutChart component re-renders with real data
```

### 4. Database Queries

**Query 1 - Emotion Counts** (executed in JournalEntryRepository):
```sql
SELECT
    jee.emotion_id,
    COUNT(jee.id) as emotion_count
FROM journal_entry_emotions jee
JOIN journal_entries je ON jee.journal_entry_id = je.id
WHERE je.user_id = @userId AND je.is_deleted = false
GROUP BY jee.emotion_id
ORDER BY emotion_count DESC
```

**Query 2 - Emotion Details** (executed in EmotionService):
```sql
SELECT
    id,
    name,
    color
FROM emotions
WHERE id IN (@emotionIds)
```

### 5. Edge Cases & Considerations

- **No entries**: Show empty state or placeholder
- **No emotions**: Handle gracefully (shouldn't happen with AI analysis)
- **Performance**: Consider caching statistics for 1-5 minutes
- **Real-time updates**: Statistics update when new journal entries are created
- **Date filtering**: Future enhancement for time-range statistics

### 6. Testing Strategy

- Unit tests for `EmotionStatisticsService`
- Integration tests for repository query
- Component tests for donut chart with real data
- E2E test: Create journal entry → Verify emotion appears in chart

## Implementation Order

1. Backend: Add repository method in `services.journal` for emotion counts
2. Backend: Add method in `JournalEntryService` to call repository
3. Backend: Add method in `EmotionService` (services.emotions) to get emotion details
4. Backend: Add orchestration service method to assemble data
5. Backend: Add controller endpoint
6. React Native: API hook
7. React Native: Redux slice
8. React Native: Update HomeScreen
9. React Native: Update DonutChart component
10. Testing & refinement

## Success Criteria

✅ Donut chart displays real emotion distribution from journal entries
✅ Entry count is accurate
✅ Only emotions present in entries are shown
✅ Percentages are calculated correctly
✅ Chart updates when new entries are created
✅ Handles edge cases (no entries, no emotions)
✅ No hardcoded data in UI

