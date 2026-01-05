
import React, { useState } from 'react';
import { Device } from '../types';
import { ICONS, COLORS } from '../constants';

interface DeviceCardProps {
  device: Device;
  onUpdate: (id: string, updates: Partial<Device>) => void;
  onSOS: (id: string) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onUpdate, onSOS }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(device.name);

  const handleNameSave = () => {
    onUpdate(device.id, { name: tempName });
    setIsEditing(false);
  };

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${device.status === 'SOS' ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-100'}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="text-lg font-bold border-b border-indigo-500 outline-none"
                autoFocus
              />
              <button onClick={handleNameSave} className="text-green-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-800">{device.name}</h3>
              <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-indigo-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
            </div>
          )}
          <p className="text-xs text-slate-400">ID: {device.id}</p>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
          device.status === 'Online' ? 'bg-green-100 text-green-700' : 
          device.status === 'SOS' ? 'bg-red-100 text-red-700' : 
          'bg-slate-100 text-slate-700'
        }`}>
          {device.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <ICONS.Battery className={`w-4 h-4 ${device.battery < 20 ? 'text-red-500' : 'text-slate-400'}`} />
          <span className="text-sm font-semibold">{device.battery}%</span>
        </div>
        <div className="flex items-center gap-2">
          <ICONS.Wifi className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold">{device.signal}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <span className="text-sm font-semibold">{device.speed} <span className="text-xs font-normal text-slate-400">km/h</span></span>
        </div>
        <div className="flex items-center gap-2">
          <ICONS.Map className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 truncate">{device.lat.toFixed(4)}, {device.lng.toFixed(4)}</span>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ICONS.Power className={`w-4 h-4 ${device.isSleepMode ? 'text-indigo-500' : 'text-slate-400'}`} />
            <span className="text-sm text-slate-600">Sleep Mode</span>
          </div>
          <button 
            onClick={() => onUpdate(device.id, { isSleepMode: !device.isSleepMode })}
            className={`w-10 h-5 rounded-full relative transition-colors ${device.isSleepMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${device.isSleepMode ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">Speed Limit ({device.speedLimit} km/h)</label>
          <input 
            type="range" 
            min="20" 
            max="180" 
            value={device.speedLimit}
            onChange={(e) => onUpdate(device.id, { speedLimit: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <button 
          onClick={() => onSOS(device.id)}
          className={`w-full py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            device.status === 'SOS' 
              ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
              : 'bg-slate-50 text-red-500 border border-red-100 hover:bg-red-50'
          }`}
        >
          <ICONS.SOS className="w-5 h-5" />
          {device.status === 'SOS' ? 'SENDING HELP' : 'EMERGENCY SOS'}
        </button>
      </div>
    </div>
  );
};

export default DeviceCard;
