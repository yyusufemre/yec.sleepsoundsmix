import { 
  getMessaging, 
  requestPermission, 
  getToken, 
  deleteToken,
  onMessage, 
  onNotificationOpenedApp, 
  getInitialNotification, 
  registerDeviceForRemoteMessages,
  AuthorizationStatus
} from '@react-native-firebase/messaging';
import { getApps } from '@react-native-firebase/app';
import { Alert, Platform, PermissionsAndroid } from 'react-native';

class NotificationService {
  // Firebase App'in hazır olmasını bekleyen yardımcı metod
  private async ensureMessaging() {
    let retryCount = 0;
    while (!getApps().length && retryCount < 10) {
      await new Promise<void>(resolve => setTimeout(resolve, 500));
      retryCount++;
    }
    
    if (getApps().length === 0) {
      throw new Error('Firebase App not initialized after retries');
    }
    
    return getMessaging();
  }

  async getPermissionStatus() {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }

      if (Platform.OS === 'android') {
        return true;
      }

      const messaging = await this.ensureMessaging();
      const authStatus = await requestPermission(messaging);
      return (
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      console.log('[NotificationService] Permission status error:', error);
      return false;
    }
  }

  async requestUserPermission() {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('[NotificationService] Android 13+ permission denied');
            return false;
          }
        }

        return true;
      }

      const messaging = await this.ensureMessaging();
      const authStatus = await requestPermission(messaging);
      
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('[NotificationService] Authorization status:', authStatus);
        await this.getFcmToken();
      }
      
      return enabled;
    } catch (error) {
      console.log('[NotificationService] Permission error:', error);
      return false;
    }
  }

  async getFcmToken() {
    try {
      const messaging = await this.ensureMessaging();
      
      if (Platform.OS === 'ios') {
        await registerDeviceForRemoteMessages(messaging);
      }
      
      const fcmToken = await getToken(messaging);
      if (fcmToken) {
        if (__DEV__) {
          console.log('[NotificationService] FCM Token:', fcmToken);
        }
      }
      return fcmToken || null;
    } catch (error) {
      if (__DEV__) {
        console.log('[NotificationService] Error getting token:', error);
      }
      return null;
    }
  }

  async deleteFcmToken() {
    try {
      const messaging = await this.ensureMessaging();
      await deleteToken(messaging);
      console.log('[NotificationService] FCM Token deleted');
      return true;
    } catch (error) {
      console.log('[NotificationService] Error deleting token:', error);
      return false;
    }
  }

  async setupListeners() {
    try {
      const messaging = await this.ensureMessaging();

      // Foreground message listener
      const unsubscribeOnMessage = onMessage(messaging, async remoteMessage => {
        if (__DEV__) {
          console.log('[NotificationService] Foreground message arrived!', JSON.stringify(remoteMessage));
        }
        
        Alert.alert(
          remoteMessage.notification?.title || 'Yeni Bildirim',
          remoteMessage.notification?.body || ''
        );
      });

      // Notification opened listener
      onNotificationOpenedApp(messaging, remoteMessage => {
        if (__DEV__) {
          console.log(
            '[NotificationService] Notification caused app to open from background state:',
            remoteMessage.notification,
          );
        }
      });

      // Initial notification check
      getInitialNotification(messaging)
        .then(remoteMessage => {
          if (remoteMessage) {
            if (__DEV__) {
              console.log(
                '[NotificationService] Notification caused app to open from quit state:',
                remoteMessage.notification,
              );
            }
          }
        })
        .catch(err => {
          if (__DEV__) {
            console.log('[NotificationService] Initial notification error:', err);
          }
        });

      return unsubscribeOnMessage;
    } catch (error) {
      console.log('[NotificationService] setupListeners error:', error);
      return () => {};
    }
  }
}

export default new NotificationService();
