import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth-shell.component').then(m => m.AuthShellComponent),
    children: [
      { path: '',        redirectTo: 'login', pathMatch: 'full' },
      { path: 'login',    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),       title: 'Sign In — UTILIDADES' },
      { path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent), title: 'Sign Up — UTILIDADES' },
    ]
  }
];
