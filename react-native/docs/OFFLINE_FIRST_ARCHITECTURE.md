# Offline-First Data Architecture for Guras Meditation App

> **Location**: `react-native/docs/OFFLINE_FIRST_ARCHITECTURE.md`  
> **Last Updated**: December 2024  
> **Status**: Draft - Ready for Implementation

## Overview

This document outlines the architecture for implementing offline-first data storage with database synchronization in the Guras React Native meditation application. The architecture ensures data availability when offline while maintaining synchronization with the backend database when connectivity is available.

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Architecture Design](#architecture-design)
3. [Implementation Strategy](#implementation-strategy)
4. [Data Models Enhancement](#data-models-enhancement)
5. [API Integration](#api-integration)
6. [Error Handling & Recovery](#error-handling--recovery)
7. [Performance Considerations](#performance-considerations)
8. [Testing Strategy](#testing-strategy)
9. [Migration Strategy](#migration-strategy)
10. [Monitoring & Analytics](#monitoring--analytics)
11. [Security Considerations](#security-considerations)
12. [Future Enhancements](#future-enhancements)

## Current State Analysis

### Existing Infrastructure
- **Frontend**: React Native with Redux Toolkit for state management
- **Backend**: .NET 8 Web API with PostgreSQL database
- **Authentication**: Firebase Auth
- **Storage**: Currently in-memory Redux state (data lost on app restart)
- **Services**: Quotes, Meditation, Notifications, Audio, Users

### Data Types Requiring Offline Support
1. **User Meditation Progress** - Session completions, ratings, notes
2. **Quotes Data** - User likes, comments, preferences
3. **Guided Meditation Progress** - Program enrollments, completion status
4. **User Preferences** - Notification settings, theme preferences
5. **Downloaded Audio Files** - Local audio file references

## Architecture Design

### 1. Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Layer      │    │   Sync Service   │    │   Local Storage │
│   (Redux)       │◄──►│   (Background)   │◄──►│   (AsyncStorage)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌──────────────────┐             │
         └─────────────►│   API Service    │◄────────────┘
                        │   (Server)       │
                        └──────────────────┘
```

### 2. Core Components

#### 2.1 Redux Persist Layer
- **Purpose**: Automatically persist Redux state to local storage
- **Technology**: `redux-persist` + `@react-native-async-storage/async-storage`
- **Scope**: Selected slices only (quotes, meditation, guidedMeditation)

#### 2.2 Sync Service
- **Purpose**: Handle bidirectional data synchronization
- **Features**: 
  - Optimistic updates
  - Conflict resolution
  - Retry mechanisms
  - Network awareness

#### 2.3 Data Models
- **Local Models**: Mirror server models with sync metadata
- **Sync Queue**: Track pending changes for server sync
- **Conflict Resolution**: Handle data conflicts intelligently

## Implementation Strategy

### Phase 1: Foundation Setup

#### 1.1 Redux Persist Configuration
```typescript
// store/persistConfig.ts
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['quotes', 'meditation', 'guidedMeditation'],
  blacklist: ['navigation', 'bottomNav'], // Don't persist UI state
  transforms: [
    // Custom transforms for data serialization
  ]
};
```

#### 1.2 Enhanced Data Models
```typescript
// types/sync.ts
interface SyncMetadata {
  lastSyncedAt: number;
  isDirty: boolean;
  syncStatus: 'synced' | 'pending' | 'failed';
  retryCount: number;
}

interface OfflineEntity {
  id: string;
  syncMetadata: SyncMetadata;
  // ... entity-specific fields
}
```

### Phase 2: Sync Service Implementation

#### 2.1 Sync Service Architecture
```typescript
// services/syncService.ts
class SyncService {
  private syncQueue: SyncQueueItem[] = [];
  private isOnline: boolean = false;
  private syncInProgress: boolean = false;

  // Core sync methods
  async syncAll(): Promise<void>
  async syncEntity(entityType: string): Promise<void>
  async syncPendingChanges(): Promise<void>
  
  // Queue management
  async addToSyncQueue(item: SyncQueueItem): Promise<void>
  async processSyncQueue(): Promise<void>
  
  // Conflict resolution
  async resolveConflict(local: any, server: any): Promise<any>
}
```

#### 2.2 Sync Queue Management
```typescript
interface SyncQueueItem {
  id: string;
  entityType: 'quotes' | 'meditation' | 'guidedMeditation';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}
```

### Phase 3: Data Synchronization Patterns

#### 3.1 Optimistic Updates
```typescript
// Redux action for optimistic updates
const toggleQuoteLike = createAsyncThunk(
  'quotes/toggleLike',
  async (quoteId: string, { dispatch, getState }) => {
    // 1. Update UI immediately
    dispatch(quotesSlice.actions.toggleLike(quoteId));
    
    // 2. Add to sync queue
    await syncService.addToSyncQueue({
      entityType: 'quotes',
      entityId: quoteId,
      action: 'UPDATE',
      data: { liked: true }
    });
    
    // 3. Sync in background
    syncService.syncInBackground();
  }
);
```

#### 3.2 Pull-to-Refresh Pattern
```typescript
// Enhanced refresh functionality
const useRefreshData = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await syncService.syncAll();
    } catch (error) {
      // Handle sync errors
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return { isRefreshing, refreshData };
};
```

#### 3.3 Background Synchronization
```typescript
// App state change handling
useEffect(() => {
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && isOnline) {
      syncService.syncInBackground();
    }
  };
  
  AppState.addEventListener('change', handleAppStateChange);
}, [isOnline]);
```

### Phase 4: Conflict Resolution Strategy

#### 4.1 Conflict Resolution Rules
1. **User Intent Priority**: User's most recent action takes precedence
2. **Timestamp-based**: Server timestamp wins for simultaneous changes
3. **Data Merging**: For non-conflicting fields, merge both versions
4. **User Notification**: Alert user for complex conflicts requiring manual resolution

#### 4.2 Conflict Resolution Implementation
```typescript
const resolveConflict = (local: OfflineEntity, server: OfflineEntity): OfflineEntity => {
  // Compare timestamps
  if (server.syncMetadata.lastSyncedAt > local.syncMetadata.lastSyncedAt) {
    return { ...server, syncMetadata: { ...server.syncMetadata, isDirty: false } };
  }
  
  // Merge non-conflicting fields
  return {
    ...local,
    ...server,
    syncMetadata: {
      ...local.syncMetadata,
      isDirty: true,
      syncStatus: 'pending'
    }
  };
};
```

## Data Models Enhancement

### 1. Enhanced Quote Model
```typescript
interface QuoteWithSync extends Quote {
  syncMetadata: SyncMetadata;
  localLikes: number;
  localComments: number;
}

interface QuotesState {
  // ... existing state
  quotes: QuoteWithSync[];
  syncQueue: SyncQueueItem[];
  lastSyncTimestamp: number;
  syncInProgress: boolean;
}
```

### 2. Enhanced Meditation Progress Model
```typescript
interface MeditationProgressWithSync extends UserMeditationProgress {
  syncMetadata: SyncMetadata;
  localNotes?: string;
  localRating?: number;
}

interface MeditationState {
  // ... existing state
  progress: MeditationProgressWithSync[];
  pendingProgress: MeditationProgressWithSync[];
}
```

## API Integration

### 1. Enhanced API Service
```typescript
// services/api.ts
class ApiService {
  // Sync-specific endpoints
  async getChangesSince(timestamp: number): Promise<ServerChanges>
  async syncEntityChanges(entityType: string, changes: SyncQueueItem[]): Promise<SyncResult>
  async resolveConflict(entityType: string, conflict: ConflictData): Promise<ResolvedData>
  
  // Batch operations
  async batchSync(changes: SyncQueueItem[]): Promise<BatchSyncResult>
}
```

### 2. Server-Side Sync Endpoints
```csharp
// Controllers/SyncController.cs
[ApiController]
[Route("api/[controller]")]
public class SyncController : ControllerBase
{
    [HttpPost("changes")]
    public async Task<IActionResult> GetChangesSince([FromBody] SyncRequest request)
    
    [HttpPost("sync")]
    public async Task<IActionResult> SyncChanges([FromBody] SyncChangesRequest request)
    
    [HttpPost("resolve-conflict")]
    public async Task<IActionResult> ResolveConflict([FromBody] ConflictResolutionRequest request)
}
```

## Error Handling & Recovery

### 1. Sync Error Categories
- **Network Errors**: Temporary connectivity issues
- **Authentication Errors**: Token expiration
- **Server Errors**: Backend service issues
- **Data Validation Errors**: Invalid data format
- **Conflict Errors**: Data conflicts requiring resolution

### 2. Retry Strategy
```typescript
const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2
};

const syncWithRetry = async (item: SyncQueueItem) => {
  for (let attempt = 0; attempt < retryConfig.maxRetries; attempt++) {
    try {
      await syncToServer(item);
      return;
    } catch (error) {
      if (attempt === retryConfig.maxRetries - 1) {
        await markAsFailed(item);
        throw error;
      }
      
      const delay = Math.min(
        retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
        retryConfig.maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

### 3. User Notifications
```typescript
const showSyncStatus = (status: SyncStatus) => {
  switch (status) {
    case 'syncing':
      showToast('Syncing data...', 'info');
      break;
    case 'success':
      showToast('Data synced successfully', 'success');
      break;
    case 'failed':
      showToast('Sync failed. Will retry when online.', 'error');
      break;
    case 'conflict':
      showAlert('Data conflict detected. Please review changes.');
      break;
  }
};
```

## Performance Considerations

### 1. Data Optimization
- **Selective Persistence**: Only persist essential data slices
- **Data Compression**: Compress large data before storage
- **Incremental Sync**: Only sync changed data since last sync
- **Pagination**: Implement pagination for large datasets

### 2. Memory Management
- **Lazy Loading**: Load data on demand
- **Cache Cleanup**: Remove old cached data
- **Memory Monitoring**: Monitor memory usage for large datasets

### 3. Network Optimization
- **Batch Operations**: Group multiple changes into single requests
- **Request Deduplication**: Avoid duplicate requests
- **Compression**: Compress network payloads
- **Offline Detection**: Skip network operations when offline

## Testing Strategy

### 1. Unit Tests
- Sync service logic
- Conflict resolution algorithms
- Data transformation functions
- Error handling scenarios

### 2. Integration Tests
- Redux persist integration
- API sync operations
- Network state changes
- App state transitions

### 3. E2E Tests
- Complete offline/online workflows
- Data consistency across app restarts
- Sync queue processing
- Conflict resolution flows

## Migration Strategy

### 1. Phase 1: Setup (Week 1)
- Install and configure Redux Persist
- Set up basic sync service structure
- Implement data model enhancements

### 2. Phase 2: Core Sync (Week 2)
- Implement sync service core functionality
- Add optimistic updates for quotes
- Set up basic conflict resolution

### 3. Phase 3: Advanced Features (Week 3)
- Implement background sync
- Add comprehensive error handling
- Set up sync queue management

### 4. Phase 4: Testing & Optimization (Week 4)
- Comprehensive testing
- Performance optimization
- User experience refinement

## Monitoring & Analytics

### 1. Sync Metrics
- Sync success/failure rates
- Average sync duration
- Conflict resolution frequency
- Data consistency metrics

### 2. Performance Metrics
- Local storage usage
- Network data usage
- Sync queue size
- Memory consumption

### 3. User Experience Metrics
- Offline usage patterns
- Sync failure impact on user actions
- Data loss incidents
- User satisfaction with offline experience

## Security Considerations

### 1. Data Encryption
- Encrypt sensitive data in local storage
- Use secure key management
- Implement data integrity checks

### 2. Sync Security
- Validate all synced data
- Implement proper authentication
- Use secure communication channels

### 3. Privacy
- Minimize data collection
- Implement data retention policies
- Provide user control over data sync

## Future Enhancements

### 1. Advanced Features
- Real-time sync with WebSockets
- Multi-device synchronization
- Advanced conflict resolution UI
- Data versioning and rollback

### 2. Scalability
- Database sharding support
- Microservices architecture
- CDN integration for media files
- Advanced caching strategies

### 3. Analytics
- Advanced sync analytics
- User behavior tracking
- Performance monitoring
- Predictive sync optimization

## Conclusion

This architecture provides a robust foundation for implementing offline-first data storage in the Guras meditation app. The phased approach ensures gradual implementation while maintaining app stability. The design prioritizes user experience, data consistency, and system reliability.

The implementation will enable users to enjoy a seamless meditation experience regardless of network connectivity while ensuring their progress and preferences are safely synchronized across devices.
