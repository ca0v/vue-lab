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
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlite("Data Source=./MyDatabase.sqlite");

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
