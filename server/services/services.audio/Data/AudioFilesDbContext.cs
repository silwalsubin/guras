using Microsoft.EntityFrameworkCore;
using services.audio.Models;

namespace services.audio.Data;

public class AudioFilesDbContext : DbContext
{
    public AudioFilesDbContext(DbContextOptions<AudioFilesDbContext> options) : base(options)
    {
    }

    public DbSet<AudioFileEntity> AudioFiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure AudioFileEntity
        modelBuilder.Entity<AudioFileEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("audiofiles");

            // Configure indexes
            entity.HasIndex(e => e.UploadedByUserId);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.Author);
            entity.HasIndex(e => e.Name);

            // Configure constraints
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Author).IsRequired().HasMaxLength(255);
            entity.Property(e => e.AudioS3Key).IsRequired().HasMaxLength(500);
            entity.Property(e => e.ThumbnailS3Key).HasMaxLength(500);
            entity.Property(e => e.AudioContentType).HasMaxLength(100);
            entity.Property(e => e.ThumbnailContentType).HasMaxLength(100);
            entity.Property(e => e.UploadedByUserId).IsRequired();

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
        var entries = ChangeTracker.Entries<AudioFileEntity>()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
    }
}

