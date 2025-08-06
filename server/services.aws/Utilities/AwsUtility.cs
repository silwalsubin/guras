using Amazon;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using Newtonsoft.Json;

namespace services.aws.Utilities;

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
        return JsonConvert.DeserializeObject<T>(response.SecretString);
    }
}