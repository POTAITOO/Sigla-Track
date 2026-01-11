import { FontAwesome6 } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onDismiss: () => void;
  buttons?: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
}

const alertConfig = {
  success: {
    icon: 'circle-check',
    bgColor: '#f0fdf4',
    borderColor: '#22c55e',
    titleColor: '#15803d',
    messageColor: '#166534',
    buttonBg: '#22c55e',
    iconColor: '#22c55e',
  },
  error: {
    icon: 'circle-xmark',
    bgColor: '#fef2f2',
    borderColor: '#ef4444',
    titleColor: '#991b1b',
    messageColor: '#7f1d1d',
    buttonBg: '#ef4444',
    iconColor: '#ef4444',
  },
  warning: {
    icon: 'triangle-exclamation',
    bgColor: '#fffbeb',
    borderColor: '#f59e0b',
    titleColor: '#92400e',
    messageColor: '#78350f',
    buttonBg: '#f59e0b',
    iconColor: '#f59e0b',
  },
  info: {
    icon: 'circle-info',
    bgColor: '#eff6ff',
    borderColor: '#3b82f6',
    titleColor: '#1e40af',
    messageColor: '#1e3a8a',
    buttonBg: '#3b82f6',
    iconColor: '#3b82f6',
  },
};

export default function CustomAlert({
  visible,
  type,
  title,
  message,
  onDismiss,
  buttons,
}: CustomAlertProps) {
  const config = alertConfig[type];
  const defaultButtons = (buttons !== undefined && buttons.length === 0) ? [] : (buttons || [{ text: 'OK', onPress: onDismiss }]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => onDismiss?.()}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, { backgroundColor: config.bgColor, borderLeftColor: config.borderColor }]}>
          {/* Icon and Title */}
          <View style={styles.headerContainer}>
            <FontAwesome6
              name={config.icon}
              size={32}
              color={config.iconColor}
              style={styles.icon}
            />
            <Text style={[styles.title, { color: config.titleColor }]}>
              {title}
            </Text>
          </View>

          {/* Message */}
          <Text style={[styles.message, { color: config.messageColor }]}>
            {message}
          </Text>

          {/* Buttons */}
          {defaultButtons.length > 0 && (
            <View style={styles.buttonContainer}>
              {defaultButtons.map((button, index) => {
                const isDestructive = button.style === 'destructive';
                const isCancel = button.style === 'cancel';

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      isDestructive && styles.destructiveButton,
                      isCancel && styles.cancelButton,
                      !isDestructive && !isCancel && [styles.primaryButton, { backgroundColor: config.buttonBg }],
                    ]}
                    onPress={() => {
                      button.onPress();
                      if (onDismiss) onDismiss();
                    }}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        isDestructive && styles.destructiveButtonText,
                        isCancel && styles.cancelButtonText,
                        !isDestructive && !isCancel && styles.primaryButtonText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 32,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    color: '#1f2937',
  },
  message: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 32,
    color: '#6b7280',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#6366f1',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  destructiveButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    borderWidth: 1.5,
  },
  destructiveButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 15,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 15,
  },
});
