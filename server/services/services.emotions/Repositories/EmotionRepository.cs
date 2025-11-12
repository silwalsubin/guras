using Microsoft.EntityFrameworkCore;
using services.emotions.Data;
using services.emotions.Domain;
using services.emotions.Models;

namespace services.emotions.Repositories;

public interface IEmotionRepository
{
    Task<List<Emotion>> GetAllAsync();
    Task<Emotion?> GetByIdAsync(string id);
    Task<Emotion?> GetByNameAsync(string name);
    Task<List<Emotion>> GetByIdsAsync(List<string> ids);
}

public class EmotionRepository : IEmotionRepository
{
    private readonly EmotionsDbContext _context;

    public EmotionRepository(EmotionsDbContext context)
    {
        _context = context;
    }

    public async Task<List<Emotion>> GetAllAsync()
    {
        var entities = await _context.Emotions
            .Where(e => e.IsActive)
            .ToListAsync();

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<Emotion?> GetByIdAsync(string id)
    {
        var entity = await _context.Emotions
            .FirstOrDefaultAsync(e => e.Id == id && e.IsActive);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<Emotion?> GetByNameAsync(string name)
    {
        var entity = await _context.Emotions
            .FirstOrDefaultAsync(e => e.Name == name && e.IsActive);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<List<Emotion>> GetByIdsAsync(List<string> ids)
    {
        var entities = await _context.Emotions
            .Where(e => ids.Contains(e.Id) && e.IsActive)
            .ToListAsync();

        return entities.Select(MapToDomain).ToList();
    }

    private static Emotion MapToDomain(EmotionEntity entity)
    {
        return new Emotion
        {
            Id = entity.Id,
            Name = entity.Name,
            Color = entity.Color,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}

