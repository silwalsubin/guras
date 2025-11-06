using services.audio.Models;

namespace services.audio.Services;

public interface IAudioFileService
{
    Task<AudioFileResponse> UploadAudioAsync(FileUpload audioFile, FileUpload thumbnailFile, CreateAudioFileRequest metadata, Guid userId);
    Task<GetUploadUrlsResponse> GetUploadUrlsAsync(GetUploadUrlsRequest request, Guid userId);
    Task<AudioFileResponse?> GetByIdAsync(Guid id, int expirationMinutes = 60);
    Task<IEnumerable<AudioFileResponse>> GetByUserIdAsync(Guid userId, int expirationMinutes = 60);
    Task<IEnumerable<AudioFileResponse>> GetAllAsync(int expirationMinutes = 60);
    Task<AudioFileResponse?> UpdateAsync(Guid id, CreateAudioFileRequest request, int expirationMinutes = 60);
    Task<bool> DeleteAsync(Guid id);
}
