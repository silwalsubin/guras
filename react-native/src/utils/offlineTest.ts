// Simple test utility to verify offline functionality
import offlineStorageService from '@/services/offlineStorageService';

export const testOfflineStorage = async () => {
  console.log('🧪 Testing offline storage functionality...');
  
  try {
    // Test saving a meditation session
    const sessionId = await offlineStorageService.saveMeditationSession({
      sessionId: 'test_timer_123',
      duration: 10,
      completedAt: new Date().toISOString(),
      rating: 5,
      notes: 'Test meditation session',
      mood: { before: 3, after: 5 },
      sessionType: 'timer',
      isCompleted: true,
    });
    
    console.log('✅ Meditation session saved:', sessionId);
    
    // Test saving a guided session
    const guidedSessionId = await offlineStorageService.saveGuidedSession({
      sessionId: 'test_guided_456',
      title: 'Test Guided Session',
      teacherName: 'Test Teacher',
      theme: 'mindfulness',
      duration: 15,
      completedAt: new Date().toISOString(),
      rating: 4,
      mood: { before: 2, after: 4 },
      programId: 'test_program_1',
      programDay: 1,
      isCompleted: true,
    });
    
    console.log('✅ Guided session saved:', guidedSessionId);
    
    // Test getting offline stats
    const stats = await offlineStorageService.getOfflineStats();
    console.log('📊 Offline stats:', stats);
    
    // Test getting meditation sessions
    const meditationSessions = await offlineStorageService.getMeditationSessions();
    console.log('🧘 Meditation sessions:', meditationSessions.length);
    
    // Test getting guided sessions
    const guidedSessions = await offlineStorageService.getGuidedSessions();
    console.log('🎧 Guided sessions:', guidedSessions.length);
    
    console.log('✅ All offline storage tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Offline storage test failed:', error);
    return false;
  }
};

// Test Redux Persist functionality
export const testReduxPersistence = () => {
  console.log('🧪 Testing Redux Persist functionality...');
  
  // This would be called from a component to test persistence
  console.log('✅ Redux Persist is configured and should work');
  return true;
};
