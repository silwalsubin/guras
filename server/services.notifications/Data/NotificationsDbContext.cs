using Microsoft.EntityFrameworkCore;
using services.notifications.Models;

namespace services.notifications.Data;

public class NotificationsDbContext : DbContext
{
    public NotificationsDbContext(DbContextOptions<NotificationsDbContext> options) : base(options)
    {
    }

    public DbSet<UserNotificationPreferencesEntity> UserNotificationPreferences { get; set; }
    public DbSet<NotificationTokenEntity> NotificationTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure UserNotificationPreferencesEntity
        modelBuilder.Entity<UserNotificationPreferencesEntity>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.ToTable("user_notification_preferences");

            // Configure constraints
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(255);

            // Configure default values
            entity.Property(e => e.Enabled).HasDefaultValue(true);
            entity.Property(e => e.Frequency).HasDefaultValue(3); // Daily
            entity.Property(e => e.QuietHoursStart).HasDefaultValue(new TimeSpan(22, 0, 0));
            entity.Property(e => e.QuietHoursEnd).HasDefaultValue(new TimeSpan(8, 0, 0));
            entity.Property(e => e.LastNotificationSent).HasDefaultValue(DateTime.MinValue);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Configure NotificationTokenEntity
        modelBuilder.Entity<NotificationTokenEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("notification_tokens");

            // Configure indexes
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Token).IsUnique();

            // Configure constraints
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Platform).HasMaxLength(50);

            // Configure default values
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Modified &&
                       (e.Entity is UserNotificationPreferencesEntity || e.Entity is NotificationTokenEntity));

        foreach (var entry in entries)
        {
            if (entry.Entity is UserNotificationPreferencesEntity prefs)
            {
                prefs.UpdatedAt = DateTime.UtcNow;
            }
            else if (entry.Entity is NotificationTokenEntity token)
            {
                token.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}

