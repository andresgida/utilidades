import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { TitleService } from '../../services/title.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule,
            MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="shell">
      <!-- ── Sidebar ───────────────────────────────────────────── -->
      <aside class="sidebar" [class.mobile-open]="mobileOpen()">

        <!-- Logo -->
        <div class="sb-logo">
          <span class="sb-logo-text">Utilidades</span>
        </div>

        <!-- User -->
        <div class="sb-user">
          <div class="sb-avatar">{{ initials() }}</div>
          <div class="sb-user-info">
            <span class="sb-user-name">{{ auth.currentUser()?.fullName }}</span>
            <span class="sb-user-email">{{ auth.currentUser()?.email }}</span>
          </div>
        </div>

        <!-- Nav -->
        <nav class="sb-nav">
          @for (item of navItems; track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active" class="sb-nav-item">
              <mat-icon class="sb-nav-icon">{{ item.icon }}</mat-icon>
              <span class="sb-nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <!-- Bottom -->
        <div class="sb-bottom">
          <button class="sb-logout" (click)="auth.logout()">
            <mat-icon>logout</mat-icon>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- ── Main ──────────────────────────────────────────────── -->
      <div class="shell-main">

        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left">
            <button mat-icon-button class="mobile-menu" (click)="mobileOpen.set(!mobileOpen())">
              <mat-icon>menu</mat-icon>
            </button>
            <div class="topbar-title-block">
              <div class="topbar-title-row">
                <mat-icon class="topbar-apps-icon">apps</mat-icon>
                <span class="topbar-title">{{ titleSvc.pageTitle() }}</span>
              </div>
              @if (titleSvc.pageBadge()) {
                <span class="topbar-badge" [class]="'topbar-badge--' + titleSvc.badgeVariant()">
                  @if (titleSvc.badgeVariant() === 'success') {
                    <span class="badge-dot"></span>
                  }
                  {{ titleSvc.pageBadge() }}
                </span>
              }
            </div>
          </div>
          <div class="topbar-right">
            <button mat-icon-button class="topbar-btn" (click)="theme.toggle()"
                    [matTooltip]="theme.isDark() ? 'Modo claro' : 'Modo oscuro'">
              <mat-icon>{{ theme.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>
            <button mat-icon-button class="topbar-btn">
              <mat-icon>notifications_none</mat-icon>
            </button>
            <div class="topbar-user-chip">{{ initials() }}</div>
          </div>
        </header>

        <div class="page-content">
          <router-outlet />
        </div>
      </div>

      <!-- Mobile overlay -->
      @if (mobileOpen()) {
        <div class="mobile-overlay" (click)="mobileOpen.set(false)"></div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; background: var(--bg-base); }

    .shell { display: flex; height: 100vh; overflow: hidden; }

    /* ── Sidebar ── */
    .sidebar {
      width: 220px; flex-shrink: 0;
      height: 100vh; display: flex; flex-direction: column;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--sidebar-border);
      transition: background 0.3s ease;
      z-index: 200;
    }

    .sb-logo {
      padding: 28px 24px 20px;
      border-bottom: 1px solid var(--sidebar-border);
    }
    .sb-logo-text {
      font-family: 'Montserrat', sans-serif;
      font-size: 20px; font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent; color: transparent;
    }

    .sb-user {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 16px 16px;
      border-bottom: 1px solid var(--sidebar-border);
    }
    .sb-avatar {
      width: 40px; height: 40px; min-width: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #22d3ee);
      border: 2px solid var(--user-avatar-border);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 15px;
      font-family: 'Montserrat', sans-serif;
    }
    .sb-user-info { display: flex; flex-direction: column; overflow: hidden; }
    .sb-user-name {
      font-size: 13px; font-weight: 600; color: var(--text-primary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .sb-user-email {
      font-size: 11px; color: var(--text-muted);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .sb-nav {
      flex: 1; padding: 16px 12px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .sb-nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 14px; border-radius: 10px;
      color: var(--nav-text); text-decoration: none;
      font-size: 14px; font-weight: 500;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .sb-nav-item:hover { background: var(--nav-bg-hover); color: var(--nav-text-hover); }
    .sb-nav-item.active { background: var(--nav-bg-active); color: var(--nav-text-active); }
    .sb-nav-item.active .sb-nav-icon { color: var(--nav-text-active); }
    .sb-nav-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    .sb-nav-label { white-space: nowrap; }

    .sb-bottom {
      padding: 12px 12px 24px;
      border-top: 1px solid var(--sidebar-border);
    }
    .sb-logout {
      display: flex; align-items: center; gap: 10px;
      width: 100%; padding: 11px 14px;
      background: var(--hover-bg); border: 1px solid var(--border-color);
      border-radius: 10px; cursor: pointer;
      color: var(--logout-btn-color); font-size: 14px; font-weight: 500;
      font-family: var(--font-sans);
      transition: background 0.15s ease, color 0.15s ease;
    }
    .sb-logout:hover { background: rgba(248,113,113,0.08); color: #f87171; }
    .sb-logout mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* ── Main ── */
    .shell-main {
      flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden;
      background: var(--bg-base);
      transition: background-color 0.35s ease;
    }

    .topbar {
      height: 64px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 28px;
      background: var(--topbar-bg);
      border-bottom: 1px solid var(--topbar-border);
      transition: background 0.3s ease;
    }
    .topbar-left { display: flex; align-items: center; gap: 14px; }
    .topbar-title-block { display: flex; flex-direction: column; gap: 2px; }
    .topbar-title-row { display: flex; align-items: center; gap: 8px; }
    .topbar-apps-icon { font-size: 22px; width: 22px; height: 22px; color: var(--text-muted); }
    .topbar-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 20px; font-weight: 700; color: var(--text-primary);
    }
    .topbar-badge {
      font-size: 11px; font-weight: 600;
      padding: 2px 10px; border-radius: 6px; width: fit-content;
      display: flex; align-items: center; gap: 5px;
    }
    .topbar-badge--default  { background: var(--hover-bg); color: var(--text-muted); }
    .topbar-badge--success  { background: rgba(34,197,94,0.12);   color: #4ade80; }
    .topbar-badge--warning  { background: rgba(245,158,11,0.12);  color: #fbbf24; }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; flex-shrink: 0; }

    .topbar-right { display: flex; align-items: center; gap: 4px; }
    .topbar-btn { color: var(--text-muted) !important; }
    .topbar-btn:hover { color: var(--text-primary) !important; }

    .topbar-user-chip {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #22d3ee);
      border: 1.5px solid var(--user-avatar-border);
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 13px;
      margin-left: 4px; cursor: pointer;
    }

    .mobile-menu { display: none !important; }

    .page-content {
      flex: 1; overflow-y: auto; padding: 28px;
      background: transparent;
    }

    .mobile-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 150;
      display: none;
    }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed; left: -220px; top: 0;
        transition: left 0.3s ease;
      }
      .sidebar.mobile-open { left: 0; }
      .mobile-menu { display: flex !important; }
      .mobile-overlay { display: block; }
      .page-content { padding: 16px; }
    }
  `]
})
export class ShellComponent {
  readonly auth     = inject(AuthService);
  readonly theme    = inject(ThemeService);
  readonly titleSvc = inject(TitleService);

  readonly mobileOpen = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Inicio',        icon: 'home',          route: '/dashboard' },
    { label: 'Kilometraje',   icon: 'directions_car', route: '/vehicles'  },
    { label: 'Ciclos iPhone', icon: 'phone_iphone',  route: '/devices'   },
    { label: 'Catálogo',      icon: 'inventory_2',   route: '/devices/catalog' },
  ];

  initials(): string {
    const u = this.auth.currentUser();
    if (!u) return 'U';
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase() || 'U';
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 768) this.mobileOpen.set(false);
  }
}
