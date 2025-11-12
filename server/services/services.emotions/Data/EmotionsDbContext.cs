using Microsoft.EntityFrameworkCore;
using services.emotions.Models;

namespace services.emotions.Data;

public class EmotionsDbContext : DbContext
{
    public EmotionsDbContext(DbContextOptions<EmotionsDbContext> options) : base(options)
    {
    }

    public DbSet<EmotionEntity> Emotions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure EmotionEntity
        modelBuilder.Entity<EmotionEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("emotions");

            // Configure properties
            entity.Property(e => e.Id)
                .HasColumnName("id")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.Color)
                .HasColumnName("color")
                .HasMaxLength(7)
                .IsRequired();

            entity.Property(e => e.IsActive)
                .HasColumnName("is_active")
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Configure indexes
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.Name).IsUnique();
        });
    }
}

