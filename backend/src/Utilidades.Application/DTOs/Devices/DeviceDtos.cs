namespace Utilidades.Application.DTOs.Devices;

public record AppleDeviceDto(
    Guid Id,
    string DeviceName,
    Guid? CatalogDeviceId,
    string? CatalogDeviceName,
    string? CatalogImageUrl,
    DateOnly PurchaseDate,
    bool IsCustomDevice,
    DateTime CreatedAt,
    int TotalRecords);

public record AppleDeviceDetailDto(
    Guid Id,
    string DeviceName,
    Guid? CatalogDeviceId,
    string? CatalogDeviceName,
    string? CatalogImageUrl,
    DateOnly PurchaseDate,
    bool IsCustomDevice,
    DateTime CreatedAt,
    IEnumerable<BatteryCycleRecordDto> Records,
    DeviceStatisticsDto Statistics);

public record BatteryCycleRecordDto(
    Guid Id,
    Guid AppleDeviceId,
    DateOnly RecordDate,
    int CurrentCycles,
    string? Notes,
    DateTime CreatedAt);

public record DeviceStatisticsDto(
    Guid DeviceId,
    int DaysElapsed,
    int CurrentCycles,
    decimal DailyAverage,
    decimal AnnualProjection,
    decimal HealthPercentage,
    string HealthStatus);

public record DeviceCatalogDto(
    Guid Id,
    string Name,
    string Brand,
    int ReleaseYear,
    int MaxCycles,
    string? ImageUrl,
    int SortOrder);

public record CreateAppleDeviceDto(
    string DeviceName,
    DateOnly PurchaseDate,
    Guid? CatalogDeviceId,
    bool IsCustomDevice = false);

public record UpdateAppleDeviceDto(
    string DeviceName,
    DateOnly PurchaseDate);

public record CreateBatteryCycleRecordDto(
    DateOnly RecordDate,
    int CurrentCycles,
    string? Notes);

public record UpdateBatteryCycleRecordDto(
    DateOnly RecordDate,
    int CurrentCycles,
    string? Notes);

public record CreateCatalogDeviceDto(
    string Name,
    string Brand,
    int ReleaseYear,
    int MaxCycles = 1000,
    string? ImageUrl = null,
    int SortOrder = 0);

public record UpdateCatalogDeviceDto(
    string Name,
    string Brand,
    int ReleaseYear,
    int MaxCycles,
    string? ImageUrl,
    int SortOrder);
