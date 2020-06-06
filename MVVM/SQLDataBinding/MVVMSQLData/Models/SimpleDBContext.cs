using System.Reflection;
using Microsoft.EntityFrameworkCore;


namespace MVVMSQLData.Models
{
    public class SimpleDBContext : DbContext
    {

        public DbSet<DayText> TblDayText { get; set; }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlite("Filename=SimpleDB.db", options =>
            {
                options.MigrationsAssembly(Assembly.GetExecutingAssembly().FullName);
            });
            base.OnConfiguring(optionsBuilder);
        }

        // see https://docs.microsoft.com/en-us/ef/ef6/modeling/code-first/fluent/types-and-properties
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder?.Entity<DayText>()
                .Property(b => b.DayTextStr)
                .IsRequired();
            modelBuilder?.Entity<DayText>()
                .HasKey(b => b.Id);
            modelBuilder?.Entity<DayText>()
                .ToTable<DayText>("tblDayText");
            base.OnModelCreating(modelBuilder);
        }
    }
}
