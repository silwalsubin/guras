using Microsoft.EntityFrameworkCore;
using services.teachers.Models;

namespace services.teachers.Data;

public class TeachersDbContext : DbContext
{
    public TeachersDbContext(DbContextOptions<TeachersDbContext> options) : base(options)
    {
    }

    public DbSet<TeacherEntity> Teachers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure TeacherEntity
        modelBuilder.Entity<TeacherEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("teachers");

            // Configure string arrays for PostgreSQL - EF Core handles this natively
            entity.Property(e => e.CoreTeachings)
                .HasColumnType("text[]");

            entity.Property(e => e.PersonalityTraits)
                .HasColumnType("text[]");

            // Configure indexes
            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasIndex(e => e.DisplayName);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.TeachingFocus);
            entity.HasIndex(e => e.TeachingComplexity);
            entity.HasIndex(e => e.CreatedAt);

            // Configure constraints
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.DisplayName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(255);
            entity.Property(e => e.Nationality).HasMaxLength(100);
            entity.Property(e => e.TraditionName).HasMaxLength(255);
            entity.Property(e => e.TraditionOrigin).HasMaxLength(100);
            entity.Property(e => e.Era).HasMaxLength(50);
            entity.Property(e => e.TeachingApproach).HasMaxLength(50);
            entity.Property(e => e.TeachingTone).HasMaxLength(50);
            entity.Property(e => e.TeachingFocus).HasMaxLength(100);
            entity.Property(e => e.TeachingComplexity).HasMaxLength(20);

            // Configure default values
            entity.Property(e => e.IsActive).HasDefaultValue(true);
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
        var entries = ChangeTracker.Entries<TeacherEntity>()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            entry.Entity.UpdatedAt = DateTime.Now; // Use local time to match database CURRENT_TIMESTAMP
        }
    }
}
