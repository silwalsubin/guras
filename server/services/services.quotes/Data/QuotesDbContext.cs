using Microsoft.EntityFrameworkCore;
using services.quotes.Models;

namespace services.quotes.Data;

public class QuotesDbContext : DbContext
{
    public QuotesDbContext(DbContextOptions<QuotesDbContext> options) : base(options)
    {
    }

    public DbSet<QuoteEntity> Quotes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure QuoteEntity
        modelBuilder.Entity<QuoteEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("quotes");

            // Configure indexes
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.Author);

            // Configure constraints
            entity.Property(e => e.Text).IsRequired();
            entity.Property(e => e.Author).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);

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
        var entries = ChangeTracker.Entries<QuoteEntity>()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
    }
}

