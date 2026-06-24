import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { switchMap } from 'rxjs';
import { NgApexchartsModule } from 'ng-apexcharts';
import { VehicleService } from '../../../application/services/vehicle.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TitleService } from '../../../shared/services/title.service';
import { VehicleDetail, MileageRecord, UpdateMileageRecord } from '../../../domain/models/vehicle.model';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, DecimalPipe, DatePipe,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    NgApexchartsModule
  ],
  template: `
    <div class="detail-page">

      @if (loading()) {
        <div class="loading-center"><mat-progress-spinner mode="indeterminate" diameter="48" /></div>
      }

      @if (!loading() && detail()) {
        <div class="animate-fade-up">

          <!-- Hero row: car image + form -->
          <div class="hero-row">
            <div class="hero-card">
              @if (detail()!.imageUrl) {
                <img [src]="detail()!.imageUrl!" [alt]="detail()!.name" class="hero-photo">
              } @else {
                <div class="hero-overlay">
                  <div class="hero-car-icon"><mat-icon>directions_car</mat-icon></div>
                </div>
              }
              <div class="hero-info">
                <div class="hero-name">{{ detail()!.name }}</div>
                <div class="hero-location">
                  <mat-icon>place</mat-icon>
                  {{ detail()!.brand }} {{ detail()!.model }} · {{ detail()!.year }}
                </div>
              </div>
            </div>

            <div class="form-card">
              <h3 class="form-title">Registrar</h3>
              <form [formGroup]="recordForm" (ngSubmit)="addRecord()" class="record-form">
                <div class="field-group">
                  <label class="field-lbl">KILOMETRAJE ACTUAL</label>
                  <div class="input-suffix-wrap">
                    <input formControlName="currentMileage" type="number" class="field-input has-suffix"
                           [class.err]="recordForm.get('currentMileage')?.invalid && recordForm.get('currentMileage')?.touched"
                           placeholder="000.000">
                    <span class="input-suffix">KM</span>
                  </div>
                  @if (recordForm.get('currentMileage')?.invalid && recordForm.get('currentMileage')?.touched) {
                    <span class="field-error">Ingresa un kilometraje válido</span>
                  }
                </div>
                <div class="field-group">
                  <label class="field-lbl">FECHA DE REGISTRO</label>
                  <input formControlName="recordDate" type="date" class="field-input"
                         [class.err]="recordForm.get('recordDate')?.invalid && recordForm.get('recordDate')?.touched">
                </div>
                <div class="field-group">
                  <label class="field-lbl">OBSERVACIONES <span class="opt">(opcional)</span></label>
                  <textarea formControlName="observations" class="field-input field-textarea"
                            placeholder="Ej. Cambio de aceite..." rows="2"></textarea>
                </div>
                <button type="submit" class="btn-save" [disabled]="recordForm.invalid || recordSaving()">
                  @if (recordSaving()) {
                    <mat-progress-spinner diameter="18" mode="indeterminate" />
                  } @else {
                    GUARDAR REGISTRO
                  }
                </button>
              </form>
            </div>
          </div>

          <!-- KPI row -->
          <div class="kpi-row">
            <div class="kpi-card">
              <div class="kpi-lbl">KM REGISTRADOS</div>
              <div class="kpi-val">{{ displayedStats()!.currentMileage | number:'1.0-0' }}<span class="kpi-unit"> km</span></div>
              @if (displayedStats()!.kmTraveled > 0) {
                <div class="kpi-trend">→ +{{ displayedStats()!.kmTraveled | number:'1.0-0' }} este mes</div>
              }
            </div>
            <div class="kpi-card">
              <div class="kpi-lbl">DÍAS TRANSCURRIDOS</div>
              <div class="kpi-val">{{ displayedStats()!.daysElapsed | number }}<span class="kpi-unit"> días</span></div>
              <div class="kpi-trend kpi-trend--muted">Desde último mantenimiento</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-lbl">KM / DÍA</div>
              <div class="kpi-val">{{ displayedStats()!.dailyAverage | number:'1.1-1' }}<span class="kpi-unit"> km/d</span></div>
              <div class="kpi-bar">
                <div class="kpi-bar-fill" [style.width.%]="Math.min(100, displayedStats()!.dailyAverage / 2)"></div>
              </div>
            </div>
            <div class="kpi-card">
              <div class="kpi-lbl">PROYECCIÓN ANUAL</div>
              <div class="kpi-val">{{ displayedStats()!.annualProjection | number:'1.0-0' }}<span class="kpi-unit"> km</span></div>
              <div class="kpi-trend kpi-trend--warn">Sobre el promedio</div>
            </div>
          </div>

          @if (selectedRecord()) {
            <div class="record-hint">
              <mat-icon>info</mat-icon>
              Mostrando datos del registro del {{ selectedRecord()!.recordDate | date:'dd/MM/yyyy' }} —
              <button class="hint-clear" (click)="selectedRecord.set(null)">Ver resumen total</button>
            </div>
          }

          <!-- Chart -->
          <div class="chart-card">
            <div class="chart-header">
              <h3>Historial de KM</h3>
            </div>
            @if (detail()!.records.length > 1) {
              <apx-chart
                [series]="chartSeries()"
                [chart]="chartOptions.chart"
                [xaxis]="chartOptions.xaxis"
                [yaxis]="chartOptions.yaxis"
                [stroke]="chartOptions.stroke"
                [fill]="chartOptions.fill"
                [tooltip]="chartOptions.tooltip"
                [grid]="chartOptions.grid"
                [colors]="chartOptions.colors">
              </apx-chart>
            } @else {
              <div class="chart-empty">Agrega al menos 2 registros para ver la gráfica.</div>
            }
          </div>

          <!-- Records table -->
          <div class="records-card">
            <div class="records-header">
              <h3>Registros Recientes</h3>
              <span class="records-count">{{ detail()!.records.length }} registros</span>
            </div>
            @if (detail()!.records.length === 0) {
              <div class="table-empty">No hay registros aún. ¡Agrega el primero!</div>
            } @else {
              <div class="records-table-wrap">
                <table class="records-table">
                  <thead><tr>
                    <th>FECHA</th><th>KM TOTAL</th><th>RECORRIDO</th>
                    <th>ESTADO</th><th class="th-actions">ACCIONES</th>
                  </tr></thead>
                  <tbody>
                    @for (r of sortedRecords(); track r.id) {
                      @if (editingRecord()?.id === r.id) {
                        <tr class="edit-row">
                          <td><input type="date" class="edit-input" [value]="editDate" (input)="editDate = $any($event.target).value"></td>
                          <td>
                            <div class="edit-km-wrap">
                              <input type="number" class="edit-input" [value]="editMileage" (input)="editMileage = +$any($event.target).value">
                              <span class="edit-km-suffix">km</span>
                            </div>
                          </td>
                          <td><input type="text" class="edit-input" [value]="editObs" (input)="editObs = $any($event.target).value" placeholder="Obs."></td>
                          <td></td>
                          <td class="td-actions">
                            <button class="btn-icon btn-save-edit" (click)="saveEdit(r)"><mat-icon>check</mat-icon></button>
                            <button class="btn-icon btn-cancel-edit" (click)="editingRecord.set(null)"><mat-icon>close</mat-icon></button>
                          </td>
                        </tr>
                      } @else {
                        <tr (click)="selectRecord(r)" [class.selected]="selectedRecord()?.id === r.id">
                          <td [class.future-date]="isFuture(r.recordDate)">
                            {{ r.recordDate | date:'dd MMM yyyy' }}
                            @if (isFuture(r.recordDate)) { <span class="future-badge">proyección</span> }
                          </td>
                          <td class="mono">{{ r.currentMileage | number:'1.0-0' }}</td>
                          <td>
                            @if (deltaKm(r) > 0) {
                              <span class="delta-km">+{{ deltaKm(r) | number:'1.1-1' }} km</span>
                            } @else {
                              <span class="delta-km--zero">—</span>
                            }
                          </td>
                          <td><span class="badge-validado">VALIDADO</span></td>
                          <td class="td-actions" (click)="$event.stopPropagation()">
                            @if (confirmDeleteId() === r.id) {
                              <span class="confirm-del">
                                <button class="btn-icon btn-confirm-del" (click)="deleteRecord(r)"><mat-icon>check</mat-icon></button>
                                <button class="btn-icon btn-cancel-edit" (click)="confirmDeleteId.set(null)"><mat-icon>close</mat-icon></button>
                              </span>
                            } @else {
                              <button class="btn-icon btn-more" (click)="startEdit(r)"><mat-icon>more_vert</mat-icon></button>
                              <button class="btn-icon btn-del" (click)="confirmDeleteId.set(r.id)"><mat-icon>delete</mat-icon></button>
                            }
                          </td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
              </div>
              @if (detail()!.records.length > 3) {
                <div class="table-footer">
                  <span class="ver-todos">Ver todos los registros</span>
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page { max-width: 1100px; margin: 0 auto; }
    .loading-center { display: flex; justify-content: center; padding: 80px; }

    /* Hero */
    .hero-row { display: grid; grid-template-columns: 1fr 300px; gap: 20px; margin-bottom: 20px; }
    @media (max-width: 860px) { .hero-row { grid-template-columns: 1fr; } }

    .hero-card {
      position: relative; border-radius: 16px; overflow: hidden; min-height: 240px;
      background: linear-gradient(145deg, #1a1040 0%, #0d1b30 40%, #0a2535 100%);
      border: 1px solid var(--border-color);
      display: flex; flex-direction: column; justify-content: flex-end;
    }
    .hero-photo {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block;
    }
    .hero-overlay {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      background: radial-gradient(ellipse at 60% 50%, rgba(34,211,238,0.08) 0%, transparent 70%);
    }
    .hero-car-icon { color: rgba(34,211,238,0.25); }
    .hero-car-icon mat-icon { font-size: 120px; width: 120px; height: 120px; }
    .hero-info {
      position: relative; padding: 20px 24px;
      background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
    }
    .hero-name { font-family: 'Montserrat', sans-serif; font-size: 26px; font-weight: 700; color: #fff; }
    .hero-location {
      display: flex; align-items: center; gap: 4px;
      font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 4px;
    }
    .hero-location mat-icon { font-size: 15px; width: 15px; height: 15px; }

    /* Form card */
    .form-card {
      background: var(--card-bg); border: 1px solid var(--border-color);
      border-radius: 16px; padding: 22px;
      display: flex; flex-direction: column; gap: 0;
    }
    .form-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 18px; font-weight: 700; margin: 0 0 18px; color: var(--text-primary);
    }
    .record-form { display: flex; flex-direction: column; gap: 14px; }
    .field-group  { display: flex; flex-direction: column; gap: 5px; }
    .field-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: var(--text-muted); }
    .opt { font-size: 10px; font-weight: 400; }

    .field-input {
      height: 42px; padding: 0 12px;
      border: 1px solid var(--border-color); border-radius: 8px;
      font-size: 14px; color: var(--text-primary); background: var(--hover-bg);
      outline: none; width: 100%; box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s; font-family: var(--font-sans);
    }
    .field-input::placeholder { color: var(--input-placeholder); }
    .field-input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.12); }
    .field-input.err { border-color: #f87171; }
    .field-textarea { height: auto; padding: 8px 12px; resize: vertical; }
    .field-error { font-size: 11px; color: #f87171; }

    .input-suffix-wrap { position: relative; display: flex; align-items: center; }
    .field-input.has-suffix { padding-right: 44px; }
    .input-suffix { position: absolute; right: 12px; font-size: 12px; font-weight: 700; color: var(--text-muted); pointer-events: none; }

    .btn-save {
      height: 46px; width: 100%; margin-top: 4px;
      border: none; border-radius: 10px;
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 0.06em;
      cursor: pointer; font-family: 'Montserrat', sans-serif;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      transition: opacity 0.2s, transform 0.2s;
    }
    .btn-save:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

    /* KPI row */
    .kpi-row {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 14px; margin-bottom: 20px;
    }
    @media (max-width: 860px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }

    .kpi-card {
      background: var(--card-bg); border: 1px solid var(--border-color);
      border-radius: 12px; padding: 16px 18px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .kpi-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.07em; color: var(--text-muted); }
    .kpi-val { font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
    .kpi-unit { font-size: 13px; font-weight: 500; color: var(--text-muted); }
    .kpi-trend { font-size: 12px; color: #22d3ee; }
    .kpi-trend--muted { color: var(--text-muted); }
    .kpi-trend--warn  { color: #f59e0b; }
    .kpi-bar { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; }
    .kpi-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #8b5cf6, #22d3ee); }

    /* Record hint */
    .record-hint {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: var(--text-muted);
      background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.15);
      border-radius: 10px; padding: 8px 14px; margin-bottom: 16px;
    }
    .record-hint mat-icon { font-size: 16px; width: 16px; height: 16px; color: #8b5cf6; }
    .hint-clear { background: none; border: none; cursor: pointer; color: #8b5cf6; font-weight: 600; font-size: 13px; padding: 0; text-decoration: underline; }

    /* Chart */
    .chart-card {
      background: var(--card-bg); border: 1px solid var(--border-color);
      border-radius: 16px; padding: 22px 22px 8px; margin-bottom: 20px;
    }
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .chart-header h3 { font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; margin: 0; color: var(--text-primary); }
    .chart-empty { text-align: center; padding: 48px; color: var(--text-muted); font-size: 14px; }

    /* Records */
    .records-card {
      background: var(--card-bg); border: 1px solid var(--border-color);
      border-radius: 16px; overflow: hidden; margin-bottom: 20px;
    }
    .records-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 18px 22px 14px; border-bottom: 1px solid var(--border-color);
    }
    .records-header h3 { font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; margin: 0; color: var(--text-primary); }
    .records-count { font-size: 12px; color: var(--text-muted); }
    .table-empty { text-align: center; padding: 32px; color: var(--text-muted); font-size: 14px; }
    .records-table-wrap { overflow-x: auto; }

    .records-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .records-table th {
      text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.07em; color: var(--text-muted);
      padding: 10px 20px; border-bottom: 1px solid var(--border-color);
    }
    .records-table tbody tr { cursor: pointer; transition: background 0.12s; }
    .records-table tbody tr:hover td { background: var(--hover-bg); }
    .records-table tbody tr.selected td { background: rgba(139,92,246,0.08); }
    .records-table tbody tr.edit-row td { background: rgba(139,92,246,0.04); }
    .records-table td { padding: 14px 20px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); }
    .records-table tr:last-child td { border-bottom: none; }
    .th-actions { width: 80px; }
    .td-actions { text-align: right; white-space: nowrap; }

    .mono { font-weight: 600; font-size: 14px; }
    .delta-km { color: #22d3ee; font-weight: 600; }
    .delta-km--zero { color: var(--text-muted); }

    .badge-validado {
      display: inline-block; padding: 3px 10px; border-radius: 6px;
      font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
      background: rgba(34,211,238,0.1); color: #22d3ee;
    }

    .future-date { color: #f59e0b !important; }
    .future-badge {
      display: inline-block; margin-left: 6px;
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      background: rgba(245,158,11,0.12); color: #f59e0b;
      border-radius: 4px; padding: 1px 5px;
    }

    .btn-icon {
      background: none; border: none; cursor: pointer;
      width: 28px; height: 28px; border-radius: 6px;
      display: inline-flex; align-items: center; justify-content: center;
      transition: background 0.12s, color 0.12s;
    }
    .btn-icon mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .btn-more  { color: var(--text-muted); } .btn-more:hover  { background: var(--hover-bg); color: var(--text-primary); }
    .btn-del   { color: var(--text-muted); } .btn-del:hover   { background: rgba(248,113,113,0.1); color: #f87171; }
    .btn-save-edit   { color: #22d3ee; } .btn-save-edit:hover   { background: rgba(34,211,238,0.1); }
    .btn-cancel-edit { color: var(--text-muted); } .btn-cancel-edit:hover { background: var(--hover-bg); }
    .btn-confirm-del { color: #f87171; } .btn-confirm-del:hover { background: rgba(248,113,113,0.1); }
    .confirm-del { display: inline-flex; align-items: center; gap: 2px; }

    .edit-input {
      width: 100%; height: 32px; padding: 0 8px;
      border: 1px solid #8b5cf6; border-radius: 6px;
      font-size: 13px; color: var(--text-primary);
      background: var(--hover-bg); outline: none; box-sizing: border-box;
    }
    .edit-km-wrap { position: relative; display: flex; align-items: center; }
    .edit-km-wrap .edit-input { padding-right: 30px; }
    .edit-km-suffix { position: absolute; right: 8px; font-size: 11px; color: var(--text-muted); pointer-events: none; }

    .table-footer {
      padding: 12px 20px; border-top: 1px solid var(--border-color);
      display: flex; justify-content: center;
    }
    .ver-todos { font-size: 13px; color: #8b5cf6; font-weight: 600; cursor: pointer; }
    .ver-todos:hover { text-decoration: underline; }

    .animate-fade-up { animation: fadeUp 0.4s ease-out both; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  `]
})
export class VehicleDetailComponent implements OnInit {
  private readonly route    = inject(ActivatedRoute);
  private readonly svc      = inject(VehicleService);
  private readonly notify   = inject(NotificationService);
  private readonly fb       = inject(FormBuilder);
  private readonly titleSvc = inject(TitleService);

  readonly Math = Math;

  readonly loading     = signal(true);
  readonly detail      = signal<VehicleDetail | null>(null);
  readonly recordSaving   = signal(false);
  readonly selectedRecord   = signal<MileageRecord | null>(null);
  readonly editingRecord    = signal<MileageRecord | null>(null);
  readonly confirmDeleteId  = signal<string | null>(null);
  readonly recordUpdating   = signal(false);
  editDate    = '';
  editMileage = 0;
  editObs     = '';

  readonly displayedStats = computed(() => {
    const d   = this.detail();
    const sel = this.selectedRecord();
    if (!d) return null;
    if (!sel) return d.statistics;
    const start = new Date(d.startCountDate).getTime();
    const rec   = new Date(sel.recordDate).getTime();
    const daysElapsed = Math.max(0, Math.floor((rec - start) / 86400000));
    const kmTraveled  = sel.currentMileage - d.baseMileage;
    const dailyAverage    = daysElapsed > 0 ? kmTraveled / daysElapsed : 0;
    const annualProjection = dailyAverage * 365;
    return { vehicleId: d.id, daysElapsed, kmTraveled, dailyAverage, annualProjection, currentMileage: sel.currentMileage };
  });

  readonly chartSeries = signal<ApexAxisChartSeries>([]);

  readonly sortedRecords = computed(() => {
    const d = this.detail();
    if (!d) return [];
    return [...d.records].sort((a, b) => b.recordDate.localeCompare(a.recordDate));
  });

  deltaKm(r: MileageRecord): number {
    const d = this.detail();
    if (!d) return 0;
    const sorted = [...d.records].sort((a, b) => a.recordDate.localeCompare(b.recordDate));
    const idx = sorted.findIndex(x => x.id === r.id);
    if (idx <= 0) return 0;
    return Math.max(0, r.currentMileage - sorted[idx - 1].currentMileage);
  }

  readonly chartOptions = {
    chart:   { type: 'area' as const, height: 300, toolbar: { show: false }, background: 'transparent' },
    colors:  ['#22d3ee'],
    stroke:  { curve: 'smooth' as const, width: 3 },
    fill:    { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, colorStops: [{ offset: 0, color: '#22d3ee', opacity: 0.3 }, { offset: 100, color: '#22d3ee', opacity: 0 }] } },
    xaxis:   { type: 'category' as const, labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    yaxis:   { labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    grid:    { borderColor: 'rgba(255,255,255,0.04)' },
    tooltip: { theme: 'dark' }
  };

  readonly recordForm = this.fb.group({
    recordDate:     [new Date().toISOString().split('T')[0], Validators.required],
    currentMileage: [null as number | null, [Validators.required, Validators.min(0)]],
    observations:   ['']
  });

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(p => this.svc.getVehicle(p['id']))
    ).subscribe({
      next: (d) => {
        this.detail.set(d);
        this.loading.set(false);
        this.buildChart(d);
        this.titleSvc.set(d.name, d.licensePlate ?? `${d.brand} ${d.model}`);
      },
      error: () => this.loading.set(false)
    });
  }

  selectRecord(r: MileageRecord): void {
    if (this.editingRecord()?.id === r.id) return;
    this.selectedRecord.update(cur => cur?.id === r.id ? null : r);
  }

  isFuture(dateStr: string): boolean {
    return new Date(dateStr) > new Date();
  }

  startEdit(r: MileageRecord): void {
    this.editingRecord.set(r);
    this.editDate    = r.recordDate;
    this.editMileage = r.currentMileage;
    this.editObs     = r.observations ?? '';
  }

  saveEdit(r: MileageRecord): void {
    this.recordUpdating.set(true);
    const payload: UpdateMileageRecord = {
      recordDate:     this.editDate,
      currentMileage: this.editMileage,
      observations:   this.editObs || undefined
    };
    this.svc.updateMileageRecord(this.detail()!.id, r.id, payload).subscribe({
      next: () => {
        this.recordUpdating.set(false);
        this.editingRecord.set(null);
        this.notify.success('Registro actualizado.');
        this.svc.getVehicle(this.detail()!.id).subscribe(d => { this.detail.set(d); this.buildChart(d); });
      },
      error: (e: { error?: { title?: string; errors?: { message: string }[] } }) => {
        this.recordUpdating.set(false);
        this.notify.error(e?.error?.errors?.[0]?.message || e?.error?.title || 'No se pudo actualizar.');
      }
    });
  }

  deleteRecord(r: MileageRecord): void {
    this.confirmDeleteId.set(null);
    this.svc.deleteMileageRecord(this.detail()!.id, r.id).subscribe({
      next: () => {
        this.notify.success('Registro eliminado.');
        this.svc.getVehicle(this.detail()!.id).subscribe(d => { this.detail.set(d); this.buildChart(d); });
      },
      error: () => this.notify.error('No se pudo eliminar el registro.')
    });
  }

  addRecord(): void {
    if (this.recordForm.invalid) return;
    const v = this.recordForm.value;
    this.recordSaving.set(true);

    this.svc.addMileageRecord(this.detail()!.id, {
      recordDate:     v.recordDate!,
      currentMileage: Number(v.currentMileage),
      observations:   v.observations || undefined
    }).subscribe({
      next: () => {
        this.recordSaving.set(false);
        this.notify.success('Registro agregado correctamente.');
        this.svc.getVehicle(this.detail()!.id).subscribe(d => { this.detail.set(d); this.buildChart(d); });
        this.recordForm.reset({ recordDate: new Date().toISOString().split('T')[0] });
      },
      error: (e: { error?: { title?: string; errors?: { field: string; message: string }[] } }) => {
        this.recordSaving.set(false);
        const firstMsg = e?.error?.errors?.[0]?.message;
        this.notify.error(firstMsg || e?.error?.title || 'No se pudo agregar el registro.');
      }
    });
  }

  private buildChart(d: VehicleDetail): void {
    const sorted = [...d.records].sort((a, b) => a.recordDate.localeCompare(b.recordDate));
    this.chartSeries.set([{
      name: 'Mileage',
      data: sorted.map(r => ({ x: r.recordDate, y: r.currentMileage }))
    }]);
  }
}
