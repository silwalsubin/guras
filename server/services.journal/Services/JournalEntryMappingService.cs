using services.journal.Domain;
using services.journal.Models;
using services.journal.Requests;

namespace services.journal.Services;

public static class JournalEntryMappingService
{
    public static JournalEntryEntity ToEntity(this JournalEntry journalEntry)
    {
        return new JournalEntryEntity
        {
            Id = journalEntry.Id,
            UserId = journalEntry.UserId,
            Title = journalEntry.Title,
            Content = journalEntry.Content,
            Mood = journalEntry.Mood,
            MoodScore = journalEntry.MoodScore,
            Tags = journalEntry.Tags,
            CreatedAt = journalEntry.CreatedAt,
            UpdatedAt = journalEntry.UpdatedAt,
            IsDeleted = journalEntry.IsDeleted
        };
    }

    public static JournalEntry ToDomain(this JournalEntryEntity entity)
    {
        return new JournalEntry
        {
            Id = entity.Id,
            UserId = entity.UserId,
            Title = entity.Title,
            Content = entity.Content,
            Mood = entity.Mood,
            MoodScore = entity.MoodScore,
            Tags = entity.Tags,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
            IsDeleted = entity.IsDeleted
        };
    }

    public static JournalEntry ToDomain(this CreateJournalEntryRequest request, Guid userId, string title, string? mood = null, int? moodScore = null)
    {
        return new JournalEntry
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Content = request.Content,
            Mood = mood,
            MoodScore = moodScore,
            Tags = request.Tags ?? Array.Empty<string>(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsDeleted = false
        };
    }
}

