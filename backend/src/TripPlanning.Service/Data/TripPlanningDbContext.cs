using Microsoft.EntityFrameworkCore;
using TripPlanning.Service.Models;

namespace TripPlanning.Service.Data;

public class TripPlanningDbContext : DbContext
{
    public TripPlanningDbContext(DbContextOptions<TripPlanningDbContext> options) : base(options)
    {
    }

    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<Destination> Destinations => Set<Destination>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<ChecklistItem> ChecklistItems => Set<ChecklistItem>();
    public DbSet<Expense> Expenses => Set<Expense>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Trip>(entity =>
        {
            entity.Property(t => t.Name).HasMaxLength(200).IsRequired();
            entity.Property(t => t.Description).HasMaxLength(2000);
            entity.Property(t => t.Notes).HasMaxLength(2000);
            entity.Property(t => t.Budget).HasColumnType("decimal(18,2)");
            entity.HasIndex(t => t.UserId);

            entity.HasMany(t => t.Destinations)
                .WithOne(d => d.Trip)
                .HasForeignKey(d => d.TripId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(t => t.Activities)
                .WithOne(a => a.Trip)
                .HasForeignKey(a => a.TripId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(t => t.ChecklistItems)
                .WithOne(c => c.Trip)
                .HasForeignKey(c => c.TripId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(t => t.Expenses)
                .WithOne(e => e.Trip)
                .HasForeignKey(e => e.TripId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Destination>(entity =>
        {
            entity.Property(d => d.Name).HasMaxLength(200).IsRequired();
            entity.Property(d => d.Location).HasMaxLength(300).IsRequired();
            entity.Property(d => d.Description).HasMaxLength(2000);
        });

        modelBuilder.Entity<Activity>(entity =>
        {
            entity.Property(a => a.Name).HasMaxLength(200).IsRequired();
            entity.Property(a => a.Location).HasMaxLength(300);
            entity.Property(a => a.Description).HasMaxLength(2000);
            entity.Property(a => a.EstimatedCost).HasColumnType("decimal(18,2)");
            entity.Property(a => a.Status).HasConversion<string>().HasMaxLength(20);

            // NoAction (not SetNull): a DB-level cascading SetNull here would give SQL Server two
            // cascade paths into Activities (direct Trip->Activities, and Trip->Destinations->Activities),
            // which it rejects. DestinationService nulls out DestinationId on delete instead.
            entity.HasOne<Destination>()
                .WithMany()
                .HasForeignKey(a => a.DestinationId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<ChecklistItem>(entity =>
        {
            entity.Property(c => c.Text).HasMaxLength(300).IsRequired();
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Category).HasConversion<string>().HasMaxLength(20);
        });
    }
}
