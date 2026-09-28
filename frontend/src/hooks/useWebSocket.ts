import { useEffect } from 'react';
import { initWS, /*getSocket,*/ closeWS } from '../services/ws';
import { useStore } from '../store';

export const useWebSocket = () => {
  const setWsConnected = useStore((s) => s.setWsConnected);
  const fetchTasks = useStore((s) => s.fetchTasks);

  useEffect(() => {
    const socket = initWS();
    setWsConnected(true);

    socket.on('task.created', () => fetchTasks());
    socket.on('task.updated', () => fetchTasks());
    socket.on('task.status.changed', () => fetchTasks());
    socket.on('dependency.added', () => fetchTasks());
    socket.on('dependency.removed', () => fetchTasks());
    socket.on('dependency.validated', () => fetchTasks());

    socket.on('disconnect', () => setWsConnected(false));
    socket.on('connect', () => setWsConnected(true));

    return () => closeWS();
  }, [fetchTasks, setWsConnected]);

  return { connected: useStore((s) => s.wsConnected) };
};
