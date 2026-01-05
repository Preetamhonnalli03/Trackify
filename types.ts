
export interface Device {
  id: string;
  name: string;
  lat: number;
  lng: number;
  speed: number;
  speedLimit: number;
  isSleepMode: boolean;
  battery: number;
  signal: 'Strong' | 'Weak' | 'None';
  lastUpdated: string;
  status: 'Online' | 'Offline' | 'SOS';
}

export interface Alert {
  id: string;
  deviceId: string;
  deviceName: string;
  type: 'Speed' | 'SOS' | 'Geofence' | 'Battery';
  message: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
}

export interface SpeedHistory {
  time: string;
  speed: number;
}
