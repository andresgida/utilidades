namespace Utilidades.Application.DTOs.Vehicles;

public record VehicleDto(
    Guid Id,
    string Name,
    string Brand,
    string Model,
    int Year,
    string? LicensePlate,
    DateOnly StartCountDate,
    decimal BaseMileage,
    bool IsActive,
    DateTime CreatedAt,
    int TotalRecords);

public record VehicleDetailDto(
    Guid Id,
    string Name,
    string Brand,
    string Model,
    int Year,
    string? LicensePlate,
    DateOnly StartCountDate,
    decimal BaseMileage,
    bool IsActive,
    DateTime CreatedAt,
    IEnumerable<MileageRecordDto> Records,
    VehicleStatisticsDto Statistics);

public record MileageRecordDto(
    Guid Id,
    Guid VehicleId,
    DateOnly RecordDate,
    decimal CurrentMileage,
    string? Observations,
    DateTime CreatedAt);

public record VehicleStatisticsDto(
    Guid VehicleId,
    int DaysElapsed,
    decimal KmTraveled,
    decimal DailyAverage,
    decimal AnnualProjection,
    decimal CurrentMileage);

public record CreateVehicleDto(
    string Name,
    string Brand,
    string Model,
    int Year,
    string? LicensePlate,
    DateOnly StartCountDate,
    decimal BaseMileage);

public record UpdateVehicleDto(
    string Name,
    string Brand,
    string Model,
    int Year,
    string? LicensePlate,
    DateOnly StartCountDate,
    decimal BaseMileage);

public record CreateMileageRecordDto(
    DateOnly RecordDate,
    decimal CurrentMileage,
    string? Observations);

public record UpdateMileageRecordDto(
    DateOnly RecordDate,
    decimal CurrentMileage,
    string? Observations);
