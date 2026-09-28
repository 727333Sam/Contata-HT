import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initWS = (url = 'http://localhost:8000') => {
  if (socket) return socket;
  socket = io(url, { reconnection: true, reconnectionAttempts: 5, reconnectionDelay: 1000 });
  return socket;
};

export const getSocket = () => socket;

export const closeWS = () => {
  if (socket) { socket.disconnect(); socket = null; }
};
