import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Vehicle, VehicleDetail, CreateVehicle,
  MileageRecord, CreateMileageRecord, UpdateMileageRecord
} from '../../domain/models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly api  = `${environment.apiUrl}/vehicles`;

  private readonly _vehicles = signal<Vehicle[]>([]);
  private readonly _loading  = signal(false);

  readonly vehicles = this._vehicles.asReadonly();
  readonly loading  = this._loading.asReadonly();

  loadVehicles() {
    this._loading.set(true);
    return this.http.get<Vehicle[]>(this.api).pipe(
      tap(v => { this._vehicles.set(v); this._loading.set(false); })
    );
  }

  getVehicle(id: string) {
    return this.http.get<VehicleDetail>(`${this.api}/${id}`);
  }

  createVehicle(data: CreateVehicle) {
    return this.http.post<Vehicle>(this.api, data).pipe(
      tap(v => this._vehicles.update(list => [v, ...list]))
    );
  }

  updateVehicle(id: string, data: CreateVehicle) {
    return this.http.put<Vehicle>(`${this.api}/${id}`, data).pipe(
      tap(updated => this._vehicles.update(list =>
        list.map(v => v.id === id ? updated : v)))
    );
  }

  deleteVehicle(id: string) {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      tap(() => this._vehicles.update(list => list.filter(v => v.id !== id)))
    );
  }

  addMileageRecord(vehicleId: string, data: CreateMileageRecord) {
    return this.http.post<MileageRecord>(`${this.api}/${vehicleId}/records`, data);
  }

  updateMileageRecord(vehicleId: string, recordId: string, data: UpdateMileageRecord) {
    return this.http.put<MileageRecord>(`${this.api}/${vehicleId}/records/${recordId}`, data);
  }

  deleteMileageRecord(vehicleId: string, recordId: string) {
    return this.http.delete<void>(`${this.api}/${vehicleId}/records/${recordId}`);
  }
}
