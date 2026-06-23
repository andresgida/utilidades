import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeviceService } from '../../../application/services/device.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TitleService } from '../../../shared/services/title.service';
import { DeviceCatalog } from '../../../domain/models/device.model';
import { CatalogFormDialogComponent } from './catalog-form-dialog.component';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
            MatDialogModule, MatTooltipModule],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="page-header">
        <div class="page-title-group">
          <div class="page-icon"><mat-icon>inventory_2</mat-icon></div>
          <div>
            <h1 class="page-title">Catálogo de Modelos</h1>
            <p class="page-sub">Gestiona los modelos de iPhone disponibles en el sistema</p>
          </div>
        </div>
        <button class="add-btn" (click)="openForm()">
          <mat-icon>add</mat-icon>
          <span>Agregar modelo</span>
        </button>
      </div>

      <!-- Stats strip -->
      <div class="stats-strip">
        <div class="stat-item">
          <span class="stat-val">{{ svc.catalog().length }}</span>
          <span class="stat-lbl">Modelos totales</span>
        </div>
        <div class="stat-sep"></div>
        <div class="stat-item">
          <span class="stat-val">{{ brands() }}</span>
          <span class="stat-lbl">Marcas</span>
        </div>
        <div class="stat-sep"></div>
        <div class="stat-item">
          <span class="stat-val">{{ latestYear() }}</span>
          <span class="stat-lbl">Modelo más reciente</span>
        </div>
        <div class="stat-sep"></div>
        <div class="stat-item">
          <span class="stat-val">{{ avgMaxCycles() | number:'1.0-0' }}</span>
          <span class="stat-lbl">Ciclos máx. promedio</span>
        </div>
      </div>

      @if (svc.loading()) {
        <div class="loading-row">
          <div class="loading-spinner"></div>
          <span>Cargando catálogo...</span>
        </div>
      } @else {
        <div class="table-card">

          <!-- Table toolbar -->
          <div class="table-toolbar">
            <span class="toolbar-title">
              <mat-icon>list</mat-icon>
              Modelos registrados
            </span>
            <span class="toolbar-count">{{ svc.catalog().length }}</span>
          </div>

          <div class="table-wrap">
            <table class="cat-table">
              <thead>
                <tr>
                  <th class="col-num">#</th>
                  <th class="col-model">MODELO</th>
                  <th>MARCA</th>
                  <th>AÑO</th>
                  <th>MÁX. CICLOS</th>
                  <th>ORDEN</th>
                  <th class="col-actions">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                @for (item of svc.catalog(); track item.id; let i = $index) {
                  <tr [class.row-deleting]="confirmDeleteId() === item.id">
                    <td class="td-num">{{ i + 1 }}</td>
                    <td class="td-name">
                      <div class="model-cell">
                        <div class="model-logo">
                          <mat-icon>phone_iphone</mat-icon>
                        </div>
                        <span>{{ item.name }}</span>
                      </div>
                    </td>
                    <td class="td-brand">{{ item.brand }}</td>
                    <td class="td-year">{{ item.releaseYear }}</td>
                    <td>
                      <div class="cycles-bar-wrap">
                        <span class="cycles-val">{{ item.maxCycles }}</span>
                        <div class="cycles-bar">
                          <div class="cycles-fill" [style.width.%]="cyclesBarPct(item.maxCycles)"></div>
                        </div>
                      </div>
                    </td>
                    <td class="td-sort">{{ item.sortOrder }}</td>
                    <td class="td-actions">
                      @if (confirmDeleteId() === item.id) {
                        <div class="confirm-inline">
                          <mat-icon class="confirm-warn">error_outline</mat-icon>
                          <span class="confirm-text">¿Eliminar <strong>{{ item.name }}</strong>?</span>
                          <button class="act-btn act-confirm" (click)="deleteItem(item)" matTooltip="Confirmar eliminación">
                            <mat-icon>check</mat-icon>
                          </button>
                          <button class="act-btn act-cancel" (click)="confirmDeleteId.set(null)" matTooltip="Cancelar">
                            <mat-icon>close</mat-icon>
                          </button>
                        </div>
                      } @else {
                        <div class="actions-wrap">
                          <button class="act-btn act-edit" (click)="openForm(item)" matTooltip="Editar modelo">
                            <mat-icon>edit</mat-icon>
                          </button>
                          <button class="act-btn act-del" (click)="confirmDeleteId.set(item.id)" matTooltip="Eliminar modelo">
                            <mat-icon>delete_outline</mat-icon>
                          </button>
                        </div>
                      }
                    </td>
                  </tr>
                }

                @if (svc.catalog().length === 0) {
                  <tr>
                    <td colspan="7" class="empty-row">
                      <mat-icon>inventory_2</mat-icon>
                      <p class="empty-title">Sin modelos registrados</p>
                      <p class="empty-sub">Agrega el primer modelo al catálogo</p>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; }

    /* ── Header ─────────────────────────────── */
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px; flex-wrap: wrap; gap: 14px;
    }
    .page-title-group { display: flex; align-items: center; gap: 14px; }
    .page-icon {
      width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
      background: linear-gradient(135deg,rgba(139,92,246,.18),rgba(99,102,241,.1));
      border: 1px solid rgba(139,92,246,.25);
      display: flex; align-items: center; justify-content: center;
    }
    .page-icon mat-icon { color: #8b5cf6; font-size: 24px; width: 24px; height: 24px; }
    .page-title { font-size: 24px; font-weight: 700; margin: 0 0 3px; color: var(--text-primary); }
    .page-sub   { font-size: 12px; color: var(--text-muted); margin: 0; }

    .add-btn {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 0 18px; height: 40px; border-radius: 10px; border: none; cursor: pointer;
      background: linear-gradient(135deg,#8b5cf6,#6366f1); color: #fff;
      font-size: 13px; font-weight: 600; font-family: inherit;
      box-shadow: 0 4px 14px rgba(139,92,246,.35);
      transition: opacity .15s, transform .15s;
    }
    .add-btn:hover { opacity: .9; transform: translateY(-1px); }
    .add-btn mat-icon { font-size: 19px; width: 19px; height: 19px; }

    /* ── Stats strip ─────────────────────────── */
    .stats-strip {
      display: flex; align-items: center; gap: 0;
      background: var(--card-bg); border: 1px solid var(--border-color);
      border-radius: 14px; padding: 16px 24px;
      margin-bottom: 20px; flex-wrap: wrap;
    }
    .stat-item { display: flex; flex-direction: column; gap: 2px; padding: 0 20px 0 0; }
    .stat-item:first-child { padding-left: 0; }
    .stat-val { font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 700; color: var(--text-primary); }
    .stat-lbl { font-size: 11px; color: var(--text-muted); }
    .stat-sep { width: 1px; height: 36px; background: var(--border-color); margin: 0 20px 0 0; flex-shrink: 0; }

    /* ── Loading ─────────────────────────────── */
    .loading-row {
      display: flex; align-items: center; justify-content: center; gap: 12px;
      padding: 80px; color: var(--text-muted); font-size: 13px;
    }
    .loading-spinner {
      width: 22px; height: 22px; border: 2px solid var(--border-color);
      border-top-color: #8b5cf6; border-radius: 50%; animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Table card ──────────────────────────── */
    .table-card {
      background: var(--card-bg); border: 1px solid var(--border-color);
      border-radius: 16px; overflow: hidden;
    }

    .table-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 20px; border-bottom: 1px solid var(--border-color);
    }
    .toolbar-title {
      display: flex; align-items: center; gap: 7px;
      font-size: 13px; font-weight: 600; color: var(--text-primary);
    }
    .toolbar-title mat-icon { font-size: 17px; width: 17px; height: 17px; color: #8b5cf6; }
    .toolbar-count {
      background: rgba(139,92,246,.12); color: #8b5cf6;
      font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: 20px;
    }

    .table-wrap { overflow-x: auto; }
    .cat-table { width: 100%; border-collapse: collapse; font-size: 13px; }

    .cat-table th {
      text-align: left; font-size: 10px; font-weight: 700;
      letter-spacing: .08em; color: var(--text-muted);
      padding: 11px 18px; background: rgba(0,0,0,.02);
      border-bottom: 1px solid var(--border-color); white-space: nowrap;
    }
    .cat-table td {
      padding: 14px 18px; border-bottom: 1px solid var(--border-color);
      color: var(--text-primary); vertical-align: middle;
    }
    .cat-table tbody tr:last-child td { border-bottom: none; }
    .cat-table tbody tr { transition: background .12s; }
    .cat-table tbody tr:not(.row-deleting):hover td { background: var(--hover-bg); }
    .row-deleting td { background: rgba(248,113,113,.05) !important; }

    /* columns */
    .col-num     { width: 44px; }
    .col-model   { min-width: 200px; }
    .col-actions { width: 220px; }

    .td-num  { color: var(--text-muted); font-size: 12px; }
    .td-brand { color: var(--text-muted); }
    .td-year  { color: var(--text-muted); }
    .td-sort  { color: var(--text-muted); font-size: 12px; }

    /* Model cell */
    .model-cell { display: flex; align-items: center; gap: 10px; }
    .model-logo {
      width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
      background: rgba(139,92,246,.1); border: 1px solid rgba(139,92,246,.15);
      display: flex; align-items: center; justify-content: center;
    }
    .model-logo mat-icon { font-size: 17px; width: 17px; height: 17px; color: #8b5cf6; }
    .td-name .model-cell { font-weight: 600; font-size: 13px; }

    /* Cycles bar */
    .cycles-bar-wrap { display: flex; align-items: center; gap: 10px; }
    .cycles-val { font-weight: 700; font-size: 13px; color: #8b5cf6; min-width: 36px; }
    .cycles-bar {
      flex: 1; height: 5px; background: rgba(139,92,246,.12); border-radius: 99px;
      overflow: hidden; min-width: 60px; max-width: 100px;
    }
    .cycles-fill {
      height: 100%; background: linear-gradient(90deg,#8b5cf6,#6366f1); border-radius: 99px;
      transition: width .3s;
    }

    /* Action buttons */
    .actions-wrap { display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
    .act-btn {
      height: 32px; padding: 0 10px; border: none; border-radius: 8px; cursor: pointer;
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 12px; font-weight: 600; font-family: inherit;
      transition: background .15s, transform .1s;
    }
    .act-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .act-btn:hover { transform: translateY(-1px); }

    .act-edit    { background: rgba(139,92,246,.1);  color: #8b5cf6; }
    .act-edit:hover { background: rgba(139,92,246,.18); }
    .act-del     { background: rgba(248,113,113,.08); color: #f87171; }
    .act-del:hover { background: rgba(248,113,113,.16); }

    /* Inline confirm */
    .confirm-inline {
      display: flex; align-items: center; gap: 8px;
      justify-content: flex-end; flex-wrap: nowrap;
    }
    .confirm-warn { font-size: 17px; width: 17px; height: 17px; color: #fb923c; flex-shrink: 0; }
    .confirm-text { font-size: 12px; color: var(--text-primary); white-space: nowrap; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    .confirm-text strong { color: #fb923c; }

    .act-confirm { background: rgba(74,222,128,.1); color: #4ade80; }
    .act-confirm:hover { background: rgba(74,222,128,.18); }
    .act-cancel  { background: var(--hover-bg); color: var(--text-muted); }
    .act-cancel:hover { background: var(--border-color); }

    /* Empty state */
    .empty-row {
      text-align: center; padding: 70px 20px !important;
      color: var(--text-muted);
    }
    .empty-row mat-icon { font-size: 42px; width: 42px; height: 42px; opacity: .25; display: block; margin: 0 auto 12px; }
    .empty-title { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 4px; }
    .empty-sub   { font-size: 12px; color: var(--text-muted); margin: 0; }
  `]
})
export class CatalogListComponent implements OnInit {
  readonly svc    = inject(DeviceService);
  private readonly notify = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly titleSvc = inject(TitleService);

  readonly confirmDeleteId = signal<string | null>(null);

  readonly brands = computed(() =>
    new Set(this.svc.catalog().map(c => c.brand)).size
  );

  readonly latestYear = computed(() => {
    const cat = this.svc.catalog();
    return cat.length ? Math.max(...cat.map(c => c.releaseYear)) : '—';
  });

  readonly avgMaxCycles = computed(() => {
    const cat = this.svc.catalog();
    return cat.length ? cat.reduce((s, c) => s + c.maxCycles, 0) / cat.length : 0;
  });

  private readonly maxCyclesInCatalog = computed(() =>
    Math.max(...this.svc.catalog().map(c => c.maxCycles), 1)
  );

  cyclesBarPct(maxCycles: number): number {
    return Math.round((maxCycles / this.maxCyclesInCatalog()) * 100);
  }

  ngOnInit(): void {
    this.titleSvc.set('Catálogo de Modelos', 'Gestión');
    this.svc.loadCatalog().subscribe();
  }

  openForm(item?: DeviceCatalog): void {
    const ref = this.dialog.open(CatalogFormDialogComponent, {
      width: '480px',
      panelClass: 'premium-dialog',
      data: item ?? null
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (ok) this.svc.loadCatalog().subscribe();
    });
  }

  deleteItem(item: DeviceCatalog): void {
    this.svc.deleteCatalogDevice(item.id).subscribe({
      next: () => {
        this.confirmDeleteId.set(null);
        this.notify.success(`"${item.name}" eliminado del catálogo.`);
      },
      error: () => this.notify.error('No se pudo eliminar el modelo.')
    });
  }
}
