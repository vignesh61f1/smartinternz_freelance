import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../socket/socket';
import { useAuth } from '../context/AuthContext';

const useSocket = () => {
  const { token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (token) {
      socketRef.current = connectSocket(token);
    }
    return () => {
      disconnectSocket();
    };
  }, [token]);

  const emit = (event, data) => {
    const s = getSocket();
    if (s) s.emit(event, data);
  };

  const on = (event, callback) => {
    const s = getSocket();
    if (s) s.on(event, callback);
  };

  const off = (event, callback) => {
    const s = getSocket();
    if (s) s.off(event, callback);
  };

  return { socket: socketRef.current, emit, on, off };
};

export default useSocket;
