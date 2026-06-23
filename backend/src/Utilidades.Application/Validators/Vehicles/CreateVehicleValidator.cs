using FluentValidation;
using Utilidades.Application.Vehicles.Commands;

namespace Utilidades.Application.Validators.Vehicles;

public class CreateVehicleCommandValidator : AbstractValidator<CreateVehicleCommand>
{
    public CreateVehicleCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().MaximumLength(150);

        RuleFor(x => x.Brand)
            .NotEmpty().MaximumLength(100);

        RuleFor(x => x.Model)
            .NotEmpty().MaximumLength(100);

        RuleFor(x => x.Year)
            .InclusiveBetween(1900, DateTime.UtcNow.Year + 1)
            .WithMessage($"Year must be between 1900 and {DateTime.UtcNow.Year + 1}.");

        RuleFor(x => x.BaseMileage)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El kilometraje base no puede ser negativo.");

        RuleFor(x => x.LicensePlate)
            .MaximumLength(20)
            .When(x => x.LicensePlate != null);

        RuleFor(x => x.StartCountDate)
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("La fecha de inicio no puede ser futura.");
    }
}

public class UpdateVehicleCommandValidator : AbstractValidator<UpdateVehicleCommand>
{
    public UpdateVehicleCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Brand).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Model).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Year).InclusiveBetween(1900, DateTime.UtcNow.Year + 1);
        RuleFor(x => x.BaseMileage).GreaterThanOrEqualTo(0);
    }
}

public class AddMileageRecordCommandValidator : AbstractValidator<AddMileageRecordCommand>
{
    public AddMileageRecordCommandValidator()
    {
        RuleFor(x => x.CurrentMileage)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El kilometraje no puede ser negativo.");

        RuleFor(x => x.Observations)
            .MaximumLength(500)
            .When(x => x.Observations != null);
    }
}
