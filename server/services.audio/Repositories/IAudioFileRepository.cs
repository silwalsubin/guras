using services.audio.Models;

namespace services.audio.Repositories;

public interface IAudioFileRepository
{
    Task<AudioFile> CreateAsync(CreateAudioFileRequest request, Guid userId, string audioS3Key, string? thumbnailS3Key, Guid? audioFileId = null);
    Task<AudioFile?> GetByIdAsync(Guid id);
    Task<IEnumerable<AudioFile>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<AudioFile>> GetAllAsync();
    Task<AudioFile?> UpdateAsync(Guid id, CreateAudioFileRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
}
