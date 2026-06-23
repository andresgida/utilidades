using Utilidades.Domain.Common;

namespace Utilidades.Domain.Entities;

public sealed class DeviceCatalog : BaseEntity
{
    private DeviceCatalog() { }

    public string Name { get; private set; } = default!;
    public string Brand { get; private set; } = default!;
    public int ReleaseYear { get; private set; }
    public int MaxCycles { get; private set; }
    public bool IsOfficial { get; private set; }
    public string? ImageUrl { get; private set; }
    public int SortOrder { get; private set; }

    public void Update(string name, string brand, int releaseYear, int maxCycles, string? imageUrl, int sortOrder)
    {
        Name = name;
        Brand = brand;
        ReleaseYear = releaseYear;
        MaxCycles = maxCycles;
        ImageUrl = imageUrl;
        SortOrder = sortOrder;
    }

    public static DeviceCatalog Create(
        string name,
        string brand,
        int releaseYear,
        int maxCycles = 1000,
        bool isOfficial = true,
        string? imageUrl = null,
        int sortOrder = 0)
    {
        return new DeviceCatalog
        {
            Name = name,
            Brand = brand,
            ReleaseYear = releaseYear,
            MaxCycles = maxCycles,
            IsOfficial = isOfficial,
            ImageUrl = imageUrl,
            SortOrder = sortOrder
        };
    }
}
