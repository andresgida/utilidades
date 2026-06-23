import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [RouterOutlet, MatIconModule],
  template: `
    <!-- Background orbs -->
    <div class="orb orb-purple"></div>
    <div class="orb orb-cyan"></div>
    <div class="orb orb-pink"></div>

    <main class="auth-layout">
      <!-- Left brand panel -->
      <div class="auth-brand glass-panel">
        <div class="brand-content">
          <div class="brand-logo">
            <span class="logo-letter">U</span>
          </div>
          <h1 class="brand-name">
            Optimiza tu<br>
            <span class="brand-gradient">Productividad</span>
          </h1>
          <p class="brand-tagline">
            Gestiona kilometraje, ciclos de batería y utilidades esenciales en un solo ecosistema diseñado para la velocidad.
          </p>
          <div class="brand-features">
            <div class="feature-item">
              <div class="feature-icon-wrap feature-purple">
                <mat-icon>auto_graph</mat-icon>
              </div>
              <span>Análisis en Tiempo Real</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon-wrap feature-cyan">
                <mat-icon>directions_car</mat-icon>
              </div>
              <span>Seguimiento de Kilometraje</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon-wrap feature-pink">
                <mat-icon>battery_charging_full</mat-icon>
              </div>
              <span>Ciclos de Batería iPhone</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right form panel -->
      <div class="auth-form-panel glass-panel">
        <div class="form-brand">
          <div class="form-logo"><span>U</span></div>
          <h2 class="form-title">Utilidades</h2>
          <p class="form-subtitle">Acceso al Sistema</p>
        </div>
        <router-outlet />
      </div>
    </main>
  `,
  styles: [`
    :host {
      display: flex; min-height: 100vh;
      background: var(--bg-base); overflow: hidden;
      align-items: center; justify-content: center;
      font-family: 'Inter', sans-serif;
      position: relative;
      transition: background 0.3s ease;
    }

    .orb {
      position: fixed; border-radius: 50%;
      filter: blur(100px); z-index: 0;
      opacity: var(--orb-opacity); pointer-events: none;
      animation: blob-float 15s infinite ease-in-out;
    }
    .orb-purple { width: 55%; height: 55%; background: #a078ff; top: -12%; left: -10%; }
    .orb-cyan   { width: 50%; height: 50%; background: #03b5d3; bottom: -12%; right: -10%; animation-delay: 2s; }
    .orb-pink   { width: 30%; height: 30%; background: #f751a1; top: 20%; right: 10%; opacity: 0.12; animation-delay: 4s; }

    @keyframes blob-float {
      0%, 100% { transform: translate(0,0) scale(1); }
      33%       { transform: translate(30px,-50px) scale(1.1); }
      66%       { transform: translate(-20px,20px) scale(0.9); }
    }

    .auth-layout {
      position: relative; z-index: 10;
      width: 100%; max-width: 1100px;
      min-height: 600px;
      display: flex; flex-direction: row;
      gap: 16px; padding: 24px; margin: 0 auto;
    }

    .glass-panel {
      background: var(--card-bg);
      backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-glass);
      border-radius: 24px;
      transition: background 0.3s ease, border-color 0.3s ease;
    }

    .auth-brand {
      flex: 1; padding: 48px;
      display: flex; flex-direction: column;
      justify-content: center; overflow: hidden;
    }

    .brand-logo {
      width: 56px; height: 56px;
      background: linear-gradient(135deg, #6d3bd7, #03b5d3);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 24px rgba(109,59,215,0.5);
      margin-bottom: 28px;
    }

    .logo-letter {
      color: white; font-weight: 800; font-size: 28px;
      font-family: 'Montserrat', sans-serif;
    }

    .brand-name {
      font-family: 'Montserrat', sans-serif;
      font-size: 38px; font-weight: 800;
      color: var(--text-primary); margin: 0 0 16px;
      line-height: 1.15; letter-spacing: -0.02em;
    }

    .brand-gradient {
      background: var(--gradient-primary);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent; color: transparent;
    }

    .brand-tagline {
      font-size: 16px; color: var(--text-secondary);
      margin: 0 0 40px; line-height: 1.7; max-width: 380px;
    }

    .brand-features { display: flex; flex-direction: column; gap: 16px; }

    .feature-item {
      display: flex; align-items: center; gap: 14px;
      font-size: 15px; color: var(--text-primary); font-weight: 500;
    }

    .feature-icon-wrap {
      width: 40px; height: 40px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .feature-icon-wrap mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .feature-purple { background: rgba(109,59,215,0.12); color: var(--primary); }
    .feature-cyan   { background: rgba(0,150,179,0.12); color: var(--secondary); }
    .feature-pink   { background: rgba(181,48,94,0.12); color: var(--tertiary); }

    .auth-form-panel {
      width: 420px; min-width: 420px;
      padding: 40px 36px;
      display: flex; flex-direction: column; justify-content: center;
    }

    .form-brand { text-align: center; margin-bottom: 32px; }

    .form-logo {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #6d3bd7, #03b5d3);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 12px;
      box-shadow: 0 4px 16px rgba(109,59,215,0.4);
    }

    .form-logo span {
      color: white; font-weight: 800; font-size: 22px;
      font-family: 'Montserrat', sans-serif;
    }

    .form-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 22px; font-weight: 700;
      color: var(--text-primary); margin: 0 0 4px;
    }

    .form-subtitle {
      font-size: 11px; color: var(--text-muted);
      letter-spacing: 0.15em; text-transform: uppercase;
      font-family: 'Inter', sans-serif; margin: 0;
    }

    @media (max-width: 900px) {
      .auth-brand { display: none; }
      .auth-layout { padding: 16px; justify-content: center; min-height: 100vh; align-items: center; }
      .auth-form-panel { width: 100%; min-width: unset; }
    }
  `]
})
export class AuthShellComponent {
  readonly theme = inject(ThemeService);
}
