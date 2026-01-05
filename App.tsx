
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Device, Alert, SpeedHistory } from './types';
import Sidebar from './components/Sidebar';
import MapDisplay from './components/MapDisplay';
import DeviceCard from './components/DeviceCard';
import { getSmartInsights } from './services/geminiService';
import { ICONS, COLORS } from './constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const INITIAL_DEVICES: Device[] = [
  {
    id: 'TRK-9901',
    name: 'Logistics Truck A',
    lat: 40.7128,
    lng: -74.0060,
    speed: 65,
    speedLimit: 80,
    isSleepMode: false,
    battery: 88,
    signal: 'Strong',
    lastUpdated: new Date().toISOString(),
    status: 'Online'
  },
  {
    id: 'TRK-4421',
    name: 'Service Van 4',
    lat: 40.7589,
    lng: -73.9851,
    speed: 12,
    speedLimit: 45,
    isSleepMode: false,
    battery: 42,
    signal: 'Weak',
    lastUpdated: new Date().toISOString(),
    status: 'Online'
  },
  {
    id: 'ASSET-220',
    name: 'E-Bike Delivery',
    lat: 40.7484,
    lng: -73.9857,
    speed: 0,
    speedLimit: 25,
    isSleepMode: true,
    battery: 95,
    signal: 'Strong',
    lastUpdated: new Date().toISOString(),
    status: 'Offline'
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [insights, setInsights] = useState<string>("Analyzing fleet data...");
  const [speedData, setSpeedData] = useState<SpeedHistory[]>([]);

  // Simulation loop for movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev => prev.map(d => {
        if (d.isSleepMode || d.status === 'Offline') return d;

        // Simulate small movement
        const newLat = d.lat + (Math.random() - 0.5) * 0.002;
        const newLng = d.lng + (Math.random() - 0.5) * 0.002;
        const newSpeed = Math.floor(Math.random() * 90);

        // Check for speed alerts
        if (newSpeed > d.speedLimit) {
          const alertId = `alert-${Date.now()}`;
          setAlerts(prevAlerts => [
            {
              id: alertId,
              deviceId: d.id,
              deviceName: d.name,
              type: 'Speed',
              message: `Speed Violation: ${newSpeed}km/h (Limit: ${d.speedLimit})`,
              timestamp: new Date().toLocaleTimeString(),
              severity: 'medium'
            },
            ...prevAlerts.slice(0, 9)
          ]);
        }

        return {
          ...d,
          lat: newLat,
          lng: newLng,
          speed: newSpeed,
          lastUpdated: new Date().toISOString()
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Update speed chart data
  useEffect(() => {
    const activeDevice = devices[0]; // Track first device for chart demo
    setSpeedData(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString().slice(0, 5), speed: activeDevice.speed }
    ].slice(-10));
  }, [devices]);

  // Fetch AI Insights
  useEffect(() => {
    const fetchInsights = async () => {
      const result = await getSmartInsights(devices, alerts);
      setInsights(result);
    };
    fetchInsights();
  }, []); // Only once on mount to avoid token waste, could be triggered by button

  const handleUpdateDevice = (id: string, updates: Partial<Device>) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleSOS = (id: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        const newStatus = d.status === 'SOS' ? 'Online' : 'SOS';
        if (newStatus === 'SOS') {
          setAlerts(alerts => [
            {
              id: `sos-${Date.now()}`,
              deviceId: d.id,
              deviceName: d.name,
              type: 'SOS',
              message: `EMERGENCY SOS SIGNAL RECEIVED!`,
              timestamp: new Date().toLocaleTimeString(),
              severity: 'high'
            },
            ...alerts
          ]);
        }
        return { ...d, status: newStatus };
      }
      return d;
    }));
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Trackify Control Center</h1>
            <p className="text-slate-500">Managing {devices.length} active IoT assets</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
               <div className="w-2 h-2 rounded-full bg-green-500" />
               <span className="text-sm font-medium text-slate-600">All Systems Normal</span>
             </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Fleet Status</p>
                <p className="text-3xl font-bold text-slate-800">98.2%</p>
                <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"></path></svg>
                  +2.1% from yesterday
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Average Speed</p>
                <p className="text-3xl font-bold text-slate-800">42 <span className="text-lg font-normal">km/h</span></p>
                <p className="text-xs text-slate-400 mt-2">Overall fleet velocity</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Distance</p>
                <p className="text-3xl font-bold text-slate-800">1,402 <span className="text-lg font-normal">km</span></p>
                <p className="text-xs text-indigo-500 mt-2">Active session</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Critical Alerts</p>
                <p className={`text-3xl font-bold ${alerts.filter(a => a.severity === 'high').length > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                  {alerts.filter(a => a.severity === 'high').length}
                </p>
                <p className="text-xs text-slate-400 mt-2">Requires immediate attention</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart & Insights */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Fleet Velocity History</h3>
                    <select className="text-xs font-bold bg-slate-50 border-none rounded-lg px-2 py-1 outline-none">
                      <option>Last 10 minutes</option>
                      <option>Last hour</option>
                    </select>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={speedData}>
                        <defs>
                          <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="speed" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSpeed)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl text-white shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold">Trackify AI Insights</h3>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 whitespace-pre-wrap leading-relaxed">
                    {insights}
                  </div>
                  <button 
                    onClick={async () => {
                      setInsights("Refreshing insights...");
                      const result = await getSmartInsights(devices, alerts);
                      setInsights(result);
                    }}
                    className="mt-4 px-4 py-2 bg-white text-indigo-700 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-colors"
                  >
                    Refresh Analysis
                  </button>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                    Live Alerts
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-400">REALTIME</span>
                  </h3>
                  <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px]">
                    {alerts.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <ICONS.Wifi className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>All assets operational.</p>
                      </div>
                    ) : (
                      alerts.map(alert => (
                        <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${
                          alert.severity === 'high' ? 'bg-red-50 border-red-500' : 
                          alert.severity === 'medium' ? 'bg-amber-50 border-amber-500' : 
                          'bg-indigo-50 border-indigo-500'
                        }`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm text-slate-800">{alert.deviceName}</span>
                            <span className="text-[10px] font-medium text-slate-400">{alert.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 mb-2">{alert.message}</p>
                          <div className="flex gap-2">
                            <button className="text-[10px] font-bold text-indigo-600 hover:underline">LOCATE</button>
                            <button className="text-[10px] font-bold text-slate-400 hover:underline">DISMISS</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
              <MapDisplay devices={devices} selectedDeviceId={selectedDeviceId} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {devices.map(device => (
                <DeviceCard 
                  key={device.id} 
                  device={device} 
                  onUpdate={handleUpdateDevice} 
                  onSOS={handleSOS} 
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="max-w-4xl mx-auto space-y-6 py-4 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-800">Alert History</h2>
            {alerts.length === 0 ? (
              <div className="bg-white rounded-2xl p-20 text-center border border-dashed border-slate-200">
                 <p className="text-slate-400 font-medium">No alerts recorded in the last 24 hours.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
                {alerts.map(alert => (
                  <div key={alert.id} className="p-6 flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {alert.type === 'SOS' ? <ICONS.SOS className="w-6 h-6" /> : <ICONS.Alerts className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-slate-800">{alert.deviceName}</h4>
                        <span className="text-xs text-slate-400">{alert.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-600">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto py-8 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-8">System Settings</h2>
              
              <div className="space-y-8">
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-700">Push Notifications</p>
                        <p className="text-xs text-slate-400">Receive alerts on mobile/desktop</p>
                      </div>
                      <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center px-1">
                        <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-700">Email Reports</p>
                        <p className="text-xs text-slate-400">Weekly fleet summaries</p>
                      </div>
                      <div className="w-12 h-6 bg-slate-200 rounded-full flex items-center px-1">
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Global Speed Policy</h3>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <label className="text-sm font-bold text-slate-700 block mb-2">Default Maximum (km/h)</label>
                    <input type="number" defaultValue={80} className="w-full bg-white border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                </section>

                <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors">
                  Save All Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
