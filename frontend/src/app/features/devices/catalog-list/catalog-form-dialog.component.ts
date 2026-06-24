import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeviceService } from '../../../application/services/device.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DeviceCatalog } from '../../../domain/models/device.model';

@Component({
  selector: 'app-catalog-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="dlg">
      <div class="dlg-header">
        <div class="dlg-icon"><mat-icon>{{ isEdit ? 'edit' : 'add_circle' }}</mat-icon></div>
        <div>
          <h2 class="dlg-title">{{ isEdit ? 'Editar modelo' : 'Nuevo modelo' }}</h2>
          <p class="dlg-sub">{{ isEdit ? 'Modifica los datos del modelo' : 'Agrega un nuevo modelo al catálogo' }}</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="dlg-form">

        <div class="field-row">
          <div class="field-group field-grow">
            <label class="field-lbl">NOMBRE DEL MODELO <span class="req">*</span></label>
            <input formControlName="name" class="field-input"
                   [class.err]="form.get('name')!.invalid && form.get('name')!.touched"
                   placeholder="iPhone 16 Pro Max">
            @if (form.get('name')!.invalid && form.get('name')!.touched) {
              <span class="field-error">El nombre es requerido</span>
            }
          </div>
        </div>

        <div class="field-row">
          <div class="field-group field-grow">
            <label class="field-lbl">MARCA <span class="req">*</span></label>
            <input formControlName="brand" class="field-input"
                   [class.err]="form.get('brand')!.invalid && form.get('brand')!.touched"
                   placeholder="Apple">
          </div>
          <div class="field-group w140">
            <label class="field-lbl">AÑO <span class="req">*</span></label>
            <input formControlName="releaseYear" type="number" class="field-input"
                   [class.err]="form.get('releaseYear')!.invalid && form.get('releaseYear')!.touched"
                   placeholder="2024">
          </div>
        </div>

        <div class="field-row">
          <div class="field-group field-grow">
            <label class="field-lbl">CICLOS MÁXIMOS</label>
            <input formControlName="maxCycles" type="number" class="field-input" placeholder="1000">
          </div>
          <div class="field-group w140">
            <label class="field-lbl">ORDEN</label>
            <input formControlName="sortOrder" type="number" class="field-input" placeholder="0">
          </div>
        </div>

        <div class="field-group">
          <label class="field-lbl">IMAGEN DEL MODELO <span class="opt">(opcional)</span></label>
          <div class="upload-area" (click)="imgFileInput.click()" [class.has-image]="imagePreview()">
            @if (imagePreview()) {
              <img [src]="imagePreview()!" class="img-preview" alt="Vista previa">
              <button type="button" class="img-remove" (click)="removeImage($event)">
                <mat-icon>close</mat-icon>
              </button>
            } @else {
              <mat-icon class="upload-icon">add_photo_alternate</mat-icon>
              <span class="upload-text">Haz clic para subir una imagen</span>
              <span class="upload-hint">JPG, PNG, WEBP · máx. 5 MB</span>
            }
          </div>
          <input #imgFileInput type="file" accept="image/*" style="display:none"
                 (change)="onFileSelected($event)">
        </div>

        <div class="dlg-actions">
          <button type="button" mat-stroked-button (click)="dialogRef.close(false)">Cancelar</button>
          <button type="submit" mat-flat-button color="primary" class="btn-save" [disabled]="saving() || form.invalid">
            @if (saving()) {
              <mat-progress-spinner diameter="16" mode="indeterminate" />
            } @else {
              <mat-icon>{{ isEdit ? 'save' : 'add' }}</mat-icon>
              {{ isEdit ? 'Guardar cambios' : 'Agregar modelo' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dlg { padding: 28px; min-width: 400px; }
    .dlg-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 24px; }
    .dlg-icon {
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
      background: rgba(139,92,246,0.12);
      display: flex; align-items: center; justify-content: center;
    }
    .dlg-icon mat-icon { color: #8b5cf6; font-size: 22px; width: 22px; height: 22px; }
    .dlg-title { font-size: 18px; font-weight: 700; margin: 0 0 2px; color: var(--text-primary); }
    .dlg-sub   { font-size: 12px; color: var(--text-muted); margin: 0; }

    .dlg-form { display: flex; flex-direction: column; gap: 14px; }
    .field-row { display: flex; gap: 12px; }
    .field-group { display: flex; flex-direction: column; gap: 5px; }
    .field-grow { flex: 1; }
    .w140 { width: 140px; flex-shrink: 0; }

    .field-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.07em; color: var(--text-muted); }
    .req { color: #f87171; }
    .opt { font-size: 10px; font-weight: 400; color: var(--text-muted); }

    .field-input {
      height: 40px; padding: 0 12px;
      border: 1px solid var(--border-color); border-radius: 8px;
      font-size: 14px; color: var(--text-primary); background: var(--hover-bg);
      outline: none; width: 100%; box-sizing: border-box; font-family: var(--font-sans);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .field-input::placeholder { color: var(--input-placeholder); }
    .field-input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.12); }
    .field-input.err { border-color: #f87171; }
    .field-error { font-size: 11px; color: #f87171; }

    .upload-area {
      border: 2px dashed var(--border-color); border-radius: 10px;
      min-height: 100px; cursor: pointer; position: relative;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
      transition: border-color 0.2s, background 0.2s; overflow: hidden;
    }
    .upload-area:hover { border-color: #8b5cf6; background: rgba(139,92,246,0.04); }
    .upload-area.has-image { border-style: solid; min-height: 130px; padding: 0; }
    .upload-icon { font-size: 28px; width: 28px; height: 28px; color: var(--text-muted); }
    .upload-text { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
    .upload-hint { font-size: 11px; color: var(--text-muted); }
    .img-preview {
      width: 100%; height: 130px; object-fit: contain; display: block;
      background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%);
      background-size: 14px 14px;
      background-position: 0 0, 0 7px, 7px -7px, -7px 0px;
      background-color: #f0f0f0;
    }
    .img-remove {
      position: absolute; top: 6px; right: 6px;
      background: rgba(0,0,0,0.55); border: none; border-radius: 50%;
      width: 26px; height: 26px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; color: white;
    }
    .img-remove mat-icon { font-size: 15px; width: 15px; height: 15px; }

    .dlg-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
    .btn-save { display: flex; align-items: center; gap: 6px; font-weight: 600; border-radius: 8px !important; }
    .btn-save mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `]
})
export class CatalogFormDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CatalogFormDialogComponent>);
  private readonly data: DeviceCatalog | null = inject(MAT_DIALOG_DATA);
  private readonly svc    = inject(DeviceService);
  private readonly notify = inject(NotificationService);
  private readonly fb     = inject(FormBuilder);

  readonly saving = signal(false);
  readonly isEdit = !!this.data;
  readonly imagePreview = signal<string | null>(this.data?.imageUrl ?? null);

  readonly form = this.fb.group({
    name:        [this.data?.name        ?? '',    Validators.required],
    brand:       [this.data?.brand       ?? 'Apple', Validators.required],
    releaseYear: [this.data?.releaseYear ?? new Date().getFullYear(), [Validators.required, Validators.min(2007)]],
    maxCycles:   [this.data?.maxCycles   ?? 1000,  Validators.required],
    sortOrder:   [this.data?.sortOrder   ?? 0],
    imageUrl:    [this.data?.imageUrl    ?? '']
  });

  async onFileSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('La imagen no puede superar 5 MB'); return; }
    const b64 = await this.compressImage(file);
    this.imagePreview.set(b64);
    this.form.patchValue({ imageUrl: b64 });
  }

  removeImage(e: Event): void {
    e.stopPropagation();
    this.imagePreview.set(null);
    this.form.patchValue({ imageUrl: '' });
  }

  private compressImage(file: File, maxW = 800, quality = 0.78): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          let { width: w, height: h } = img;
          if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, w, h);
          const mayHaveAlpha = file.type === 'image/png' || file.type === 'image/webp';
          if (mayHaveAlpha) {
            const data = ctx.getImageData(0, 0, w, h).data;
            let transparent = false;
            for (let i = 3; i < data.length; i += 4) {
              if (data[i] < 255) { transparent = true; break; }
            }
            if (transparent) { resolve(canvas.toDataURL('image/png')); return; }
          }
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = ev.target!.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const v = this.form.value;
    const payload = {
      name:        v.name!,
      brand:       v.brand!,
      releaseYear: v.releaseYear!,
      maxCycles:   v.maxCycles!,
      sortOrder:   v.sortOrder ?? 0,
      imageUrl:    v.imageUrl || undefined
    };

    const request$ = this.isEdit
      ? this.svc.updateCatalogDevice(this.data!.id, payload)
      : this.svc.createCatalogDevice(payload);

    request$.subscribe({
      next: () => {
        this.notify.success(this.isEdit ? 'Modelo actualizado.' : 'Modelo agregado al catálogo.');
        this.dialogRef.close(true);
      },
      error: () => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar el modelo.');
      }
    });
  }
}
