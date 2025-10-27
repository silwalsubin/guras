import { JournalEntry, CreateJournalEntryDto, UpdateJournalEntryDto, JournalEntryResponse } from '@/types/journal';
import { apiService, ApiResponse } from '@/services/api';

const convertResponseToEntry = (response: JournalEntryResponse): JournalEntry => {
  return {
    ...response,
    // Keep dates as ISO strings for Redux serialization
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  };
};

export const journalApi = {
  /**
   * Get all journal entries for a user
   */
  async getEntries(userId: string, page: number = 1, pageSize: number = 20, search?: string): Promise<JournalEntry[]> {
    try {
      console.log('📖 Fetching journal entries for user:', userId, search ? `with search: ${search}` : '');

      let url = `/api/journal/entries?page=${page}&pageSize=${pageSize}`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      const response = await apiService.makeRequest<JournalEntryResponse[]>(url);

      if (response.success && response.data) {
        console.log('✅ Entries fetched successfully:', response.data.length);
        return response.data.map(convertResponseToEntry);
      } else {
        console.error('❌ API Error:', response.error?.message);
        throw new Error(response.error?.message || 'Failed to fetch journal entries');
      }
    } catch (error) {
      console.error('❌ Error fetching journal entries:', error);
      throw error;
    }
  },

  /**
   * Get a specific journal entry
   */
  async getEntry(entryId: string): Promise<JournalEntry> {
    try {
      const response = await apiService.makeRequest<JournalEntryResponse>(
        `/api/journal/entries/${entryId}`
      );

      if (response.success && response.data) {
        return convertResponseToEntry(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch journal entry');
      }
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      throw error;
    }
  },

  /**
   * Create a new journal entry
   */
  async createEntry(userId: string, data: CreateJournalEntryDto): Promise<JournalEntry> {
    try {
      console.log('📝 Creating journal entry with data:', { content: data.content?.substring(0, 50), mood: data.mood, moodScore: data.moodScore });

      const response = await apiService.makeRequest<JournalEntryResponse>(
        '/api/journal/entries',
        { method: 'POST', body: JSON.stringify(data) }
      );

      console.log('📝 Create entry response:', { success: response.success, hasData: !!response.data, error: response.error });

      if (response.success && response.data) {
        console.log('✅ Journal entry created successfully:', response.data.id);
        return convertResponseToEntry(response.data);
      } else {
        const errorMessage = response.error?.message || 'Failed to create journal entry';
        console.error('❌ Failed to create journal entry:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create journal entry';
      console.error('❌ Error creating journal entry:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Update a journal entry
   */
  async updateEntry(entryId: string, data: UpdateJournalEntryDto): Promise<JournalEntry> {
    try {
      const response = await apiService.makeRequest<JournalEntryResponse>(
        `/api/journal/entries/${entryId}`,
        { method: 'PUT', body: JSON.stringify(data) }
      );

      if (response.success && response.data) {
        return convertResponseToEntry(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to update journal entry');
      }
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  },

  /**
   * Delete a journal entry (soft delete)
   */
  async deleteEntry(entryId: string): Promise<void> {
    try {
      const response = await apiService.makeRequest<void>(
        `/api/journal/entries/${entryId}`,
        { method: 'DELETE' }
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete journal entry');
      }
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  },
};

