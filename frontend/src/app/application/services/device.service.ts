import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AppleDevice, AppleDeviceDetail, CreateAppleDevice,
  BatteryCycleRecord, CreateBatteryCycleRecord, UpdateBatteryCycleRecord,
  DeviceCatalog, CreateCatalogDevice
} from '../../domain/models/device.model';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly http = inject(HttpClient);
  private readonly api  = `${environment.apiUrl}/devices`;

  private readonly _devices  = signal<AppleDevice[]>([]);
  private readonly _catalog  = signal<DeviceCatalog[]>([]);
  private readonly _loading  = signal(false);

  readonly devices  = this._devices.asReadonly();
  readonly catalog  = this._catalog.asReadonly();
  readonly loading  = this._loading.asReadonly();

  loadDevices() {
    this._loading.set(true);
    return this.http.get<AppleDevice[]>(this.api).pipe(
      tap((d: AppleDevice[]) => { this._devices.set(d); this._loading.set(false); })
    );
  }

  loadCatalog() {
    return this.http.get<DeviceCatalog[]>(`${this.api}/catalog`).pipe(
      tap((c: DeviceCatalog[]) => this._catalog.set(c))
    );
  }

  getDevice(id: string) {
    return this.http.get<AppleDeviceDetail>(`${this.api}/${id}`);
  }

  createDevice(data: CreateAppleDevice) {
    return this.http.post<AppleDevice>(this.api, data).pipe(
      tap((d: AppleDevice) => this._devices.update((list: AppleDevice[]) => [d, ...list]))
    );
  }

  updateDevice(id: string, data: Partial<CreateAppleDevice>) {
    return this.http.put<AppleDevice>(`${this.api}/${id}`, data).pipe(
      tap((updated: AppleDevice) => this._devices.update((list: AppleDevice[]) =>
        list.map((d: AppleDevice) => d.id === id ? updated : d)))
    );
  }

  deleteDevice(id: string) {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      tap(() => this._devices.update((list: AppleDevice[]) => list.filter((d: AppleDevice) => d.id !== id)))
    );
  }

  addCycleRecord(deviceId: string, data: CreateBatteryCycleRecord) {
    return this.http.post<BatteryCycleRecord>(`${this.api}/${deviceId}/cycles`, data);
  }

  updateCycleRecord(deviceId: string, recordId: string, data: UpdateBatteryCycleRecord) {
    return this.http.put<BatteryCycleRecord>(`${this.api}/${deviceId}/cycles/${recordId}`, data);
  }

  deleteCycleRecord(deviceId: string, recordId: string) {
    return this.http.delete<void>(`${this.api}/${deviceId}/cycles/${recordId}`);
  }

  createCatalogDevice(data: CreateCatalogDevice) {
    return this.http.post<DeviceCatalog>(`${this.api}/catalog`, data).pipe(
      tap((item: DeviceCatalog) => this._catalog.update((list: DeviceCatalog[]) =>
        [...list, item].sort((a, b) => a.sortOrder - b.sortOrder)))
    );
  }

  updateCatalogDevice(id: string, data: CreateCatalogDevice) {
    return this.http.put<DeviceCatalog>(`${this.api}/catalog/${id}`, data).pipe(
      tap((updated: DeviceCatalog) => this._catalog.update((list: DeviceCatalog[]) =>
        list.map((c: DeviceCatalog) => c.id === id ? updated : c)))
    );
  }

  deleteCatalogDevice(id: string) {
    return this.http.delete<void>(`${this.api}/catalog/${id}`).pipe(
      tap(() => this._catalog.update((list: DeviceCatalog[]) =>
        list.filter((c: DeviceCatalog) => c.id !== id)))
    );
  }
}
