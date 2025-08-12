namespace services.users.Domain;

public class UpdateUserPayload
{
    public Guid UserId { get; set; }
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? FireBaseUserId { get; set; }
}