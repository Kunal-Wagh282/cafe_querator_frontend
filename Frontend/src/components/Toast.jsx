import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Ensure you import the CSS

const Toast = ({ text, type, time = 3000 ,position}) => {
  useEffect(() => {
    if (text) {
      switch (type) {
        case 'success':
          toast.success(text);
          break;
        case 'error':
          toast.error(text);
          break;
        case 'warning':
          toast.warning(text);
          break;
        case 'info':
          toast.info(text);
          break;
        default:
          toast(text); // Default toast notification if no type is specified
      }
    }
  }, [text, type]);

  return <ToastContainer autoClose={time} position={position} />;
};

export default Toast;
