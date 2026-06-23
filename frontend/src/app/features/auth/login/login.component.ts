import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-header">
        <h2>Bienvenido</h2>
        <p>Inicia sesión para continuar</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">

        <div class="field-group">
          <label for="email" class="field-label">Correo electrónico</label>
          <div class="input-wrapper">
            <input id="email" formControlName="email" type="email"
                   autocomplete="email" placeholder="tu@correo.com"
                   class="field-input" [class.input-error]="form.get('email')?.invalid && form.get('email')?.touched">
            <mat-icon class="input-icon">mail_outline</mat-icon>
          </div>
          @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
            <span class="field-error">El correo es requerido</span>
          }
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <span class="field-error">Formato de correo inválido</span>
          }
        </div>

        <div class="field-group">
          <label for="password" class="field-label">Contraseña</label>
          <div class="input-wrapper">
            <input id="password" formControlName="password"
                   [type]="showPw() ? 'text' : 'password'"
                   autocomplete="current-password" placeholder="••••••••"
                   class="field-input" [class.input-error]="form.get('password')?.invalid && form.get('password')?.touched">
            <button type="button" class="pw-toggle" (click)="togglePw()">
              <mat-icon>{{ showPw() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </div>
          @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
            <span class="field-error">La contraseña es requerida</span>
          }
        </div>

        @if (errorMsg()) {
          <div class="error-banner">
            <mat-icon>error_outline</mat-icon>
            <span>{{ errorMsg() }}</span>
          </div>
        }

        <button type="submit" [disabled]="form.invalid || loading()" class="submit-btn">
          @if (loading()) {
            <mat-progress-spinner diameter="20" mode="indeterminate" />
          } @else {
            Iniciar sesión
          }
        </button>

        <p class="register-link">
          ¿No tienes cuenta? <a routerLink="/auth/register">Regístrate</a>
        </p>
      </form>
    </div>
  `,
  styles: [`
    .login-container { width: 100%; }
    .login-header { margin-bottom: 28px; }
    .login-header h2 {
      font-family: 'Montserrat', sans-serif;
      font-size: 22px; font-weight: 700; margin: 0 0 6px;
      color: var(--text-primary);
    }
    .login-header p { color: var(--text-muted); margin: 0; font-size: 14px; }

    .login-form { display: flex; flex-direction: column; gap: 18px; }

    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label {
      font-size: 11px; font-weight: 600; color: var(--text-secondary);
      letter-spacing: 0.08em; text-transform: uppercase;
    }
    .input-wrapper { position: relative; display: flex; align-items: center; }
    .field-input {
      width: 100%; height: 52px; padding: 0 48px 0 16px;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      font-size: 15px; color: var(--text-primary);
      background: var(--input-bg);
      outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.3s;
      box-sizing: border-box; font-family: 'Inter', sans-serif;
    }
    .field-input::placeholder { color: var(--input-placeholder); }
    .field-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .field-input.input-error { border-color: #ffb4ab; }
    .field-input.input-error:focus { box-shadow: 0 0 0 3px rgba(255,180,171,0.15); }

    .input-icon {
      position: absolute; right: 14px;
      font-size: 18px; color: var(--text-muted); pointer-events: none;
    }
    .pw-toggle {
      position: absolute; right: 10px;
      background: none; border: none; cursor: pointer;
      padding: 4px; color: var(--text-muted); display: flex; align-items: center;
    }
    .pw-toggle:hover { color: var(--primary); }

    .field-error { font-size: 12px; color: var(--error); margin-top: 2px; }

    .error-banner {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; border-radius: 12px;
      background: rgba(179,38,30,0.08); color: var(--error);
      font-size: 14px; border: 1px solid rgba(179,38,30,0.2);
    }

    .submit-btn {
      width: 100%; height: 52px; border: none; border-radius: 9999px;
      background: linear-gradient(135deg, #6d3bd7 0%, #03b5d3 100%);
      color: #fff; font-family: 'Montserrat', sans-serif;
      font-size: 15px; font-weight: 700; cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(109,59,215,0.4);
      letter-spacing: 0.04em;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(76,215,246,0.4);
    }
    .submit-btn:active:not(:disabled) { transform: scale(0.98); }
    .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .register-link { text-align: center; font-size: 14px; color: var(--text-muted); margin: 0; }
    .register-link a { color: var(--primary); text-decoration: none; font-weight: 600; }
    .register-link a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  readonly loading  = signal(false);
  readonly showPw   = signal(false);
  readonly errorMsg = signal('');

  readonly form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  togglePw(): void { this.showPw.update(v => !v); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.errorMsg.set('');

    const { email, password } = this.form.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.title || 'Credenciales inválidas. Intenta de nuevo.';
        this.errorMsg.set(msg);
      }
    });
  }
}
