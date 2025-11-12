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
   * Get all journal entries for a user (with emotions from orchestration layer)
   */
  async getEntries(userId: string, page: number = 1, pageSize: number = 20, search?: string): Promise<JournalEntry[]> {
    try {
      console.log('📖 Fetching journal entries for user:', userId, search ? `with search: ${search}` : '');

      let url = `/api/journal-orchestration/entries?page=${page}&pageSize=${pageSize}`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      const response = await apiService.makeRequest<JournalEntryResponse[]>(url);

      if (response.success && response.data) {
        console.log('✅ Entries fetched successfully:', response.data.length);
        // Log first entry's emotions for debugging
        if (response.data.length > 0) {
          console.log('📊 First entry full response:', JSON.stringify(response.data[0], null, 2));
          console.log('📊 First entry emotions:', {
            id: response.data[0].id,
            emotionCount: response.data[0].emotions?.length ?? 0,
            emotions: response.data[0].emotions?.map(e => ({ id: e.id, name: e.name, color: e.color })) ?? []
          });
        }
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
   * Get a specific journal entry (with emotions from orchestration layer)
   */
  async getEntry(entryId: string): Promise<JournalEntry> {
    try {
      const response = await apiService.makeRequest<JournalEntryResponse>(
        `/api/journal-orchestration/entries/${entryId}`
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
   * Create a new journal entry with emotions (via orchestration layer)
   */
  async createEntry(userId: string, data: CreateJournalEntryDto): Promise<JournalEntry> {
    try {
      console.log('📝 Creating journal entry with data:', { content: data.content?.substring(0, 50) });

      const response = await apiService.makeRequest<JournalEntryResponse>(
        '/api/journal-orchestration/entries',
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
   * Update a journal entry with emotions (via orchestration layer)
   */
  async updateEntry(entryId: string, data: UpdateJournalEntryDto): Promise<JournalEntry> {
    try {
      const response = await apiService.makeRequest<JournalEntryResponse>(
        `/api/journal-orchestration/entries/${entryId}`,
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
        `/api/journal-orchestration/entries/${entryId}`,
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

