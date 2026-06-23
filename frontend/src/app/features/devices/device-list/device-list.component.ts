import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeviceService } from '../../../application/services/device.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppleDevice } from '../../../domain/models/device.model';
import { DeviceFormDialogComponent } from '../device-form-dialog/device-form-dialog.component';

@Component({
  selector: 'app-device-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatDialogModule,
    MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="page">
      <div class="page-header animate-fade-up">
        <div>
          <h1 class="page-title">
            <span class="title-emoji">📱</span> Ciclos de Batería iPhone
          </h1>
          <p class="page-subtitle">Monitorea el estado de la batería de tus dispositivos Apple.</p>
        </div>
        <button mat-flat-button color="primary" (click)="openCreateDialog()" class="add-btn">
          <mat-icon>add</mat-icon> Nuevo dispositivo
        </button>
      </div>

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

      @if (!svc.loading() && svc.devices().length === 0) {
        <div class="empty-state animate-fade-up">
          <div class="empty-icon">📱</div>
          <h3>Sin dispositivos aún</h3>
          <p>Agrega tu primer dispositivo Apple para monitorear ciclos de batería.</p>
          <button mat-flat-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon> Agregar dispositivo
          </button>
        </div>
      }

      @if (!svc.loading() && svc.devices().length > 0) {
        <div class="devices-grid">
          @for (d of svc.devices(); track d.id; let i = $index) {
            <div class="device-card" [style.animation-delay]="(i * 80) + 'ms'">
              <div class="dc-header">
                <div class="dc-brand-icon">
                  <span>🍎</span>
                </div>
                <div class="dc-info">
                  <div class="dc-name">{{ d.deviceName }}</div>
                  @if (d.catalogDeviceName) {
                    <div class="dc-catalog">{{ d.catalogDeviceName }}</div>
                  }
                </div>
              </div>

              <div class="dc-purchase">
                <mat-icon>calendar_today</mat-icon>
                Comprado: {{ d.purchaseDate }}
              </div>

              <div class="dc-stats">
                <div class="dc-stat">
                  <span class="dcs-val">{{ d.totalRecords }}</span>
                  <span class="dcs-lbl">Registros</span>
                </div>
              </div>

              <div class="dc-actions">
                <button mat-stroked-button (click)="goToDetail(d.id)" class="view-btn">
                  <mat-icon>battery_charging_full</mat-icon> Ver detalle
                </button>
                <button mat-icon-button (click)="openEditDialog(d)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="confirmDelete(d)" matTooltip="Eliminar" color="warn">
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
    .add-btn { border-radius: 10px !important; height: 44px; }

    .loading-grid, .devices-grid {
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
      height: 14px;
      background: linear-gradient(90deg, var(--border-color) 25%, var(--hover-bg) 50%, var(--border-color) 75%);
      background-size: 200% 100%; border-radius: 6px; margin-bottom: 10px;
      animation: shimmer 1.5s infinite;
    }

    .w-60 { width: 60%; } .w-40 { width: 40%; } .w-80 { width: 80%; }

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

    .device-card {
      background: var(--card-bg); border: 1px solid var(--border-color);
      backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
      border-radius: 20px; padding: 24px;
      display: flex; flex-direction: column; gap: 14px;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, border-color 0.25s ease;
      animation: fadeUp 0.5s ease-out both;
    }

    .device-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
      border-color: rgba(16,185,129,0.3);
    }

    .dc-header { display: flex; align-items: center; gap: 14px; }

    .dc-brand-icon {
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.08));
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
    }

    .dc-name    { font-size: 16px; font-weight: 700; color: var(--text-primary); }
    .dc-catalog { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

    .dc-purchase {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: var(--text-muted);
    }

    .dc-purchase mat-icon { font-size: 15px; width: 15px; height: 15px; }

    .dc-stats { padding: 12px 0; border-top: 1px solid var(--border-color); }
    .dc-stat  { display: flex; flex-direction: column; gap: 2px; }
    .dcs-val  { font-size: 22px; font-weight: 700; color: var(--text-primary); }
    .dcs-lbl  { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

    .dc-actions { display: flex; align-items: center; gap: 8px; }
    .view-btn { flex: 1; gap: 4px; border-radius: 8px !important; }

    .animate-fade-up { animation: fadeUp 0.5s ease-out both; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DeviceListComponent implements OnInit {
  readonly svc    = inject(DeviceService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  ngOnInit(): void {
    this.svc.loadDevices().subscribe();
  }

  goToDetail(id: string): void {
    this.router.navigate(['/devices', id]);
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(DeviceFormDialogComponent, {
      width: '520px',
      panelClass: 'premium-dialog'
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.notify.success('Dispositivo agregado.');
    });
  }

  openEditDialog(device: AppleDevice): void {
    const ref = this.dialog.open(DeviceFormDialogComponent, {
      width: '520px',
      panelClass: 'premium-dialog',
      data: device
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.notify.success('Dispositivo actualizado.');
    });
  }

  confirmDelete(device: AppleDevice): void {
    if (!confirm(`¿Eliminar "${device.deviceName}"?`)) return;

    this.svc.deleteDevice(device.id).subscribe({
      next: ()  => this.notify.success('Dispositivo eliminado.'),
      error: () => this.notify.error('No se pudo eliminar el dispositivo.')
    });
  }
}
