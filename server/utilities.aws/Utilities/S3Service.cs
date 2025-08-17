using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;

namespace utilities.aws.Utilities;

public class S3Service(IAmazonS3 s3Client, ILogger<S3Service> logger) : IS3Service
{
    public async Task<string> GeneratePreSignedUploadUrlAsync(string bucketName, string fileName, TimeSpan expiration)
    {
        try
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = fileName,
                Verb = HttpVerb.PUT,
                Expires = DateTime.UtcNow.Add(expiration),
                ContentType = GetContentType(fileName)
            };

            var preSignedUrl = await s3Client.GetPreSignedURLAsync(request);
            logger.LogInformation("Generated pre-signed upload URL for file: {FileName}", fileName);
            
            return preSignedUrl;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error generating pre-signed upload URL for file: {FileName}", fileName);
            throw;
        }
    }

    public async Task<string> GeneratePreSignedDownloadUrlAsync(string bucketName, string fileName, TimeSpan expiration)
    {
        try
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = fileName,
                Verb = HttpVerb.GET,
                Expires = DateTime.UtcNow.Add(expiration)
            };

            var presignedUrl = await s3Client.GetPreSignedURLAsync(request);
            logger.LogInformation("Generated pre-signed download URL for file: {FileName}", fileName);

            return presignedUrl;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error generating pre-signed download URL for file: {FileName}", fileName);
            throw;
        }
    }

    public async Task<bool> UploadFileAsync(string bucketName, string fileName, Stream fileStream, string? contentType = null)
    {
        try
        {
            var request = new PutObjectRequest
            {
                BucketName = bucketName,
                Key = fileName,
                InputStream = fileStream,
                ContentType = contentType ?? GetContentType(fileName),
                ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
            };

            await s3Client.PutObjectAsync(request);
            logger.LogInformation("Successfully uploaded file: {FileName} to bucket: {BucketName}", fileName, bucketName);

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error uploading file: {FileName} to bucket: {BucketName}", fileName, bucketName);
            return false;
        }
    }

    public async Task<bool> DeleteFileAsync(string bucketName, string fileName)
    {
        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = bucketName,
                Key = fileName
            };

            await s3Client.DeleteObjectAsync(request);
            logger.LogInformation("Deleted file: {FileName}", fileName);
            
            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting file: {FileName}", fileName);
            return false;
        }
    }

    public async Task<IEnumerable<string>> ListFilesAsync(string bucketName, string prefix = "")
    {
        try
        {
            var request = new ListObjectsV2Request
            {
                BucketName = bucketName,
                Prefix = prefix,
                MaxKeys = 1000
            };

            var response = await s3Client.ListObjectsV2Async(request);
            var fileNames = (response.S3Objects?.Select(obj => obj.Key)).ToList<string>() ?? new List<string>();
            
            logger.LogInformation("Listed {Count} files with prefix: {Prefix}", fileNames.Count, prefix);
            
            return fileNames;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error listing files with prefix: {Prefix}", prefix);
            throw;
        }
    }

    public async Task<bool> FileExistsAsync(string bucketName, string fileName)
    {
        try
        {
            var request = new GetObjectMetadataRequest
            {
                BucketName = bucketName,
                Key = fileName
            };

            await s3Client.GetObjectMetadataAsync(request);
            return true;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error checking if file exists: {FileName}", fileName);
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