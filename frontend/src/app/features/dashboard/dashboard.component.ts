import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { VehicleService } from '../../application/services/vehicle.service';
import { DeviceService } from '../../application/services/device.service';
import { TitleService } from '../../shared/services/title.service';
import { VehicleDetail } from '../../domain/models/vehicle.model';
import { AppleDeviceDetail } from '../../domain/models/device.model';

interface ActivityItem {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  amount: string;
  amountClass: string;
  detail: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, RouterLink, MatIconModule, MatButtonModule],
  template: `
    <div class="dashboard">

      <!-- Header -->
      <div class="dash-header">
        <h1 class="dash-greeting">
          {{ greeting() }},&nbsp;<span class="name-accent">{{ auth.currentUser()?.firstName }}</span>
        </h1>
        <p class="dash-sub">Aquí tienes el resumen de tus utilidades hoy.</p>
      </div>

      <!-- Stat Cards -->
      <div class="cards-row">

        <!-- Kilometraje -->
        <a routerLink="/vehicles" class="stat-card">
          <div class="sc-top">
            <div class="sc-icon-wrap sc-icon--purple">
              <mat-icon>directions_car</mat-icon>
            </div>
            <span class="sc-badge sc-badge--green">+{{ vehicleCount() }} vehículo{{ vehicleCount() !== 1 ? 's' : '' }}</span>
          </div>
          <h3 class="sc-title">Kilometraje</h3>
          <p class="sc-desc">Uso total del vehículo principal</p>
          <div class="sc-metric-row">
            <div>
              <span class="sc-big">{{ currentKm() | number:'1.0-0' }}</span>
              <span class="sc-unit"> km</span>
            </div>
            <span class="sc-meta">{{ metaPct() }}% Meta</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="metaPct()"></div>
          </div>
        </a>

        <!-- Ciclos iPhone -->
        <a routerLink="/devices" class="stat-card">
          <div class="sc-top">
            <div class="sc-icon-wrap sc-icon--cyan">
              <mat-icon>phone_iphone</mat-icon>
            </div>
            <span class="sc-badge sc-badge--dot">Actualizado ahora</span>
          </div>
          <h3 class="sc-title">Ciclos iPhone</h3>
          <p class="sc-desc">Salud de la batería y desgaste</p>
          <div class="cycle-row">
            <div class="ring-wrap">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="30" fill="none"
                  stroke="rgba(255,255,255,0.07)" stroke-width="8"/>
                <circle cx="40" cy="40" r="30" fill="none"
                  stroke="#22d3ee" stroke-width="8"
                  stroke-linecap="round"
                  [attr.stroke-dasharray]="188.5"
                  [attr.stroke-dashoffset]="188.5 - (188.5 * deviceHealth() / 100)"
                  transform="rotate(-90 40 40)"
                  style="transition:stroke-dashoffset 1.2s ease"/>
              </svg>
              <div class="ring-inner">{{ deviceHealth() | number:'1.0-0' }}%</div>
            </div>
            <div class="cycle-stats">
              <span class="cycle-lbl">Ciclos Totales</span>
              <span class="cycle-val">{{ totalCycles() }}</span>
              <span class="cycle-status">Estado:&nbsp;<span class="accent-cyan">{{ healthLabel() }}</span></span>
            </div>
          </div>
        </a>

        <!-- Nueva Entrada -->
        <div class="stat-card stat-card--action">
          <h3 class="sc-title">Nueva Entrada</h3>
          <p class="sc-desc sc-desc--lg">Registra kilometraje o ciclos de carga rápidamente.</p>
          <a routerLink="/vehicles" class="btn-create">
            <mat-icon>add_circle</mat-icon> Crear Registro
          </a>
        </div>

      </div>

      <!-- Actividad Reciente -->
      <div class="activity-section">
        <div class="section-hdr">
          <h2 class="section-title">Actividad Reciente</h2>
          <a routerLink="/vehicles" class="ver-todo">Ver todo</a>
        </div>

        @for (act of activity(); track act.id) {
          <div class="act-row">
            <div class="act-icon" [style.background]="act.iconBg">
              <mat-icon>{{ act.icon }}</mat-icon>
            </div>
            <div class="act-info">
              <span class="act-title">{{ act.title }}</span>
              <span class="act-sub">{{ act.subtitle }}</span>
            </div>
            <div class="act-meta">
              <span class="act-amount" [ngClass]="act.amountClass">{{ act.amount }}</span>
              <span class="act-detail">{{ act.detail }}</span>
            </div>
          </div>
        }

        @if (activity().length === 0) {
          <div class="act-empty">
            <mat-icon>history</mat-icon>
            <span>No hay actividad reciente aún.</span>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .dashboard { max-width: 1100px; margin: 0 auto; }

    /* Header */
    .dash-header { margin-bottom: 28px; }
    .dash-greeting {
      font-family: 'Montserrat', sans-serif;
      font-size: clamp(22px, 3vw, 30px); font-weight: 700;
      color: var(--text-primary); margin: 0 0 6px;
    }
    .name-accent {
      background: linear-gradient(135deg, #8b5cf6, #22d3ee);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent; color: transparent;
    }
    .dash-sub { color: var(--text-muted); font-size: 14px; margin: 0; }

    /* Cards row */
    .cards-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px; margin-bottom: 28px;
    }
    @media (max-width: 900px) { .cards-row { grid-template-columns: 1fr; } }

    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px; padding: 22px;
      display: flex; flex-direction: column; gap: 10px;
      text-decoration: none; color: inherit;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-card-hover);
      border-color: rgba(139,92,246,0.3);
    }
    .stat-card--action { cursor: default; }
    .stat-card--action:hover { transform: none; box-shadow: none; border-color: var(--border-color); }

    .sc-top { display: flex; align-items: center; justify-content: space-between; }

    .sc-icon-wrap {
      width: 42px; height: 42px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .sc-icon-wrap mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .sc-icon--purple { background: rgba(139,92,246,0.15); color: #8b5cf6; }
    .sc-icon--cyan   { background: rgba(34,211,238,0.12); color: #22d3ee; }

    .sc-badge {
      font-size: 11px; font-weight: 600; padding: 3px 10px;
      border-radius: 20px;
    }
    .sc-badge--green { background: rgba(74,222,128,0.12); color: #4ade80; }
    .sc-badge--dot {
      display: flex; align-items: center; gap: 5px;
      background: rgba(74,222,128,0.08); color: #4ade80;
    }
    .sc-badge--dot::before {
      content: ''; width: 6px; height: 6px; border-radius: 50%;
      background: #4ade80; flex-shrink: 0;
    }

    .sc-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 17px; font-weight: 700; margin: 0; color: var(--text-primary);
    }
    .sc-desc { font-size: 13px; color: var(--text-muted); margin: 0; line-height: 1.4; }
    .sc-desc--lg { font-size: 14px; flex: 1; }

    .sc-metric-row {
      display: flex; align-items: baseline; justify-content: space-between;
    }
    .sc-big { font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 700; color: var(--text-primary); }
    .sc-unit { font-size: 14px; color: var(--text-muted); }
    .sc-meta { font-size: 12px; color: var(--text-muted); }

    .progress-track {
      height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px;
    }
    .progress-fill {
      height: 100%; border-radius: 3px;
      background: linear-gradient(90deg, #8b5cf6, #22d3ee);
      transition: width 1s ease;
    }

    /* Cycles ring */
    .cycle-row { display: flex; align-items: center; gap: 16px; margin-top: 4px; }
    .ring-wrap { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
    .ring-inner {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700;
      color: var(--text-primary);
    }
    .cycle-stats { display: flex; flex-direction: column; gap: 4px; }
    .cycle-lbl { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .cycle-val { font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 700; color: var(--text-primary); }
    .cycle-status { font-size: 12px; color: var(--text-muted); }
    .accent-cyan { color: #22d3ee; font-weight: 600; }

    /* Create btn */
    .btn-create {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 11px 22px; border-radius: 9999px;
      background: linear-gradient(135deg, #8b5cf6, #22d3ee);
      color: #fff; font-weight: 700; font-size: 14px;
      text-decoration: none; font-family: 'Montserrat', sans-serif;
      width: fit-content; margin-top: auto;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .btn-create:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-create mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* Activity */
    .activity-section {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px; overflow: hidden;
    }
    .section-hdr {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .section-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 17px; font-weight: 700; margin: 0; color: var(--text-primary);
    }
    .ver-todo { font-size: 13px; color: #8b5cf6; text-decoration: none; font-weight: 600; }
    .ver-todo:hover { text-decoration: underline; }

    .act-row {
      display: flex; align-items: center; gap: 16px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-color);
      transition: background 0.15s ease;
    }
    .act-row:last-child { border-bottom: none; }
    .act-row:hover { background: var(--hover-bg); }

    .act-icon {
      width: 40px; height: 40px; min-width: 40px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .act-icon mat-icon { font-size: 20px; width: 20px; height: 20px; color: white; }

    .act-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .act-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .act-sub   { font-size: 12px; color: var(--text-muted); }

    .act-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .act-amount { font-size: 14px; font-weight: 700; }
    .act-detail { font-size: 12px; color: var(--text-muted); }

    .act-amount--green  { color: #4ade80; }
    .act-amount--cyan   { color: #22d3ee; }
    .act-amount--amber  { color: #fbbf24; }
    .act-amount--muted  { color: var(--text-muted); }

    .act-empty {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 40px; color: var(--text-muted); font-size: 14px;
    }
    .act-empty mat-icon { font-size: 32px; width: 32px; height: 32px; opacity: 0.4; }
  `]
})
export class DashboardComponent implements OnInit {
  readonly auth             = inject(AuthService);
  private readonly vSvc     = inject(VehicleService);
  private readonly dSvc     = inject(DeviceService);
  private readonly titleSvc = inject(TitleService);

  readonly vehicleCount  = signal(0);
  readonly deviceCount   = signal(0);
  readonly currentKm     = signal(0);
  readonly totalCycles   = signal(0);
  readonly deviceHealth  = signal(0);

  readonly greeting = signal(this.getGreeting());
  readonly activity = signal<ActivityItem[]>([]);

  metaPct(): number {
    const km = this.currentKm();
    const target = 20000;
    return Math.min(100, Math.round((km / target) * 100));
  }

  healthLabel(): string {
    const h = this.deviceHealth();
    if (h >= 90) return 'Excelente';
    if (h >= 75) return 'Buena';
    if (h >= 60) return 'Aceptable';
    return 'Deteriorada';
  }

  ngOnInit(): void {
    this.titleSvc.reset();

    this.vSvc.loadVehicles().subscribe({
      next: () => {
        const vs = this.vSvc.vehicles();
        this.vehicleCount.set(vs.length);
        if (vs.length > 0) {
          this.vSvc.getVehicle(vs[0].id).subscribe({
            next: (d: VehicleDetail) => {
              this.currentKm.set(d.statistics.currentMileage);
              this._refreshActivity(d, null);
            }
          });
        }
      }
    });

    this.dSvc.loadDevices().subscribe({
      next: () => {
        const ds = this.dSvc.devices();
        this.deviceCount.set(ds.length);
        if (ds.length > 0) {
          this.dSvc.getDevice(ds[0].id).subscribe({
            next: (d: AppleDeviceDetail) => {
              this.totalCycles.set(d.statistics.currentCycles);
              this.deviceHealth.set(d.statistics.healthPercentage);
              this._refreshActivity(null, d);
            }
          });
        }
      }
    });
  }

  private _vDetail: VehicleDetail | null = null;
  private _dDetail: AppleDeviceDetail | null = null;

  private _refreshActivity(v: VehicleDetail | null, d: AppleDeviceDetail | null): void {
    if (v) this._vDetail = v;
    if (d) this._dDetail = d;
    const items: ActivityItem[] = [];

    const vd = this._vDetail;
    if (vd?.records?.length) {
      const sorted = [...vd.records].sort((a, b) => b.recordDate.localeCompare(a.recordDate));
      sorted.slice(0, 2).forEach((r, i) => {
        const prev = sorted[i + 1];
        const delta = prev ? r.currentMileage - prev.currentMileage : 0;
        items.push({
          id: r.id,
          icon: 'local_gas_station',
          iconBg: 'rgba(139,92,246,0.2)',
          title: `Registro ${vd.name}`,
          subtitle: `${r.recordDate} · ${vd.brand} ${vd.model}`,
          amount: `${r.currentMileage.toLocaleString()} km`,
          amountClass: 'act-amount--cyan',
          detail: delta > 0 ? `+${delta.toLocaleString()} km este registro` : 'Primer registro'
        });
      });
    }

    const dd = this._dDetail;
    if (dd?.records?.length) {
      const sorted = [...dd.records].sort((a, b) => b.recordDate.localeCompare(a.recordDate));
      sorted.slice(0, 1).forEach(r => {
        const h = Math.max(0, 100 - (r.currentCycles / 1000 * 20));
        items.push({
          id: r.id,
          icon: 'phone_iphone',
          iconBg: 'rgba(34,211,238,0.15)',
          title: `Sincronización ${dd.deviceName}`,
          subtitle: r.recordDate,
          amount: 'Actualizado',
          amountClass: 'act-amount--cyan',
          detail: `Salud ${h.toFixed(0)}%`
        });
      });
    }

    if (items.length === 0 && (this._vDetail || this._dDetail)) {
      if (this._vDetail) items.push({
        id: 'v0', icon: 'directions_car', iconBg: 'rgba(139,92,246,0.2)',
        title: this._vDetail.name, subtitle: `${this._vDetail.brand} ${this._vDetail.model}`,
        amount: 'Registrado', amountClass: 'act-amount--muted', detail: 'Sin registros aún'
      });
      if (this._dDetail) items.push({
        id: 'd0', icon: 'phone_iphone', iconBg: 'rgba(34,211,238,0.15)',
        title: this._dDetail.deviceName, subtitle: this._dDetail.catalogDeviceName ?? '',
        amount: 'Registrado', amountClass: 'act-amount--muted', detail: 'Sin ciclos aún'
      });
    }

    this.activity.set(items.slice(0, 3));
  }

  private getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
