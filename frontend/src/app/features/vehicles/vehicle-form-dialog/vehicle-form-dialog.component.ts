import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehicleService } from '../../../application/services/vehicle.service';
import { Vehicle } from '../../../domain/models/vehicle.model';

@Component({
  selector: 'app-vehicle-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="dlg">
      <!-- Header -->
      <div class="dlg-header">
        <div class="dlg-icon">
          <mat-icon>{{ isEdit ? 'directions_car' : 'add' }}</mat-icon>
        </div>
        <div>
          <h2 class="dlg-title">{{ isEdit ? 'Editar vehículo' : 'Nuevo vehículo' }}</h2>
          <p class="dlg-sub">{{ isEdit ? 'Modifica los datos del vehículo' : 'Completa los datos para registrar tu vehículo' }}</p>
        </div>
        <button class="dlg-close" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Form -->
      <form [formGroup]="form" class="dlg-body" (ngSubmit)="save()">

        <div class="field-group span-2">
          <label class="field-label">Nombre del vehículo</label>
          <input formControlName="name" class="field-input"
                 [class.err]="form.get('name')?.invalid && form.get('name')?.touched"
                 placeholder="Ej. Mi Toyota Corolla">
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <span class="field-error">El nombre es requerido</span>
          }
        </div>

        <div class="field-group">
          <label class="field-label">Marca</label>
          <input formControlName="brand" class="field-input"
                 [class.err]="form.get('brand')?.invalid && form.get('brand')?.touched"
                 placeholder="Toyota">
          @if (form.get('brand')?.invalid && form.get('brand')?.touched) {
            <span class="field-error">La marca es requerida</span>
          }
        </div>

        <div class="field-group">
          <label class="field-label">Modelo</label>
          <input formControlName="model" class="field-input"
                 [class.err]="form.get('model')?.invalid && form.get('model')?.touched"
                 placeholder="Corolla">
          @if (form.get('model')?.invalid && form.get('model')?.touched) {
            <span class="field-error">El modelo es requerido</span>
          }
        </div>

        <div class="field-group">
          <label class="field-label">Año</label>
          <input formControlName="year" type="number" class="field-input"
                 [class.err]="form.get('year')?.invalid && form.get('year')?.touched"
                 placeholder="2024">
        </div>

        <div class="field-group">
          <label class="field-label">Placa <span class="optional">(opcional)</span></label>
          <input formControlName="licensePlate" class="field-input" placeholder="ABC-123">
        </div>

        <div class="field-group">
          <label class="field-label">Fecha inicio conteo</label>
          <input formControlName="startCountDate" type="date" class="field-input"
                 [class.err]="form.get('startCountDate')?.invalid && form.get('startCountDate')?.touched">
        </div>

        <div class="field-group">
          <label class="field-label">Kilometraje base</label>
          <div class="input-suffix-wrap">
            <input formControlName="baseMileage" type="number" class="field-input has-suffix"
                   [class.err]="form.get('baseMileage')?.invalid && form.get('baseMileage')?.touched"
                   placeholder="0">
            <span class="input-suffix">km</span>
          </div>
        </div>

      </form>

      <!-- Footer -->
      <div class="dlg-footer">
        <button class="btn-cancel" (click)="dialogRef.close()">Cancelar</button>
        <button class="btn-save" (click)="save()" [disabled]="form.invalid || loading()">
          @if (loading()) {
            <mat-progress-spinner diameter="18" mode="indeterminate" />
          } @else {
            {{ isEdit ? 'Guardar cambios' : 'Crear vehículo' }}
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dlg {
      width: 520px;
      background: transparent;
      display: flex;
      flex-direction: column;
      color: var(--text-primary);
    }

    .dlg-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 24px 24px 20px;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
    }

    .dlg-icon {
      width: 44px; height: 44px; min-width: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(90,111,248,0.15), rgba(167,139,250,0.1));
      display: flex; align-items: center; justify-content: center;
      color: #5a6ff8;
    }

    .dlg-title {
      font-size: 18px; font-weight: 700; margin: 0 0 4px;
      color: var(--text-primary, #111);
    }

    .dlg-sub {
      font-size: 13px; color: var(--text-muted, #6b7280); margin: 0;
    }

    .dlg-close {
      margin-left: auto; background: none; border: none; cursor: pointer;
      color: var(--text-muted, #9ca3af); padding: 4px;
      border-radius: 8px; display: flex; align-items: center;
      transition: background 0.15s, color 0.15s;
    }
    .dlg-close:hover { background: var(--hover-bg, #f3f4f6); color: var(--text-primary, #111); }

    .dlg-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 20px;
      padding: 24px;
      overflow-y: auto;
      max-height: 60vh;
    }

    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .span-2 { grid-column: span 2; }

    .field-label {
      font-size: 13px; font-weight: 600;
      color: var(--text-primary, #374151);
    }

    .optional {
      font-weight: 400; font-size: 12px; color: var(--text-muted, #9ca3af);
    }

    .field-input {
      height: 42px; padding: 0 12px;
      border: 1.5px solid var(--border-color, #e5e7eb);
      border-radius: 10px;
      font-size: 14px; color: var(--text-primary, #111);
      background: var(--hover-bg, rgba(0,0,0,0.04));
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      width: 100%; box-sizing: border-box;
    }
    .field-input::placeholder { color: #9ca3af; }
    .field-input:focus {
      border-color: #5a6ff8;
      box-shadow: 0 0 0 3px rgba(90,111,248,0.12);
    }
    .field-input.err { border-color: #ef4444; }
    .field-input.err:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }

    .input-suffix-wrap { position: relative; display: flex; align-items: center; }
    .field-input.has-suffix { padding-right: 40px; }
    .input-suffix {
      position: absolute; right: 12px;
      font-size: 13px; font-weight: 600;
      color: var(--text-muted, #9ca3af);
      pointer-events: none;
    }

    .field-error { font-size: 12px; color: #ef4444; }

    .dlg-footer {
      display: flex; justify-content: flex-end; align-items: center;
      gap: 10px; padding: 16px 24px;
      border-top: 1px solid var(--border-color, #e5e7eb);
    }

    .btn-cancel {
      height: 40px; padding: 0 20px;
      border: 1.5px solid var(--border-color);
      border-radius: 10px; background: transparent;
      font-size: 14px; font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer; transition: background 0.15s;
    }
    .btn-cancel:hover { background: var(--hover-bg, #f3f4f6); }

    .btn-save {
      height: 40px; padding: 0 24px;
      border: none; border-radius: 10px;
      background: #5a6ff8; color: #fff;
      font-size: 14px; font-weight: 600;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      transition: background 0.2s;
    }
    .btn-save:hover:not(:disabled) { background: #4558e8; }
    .btn-save:disabled { opacity: 0.55; cursor: not-allowed; }

    @media (max-width: 560px) {
      .dlg { width: 100%; }
      .dlg-body { grid-template-columns: 1fr; }
      .span-2 { grid-column: span 1; }
    }
  `]
})
export class VehicleFormDialogComponent {
  private readonly fb      = inject(FormBuilder);
  private readonly svc     = inject(VehicleService);
  readonly dialogRef = inject(MatDialogRef<VehicleFormDialogComponent>);

  readonly vehicle: Vehicle | null = inject(MAT_DIALOG_DATA, { optional: true });
  readonly isEdit = !!this.vehicle;
  readonly loading = signal(false);

  readonly form = this.fb.group({
    name:           [this.vehicle?.name ?? '',            [Validators.required, Validators.maxLength(150)]],
    brand:          [this.vehicle?.brand ?? '',           [Validators.required, Validators.maxLength(100)]],
    model:          [this.vehicle?.model ?? '',           [Validators.required, Validators.maxLength(100)]],
    year:           [this.vehicle?.year ?? new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
    licensePlate:   [this.vehicle?.licensePlate ?? ''],
    startCountDate: [this.vehicle?.startCountDate ?? new Date().toISOString().split('T')[0], Validators.required],
    baseMileage:    [this.vehicle?.baseMileage ?? 0, [Validators.required, Validators.min(0)]]
  });

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    const value = this.form.value;

    const payload = {
      name:           value.name!,
      brand:          value.brand!,
      model:          value.model!,
      year:           Number(value.year),
      licensePlate:   value.licensePlate || undefined,
      startCountDate: value.startCountDate!,
      baseMileage:    Number(value.baseMileage)
    };

    const op = this.isEdit
      ? this.svc.updateVehicle(this.vehicle!.id, payload)
      : this.svc.createVehicle(payload);

    op.subscribe({
      next: ()  => { this.loading.set(false); this.dialogRef.close(true); },
      error: () => { this.loading.set(false); }
    });
  }
}
