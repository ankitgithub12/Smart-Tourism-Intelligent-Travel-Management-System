import { useState, useEffect } from 'react';
import {
  initialAgencyData,
  initialAdminData,
  tickAgencyData,
  tickAdminData
} from '../utils/simulationData';

/**
 * A custom hook to simulate real-time data ticks for Agency and Admin Dashboards.
 * Falls back to standard state management but ticks/updates fields periodically.
 * 
 * @param {'agency' | 'admin'} type The type of dashboard data to simulate
 * @param {number} intervalMs The update frequency in milliseconds (default 3000ms)
 */
export function useRealtimeSimulator(type, intervalMs = 3000) {
  const [data, setData] = useState(() => {
    return type === 'agency' ? initialAgencyData : initialAdminData;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setData((prevData) => {
        if (type === 'agency') {
          return tickAgencyData(prevData);
        } else {
          return tickAdminData(prevData);
        }
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [type, intervalMs]);

  // Expose setter so components can trigger manually (like adding package, scheduling tour, approving agency)
  return [data, setData];
}

export default useRealtimeSimulator;
