namespace utilities.aws.Utilities;

public class AudioFilesUtility
{
    private readonly IS3Service _s3Service;
    private readonly string _bucketName;

    public AudioFilesUtility(IS3Service s3Service)
    {
        _s3Service = s3Service;
        // Get bucket name from environment or configuration
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")?.ToLower() ?? "development";
        _bucketName = $"{environment}-guras-audio-files";
    }

    public async Task<string> GeneratePreSignedUploadUrlAsync(string fileName, TimeSpan expiration)
    {
        return await _s3Service.GeneratePreSignedUploadUrlAsync(_bucketName, fileName, expiration);
    }

    public async Task<string> GeneratePreSignedDownloadUrlAsync(string fileName, TimeSpan expiration)
    {
        return await _s3Service.GeneratePreSignedDownloadUrlAsync(_bucketName, fileName, expiration);
    }

    public async Task<bool> DeleteFileAsync(string fileName)
    {
        return await _s3Service.DeleteFileAsync(_bucketName, fileName);
    }

    public async Task<IEnumerable<string>> ListFilesAsync(string prefix = "")
    {
        return await _s3Service.ListFilesAsync(_bucketName, prefix);
    }

    public async Task<bool> FileExistsAsync(string fileName)
    {
        return await _s3Service.FileExistsAsync(_bucketName, fileName);
    }
}