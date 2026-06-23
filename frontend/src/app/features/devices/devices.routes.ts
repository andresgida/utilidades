import { Routes } from '@angular/router';

export const devicesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./device-list/device-list.component').then(m => m.DeviceListComponent),
    title: 'Mis Dispositivos — UTILIDADES'
  },
  {
    path: 'catalog',
    loadComponent: () => import('./catalog-list/catalog-list.component').then(m => m.CatalogListComponent),
    title: 'Catálogo de Modelos — UTILIDADES'
  },
  {
    path: ':id',
    loadComponent: () => import('./device-detail/device-detail.component').then(m => m.DeviceDetailComponent),
    title: 'Detalle Dispositivo — UTILIDADES'
  }
];
