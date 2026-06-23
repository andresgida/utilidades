using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Utilidades.Domain.Entities;

namespace Utilidades.Infrastructure.Persistence.Configurations;

public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.ToTable("vehicles");

        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).HasColumnName("id");
        builder.Property(v => v.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(v => v.Name).HasColumnName("name").HasMaxLength(150).IsRequired();
        builder.Property(v => v.Brand).HasColumnName("brand").HasMaxLength(100).IsRequired();
        builder.Property(v => v.Model).HasColumnName("model").HasMaxLength(100).IsRequired();
        builder.Property(v => v.Year).HasColumnName("year").IsRequired();
        builder.Property(v => v.LicensePlate).HasColumnName("license_plate").HasMaxLength(20);
        builder.Property(v => v.StartCountDate).HasColumnName("start_count_date").IsRequired();
        builder.Property(v => v.BaseMileage).HasColumnName("base_mileage").HasPrecision(10, 2).IsRequired();
        builder.Property(v => v.IsActive).HasColumnName("is_active").HasDefaultValue(true);

        builder.Property(v => v.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(v => v.UpdatedAt).HasColumnName("updated_at");
        builder.Property(v => v.CreatedBy).HasColumnName("created_by").HasMaxLength(256);
        builder.Property(v => v.UpdatedBy).HasColumnName("updated_by").HasMaxLength(256);
        builder.Property(v => v.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        builder.Property(v => v.DeletedAt).HasColumnName("deleted_at");
        builder.Property(v => v.DeletedBy).HasColumnName("deleted_by").HasMaxLength(256);
        builder.HasIndex(v => v.UserId).HasDatabaseName("ix_vehicles_user_id");
        builder.HasIndex(v => new { v.UserId, v.IsDeleted }).HasDatabaseName("ix_vehicles_user_active");
        builder.HasQueryFilter(v => !v.IsDeleted);

        builder.HasMany(v => v.MileageRecords)
            .WithOne(r => r.Vehicle)
            .HasForeignKey(r => r.VehicleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
