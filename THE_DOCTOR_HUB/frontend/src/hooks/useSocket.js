import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice';

let socketInstance = null;

export const useSocket = () => {
  const { user, accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !accessToken) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
      });
    }

    socketRef.current = socketInstance;

    socketInstance.emit('join', user._id);

    socketInstance.on('new_notification', (notification) => {
      dispatch(addNotification(notification));
    });

    return () => {
      socketInstance?.off('new_notification');
    };
  }, [user?._id, accessToken]);

  return socketRef.current;
};
