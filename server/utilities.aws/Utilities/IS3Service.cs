namespace utilities.aws.Utilities;

public interface IS3Service
{
    Task<string> GeneratePreSignedUploadUrlAsync(string bucketName, string fileName, TimeSpan expiration);
    Task<string> GeneratePreSignedDownloadUrlAsync(string bucketName, string fileName, TimeSpan expiration);
    Task<bool> UploadFileAsync(string bucketName, string fileName, Stream fileStream, string? contentType = null);
    Task<bool> DeleteFileAsync(string bucketName, string fileName);
    Task<IEnumerable<string>> ListFilesAsync(string bucketName, string prefix = "");
    Task<bool> FileExistsAsync(string bucketName, string fileName);
}