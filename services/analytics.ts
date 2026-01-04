// analytics.ts
import analytics from '@react-native-firebase/analytics';

// Log a custom event
export const logCustomEvent = async (eventName: string, params?: object) => {
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.warn('Analytics event error:', error);
  }
};

// Log a screen view
export const logScreenView = async (screenName: string, screenClass?: string) => {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    console.warn('Analytics screen view error:', error);
  }
};
