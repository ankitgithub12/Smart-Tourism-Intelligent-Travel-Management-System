import { useState, useEffect, useRef, useCallback } from 'react';
import { telemetryAPI, agencyAPI } from '../services/api';
import { initialAgencyData, initialAdminData } from '../utils/simulationData';

/**
 * Real-time dashboard hook.
 * 1. Fetches initial data from Laravel REST API.
 * 2. Subscribes to Reverb public channels (telemetry / agency) via Laravel Echo.
 * 3. Falls back to 5-second polling if WebSockets unavailable.
 *
 * @param {'agency' | 'admin'} type
 * @param {number} intervalMs  Polling fallback interval (default 5000ms)
 */
export function useRealtimeSimulator(type, intervalMs = 5000) {
  const [data, setData] = useState(() =>
    type === 'agency' ? initialAgencyData : initialAdminData
  );
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const pollingRef = useRef(null);
  const channelRef = useRef(null);

  // ── Fetch from API ────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const res = type === 'agency'
        ? await agencyAPI.getDashboard()
        : await telemetryAPI.get();
      setData(res.data);
      setLoading(false);
    } catch (err) {
      // If API fails, keep using local simulation data silently
      console.warn('[useRealtimeSimulator] API fetch failed, using local data:', err?.message);
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
    const channelName = type === 'agency' ? 'agency' : 'telemetry';
    const eventName = type === 'agency'
      ? '.AgencyDataUpdated'
      : '.TelemetryUpdated';

    try {
      // Dynamic import to avoid crashing if Echo is not configured
      import('../services/echo').then(({ default: echo }) => {
        echoInstance = echo;
        const channel = echo.channel(channelName);
        channelRef.current = channel;

        channel.listen(eventName, (payload) => {
          setData(payload);
          setConnected(true);
        });

        // Mark connected; stop polling if it was started
        setConnected(true);
        stopPolling();
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
  }, [type]);

  return [data, setData, { loading, connected, refetch: fetchData, triggerTick }];
}

export default useRealtimeSimulator;
