import React, { useState } from 'react';
import {
  LayoutDashboard, Users, MapPin, Compass, Activity, ShieldAlert,
  Truck, Brain, Calendar, CheckCircle, Leaf
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import useRealtimeSimulator from '../../hooks/useRealtimeSimulator';

// Subpage components
import AdminOverview from './AdminOverview';
import CrowdMonitor from './CrowdMonitor';
import HeatmapView from './HeatmapView';
import TrafficDashboard from './TrafficDashboard';
import TransportTracker from './TransportTracker';
import EmergencyCenter from './EmergencyCenter';
import ResourceMonitor from './ResourceMonitor';
import FlowPrediction from './FlowPrediction';
import EventManager from './EventManager';
import AgencyApprovals from './AgencyApprovals';
import SustainabilityDashboard from './SustainabilityDashboard';

const navItems = [
  { label: 'Overview', path: 'overview', icon: LayoutDashboard },
  { label: 'Crowd Monitor', path: 'crowd', icon: Users },
  { label: 'Heatmap View', path: 'heatmap', icon: MapPin },
  { label: 'Traffic Dashboard', path: 'traffic', icon: Compass },
  { label: 'Public Transit', path: 'transport', icon: Activity },
  { label: 'Emergency Center', path: 'emergency', icon: ShieldAlert },
  { label: 'Resource Monitor', path: 'resources', icon: Truck },
  { label: 'AI Prediction', path: 'predictions', icon: Brain },
  { label: 'Event Manager', path: 'events', icon: Calendar },
  { label: 'Agency Approvals', path: 'agencies', icon: CheckCircle },
  { label: 'Sustainability', path: 'sustainability', icon: Leaf }
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useRealtimeSimulator('admin', 3000);

  const renderContent = () => {
    switch (activeTab) {
      case 'crowd':
        return <CrowdMonitor data={data} setData={setData} />;
      case 'heatmap':
        return <HeatmapView data={data} setData={setData} />;
      case 'traffic':
        return <TrafficDashboard data={data} setData={setData} />;
      case 'transport':
        return <TransportTracker data={data} setData={setData} />;
      case 'emergency':
        return <EmergencyCenter data={data} setData={setData} />;
      case 'resources':
        return <ResourceMonitor data={data} setData={setData} />;
      case 'predictions':
        return <FlowPrediction data={data} setData={setData} />;
      case 'events':
        return <EventManager data={data} setData={setData} />;
      case 'agencies':
        return <AgencyApprovals data={data} setData={setData} />;
      case 'sustainability':
        return <SustainabilityDashboard data={data} setData={setData} />;
      case 'overview':
      default:
        return <AdminOverview data={data} setTab={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout
      role="authority"
      title="City Command Dashboard"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      navItems={navItems}
    >
      <div className="flex flex-col min-h-screen">
        {/* Sub Navigation Tabs */}
        <div className="flex gap-1.5 pb-4 mb-6 border-b border-slate-200/50 dark:border-slate-800/50 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setActiveTab(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[hsl(var(--primary))] text-white shadow-md'
                    : 'bg-white/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Inner Tab Component */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
