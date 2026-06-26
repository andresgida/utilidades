import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DeviceService } from '../../../application/services/device.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TitleService } from '../../../shared/services/title.service';
import { AppleDeviceDetail, BatteryCycleRecord, UpdateBatteryCycleRecord, HealthStatus } from '../../../domain/models/device.model';

@Component({
  selector: 'app-device-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, DatePipe,
    MatButtonModule, MatIconModule, MatInputModule, MatProgressSpinnerModule,
    NgApexchartsModule
  ],
  template: `
    <div class="detail-page">

      @if (loading()) {
        <div class="loading-center"><mat-progress-spinner mode="indeterminate" diameter="48" /></div>
      }

      @if (errorMsg()) {
        <div class="error-state">
          <mat-icon>error_outline</mat-icon>
          <p>{{ errorMsg() }}</p>
          <a routerLink="/devices" mat-stroked-button>← Volver</a>
        </div>
      }

      @if (!loading() && detail()) {
        <div class="animate-fade-up">

          <!-- Top row: Battery ring + Quick Register -->
          <div class="top-row">

            <!-- Battery card -->
            <div class="battery-card">
              <div class="battery-ring-wrap">
                <svg width="220" height="220" viewBox="0 0 220 220">
                  <circle cx="110" cy="110" r="90" fill="none"
                    stroke="rgba(255,255,255,0.06)" stroke-width="16"/>
                  <circle cx="110" cy="110" r="90" fill="none"
                    stroke="#22d3ee" stroke-width="16"
                    stroke-linecap="round"
                    [attr.stroke-dasharray]="565.5"
                    [attr.stroke-dashoffset]="565.5 - (565.5 * displayedStats()!.healthPercentage / 100)"
                    transform="rotate(-90 110 110)"
                    style="transition:stroke-dashoffset 1.2s ease"/>
                </svg>
                <div class="ring-inner">
                  <span class="ring-pct">{{ displayedStats()!.healthPercentage | number:'1.0-0' }}%</span>
                  <span class="ring-cap">CAPACIDAD MÁXIMA</span>
                </div>
              </div>

              <div class="battery-info">
                <h3 class="battery-title">Estado de la Batería</h3>
                <p class="battery-desc">Tu {{ detail()!.deviceName }} mantiene un rendimiento
                  {{ healthLabel(displayedStats()!.healthStatus).toLowerCase() }}.
                  Se recomienda mantener la carga entre 20% y 80% para prolongar la vida útil química.</p>
                <div class="battery-chips">
                  <div class="chip">
                    <mat-icon>verified</mat-icon>
                    <div><span class="chip-lbl">GARANTÍA</span><span class="chip-val">Activa</span></div>
                  </div>
                  <div class="chip">
                    <mat-icon>calendar_today</mat-icon>
                    <div>
                      <span class="chip-lbl">FABRICADO</span>
                      <span class="chip-val">{{ detail()!.purchaseDate | date:'MMM yyyy' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              @if (detail()!.catalogImageUrl) {
                <div class="device-img-wrap">
                  <img [src]="detail()!.catalogImageUrl" [alt]="detail()!.deviceName"
                       class="device-img" (error)="onImgError($event)">
                  <div class="device-img-glow"></div>
                </div>
              } @else if (!detail()!.isCustomDevice) {
                <div class="device-img-wrap device-img-placeholder">
                  <mat-icon class="placeholder-icon">phone_iphone</mat-icon>
                </div>
              }

            </div>

            <!-- Quick Register card -->
            <div class="quick-card">
              <div class="quick-icon-wrap">
                <mat-icon>add_circle_outline</mat-icon>
              </div>
              <h3 class="quick-title">Registro Rápido</h3>
              <p class="quick-desc">Añade manualmente un ciclo de carga si no se sincronizó automáticamente.</p>
              <form [formGroup]="recordForm" (ngSubmit)="addRecord()" class="quick-form">
                <div class="field-group">
                  <label class="field-lbl">CICLOS ACTUALES</label>
                  <div class="input-suffix-wrap">
                    <input formControlName="currentCycles" type="number" class="field-input has-suffix"
                           [class.err]="recordForm.get('currentCycles')?.invalid && recordForm.get('currentCycles')?.touched"
                           placeholder="0">
                    <span class="input-suffix">ciclos</span>
                  </div>
                  @if (recordForm.get('currentCycles')?.invalid && recordForm.get('currentCycles')?.touched) {
                    <span class="field-error">Valor inválido (0–9999)</span>
                  }
                </div>
                <div class="field-group">
                  <label class="field-lbl">FECHA</label>
                  <input formControlName="recordDate" type="date" class="field-input"
                         [class.err]="recordForm.get('recordDate')?.invalid && recordForm.get('recordDate')?.touched">
                </div>
                <div class="field-group">
                  <label class="field-lbl">NOTAS <span class="opt">(opcional)</span></label>
                  <textarea formControlName="notes" class="field-input field-textarea"
                            placeholder="Ej. Actualización..." rows="2"></textarea>
                </div>
                <button type="submit" class="btn-register" [disabled]="recordForm.invalid || saving()">
                  @if (saving()) {
                    <mat-progress-spinner diameter="16" mode="indeterminate" />
                  } @else {
                    <mat-icon>bolt</mat-icon> Registrar Ciclo
                  }
                </button>
              </form>
            </div>

          </div>

          <!-- KPI row -->
          <div class="kpi-row">
            <div class="kpi-card">
              <div class="kpi-lbl">CICLOS TOTALES</div>
              <div class="kpi-val">{{ displayedStats()!.currentCycles }}</div>
              <div class="kpi-trend">+{{ detail()!.records.length }} registros</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-lbl">DÍAS DE USO</div>
              <div class="kpi-val">{{ displayedStats()!.daysElapsed }}</div>
              <div class="kpi-sub">Desde activación</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-lbl">PROMEDIO DE CARGA DIARIO</div>
              <div class="kpi-val">{{ displayedStats()!.dailyAverage * 100 | number:'1.2-2' }}<span class="kpi-unit">%</span></div>
              <div class="kpi-sub">Carga saludable</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-lbl">PROYECCIÓN ANUAL</div>
              <div class="kpi-val" [class]="annualClass(displayedStats()!.annualProjection)">{{ displayedStats()!.annualProjection | number:'1.0-0' }}<span class="kpi-unit"> ciclos</span></div>
              <div class="kpi-sub" [class]="annualSubClass(displayedStats()!.annualProjection)">{{ annualLabel(displayedStats()!.annualProjection) }}</div>
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
            <div class="chart-hdr">
              <div>
                <h3>Historial de Carga</h3>
                <p class="chart-sub">Ciclos completados en los últimos 7 días</p>
              </div>
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
            <div class="records-hdr">
              <h3>Registros Recientes</h3>
              <a routerLink="/devices" class="ver-todo">Ver todo el historial</a>
            </div>
            <div class="records-table-wrap">
              <table class="records-table">
                <thead><tr>
                  <th>FECHA</th><th>CICLOS</th><th>CICLO COMP.</th><th>SALUD</th><th class="th-actions">DETALLES</th>
                </tr></thead>
                <tbody>
                  @for (r of sortedRecords(); track r.id; let i = $index) {
                    @if (editingRecord()?.id === r.id) {
                      <tr class="edit-row">
                        <td><input type="date" class="edit-input" [value]="editDate" (input)="editDate = $any($event.target).value"></td>
                        <td><input type="number" class="edit-input" [value]="editCycles" (input)="editCycles = +$any($event.target).value"></td>
                        <td></td><td></td>
                        <td class="td-actions">
                          <button class="btn-icon btn-save-edit" (click)="saveEdit(r)"><mat-icon>check</mat-icon></button>
                          <button class="btn-icon btn-cancel-edit" (click)="editingRecord.set(null)"><mat-icon>close</mat-icon></button>
                        </td>
                      </tr>
                    } @else {
                      <tr (click)="selectRecord(r)" [class.selected]="selectedRecord()?.id === r.id">
                        <td [class.future-date]="isFuture(r.recordDate)">
                          <div class="date-main">
                            {{ r.recordDate | date:'dd MMM yyyy' }}
                            @if (isFuture(r.recordDate)) { <span class="future-badge">proyección</span> }
                          </div>
                          <div class="date-sub">{{ r.notes || 'USB-C' }}</div>
                        </td>
                        <td>
                          <div class="cycles-bar-wrap">
                            <div class="cycles-bar" [style.width.%]="Math.min(100, r.currentCycles / 10)" [style.background]="cycleBarColor(r.currentCycles)"></div>
                            <span class="cycles-val">{{ r.currentCycles }}</span>
                          </div>
                        </td>
                        <td class="cycle-num">#{{ r.currentCycles }}</td>
                        <td>
                          <span class="health-badge" [class]="'health-' + cycleHealthClass(r.currentCycles)">
                            {{ cycleHealthText(r.currentCycles) }}
                          </span>
                        </td>
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
          </div>

        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page { max-width: 1100px; margin: 0 auto; }
    .loading-center { display: flex; justify-content: center; padding: 80px; }
    .error-state {
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      padding: 80px 24px; color: var(--text-muted);
    }
    .error-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #f87171; }
    .error-state p { font-size: 15px; margin: 0; }

    /* Top row */
    .top-row { display: grid; grid-template-columns: 1fr 280px; gap: 20px; margin-bottom: 20px; }
    @media (max-width: 860px) { .top-row { grid-template-columns: 1fr; } }

    /* Battery card */
    .battery-card {
      background: var(--card-bg); border: 1px solid var(--border-color);
      border-radius: 16px; padding: 28px;
      display: flex; align-items: center; gap: 32px;
    }
    @media (max-width: 680px) { .battery-card { flex-direction: column; } }

    .device-img-wrap {
      margin-left: auto; flex-shrink: 0;
      position: relative; display: flex; align-items: center; justify-content: center;
      width: 130px;
    }
    .device-img {
      max-height: 200px; max-width: 120px; width: auto;
      object-fit: contain; position: relative; z-index: 1;
      filter: drop-shadow(0 8px 24px rgba(0,0,0,.5));
      transition: transform .3s;
    }
    .device-img:hover { transform: scale(1.05) translateY(-4px); }
    .device-img-glow {
      position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%);
      width: 70px; height: 18px;
      background: radial-gradient(ellipse,rgba(139,92,246,.4) 0%,transparent 70%);
      filter: blur(6px);
    }
    .device-img-placeholder {
      width: 90px; height: 150px; border-radius: 18px;
      background: rgba(139,92,246,.06); border: 1px dashed rgba(139,92,246,.2);
      display: flex; align-items: center; justify-content: center;
    }
    .placeholder-icon { font-size: 40px; width: 40px; height: 40px; color: rgba(139,92,246,.3); }
    @media (max-width: 860px) { .device-img-wrap { display: none; } }

    .battery-ring-wrap { position: relative; width: 220px; height: 220px; flex-shrink: 0; }
    .ring-inner {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
    }
    .ring-pct { font-family: 'Montserrat', sans-serif; font-size: 42px; font-weight: 800; color: var(--text-primary); }
    .ring-cap { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #22d3ee; }

    .battery-info { flex: 1; }
    .battery-title { font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 700; margin: 0 0 10px; color: var(--text-primary); }
    .battery-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 16px; }

    .battery-chips { display: flex; gap: 12px; flex-wrap: wrap; }
    .chip {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 14px; border-radius: 10px;
      background: var(--hover-bg); border: 1px solid var(--border-color);
    }
    .chip mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--text-muted); }
    .chip div { display: flex; flex-direction: column; }
    .chip-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; color: var(--text-muted); }
    .chip-val { font-size: 13px; font-weight: 600; color: var(--text-primary); }

    /* Quick card */
    .quick-card {
      background: var(--card-bg); border: 1px solid var(--border-color);
      border-radius: 16px; padding: 24px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .quick-icon-wrap {
      width: 44px; height: 44px; border-radius: 12px;
      background: rgba(139,92,246,0.12);
      display: flex; align-items: center; justify-content: center;
    }
    .quick-icon-wrap mat-icon { font-size: 24px; width: 24px; height: 24px; color: #8b5cf6; }
    .quick-title { font-family: 'Montserrat', sans-serif; font-size: 17px; font-weight: 700; margin: 0; color: var(--text-primary); }
    .quick-desc { font-size: 13px; color: var(--text-muted); margin: 0; line-height: 1.5; }

    .quick-form { display: flex; flex-direction: column; gap: 10px; }
    .field-group { display: flex; flex-direction: column; gap: 5px; }
    .field-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.07em; color: var(--text-muted); }
    .opt { font-size: 10px; font-weight: 400; }

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
    .field-textarea { height: auto; padding: 8px 12px; resize: vertical; }
    .field-error { font-size: 11px; color: #f87171; }
    .input-suffix-wrap { position: relative; display: flex; align-items: center; }
    .field-input.has-suffix { padding-right: 54px; }
    .input-suffix { position: absolute; right: 12px; font-size: 11px; font-weight: 700; color: var(--text-muted); pointer-events: none; }

    .btn-register {
      height: 44px; width: 100%;
      border: none; border-radius: 10px;
      background: linear-gradient(135deg, #8b5cf6, #22d3ee);
      color: #fff; font-size: 14px; font-weight: 700;
      cursor: pointer; font-family: 'Montserrat', sans-serif;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      transition: opacity 0.2s, transform 0.2s;
    }
    .btn-register:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-register:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-register mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* KPI row */
    .kpi-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 20px; }
    @media (max-width: 860px) { .kpi-row { grid-template-columns: repeat(2,1fr); } }
    .kpi-card {
      background: var(--card-bg); border: 1px solid var(--border-color);
      border-radius: 12px; padding: 16px 18px;
      display: flex; flex-direction: column; gap: 5px;
    }
    .kpi-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.07em; color: var(--text-muted); }
    .kpi-val { font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 700; color: var(--text-primary); }
    .kpi-val--green  { color: #4ade80; }
    .kpi-val--cyan   { color: #22d3ee; }
    .kpi-val--orange { color: #fb923c; }
    .kpi-val--red    { color: #f87171; }
    .kpi-unit { font-size: 13px; font-weight: 500; color: var(--text-muted); }
    .kpi-trend { font-size: 12px; color: #22d3ee; }
    .kpi-sub { font-size: 12px; color: var(--text-muted); }
    .kpi-sub--green  { color: #4ade80; }
    .kpi-sub--cyan   { color: #22d3ee; }
    .kpi-sub--orange { color: #fb923c; }
    .kpi-sub--red    { color: #f87171; }

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
    .chart-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
    .chart-hdr h3 { font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; margin: 0; color: var(--text-primary); }
    .chart-sub { font-size: 12px; color: var(--text-muted); margin: 4px 0 0; }
    .chart-empty { text-align: center; padding: 48px; color: var(--text-muted); font-size: 14px; }

    /* Records */
    .records-card {
      background: var(--card-bg); border: 1px solid var(--border-color);
      border-radius: 16px; overflow: hidden;
    }
    .records-hdr {
      display: flex; justify-content: space-between; align-items: center;
      padding: 18px 22px 14px; border-bottom: 1px solid var(--border-color);
    }
    .records-hdr h3 { font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; margin: 0; color: var(--text-primary); }
    .ver-todo { font-size: 13px; color: #8b5cf6; text-decoration: none; font-weight: 600; }
    .ver-todo:hover { text-decoration: underline; }

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
    .records-table td { padding: 12px 20px; border-bottom: 1px solid var(--border-color); color: var(--text-primary); }
    .records-table tr:last-child td { border-bottom: none; }
    .th-actions { width: 80px; }
    .td-actions { text-align: right; white-space: nowrap; }

    .date-main { font-size: 13px; font-weight: 500; }
    .date-sub  { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

    .cycles-bar-wrap { display: flex; align-items: center; gap: 8px; }
    .cycles-bar { height: 6px; border-radius: 3px; min-width: 20px; max-width: 80px; flex-shrink: 0; }
    .cycles-val { font-size: 13px; font-weight: 600; color: var(--text-primary); }

    .cycle-num { font-family: monospace; font-size: 13px; color: var(--text-muted); }

    .health-badge {
      display: inline-block; padding: 3px 10px; border-radius: 6px;
      font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
    }
    .health-excellent { background: rgba(74,222,128,0.12); color: #4ade80; }
    .health-good      { background: rgba(34,211,238,0.12); color: #22d3ee; }
    .health-fair      { background: rgba(251,191,36,0.12); color: #fbbf24; }
    .health-poor      { background: rgba(251,146,60,0.12); color: #fb923c; }
    .health-critical  { background: rgba(248,113,113,0.12); color: #f87171; }

    .future-date { color: #f59e0b !important; }
    .future-badge {
      display: inline-block; margin-left: 6px; font-size: 10px; font-weight: 700;
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

    .animate-fade-up { animation: fadeUp 0.4s ease-out both; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  `]
})
export class DeviceDetailComponent implements OnInit {
  private readonly route    = inject(ActivatedRoute);
  private readonly svc      = inject(DeviceService);
  private readonly notify   = inject(NotificationService);
  private readonly fb       = inject(FormBuilder);
  private readonly titleSvc = inject(TitleService);

  readonly Math = Math;

  readonly loading          = signal(true);
  readonly detail            = signal<AppleDeviceDetail | null>(null);
  readonly errorMsg          = signal('');
  readonly saving            = signal(false);
  readonly selectedRecord    = signal<BatteryCycleRecord | null>(null);
  readonly editingRecord     = signal<BatteryCycleRecord | null>(null);
  readonly confirmDeleteId   = signal<string | null>(null);
  readonly recordUpdating    = signal(false);
  editDate   = '';
  editCycles = 0;
  editNotes  = '';

  readonly displayedStats = computed(() => {
    const d   = this.detail();
    const sel = this.selectedRecord();
    if (!d) return null;
    if (!sel) return d.statistics;
    const purchase  = new Date(d.purchaseDate).getTime();
    const recDate   = new Date(sel.recordDate).getTime();
    const daysElapsed   = Math.max(0, Math.floor((recDate - purchase) / 86400000));
    const dailyAverage  = daysElapsed > 0 ? sel.currentCycles / daysElapsed : 0;
    const annualProjection = dailyAverage * 365;
    const healthPercentage = Math.max(0, 100 - (sel.currentCycles / 1000 * 20));
    const healthStatus = healthPercentage >= 90 ? 'Excellent' as const
      : healthPercentage >= 80 ? 'Good' as const
      : healthPercentage >= 60 ? 'Fair' as const
      : healthPercentage >= 40 ? 'Poor' as const : 'Critical' as const;
    return { ...d.statistics, daysElapsed, currentCycles: sel.currentCycles, dailyAverage, annualProjection, healthPercentage, healthStatus };
  });

  readonly chartSeries = signal<ApexAxisChartSeries>([]);

  readonly sortedRecords = computed(() => {
    const d = this.detail();
    if (!d) return [];
    return [...d.records].sort((a, b) => b.recordDate.localeCompare(a.recordDate));
  });

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  annualLabel(n: number): string {
    if (n < 150) return 'Uso muy bajo';
    if (n < 300) return 'Óptimo';
    if (n < 500) return 'Uso normal';
    if (n < 700) return 'Uso alto';
    return 'Uso crítico';
  }

  annualClass(n: number): string {
    if (n < 150) return 'kpi-val kpi-val--cyan';
    if (n < 300) return 'kpi-val kpi-val--green';
    if (n < 500) return 'kpi-val kpi-val--cyan';
    if (n < 700) return 'kpi-val kpi-val--orange';
    return 'kpi-val kpi-val--red';
  }

  annualSubClass(n: number): string {
    if (n < 150) return 'kpi-sub kpi-sub--cyan';
    if (n < 300) return 'kpi-sub kpi-sub--green';
    if (n < 500) return 'kpi-sub kpi-sub--cyan';
    if (n < 700) return 'kpi-sub kpi-sub--orange';
    return 'kpi-sub kpi-sub--red';
  }

  cycleBarColor(cycles: number): string {
    if (cycles < 300) return '#4ade80';
    if (cycles < 500) return '#22d3ee';
    if (cycles < 700) return '#fbbf24';
    if (cycles < 900) return '#fb923c';
    return '#f87171';
  }

  cycleHealthClass(cycles: number): string {
    if (cycles < 300) return 'excellent';
    if (cycles < 500) return 'good';
    if (cycles < 700) return 'fair';
    if (cycles < 900) return 'poor';
    return 'critical';
  }

  cycleHealthText(cycles: number): string {
    if (cycles < 300) return 'EXCELENTE';
    if (cycles < 500) return 'NORMAL';
    if (cycles < 700) return 'REGULAR';
    if (cycles < 900) return 'DETERIORADO';
    return 'CRÍTICO';
  }

  readonly chartOptions = {
    chart:  { type: 'area' as const, height: 280, toolbar: { show: false }, background: 'transparent' },
    colors: ['#8b5cf6'],
    stroke: { curve: 'smooth' as const, width: 3 },
    fill:   { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0 } },
    xaxis:  { type: 'category' as const, labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    yaxis:  { labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    grid:   { borderColor: 'rgba(255,255,255,0.04)' },
    tooltip:{ theme: 'dark' }
  };

  readonly recordForm = this.fb.group({
    recordDate:    [new Date().toISOString().split('T')[0], Validators.required],
    currentCycles: [null as number | null, [Validators.required, Validators.min(0), Validators.max(9999)]],
    notes:         ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.params['id'];
    this.svc.getDevice(id).subscribe({
      next: (d) => {
        this.detail.set(d);
        this.loading.set(false);
        this.buildChart(d);
        this.titleSvc.set(d.deviceName, d.catalogDeviceName ?? 'iPhone');
      },
      error: (err) => {
        console.error('[DeviceDetail] Error loading device:', err);
        this.loading.set(false);
        const status = err?.status;
        this.errorMsg.set(
          status === 404 ? 'Dispositivo no encontrado.' :
          status === 401 ? 'Sin autorización. Inicia sesión nuevamente.' :
          `Error al cargar el dispositivo (${status ?? 'sin respuesta'}).`
        );
      }
    });
  }

  selectRecord(r: BatteryCycleRecord): void {
    if (this.editingRecord()?.id === r.id) return;
    this.selectedRecord.update(cur => cur?.id === r.id ? null : r);
  }

  isFuture(dateStr: string): boolean {
    return new Date(dateStr) > new Date();
  }

  startEdit(r: BatteryCycleRecord): void {
    this.editingRecord.set(r);
    this.editDate   = r.recordDate;
    this.editCycles = r.currentCycles;
    this.editNotes  = r.notes ?? '';
  }

  saveEdit(r: BatteryCycleRecord): void {
    this.recordUpdating.set(true);
    const payload: UpdateBatteryCycleRecord = {
      recordDate:    this.editDate,
      currentCycles: this.editCycles,
      notes:         this.editNotes || undefined
    };
    this.svc.updateCycleRecord(this.detail()!.id, r.id, payload).subscribe({
      next: () => {
        this.recordUpdating.set(false);
        this.editingRecord.set(null);
        this.notify.success('Registro actualizado.');
        this.svc.getDevice(this.detail()!.id).subscribe(d => { this.detail.set(d); this.buildChart(d); });
      },
      error: (e: { error?: { title?: string; errors?: { message: string }[] } }) => {
        this.recordUpdating.set(false);
        this.notify.error(e?.error?.errors?.[0]?.message || e?.error?.title || 'No se pudo actualizar.');
      }
    });
  }

  deleteRecord(r: BatteryCycleRecord): void {
    this.confirmDeleteId.set(null);
    this.svc.deleteCycleRecord(this.detail()!.id, r.id).subscribe({
      next: () => {
        this.notify.success('Registro eliminado.');
        this.svc.getDevice(this.detail()!.id).subscribe(d => { this.detail.set(d); this.buildChart(d); });
      },
      error: () => this.notify.error('No se pudo eliminar el registro.')
    });
  }

  addRecord(): void {
    if (this.recordForm.invalid) return;
    const v = this.recordForm.value;
    this.saving.set(true);

    this.svc.addCycleRecord(this.detail()!.id, {
      recordDate:    v.recordDate!,
      currentCycles: v.currentCycles!,
      notes:         v.notes || undefined
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.notify.success('Registro de ciclo agregado.');
        this.svc.getDevice(this.detail()!.id).subscribe(d => { this.detail.set(d); this.buildChart(d); });
        this.recordForm.reset({ recordDate: new Date().toISOString().split('T')[0] });
      },
      error: (e: { error?: { title?: string; errors?: { message: string }[] } }) => {
        this.saving.set(false);
        const msg = e?.error?.errors?.[0]?.message;
        this.notify.error(msg || e?.error?.title || 'No se pudo agregar el registro.');
      }
    });
  }

  healthLabel(status: HealthStatus): string {
    const map: Record<HealthStatus, string> = {
      Excellent: 'Excelente batería', Good: 'Buena batería',
      Fair: 'Batería aceptable', Poor: 'Batería deteriorada', Critical: 'Batería crítica'
    };
    return map[status] ?? status;
  }

  healthColor(status: HealthStatus): string {
    const map: Record<HealthStatus, string> = {
      Excellent: '#10b981', Good: '#3b82f6',
      Fair: '#f59e0b', Poor: '#f97316', Critical: '#ef4444'
    };
    return map[status] ?? '#888';
  }

  private buildChart(d: AppleDeviceDetail): void {
    const sorted = [...d.records].sort((a, b) => a.recordDate.localeCompare(b.recordDate));
    this.chartSeries.set([{
      name: 'Cycles',
      data: sorted.map(r => ({ x: r.recordDate, y: r.currentCycles }))
    }]);
  }
}
