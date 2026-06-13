import { useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';

export const useToast = () => {
  const dispatch = useDispatch();
  return {
    success: (message, title) => dispatch(addToast({ type: 'success', message, title })),
    error: (message, title) => dispatch(addToast({ type: 'error', message, title })),
    info: (message, title) => dispatch(addToast({ type: 'info', message, title })),
    warning: (message, title) => dispatch(addToast({ type: 'warning', message, title })),
  };
};
