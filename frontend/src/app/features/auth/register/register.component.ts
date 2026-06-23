import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

function passwordMatchValidator(control: AbstractControl) {
  const pw  = control.get('password')?.value;
  const cpw = control.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container">
      <div class="register-header">
        <h2>Crear cuenta</h2>
        <p>Empieza a gestionar tus utilidades hoy</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="register-form">
        <div class="name-row">
          <mat-form-field appearance="outline" class="field-half">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="firstName" autocomplete="given-name">
            @if (form.get('firstName')?.hasError('required') && form.get('firstName')?.touched) {
              <mat-error>Requerido</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline" class="field-half">
            <mat-label>Apellido</mat-label>
            <input matInput formControlName="lastName" autocomplete="family-name">
            @if (form.get('lastName')?.hasError('required') && form.get('lastName')?.touched) {
              <mat-error>Requerido</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Correo electrónico</mat-label>
          <input matInput formControlName="email" type="email" autocomplete="email">
          <mat-icon matSuffix>email</mat-icon>
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <mat-error>Correo inválido</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Contraseña</mat-label>
          <input matInput formControlName="password" [type]="showPw() ? 'text' : 'password'" autocomplete="new-password">
          <button mat-icon-button matSuffix type="button" (click)="togglePw()">
            <mat-icon>{{ showPw() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
            <mat-error>Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Confirmar contraseña</mat-label>
          <input matInput formControlName="confirmPassword" [type]="showPw() ? 'text' : 'password'" autocomplete="new-password">
          @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
            <mat-error>Las contraseñas no coinciden</mat-error>
          }
        </mat-form-field>

        @if (errorMsg()) {
          <div class="error-banner">
            <mat-icon>error_outline</mat-icon>
            <span>{{ errorMsg() }}</span>
          </div>
        }

        <button mat-flat-button color="primary" type="submit"
                [disabled]="form.invalid || loading()" class="submit-btn">
          @if (loading()) {
            <mat-progress-spinner diameter="20" mode="indeterminate" color="accent" />
          } @else {
            Crear cuenta
          }
        </button>

        <p class="login-link">
          ¿Ya tienes cuenta? <a routerLink="/auth/login">Iniciar sesión</a>
        </p>
      </form>
    </div>
  `,
  styles: [`
    .register-container { width: 100%; max-width: 400px; }
    .register-header { margin-bottom: 28px; }
    .register-header h2 { font-size: 28px; font-weight: 700; margin: 0 0 8px; color: var(--text-primary, #111); }
    .register-header p  { color: var(--text-muted, #666); margin: 0; font-size: 15px; }
    .register-form { display: flex; flex-direction: column; gap: 2px; }
    .name-row { display: flex; gap: 12px; }
    .field-half { flex: 1; }
    .field-full { width: 100%; }
    .error-banner {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; border-radius: 8px;
      background: rgba(239,68,68,0.1); color: #ef4444; font-size: 14px;
    }
    .submit-btn { width: 100%; height: 48px; font-size: 16px; font-weight: 600; margin-top: 8px; border-radius: 10px !important; }
    .login-link { text-align: center; font-size: 14px; color: var(--text-muted, #666); margin-top: 16px; }
    .login-link a { color: #5a6ff8; text-decoration: none; font-weight: 600; }
  `]
})
export class RegisterComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  readonly loading  = signal(false);
  readonly showPw   = signal(false);
  readonly errorMsg = signal('');

  readonly form = this.fb.group({
    firstName:       ['', [Validators.required, Validators.maxLength(100)]],
    lastName:        ['', [Validators.required, Validators.maxLength(100)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  togglePw(): void { this.showPw.update(v => !v); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.errorMsg.set('');

    const { firstName, lastName, email, password, confirmPassword } = this.form.value;
    this.auth.register({
      firstName: firstName!,
      lastName: lastName!,
      email: email!,
      password: password!,
      confirmPassword: confirmPassword!
    }).subscribe({
      next: () => {
        this.notify.success('Cuenta creada exitosamente.');
        this.router.navigate(['/dashboard']);
      },
      error: (err: { error?: { title?: string } }) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.title || 'Error al registrarse. Intenta de nuevo.');
      }
    });
  }
}
