import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { telemetryAPI, agencyAPI } from '../services/api';
import { initialAdminData } from '../utils/simulationData';

const emptyAgencyData = {
  stats: [],
  financials: { monthlyRevenue: 0, pendingPayouts: 0, refunds: 0 },
  revenueSeries: [],
  monthlyRevenueSeries: [],
  packages: [],
  hotels: [],
  messages: [],
  tours: [],
  vehicles: [],
  guides: [],
  bookings: [],
};

/**
 * Real-time dashboard hook.
 * 1. Fetches initial data from Laravel REST API.
 * 2. Subscribes to Reverb channels via Laravel Echo.
 * 3. Falls back to 5-second polling if WebSockets unavailable.
 *
 * @param {'agency' | 'admin'} type
 * @param {number} intervalMs  Polling fallback interval (default 5000ms)
 */
export function useRealtimeSimulator(type, intervalMs = 5000) {
  const userId = useSelector((state) => state.auth.user?.id);
  const [data, setData] = useState(() =>
    type === 'agency' ? emptyAgencyData : initialAdminData
  );
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);
  const channelRef = useRef(null);

  // ── Fetch from API ────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const res = type === 'agency'
        ? await agencyAPI.getDashboard()
        : await telemetryAPI.get();
      setData(res.data);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load live dashboard data.');
      setLoading(false);
    }
  }, [type]);

  // ── Trigger a backend tick then refetch ───────────────────────────────────
  const triggerTick = useCallback(async () => {
    try {
      if (type === 'admin') {
        const res = await telemetryAPI.tick();
        setData(res.data);
      }
    } catch (err) {
      // silently ignore tick failures
    }
  }, [type]);

  // ── Set up polling fallback ───────────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      if (type === 'admin') {
        await triggerTick();
      } else {
        await fetchData();
      }
    }, intervalMs);
  }, [type, intervalMs, triggerTick, fetchData]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // ── Subscribe to Reverb WebSocket ─────────────────────────────────────────
  useEffect(() => {
    fetchData();

    let echoInstance = null;
    const channelName = type === 'agency' ? `agency.${userId}` : 'telemetry';
    const eventName = type === 'agency'
      ? '.AgencyDataUpdated'
      : '.TelemetryUpdated';

    try {
      // Dynamic import to avoid crashing if Echo is not configured
      import('../services/echo').then(({ default: echo }) => {
        echoInstance = echo;
        const channel = type === 'agency' ? echo.private(channelName) : echo.channel(channelName);
        channelRef.current = channel;

        channel.listen(eventName, (payload) => {
          if (payload && Object.keys(payload).length > 0) {
            setData(payload);
          } else {
            fetchData();
          }
          setConnected(true);
        });

        // Admin telemetry still needs a local tick driver when no scheduler is running.
        setConnected(true);
        if (type === 'admin') {
          startPolling();
        } else {
          stopPolling();
        }
      }).catch(() => {
        // Echo unavailable – start polling
        startPolling();
      });
    } catch {
      startPolling();
    }

    // Start polling as a safety net for the first 3 seconds
    const safetyTimer = setTimeout(() => {
      if (!connected) startPolling();
    }, 3000);

    return () => {
      clearTimeout(safetyTimer);
      stopPolling();
      if (channelRef.current && echoInstance) {
        echoInstance.leave(channelName);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, userId]);

  return [data, setData, { loading, connected, error, refetch: fetchData, triggerTick }];
}

export default useRealtimeSimulator;
