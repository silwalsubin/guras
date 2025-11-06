using Microsoft.EntityFrameworkCore;
using services.journal.Models;

namespace services.journal.Data;

public class JournalEntriesDbContext : DbContext
{
    public JournalEntriesDbContext(DbContextOptions<JournalEntriesDbContext> options) : base(options)
    {
    }

    public DbSet<JournalEntryEntity> JournalEntries { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure JournalEntryEntity
        modelBuilder.Entity<JournalEntryEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("journal_entries");

            // Configure string arrays for PostgreSQL
            entity.Property(e => e.Tags)
                .HasColumnType("text[]");

            // Configure indexes
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => new { e.UserId, e.CreatedAt });

            // Configure constraints
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.Mood).HasMaxLength(50);
            entity.Property(e => e.UserId).IsRequired();

            // Configure default values
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
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
        var entries = ChangeTracker.Entries<JournalEntryEntity>()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
    }
}

