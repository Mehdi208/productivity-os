// Notification Service for Productivity OS (Web Push & Local System Popups)

import { playTimerAlarm } from './audioAlert';

/**
 * Checks if the browser and OS support Web Notifications
 */
export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Returns current permission status: 'granted' | 'denied' | 'default' | 'unsupported'
 */
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

/**
 * Requests user permission to show system notifications
 */
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    localStorage.setItem('pos_notification_permission', permission);
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
};

/**
 * Shows a native system notification (lockscreen banner, popup like WhatsApp)
 * Priority: Service Worker Registration -> Native Notification -> In-app fallback
 */
export const showSystemNotification = async (title, options = {}) => {
  if (!isNotificationSupported()) return null;

  const permission = Notification.permission;
  if (permission !== 'granted') {
    return null;
  }

  const notificationOptions = {
    icon: options.icon || '/favicon.svg',
    badge: options.badge || '/favicon.svg',
    body: options.body || '',
    vibrate: options.vibrate || [200, 100, 200, 100, 400],
    data: options.data || { url: '/' },
    tag: options.tag || `notification-${Date.now()}`,
    renotify: true,
    requireInteraction: options.requireInteraction || false,
    ...options
  };

  // 1. Try Service Worker Registration (Required for Mobile Android/iOS lockscreen popups)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, notificationOptions);
        return true;
      }
    } catch (swErr) {
      console.warn('Service worker notification failed, falling back to window Notification:', swErr);
    }
  }

  // 2. Fallback to standard Window Notification (Desktop browsers)
  try {
    const notif = new Notification(title, notificationOptions);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (err) {
    console.warn('Window Notification constructor failed:', err);
    return false;
  }
};

/**
 * Sends an immediate test notification with sound to verify setup
 */
export const testNotification = async () => {
  const permission = await requestNotificationPermission();
  if (permission === 'granted') {
    // Play sound
    try {
      playTimerAlarm('digital', 0.6);
    } catch {}

    // Show popup
    await showSystemNotification('🎯 Productivity OS — Notification Active !', {
      body: 'Vos alertes d\'agenda et de fin de focus s\'afficheront désormais comme un message direct.',
      tag: 'test-notification'
    });
    return true;
  }
  return false;
};
