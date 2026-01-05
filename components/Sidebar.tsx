
import React from 'react';
import { ICONS, COLORS } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ICONS.Dashboard },
    { id: 'map', label: 'Live Map', icon: ICONS.Map },
    { id: 'alerts', label: 'Alerts', icon: ICONS.Alerts },
    { id: 'settings', label: 'Settings', icon: ICONS.Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white w-20 md:w-64 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-500 p-2 rounded-lg">
          <ICONS.Wifi className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold hidden md:block tracking-tight">Trackify</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-6 h-6 flex-shrink-0" />
              <span className="font-medium hidden md:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <img 
            src="https://picsum.photos/seed/admin/40/40" 
            alt="User" 
            className="w-10 h-10 rounded-full border-2 border-slate-700" 
          />
          <div className="hidden md:block">
            <p className="text-sm font-semibold">Fleet Manager</p>
            <p className="text-xs text-slate-500">Admin Account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
