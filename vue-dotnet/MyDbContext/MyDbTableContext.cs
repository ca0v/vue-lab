using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace vue_dotnet.MyDbContext;

public partial class MyDbTableContext : DbContext
{
    public MyDbTableContext()
    {
    }

    public MyDbTableContext(DbContextOptions<MyDbTableContext> options)
        : base(options)
    {
    }

    public virtual DbSet<MyTable> MyTables { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlite("MyTableContext");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MyTable>(entity =>
        {
            entity.ToTable("MyTable");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
