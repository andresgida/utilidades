import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VehicleService } from '../../../application/services/vehicle.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Vehicle } from '../../../domain/models/vehicle.model';
import { VehicleFormDialogComponent } from '../vehicle-form-dialog/vehicle-form-dialog.component';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, DecimalPipe,
    MatButtonModule, MatIconModule, MatDialogModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="page">
      <!-- Page header -->
      <div class="page-header animate-fade-up">
        <div>
          <h1 class="page-title">
            <span class="title-emoji">🚗</span> Control de Kilometraje
          </h1>
          <p class="page-subtitle">
            Registra y analiza el kilometraje de tus vehículos.
          </p>
        </div>
        <button mat-flat-button color="primary" (click)="openCreateDialog()" class="add-btn">
          <mat-icon>add</mat-icon>
          Nuevo vehículo
        </button>
      </div>

      <!-- Loading state -->
      @if (svc.loading()) {
        <div class="loading-grid">
          @for (s of [1,2,3]; track s) {
            <div class="skeleton-card">
              <div class="skeleton-line w-60"></div>
              <div class="skeleton-line w-40"></div>
              <div class="skeleton-line w-80" style="margin-top:16px"></div>
            </div>
          }
        </div>
      }

      <!-- Empty state -->
      @if (!svc.loading() && svc.vehicles().length === 0) {
        <div class="empty-state animate-fade-up">
          <div class="empty-icon">🚗</div>
          <h3>Sin vehículos aún</h3>
          <p>Agrega tu primer vehículo para comenzar a registrar kilometraje.</p>
          <button mat-flat-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon> Agregar vehículo
          </button>
        </div>
      }

      <!-- Vehicles grid -->
      @if (!svc.loading() && svc.vehicles().length > 0) {
        <div class="vehicles-grid">
          @for (v of svc.vehicles(); track v.id; let i = $index) {
            <div class="vehicle-card" [style.animation-delay]="(i * 80) + 'ms'">
              <div class="vc-header">
                <div class="vc-badge">{{ v.brand }}</div>
                <div class="vc-status" [class.active]="v.isActive" [class.inactive]="!v.isActive">
                  {{ v.isActive ? 'Activo' : 'Inactivo' }}
                </div>
              </div>

              <div class="vc-name">{{ v.name }}</div>
              <div class="vc-model">{{ v.brand }} {{ v.model }} {{ v.year }}</div>

              @if (v.licensePlate) {
                <div class="vc-plate">{{ v.licensePlate }}</div>
              }

              <div class="vc-stats">
                <div class="vc-stat">
                  <span class="vcs-val">{{ v.baseMileage | number:'1.0-0' }}</span>
                  <span class="vcs-lbl">Base km</span>
                </div>
                <div class="vc-stat-divider"></div>
                <div class="vc-stat">
                  <span class="vcs-val">{{ v.totalRecords }}</span>
                  <span class="vcs-lbl">Registros</span>
                </div>
              </div>

              <div class="vc-actions">
                <button mat-stroked-button [routerLink]="v.id" class="view-btn">
                  <mat-icon>bar_chart</mat-icon> Ver detalle
                </button>
                <button mat-icon-button (click)="openEditDialog(v)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="confirmDelete(v)" matTooltip="Eliminar" color="warn">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
    }

    .page-title {
      font-size: 28px; font-weight: 700; margin: 0 0 6px;
      color: var(--text-primary); display: flex; align-items: center; gap: 10px;
    }

    .title-emoji { font-size: 28px; }
    .page-subtitle { color: var(--text-muted); margin: 0; font-size: 14px; }

    .add-btn { border-radius: 10px !important; gap: 6px; height: 44px; }

    .loading-grid, .vehicles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .skeleton-card {
      background: var(--card-bg); border: 1px solid var(--border-color);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border-radius: 20px; padding: 24px;
    }

    .skeleton-line {
      height: 14px; background: linear-gradient(90deg, var(--border-color) 25%, var(--hover-bg) 50%, var(--border-color) 75%);
      background-size: 200% 100%; border-radius: 6px; margin-bottom: 10px;
      animation: shimmer 1.5s infinite;
    }

    .w-60 { width: 60%; }
    .w-40 { width: 40%; }
    .w-80 { width: 80%; }

    @keyframes shimmer {
      from { background-position: 200% 0; }
      to   { background-position: -200% 0; }
    }

    .empty-state {
      text-align: center; padding: 80px 24px;
      display: flex; flex-direction: column; align-items: center; gap: 12px;
    }

    .empty-icon { font-size: 64px; }
    .empty-state h3 { font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0; }
    .empty-state p  { color: var(--text-muted); margin: 0 0 8px; }

    .vehicle-card {
      background: var(--card-bg);
      backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, border-color 0.25s ease;
      animation: fadeUp 0.5s ease-out both;
    }

    .vehicle-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
      border-color: rgba(90,111,248,0.3);
    }

    .vc-header { display: flex; justify-content: space-between; align-items: center; }

    .vc-badge {
      font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
      padding: 3px 10px; border-radius: 20px;
      background: rgba(90,111,248,0.12); color: #5a6ff8;
    }

    .vc-status {
      font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
    }

    .vc-status.active   { background: rgba(16,185,129,0.12); color: #10b981; }
    .vc-status.inactive { background: rgba(239,68,68,0.12);  color: #ef4444; }

    .vc-name  { font-size: 18px; font-weight: 700; color: var(--text-primary); }
    .vc-model { font-size: 13px; color: var(--text-muted); }
    .vc-plate {
      font-size: 12px; font-family: var(--font-mono, monospace);
      padding: 2px 8px; background: var(--hover-bg); border-radius: 4px;
      color: var(--text-secondary); width: fit-content;
    }

    .vc-stats {
      display: flex; align-items: center; gap: 0;
      padding: 12px 0; border-top: 1px solid var(--border-color);
    }

    .vc-stat { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .vcs-val { font-size: 20px; font-weight: 700; color: var(--text-primary); }
    .vcs-lbl { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

    .vc-stat-divider { width: 1px; height: 32px; background: var(--border-color); margin: 0 16px; }

    .vc-actions { display: flex; align-items: center; gap: 8px; }
    .view-btn { flex: 1; gap: 4px; border-radius: 8px !important; }

    .animate-fade-up { animation: fadeUp 0.5s ease-out both; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class VehicleListComponent implements OnInit {
  readonly svc    = inject(VehicleService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  ngOnInit(): void {
    this.svc.loadVehicles().subscribe();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(VehicleFormDialogComponent, {
      width: '520px',
      panelClass: 'premium-dialog'
    });
    ref.afterClosed().subscribe((result: boolean) => {
      if (result) this.notify.success('Vehículo creado exitosamente.');
    });
  }

  openEditDialog(vehicle: Vehicle): void {
    const ref = this.dialog.open(VehicleFormDialogComponent, {
      width: '520px',
      panelClass: 'premium-dialog',
      data: vehicle
    });
    ref.afterClosed().subscribe((result: boolean) => {
      if (result) this.notify.success('Vehículo actualizado exitosamente.');
    });
  }

  confirmDelete(vehicle: Vehicle): void {
    if (!confirm(`¿Eliminar "${vehicle.name}"? Esta acción no se puede deshacer.`)) return;

    this.svc.deleteVehicle(vehicle.id).subscribe({
      next: () => this.notify.success('Vehículo eliminado.'),
      error: () => this.notify.error('No se pudo eliminar el vehículo.')
    });
  }
}
