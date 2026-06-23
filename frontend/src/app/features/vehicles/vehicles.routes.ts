import { Routes } from '@angular/router';

export const vehiclesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./vehicle-list/vehicle-list.component').then(m => m.VehicleListComponent),
    title: 'Mis Vehículos — UTILIDADES'
  },
  {
    path: ':id',
    loadComponent: () => import('./vehicle-detail/vehicle-detail.component').then(m => m.VehicleDetailComponent),
    title: 'Detalle Vehículo — UTILIDADES'
  }
];
