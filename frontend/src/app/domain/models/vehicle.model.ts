export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  startCountDate: string;
  baseMileage: number;
  isActive: boolean;
  createdAt: string;
  totalRecords: number;
  imageUrl?: string;
}

export interface VehicleDetail extends Vehicle {
  imageUrl?: string;
  records: MileageRecord[];
  statistics: VehicleStatistics;
}

export interface MileageRecord {
  id: string;
  vehicleId: string;
  recordDate: string;
  currentMileage: number;
  observations?: string;
  createdAt: string;
}

export interface VehicleStatistics {
  vehicleId: string;
  daysElapsed: number;
  kmTraveled: number;
  dailyAverage: number;
  annualProjection: number;
  currentMileage: number;
}

export interface CreateVehicle {
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  startCountDate: string;
  baseMileage: number;
  imageUrl?: string;
}

export interface CreateMileageRecord {
  recordDate: string;
  currentMileage: number;
  observations?: string;
}

export interface UpdateMileageRecord {
  recordDate: string;
  currentMileage: number;
  observations?: string;
}
