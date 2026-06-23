using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Utilidades.Domain.Entities;

namespace Utilidades.Infrastructure.Persistence.Configurations;

public class MileageRecordConfiguration : IEntityTypeConfiguration<MileageRecord>
{
    public void Configure(EntityTypeBuilder<MileageRecord> builder)
    {
        builder.ToTable("mileage_records");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("id");
        builder.Property(r => r.VehicleId).HasColumnName("vehicle_id").IsRequired();
        builder.Property(r => r.RecordDate).HasColumnName("record_date").IsRequired();
        builder.Property(r => r.CurrentMileage).HasColumnName("current_mileage").HasPrecision(10, 2).IsRequired();
        builder.Property(r => r.Observations).HasColumnName("observations").HasMaxLength(500);
        builder.Property(r => r.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(r => r.UpdatedAt).HasColumnName("updated_at");
        builder.Property(r => r.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        builder.Ignore(r => r.CreatedBy);
        builder.Ignore(r => r.UpdatedBy);
        builder.Ignore(r => r.DeletedAt);
        builder.Ignore(r => r.DeletedBy);

        builder.HasIndex(r => r.VehicleId).HasDatabaseName("ix_mileage_records_vehicle_id");
        builder.HasIndex(r => new { r.VehicleId, r.RecordDate }).HasDatabaseName("ix_mileage_records_vehicle_date");
        builder.HasQueryFilter(r => !r.IsDeleted);
    }
}

public class AppleDeviceConfiguration : IEntityTypeConfiguration<AppleDevice>
{
    public void Configure(EntityTypeBuilder<AppleDevice> builder)
    {
        builder.ToTable("apple_devices");

        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).HasColumnName("id");
        builder.Property(d => d.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(d => d.DeviceName).HasColumnName("device_name").HasMaxLength(150).IsRequired();
        builder.Property(d => d.CatalogDeviceId).HasColumnName("catalog_device_id");
        builder.Property(d => d.PurchaseDate).HasColumnName("purchase_date").IsRequired();
        builder.Property(d => d.IsCustomDevice).HasColumnName("is_custom_device").HasDefaultValue(false);

        builder.Property(d => d.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(d => d.UpdatedAt).HasColumnName("updated_at");
        builder.Property(d => d.CreatedBy).HasColumnName("created_by").HasMaxLength(256);
        builder.Property(d => d.UpdatedBy).HasColumnName("updated_by").HasMaxLength(256);
        builder.Property(d => d.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        builder.Property(d => d.DeletedAt).HasColumnName("deleted_at");
        builder.Property(d => d.DeletedBy).HasColumnName("deleted_by").HasMaxLength(256);
        builder.HasIndex(d => d.UserId).HasDatabaseName("ix_apple_devices_user_id");
        builder.HasQueryFilter(d => !d.IsDeleted);

        builder.HasMany(d => d.CycleRecords)
            .WithOne(r => r.AppleDevice)
            .HasForeignKey(r => r.AppleDeviceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.CatalogDevice)
            .WithMany()
            .HasForeignKey(d => d.CatalogDeviceId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class BatteryCycleRecordConfiguration : IEntityTypeConfiguration<BatteryCycleRecord>
{
    public void Configure(EntityTypeBuilder<BatteryCycleRecord> builder)
    {
        builder.ToTable("battery_cycle_records");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("id");
        builder.Property(r => r.AppleDeviceId).HasColumnName("apple_device_id").IsRequired();
        builder.Property(r => r.RecordDate).HasColumnName("record_date").IsRequired();
        builder.Property(r => r.CurrentCycles).HasColumnName("current_cycles").IsRequired();
        builder.Property(r => r.Notes).HasColumnName("notes").HasMaxLength(500);
        builder.Property(r => r.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(r => r.UpdatedAt).HasColumnName("updated_at");
        builder.Property(r => r.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        builder.Ignore(r => r.CreatedBy);
        builder.Ignore(r => r.UpdatedBy);
        builder.Ignore(r => r.DeletedAt);
        builder.Ignore(r => r.DeletedBy);

        builder.HasIndex(r => r.AppleDeviceId).HasDatabaseName("ix_battery_cycle_records_device_id");
        builder.HasQueryFilter(r => !r.IsDeleted);
    }
}

public class DeviceCatalogConfiguration : IEntityTypeConfiguration<DeviceCatalog>
{
    public void Configure(EntityTypeBuilder<DeviceCatalog> builder)
    {
        builder.ToTable("device_catalog");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("id");
        builder.Property(c => c.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(c => c.Brand).HasColumnName("brand").HasMaxLength(50).IsRequired();
        builder.Property(c => c.ReleaseYear).HasColumnName("release_year").IsRequired();
        builder.Property(c => c.MaxCycles).HasColumnName("max_cycles").HasDefaultValue(1000);
        builder.Property(c => c.IsOfficial).HasColumnName("is_official").HasDefaultValue(true);
        builder.Property(c => c.ImageUrl).HasColumnName("image_url").HasMaxLength(512);
        builder.Property(c => c.SortOrder).HasColumnName("sort_order").HasDefaultValue(0);
        builder.Property(c => c.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(c => c.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        builder.Ignore(c => c.UpdatedAt);
        builder.Ignore(c => c.UpdatedBy);
        builder.Ignore(c => c.CreatedBy);
        builder.Ignore(c => c.DeletedAt);
        builder.Ignore(c => c.DeletedBy);

        builder.HasIndex(c => c.Name).HasDatabaseName("ix_device_catalog_name");
        builder.HasQueryFilter(c => !c.IsDeleted);

        SeedData(builder);
    }

    private static void SeedData(EntityTypeBuilder<DeviceCatalog> builder)
    {
        var devices = new[]
        {
            ("iPhone 13",          "Apple", 2021, 1),
            ("iPhone 13 Mini",     "Apple", 2021, 2),
            ("iPhone 13 Pro",      "Apple", 2021, 3),
            ("iPhone 13 Pro Max",  "Apple", 2021, 4),
            ("iPhone 14",          "Apple", 2022, 5),
            ("iPhone 14 Plus",     "Apple", 2022, 6),
            ("iPhone 14 Pro",      "Apple", 2022, 7),
            ("iPhone 14 Pro Max",  "Apple", 2022, 8),
            ("iPhone 15",          "Apple", 2023, 9),
            ("iPhone 15 Plus",     "Apple", 2023, 10),
            ("iPhone 15 Pro",      "Apple", 2023, 11),
            ("iPhone 15 Pro Max",  "Apple", 2023, 12),
            ("iPhone 16",          "Apple", 2024, 13),
            ("iPhone 16 Plus",     "Apple", 2024, 14),
            ("iPhone 16 Pro",      "Apple", 2024, 15),
            ("iPhone 16 Pro Max",  "Apple", 2024, 16),
        };

        int i = 1;
        foreach (var (name, brand, year, order) in devices)
        {
            builder.HasData(new
            {
                Id = Guid.Parse($"10000000-0000-0000-0000-{i:D12}"),
                Name = name,
                Brand = brand,
                ReleaseYear = year,
                MaxCycles = 1000,
                IsOfficial = true,
                SortOrder = order,
                IsDeleted = false,
                CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            });
            i++;
        }
    }
}
