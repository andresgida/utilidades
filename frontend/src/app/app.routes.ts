import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard — UTILIDADES'
      },
      {
        path: 'vehicles',
        loadChildren: () => import('./features/vehicles/vehicles.routes').then(m => m.vehiclesRoutes),
        title: 'Kilometraje — UTILIDADES'
      },
      {
        path: 'devices',
        loadChildren: () => import('./features/devices/devices.routes').then(m => m.devicesRoutes),
        title: 'Ciclos iPhone — UTILIDADES'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
