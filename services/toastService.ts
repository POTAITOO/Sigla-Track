import Toast from 'react-native-toast-message';

export const toastService = {
  // Success messages - quick, positive feedback
  success: (message: string) => {
    Toast.show({
      type: 'success',
      text1: message,
      topOffset: 60,
    });
  },

  // Error messages - needs more time to read
  error: (message: string) => {
    Toast.show({
      type: 'error',
      text1: message,
      topOffset: 60,
    });
  },

  // Warning messages - destructive actions like delete
  warning: (message: string) => {
    Toast.show({
      type: 'warning',
      text1: message,
      topOffset: 60,
    });
  },

  // Info messages - quick notifications
  info: (message: string) => {
    Toast.show({
      type: 'info',
      text1: message,
      topOffset: 60,
    });
  },
};
