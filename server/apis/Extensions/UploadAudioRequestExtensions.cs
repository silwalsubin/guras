using apis.Requests;
using CommunityToolkit.Diagnostics;

namespace apis.Extensions;

public static class UploadAudioRequestExtensions
{
    public static void Validate(this UploadAudioRequest request)
    {
        Guard.IsNotNull(request);

        // Validate required string fields
        Guard.IsNotNullOrEmpty(request.Name, nameof(request.Name));
        Guard.IsNotNullOrEmpty(request.Author, nameof(request.Author));

        // Validate audio file
        Guard.IsNotNull(request.AudioFile, nameof(request.AudioFile));
        Guard.IsGreaterThan(request.AudioFile.Length, 0, nameof(request.AudioFile));
        Guard.IsLessThanOrEqualTo(request.AudioFile.Length, 100 * 1024 * 1024, nameof(request.AudioFile));

        var allowedAudioTypes = new[] { "audio/mpeg", "audio/mp3", "audio/wav", "audio/m4a", "audio/aac" };
        Guard.IsTrue(allowedAudioTypes.Contains(request.AudioFile.ContentType), 
            nameof(request.AudioFile), 
            $"Audio file type '{request.AudioFile.ContentType}' is not supported. Allowed types: {string.Join(", ", allowedAudioTypes)}");

        // Validate thumbnail file
        Guard.IsNotNull(request.ThumbnailFile, nameof(request.ThumbnailFile));
        Guard.IsGreaterThan(request.ThumbnailFile.Length, 0, nameof(request.ThumbnailFile));
        Guard.IsLessThanOrEqualTo(request.ThumbnailFile.Length, 10 * 1024 * 1024, nameof(request.ThumbnailFile));

        var allowedImageTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
        Guard.IsTrue(allowedImageTypes.Contains(request.ThumbnailFile.ContentType), 
            nameof(request.ThumbnailFile), 
            $"Thumbnail file type '{request.ThumbnailFile.ContentType}' is not supported. Allowed types: {string.Join(", ", allowedImageTypes)}");
    }
}
