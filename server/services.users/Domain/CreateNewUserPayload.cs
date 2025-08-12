namespace services.users.Domain;

public class CreateNewUserPayload
{
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? FireBaseUserId { get; set; }
}