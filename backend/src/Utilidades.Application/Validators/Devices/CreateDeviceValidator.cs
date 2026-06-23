using FluentValidation;
using Utilidades.Application.Devices.Commands;

namespace Utilidades.Application.Validators.Devices;

public class CreateAppleDeviceCommandValidator : AbstractValidator<CreateAppleDeviceCommand>
{
    public CreateAppleDeviceCommandValidator()
    {
        RuleFor(x => x.DeviceName)
            .NotEmpty().WithMessage("Device name is required.")
            .MaximumLength(150);

        RuleFor(x => x.PurchaseDate)
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Purchase date cannot be in the future.");
    }
}

public class AddCycleRecordCommandValidator : AbstractValidator<AddCycleRecordCommand>
{
    public AddCycleRecordCommandValidator()
    {
        RuleFor(x => x.CurrentCycles)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Cycle count cannot be negative.")
            .LessThanOrEqualTo(9999)
            .WithMessage("Cycle count seems unrealistically high. Please verify.");

        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .When(x => x.Notes != null);
    }
}
