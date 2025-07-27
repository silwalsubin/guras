using Amazon.S3;
using Amazon.S3.Model;

namespace apis.Services;

public class S3Service : IS3Service
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly ILogger<S3Service> _logger;

    public S3Service(IAmazonS3 s3Client, IConfiguration configuration, ILogger<S3Service> logger)
    {
        _s3Client = s3Client;
        _logger = logger;
        
        // Get bucket name from environment or configuration
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")?.ToLower() ?? "development";
        _bucketName = $"{environment}-guras-audio-files";
        
        _logger.LogInformation("S3Service initialized with bucket: {BucketName}", _bucketName);
    }

    public async Task<string> GeneratePresignedUploadUrlAsync(string fileName, TimeSpan expiration)
    {
        try
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = fileName,
                Verb = HttpVerb.PUT,
                Expires = DateTime.UtcNow.Add(expiration),
                ContentType = GetContentType(fileName)
            };

            var presignedUrl = await _s3Client.GetPreSignedURLAsync(request);
            _logger.LogInformation("Generated pre-signed upload URL for file: {FileName}", fileName);
            
            return presignedUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating pre-signed upload URL for file: {FileName}", fileName);
            throw;
        }
    }

    public async Task<string> GeneratePresignedDownloadUrlAsync(string fileName, TimeSpan expiration)
    {
        try
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = fileName,
                Verb = HttpVerb.GET,
                Expires = DateTime.UtcNow.Add(expiration)
            };

            var presignedUrl = await _s3Client.GetPreSignedURLAsync(request);
            _logger.LogInformation("Generated pre-signed download URL for file: {FileName}", fileName);
            
            return presignedUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating pre-signed download URL for file: {FileName}", fileName);
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(string fileName)
    {
        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName
            };

            await _s3Client.DeleteObjectAsync(request);
            _logger.LogInformation("Deleted file: {FileName}", fileName);
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file: {FileName}", fileName);
            return false;
        }
    }

    public async Task<IEnumerable<string>> ListFilesAsync(string prefix = "")
    {
        try
        {
            var request = new ListObjectsV2Request
            {
                BucketName = _bucketName,
                Prefix = prefix,
                MaxKeys = 1000
            };

            var response = await _s3Client.ListObjectsV2Async(request);
            var fileNames = response.S3Objects?.Select(obj => obj.Key).ToList() ?? new List<string>();
            
            _logger.LogInformation("Listed {Count} files with prefix: {Prefix}", fileNames.Count, prefix);
            
            return fileNames;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing files with prefix: {Prefix}", prefix);
            throw;
        }
    }

    public async Task<bool> FileExistsAsync(string fileName)
    {
        try
        {
            var request = new GetObjectMetadataRequest
            {
                BucketName = _bucketName,
                Key = fileName
            };

            await _s3Client.GetObjectMetadataAsync(request);
            return true;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if file exists: {FileName}", fileName);
            throw;
        }
    }

    private static string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".m4a" => "audio/mp4",
            ".aac" => "audio/aac",
            ".ogg" => "audio/ogg",
            ".flac" => "audio/flac",
            _ => "application/octet-stream"
        };
    }
} 