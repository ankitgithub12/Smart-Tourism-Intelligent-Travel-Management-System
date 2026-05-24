import React, { useState } from 'react';
import {
  LayoutDashboard, Users, MapPin, Compass, Activity, ShieldAlert,
  Truck, Brain, Calendar, CheckCircle, Leaf, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import useRealtimeSimulator from '../../hooks/useRealtimeSimulator';
import { telemetryAPI } from '../../services/api';

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
import MessagesPanel from '../dashboard/MessagesPanel';

const navItems = [
  { label: 'Overview',        path: 'overview',      icon: LayoutDashboard },
  { label: 'Crowd Monitor',   path: 'crowd',         icon: Users },
  { label: 'Heatmap View',    path: 'heatmap',       icon: MapPin },
  { label: 'Traffic',         path: 'traffic',       icon: Compass },
  { label: 'Public Transit',  path: 'transport',     icon: Activity },
  { label: 'Emergency Center',path: 'emergency',     icon: ShieldAlert },
  { label: 'Resources',       path: 'resources',     icon: Truck },
  { label: 'AI Prediction',   path: 'predictions',   icon: Brain },
  { label: 'Event Manager',   path: 'events',        icon: Calendar },
  { label: 'Agency Approvals',path: 'agencies',      icon: CheckCircle },
  { label: 'Sustainability',  path: 'sustainability', icon: Leaf },
  { label: 'Messages',        path: 'messages',      icon: Mail },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData, { loading, connected, refetch, triggerTick }] =
    useRealtimeSimulator('admin', 6000);

  const handleRefresh = async () => {
    await refetch();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'crowd':        return <CrowdMonitor data={data} setData={setData} />;
      case 'heatmap':      return <HeatmapView data={data} setData={setData} />;
      case 'traffic':      return <TrafficDashboard data={data} setData={setData} />;
      case 'transport':    return <TransportTracker data={data} setData={setData} />;
      case 'emergency':    return <EmergencyCenter data={data} setData={setData} />;
      case 'resources':    return <ResourceMonitor data={data} setData={setData} />;
      case 'predictions':  return <FlowPrediction data={data} setData={setData} />;
      case 'events':       return <EventManager data={data} setData={setData} />;
      case 'agencies':     return <AgencyApprovals data={data} setData={setData} />;
      case 'sustainability': return <SustainabilityDashboard data={data} setData={setData} />;
      case 'messages':     return <MessagesPanel messages={data.messages || []} title="Agency Contact Messages" />;
      default:             return <AdminOverview data={data} setTab={setActiveTab} loading={loading} />;
    }
  };

  return (
    <DashboardLayout
      role="authority"
      title="City Command Center"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      navItems={navItems}
      connected={connected}
      loading={loading}
      onRefresh={handleRefresh}
    >
      <div className="space-y-6">
        {/* Tab pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => setActiveTab(item.path)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold
                  transition-all whitespace-nowrap border shrink-0
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-600 text-white border-transparent shadow-lg shadow-blue-500/20'
                    : 'bg-white/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/5 hover:border-blue-400/40 hover:text-blue-500'
                  }`}
              >
                <Icon size={12} />
                {item.label}
              </motion.button>
            );
          })}
        </div>

        {/* Page content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
