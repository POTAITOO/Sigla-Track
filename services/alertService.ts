export const alertService = {
  // Success alerts - confirmation dialogs
  success: (
    title: string,
    message: string,
    onDismiss: () => void,
    buttons?: { text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }[]
  ) => {
    return { type: 'success' as const, title, message, onDismiss, buttons };
  },

  // Error alerts - critical failures that need attention
  error: (
    title: string,
    message: string,
    onDismiss: () => void,
    buttons?: { text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }[]
  ) => {
    return { type: 'error' as const, title, message, onDismiss, buttons };
  },

  // Warning alerts - confirm dangerous actions
  warning: (
    title: string,
    message: string,
    onDismiss: () => void,
    buttons?: { text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }[]
  ) => {
    return { type: 'warning' as const, title, message, onDismiss, buttons };
  },

  // Info alerts - general information
  info: (
    title: string,
    message: string,
    onDismiss: () => void,
    buttons?: { text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }[]
  ) => {
    return { type: 'info' as const, title, message, onDismiss, buttons };
  },
};
