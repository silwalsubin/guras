using Amazon;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using Newtonsoft.Json;

namespace utilities.aws.Utilities;

public static class AwsUtility
{
    public static RegionEndpoint GetAwsRegionEndPoint()
    {
        var region = "us-east-1";
        var regionEndPoint = RegionEndpoint.GetBySystemName(region);
        return regionEndPoint;
    }

    public static async Task<T> GetSecretValueAsync<T>(this string secretName, string version = "AWSCURRENT")
    {
        using var client = new AmazonSecretsManagerClient(GetAwsRegionEndPoint());
        var request = new GetSecretValueRequest
        {
            SecretId = secretName,
            VersionStage = version
        };
        var response = await client.GetSecretValueAsync(request);
        var result = JsonConvert.DeserializeObject<T>(response.SecretString);
        return result ?? throw new InvalidOperationException($"Failed to deserialize secret '{secretName}' as type {typeof(T).Name}");
    }
}
