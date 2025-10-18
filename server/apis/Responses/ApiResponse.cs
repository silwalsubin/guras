using System.Text.Json.Serialization;

namespace apis.Responses;

public class ApiResponse<T>
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public T? Data { get; set; }

    [JsonPropertyName("error")]
    public ErrorInfo? Error { get; set; }

    [JsonPropertyName("traceId")]
    public string TraceId { get; set; } = string.Empty;

    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public static ApiResponse<T> SuccessResponse(T data, string traceId)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            TraceId = traceId
        };
    }

    public static ApiResponse<T> ErrorResponse(string message, string traceId, string? details = null, string? code = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Error = new ErrorInfo
            {
                Code = code ?? "GENERIC_ERROR",
                Message = message,
                Details = details
            },
            TraceId = traceId
        };
    }
}

public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse SuccessResponse(string traceId)
    {
        return new ApiResponse
        {
            Success = true,
            TraceId = traceId
        };
    }

    public static new ApiResponse ErrorResponse(string message, string traceId, string? details = null, string? code = null)
    {
        return new ApiResponse
        {
            Success = false,
            Error = new ErrorInfo
            {
                Code = code ?? "GENERIC_ERROR",
                Message = message,
                Details = details
            },
            TraceId = traceId
        };
    }
}
