import React, { useState } from 'react';
import {
  LayoutDashboard, Package, Calendar, Car, UserCheck, BookOpen,
  BarChart3, DollarSign, Lightbulb, Hotel, Mail
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import useRealtimeSimulator from '../../hooks/useRealtimeSimulator';

// Subpage components
import AgencyOverview from './AgencyOverview';
import PackageManager from './PackageManager';
import HotelManager from './HotelManager';
import TourScheduler from './TourScheduler';
import VehicleAllocation from './VehicleAllocation';
import GuideManagement from './GuideManagement';
import BookingManager from './BookingManager';
import TouristAnalytics from './TouristAnalytics';
import RevenueDashboard from './RevenueDashboard';
import SmartRecommendations from './SmartRecommendations';
import MessagesPanel from '../dashboard/MessagesPanel';

const navItems = [
  { label: 'Overview', path: 'overview', icon: LayoutDashboard },
  { label: 'Packages', path: 'packages', icon: Package },
  { label: 'Hotels', path: 'hotels', icon: Hotel },
  { label: 'Schedules', path: 'tours', icon: Calendar },
  { label: 'Vehicles', path: 'vehicles', icon: Car },
  { label: 'Guides', path: 'guides', icon: UserCheck },
  { label: 'Bookings', path: 'bookings', icon: BookOpen },
  { label: 'Analytics', path: 'analytics', icon: BarChart3 },
  { label: 'Revenue', path: 'revenue', icon: DollarSign },
  { label: 'AI Smart Tips', path: 'recommendations', icon: Lightbulb },
  { label: 'Messages', path: 'messages', icon: Mail }
];

export function AgencyDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useRealtimeSimulator('agency', 3000);

  // Helper to map tab IDs to render functions
  const renderContent = () => {
    switch (activeTab) {
      case 'packages':
        return <PackageManager data={data} setData={setData} />;
      case 'hotels':
        return <HotelManager data={data} setData={setData} />;
      case 'tours':
        return <TourScheduler data={data} setData={setData} />;
      case 'vehicles':
        return <VehicleAllocation data={data} setData={setData} />;
      case 'guides':
        return <GuideManagement data={data} setData={setData} />;
      case 'bookings':
        return <BookingManager data={data} setData={setData} />;
      case 'analytics':
        return <TouristAnalytics data={data} setData={setData} />;
      case 'revenue':
        return <RevenueDashboard data={data} setData={setData} />;
      case 'recommendations':
        return <SmartRecommendations data={data} setData={setData} />;
      case 'messages':
        return <MessagesPanel messages={data.messages || []} title="Tourist Contact Messages" />;
      case 'overview':
      default:
        return <AgencyOverview data={data} setTab={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout
      role="agency"
      title="Travel Agency Portal"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      navItems={navItems}
    >
      {/* Tab Switcher override container */}
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

export default AgencyDashboard;
