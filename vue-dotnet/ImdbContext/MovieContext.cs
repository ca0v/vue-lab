using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Contexts;

public partial class MovieContext : DbContext
{
    public MovieContext()
    {
    }

    public MovieContext(DbContextOptions<MovieContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Aka> Akas { get; set; }

    public virtual DbSet<Crew> Crews { get; set; }

    public virtual DbSet<Episode> Episodes { get; set; }

    public virtual DbSet<Person> People { get; set; }

    public virtual DbSet<Rating> Ratings { get; set; }

    public virtual DbSet<Title> Titles { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlite("MovieDatabase");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Aka>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("akas");

            entity.HasIndex(e => e.Title, "ix_akas_title");

            entity.HasIndex(e => e.TitleId, "ix_akas_title_id");

            entity.Property(e => e.Attributes)
                .HasColumnType("VARCHAR")
                .HasColumnName("attributes");
            entity.Property(e => e.IsOriginalTitle).HasColumnName("is_original_title");
            entity.Property(e => e.Language)
                .HasColumnType("VARCHAR")
                .HasColumnName("language");
            entity.Property(e => e.Region)
                .HasColumnType("VARCHAR")
                .HasColumnName("region");
            entity.Property(e => e.Title)
                .HasColumnType("VARCHAR")
                .HasColumnName("title");
            entity.Property(e => e.TitleId)
                .HasColumnType("VARCHAR")
                .HasColumnName("title_id");
            entity.Property(e => e.Types)
                .HasColumnType("VARCHAR")
                .HasColumnName("types");
        });

        modelBuilder.Entity<Crew>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("crew");

            entity.HasIndex(e => e.PersonId, "ix_crew_person_id");

            entity.HasIndex(e => e.TitleId, "ix_crew_title_id");

            entity.Property(e => e.Category)
                .HasColumnType("VARCHAR")
                .HasColumnName("category");
            entity.Property(e => e.Characters)
                .HasColumnType("VARCHAR")
                .HasColumnName("characters");
            entity.Property(e => e.Job)
                .HasColumnType("VARCHAR")
                .HasColumnName("job");
            entity.Property(e => e.PersonId)
                .HasColumnType("VARCHAR")
                .HasColumnName("person_id");
            entity.Property(e => e.TitleId)
                .HasColumnType("VARCHAR")
                .HasColumnName("title_id");
        });

        modelBuilder.Entity<Episode>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("episodes");

            entity.HasIndex(e => e.EpisodeTitleId, "ix_episodes_episode_title_id");

            entity.HasIndex(e => e.ShowTitleId, "ix_episodes_show_title_id");

            entity.Property(e => e.EpisodeTitleId)
                .HasColumnType("VARCHAR")
                .HasColumnName("episode_title_id");
            entity.Property(e => e.EposideNumber).HasColumnName("eposide_number");
            entity.Property(e => e.SeasonNumber).HasColumnName("season_number");
            entity.Property(e => e.ShowTitleId)
                .HasColumnType("VARCHAR")
                .HasColumnName("show_title_id");
        });

        modelBuilder.Entity<Person>(entity =>
        {
            entity.ToTable("people");

            entity.HasIndex(e => e.Name, "ix_people_name");

            entity.Property(e => e.PersonId)
                .HasColumnType("VARCHAR")
                .HasColumnName("person_id");
            entity.Property(e => e.Born).HasColumnName("born");
            entity.Property(e => e.Died).HasColumnName("died");
            entity.Property(e => e.Name)
                .HasColumnType("VARCHAR")
                .HasColumnName("name");
        });

        modelBuilder.Entity<Rating>(entity =>
        {
            entity.HasKey(e => e.TitleId);

            entity.ToTable("ratings");

            entity.Property(e => e.TitleId)
                .HasColumnType("VARCHAR")
                .HasColumnName("title_id");
            entity.Property(e => e.Rating1).HasColumnName("rating");
            entity.Property(e => e.Votes).HasColumnName("votes");
        });

        modelBuilder.Entity<Title>(entity =>
        {
            entity.ToTable("titles");

            entity.HasIndex(e => e.OriginalTitle, "ix_titles_original_title");

            entity.HasIndex(e => e.PrimaryTitle, "ix_titles_primary_title");

            entity.HasIndex(e => e.Type, "ix_titles_type");

            entity.Property(e => e.TitleId)
                .HasColumnType("VARCHAR")
                .HasColumnName("title_id");
            entity.Property(e => e.Ended).HasColumnName("ended");
            entity.Property(e => e.Genres)
                .HasColumnType("VARCHAR")
                .HasColumnName("genres");
            entity.Property(e => e.IsAdult).HasColumnName("is_adult");
            entity.Property(e => e.OriginalTitle)
                .HasColumnType("VARCHAR")
                .HasColumnName("original_title");
            entity.Property(e => e.Premiered).HasColumnName("premiered");
            entity.Property(e => e.PrimaryTitle)
                .HasColumnType("VARCHAR")
                .HasColumnName("primary_title");
            entity.Property(e => e.RuntimeMinutes).HasColumnName("runtime_minutes");
            entity.Property(e => e.Type)
                .HasColumnType("VARCHAR")
                .HasColumnName("type");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
