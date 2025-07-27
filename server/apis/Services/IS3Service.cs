namespace apis.Services;

public interface IS3Service
{
    Task<string> GeneratePresignedUploadUrlAsync(string fileName, TimeSpan expiration);
    Task<string> GeneratePresignedDownloadUrlAsync(string fileName, TimeSpan expiration);
    Task<bool> DeleteFileAsync(string fileName);
    Task<IEnumerable<string>> ListFilesAsync(string prefix = "");
    Task<bool> FileExistsAsync(string fileName);
} 