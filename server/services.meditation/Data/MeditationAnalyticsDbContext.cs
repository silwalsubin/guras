using Microsoft.EntityFrameworkCore;
using services.meditation.Models;

namespace services.meditation.Data;

public class MeditationAnalyticsDbContext : DbContext
{
    public MeditationAnalyticsDbContext(DbContextOptions<MeditationAnalyticsDbContext> options) : base(options)
    {
    }

    public DbSet<MeditationAnalyticsEntity> MeditationAnalytics { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure MeditationAnalyticsEntity
        modelBuilder.Entity<MeditationAnalyticsEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("meditation_analytics");

            // Configure indexes
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.SessionId);
            entity.HasIndex(e => e.TeacherId);
            entity.HasIndex(e => e.SessionStartTime);
            entity.HasIndex(e => e.Completed);
            entity.HasIndex(e => new { e.UserId, e.SessionStartTime });
            entity.HasIndex(e => new { e.UserId, e.TeacherId });
            entity.HasIndex(e => e.TimeOfDay);
            entity.HasIndex(e => e.DifficultyLevel);
            entity.HasIndex(e => e.MeditationTheme);
            entity.HasIndex(e => new { e.UserId, e.SessionStartTime, e.Completed });

            // Configure constraints
            entity.Property(e => e.SessionId).IsRequired().HasMaxLength(255);
            entity.Property(e => e.SessionTitle).HasMaxLength(255);
            entity.Property(e => e.TeacherName).HasMaxLength(255);
            entity.Property(e => e.MusicName).HasMaxLength(255);
            entity.Property(e => e.MeditationTheme).HasMaxLength(100);
            entity.Property(e => e.DifficultyLevel).HasMaxLength(50);
            entity.Property(e => e.EmotionalStateBefore).HasMaxLength(50);
            entity.Property(e => e.EmotionalStateAfter).HasMaxLength(50);
            entity.Property(e => e.TimeOfDay).HasMaxLength(50);
            entity.Property(e => e.DayOfWeek).HasMaxLength(20);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.SessionStartTime).IsRequired();

            // Configure default values
            entity.Property(e => e.IsProgramSession).HasDefaultValue(false);
            entity.Property(e => e.Completed).HasDefaultValue(false);
            entity.Property(e => e.CompletionPercentage).HasDefaultValue(0);
            entity.Property(e => e.PausedCount).HasDefaultValue(0);
            entity.Property(e => e.TotalPauseDurationSeconds).HasDefaultValue(0);
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
        var entries = ChangeTracker.Entries<MeditationAnalyticsEntity>()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
    }
}

