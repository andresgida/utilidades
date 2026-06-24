export interface AppleDevice {
  id: string;
  deviceName: string;
  catalogDeviceId?: string;
  catalogDeviceName?: string;
  catalogImageUrl?: string;
  purchaseDate: string;
  isCustomDevice: boolean;
  createdAt: string;
  totalRecords: number;
}

export interface AppleDeviceDetail extends AppleDevice {
  catalogImageUrl?: string;
  records: BatteryCycleRecord[];
  statistics: DeviceStatistics;
}

export interface BatteryCycleRecord {
  id: string;
  appleDeviceId: string;
  recordDate: string;
  currentCycles: number;
  notes?: string;
  createdAt: string;
}

export interface DeviceStatistics {
  deviceId: string;
  daysElapsed: number;
  currentCycles: number;
  dailyAverage: number;
  annualProjection: number;
  healthPercentage: number;
  healthStatus: HealthStatus;
}

export type HealthStatus = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';

export interface DeviceCatalog {
  id: string;
  name: string;
  brand: string;
  releaseYear: number;
  maxCycles: number;
  imageUrl?: string;
  sortOrder: number;
}

export interface CreateCatalogDevice {
  name: string;
  brand: string;
  releaseYear: number;
  maxCycles: number;
  imageUrl?: string;
  sortOrder: number;
}

export interface CreateAppleDevice {
  deviceName: string;
  purchaseDate: string;
  catalogDeviceId?: string;
  isCustomDevice?: boolean;
}

export interface CreateBatteryCycleRecord {
  recordDate: string;
  currentCycles: number;
  notes?: string;
}

export interface UpdateBatteryCycleRecord {
  recordDate: string;
  currentCycles: number;
  notes?: string;
}
