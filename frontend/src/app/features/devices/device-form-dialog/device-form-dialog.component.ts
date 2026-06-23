import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DeviceService } from '../../../application/services/device.service';
import { AppleDevice, DeviceCatalog } from '../../../domain/models/device.model';

@Component({
  selector: 'app-device-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="dlg">
      <!-- Header -->
      <div class="dlg-header">
        <div class="dlg-icon">
          <mat-icon>phone_iphone</mat-icon>
        </div>
        <div>
          <h2 class="dlg-title">{{ isEdit ? 'Editar dispositivo' : 'Nuevo dispositivo' }}</h2>
          <p class="dlg-sub">{{ isEdit ? 'Modifica los datos del dispositivo' : 'Registra tu dispositivo Apple' }}</p>
        </div>
        <button class="dlg-close" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Form -->
      <form [formGroup]="form" class="dlg-body" (ngSubmit)="save()">

        <div class="field-group">
          <label class="field-label">
            Modelo del catálogo <span class="optional">(opcional)</span>
          </label>
          <select formControlName="catalogDeviceId" class="field-input field-select"
                  (change)="onCatalogSelect(form.get('catalogDeviceId')?.value ?? null)">
            <option [value]="null">Dispositivo personalizado</option>
            @for (c of catalog(); track c.id) {
              <option [value]="c.id">{{ c.name }} ({{ c.releaseYear }})</option>
            }
          </select>
        </div>

        <div class="field-group">
          <label class="field-label">Nombre del dispositivo</label>
          <input formControlName="deviceName" class="field-input"
                 [class.err]="form.get('deviceName')?.invalid && form.get('deviceName')?.touched"
                 placeholder="Ej. Mi iPhone 15 Pro">
          @if (form.get('deviceName')?.invalid && form.get('deviceName')?.touched) {
            <span class="field-error">El nombre es requerido</span>
          }
        </div>

        <div class="field-group">
          <label class="field-label">Fecha de compra</label>
          <input formControlName="purchaseDate" type="date" class="field-input"
                 [class.err]="form.get('purchaseDate')?.invalid && form.get('purchaseDate')?.touched">
        </div>

      </form>

      <!-- Footer -->
      <div class="dlg-footer">
        <button class="btn-cancel" (click)="dialogRef.close()">Cancelar</button>
        <button class="btn-save" (click)="save()" [disabled]="form.invalid || loading()">
          @if (loading()) {
            <mat-progress-spinner diameter="18" mode="indeterminate" />
          } @else {
            {{ isEdit ? 'Guardar cambios' : 'Agregar dispositivo' }}
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dlg {
      width: 460px;
      background: transparent;
      display: flex;
      flex-direction: column;
      color: var(--text-primary);
    }

    .dlg-header {
      display: flex; align-items: flex-start; gap: 14px;
      padding: 24px 24px 20px;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
    }

    .dlg-icon {
      width: 44px; height: 44px; min-width: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.1));
      display: flex; align-items: center; justify-content: center;
      color: #10b981;
    }

    .dlg-title { font-size: 18px; font-weight: 700; margin: 0 0 4px; color: var(--text-primary, #111); }
    .dlg-sub   { font-size: 13px; color: var(--text-muted, #6b7280); margin: 0; }

    .dlg-close {
      margin-left: auto; background: none; border: none; cursor: pointer;
      color: var(--text-muted, #9ca3af); padding: 4px;
      border-radius: 8px; display: flex; align-items: center;
      transition: background 0.15s, color 0.15s;
    }
    .dlg-close:hover { background: var(--hover-bg, #f3f4f6); color: var(--text-primary, #111); }

    .dlg-body {
      display: flex; flex-direction: column; gap: 18px;
      padding: 24px;
    }

    .field-group { display: flex; flex-direction: column; gap: 6px; }

    .field-label {
      font-size: 13px; font-weight: 600;
      color: var(--text-primary, #374151);
    }

    .optional { font-weight: 400; font-size: 12px; color: var(--text-muted, #9ca3af); }

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
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
    }
    .field-input.err { border-color: #ef4444; }
    .field-input.err:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }

    .field-select { cursor: pointer; }

    .field-error { font-size: 12px; color: #ef4444; }

    .dlg-footer {
      display: flex; justify-content: flex-end; align-items: center;
      gap: 10px; padding: 16px 24px;
      border-top: 1px solid var(--border-color, #e5e7eb);
    }

    .btn-cancel {
      height: 40px; padding: 0 20px;
      border: 1.5px solid var(--border-color, #e5e7eb);
      border-radius: 10px; background: transparent;
      font-size: 14px; font-weight: 600;
      color: var(--text-secondary, #4b5563);
      cursor: pointer; transition: background 0.15s;
    }
    .btn-cancel:hover { background: var(--hover-bg, #f3f4f6); }

    .btn-save {
      height: 40px; padding: 0 24px;
      border: none; border-radius: 10px;
      background: #10b981; color: #fff;
      font-size: 14px; font-weight: 600;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      transition: background 0.2s;
    }
    .btn-save:hover:not(:disabled) { background: #059669; }
    .btn-save:disabled { opacity: 0.55; cursor: not-allowed; }
  `]
})
export class DeviceFormDialogComponent implements OnInit {
  private readonly fb        = inject(FormBuilder);
  private readonly svc       = inject(DeviceService);
  readonly dialogRef = inject(MatDialogRef<DeviceFormDialogComponent>);

  readonly device: AppleDevice | null = inject(MAT_DIALOG_DATA, { optional: true });
  readonly isEdit  = !!this.device;
  readonly loading = signal(false);
  readonly catalog = this.svc.catalog;

  readonly form = this.fb.group({
    deviceName:     [this.device?.deviceName ?? '', [Validators.required, Validators.maxLength(150)]],
    purchaseDate:   [this.device?.purchaseDate ?? new Date().toISOString().split('T')[0], Validators.required],
    catalogDeviceId:[this.device?.catalogDeviceId ?? null as string | null]
  });

  ngOnInit(): void {
    if (this.catalog().length === 0) {
      this.svc.loadCatalog().subscribe();
    }
  }

  onCatalogSelect(catalogId: string | null): void {
    if (!catalogId) return;
    const cat = this.catalog().find((c: DeviceCatalog) => c.id === catalogId);
    if (cat && !this.isEdit) {
      this.form.patchValue({ deviceName: cat.name });
    }
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    const v = this.form.value;

    const payload = {
      deviceName:     v.deviceName!,
      purchaseDate:   v.purchaseDate!,
      catalogDeviceId: v.catalogDeviceId ?? undefined,
      isCustomDevice: !v.catalogDeviceId
    };

    const op = this.isEdit
      ? this.svc.updateDevice(this.device!.id, payload)
      : this.svc.createDevice(payload);

    op.subscribe({
      next: ()  => { this.loading.set(false); this.dialogRef.close(true); },
      error: () => { this.loading.set(false); }
    });
  }
}
