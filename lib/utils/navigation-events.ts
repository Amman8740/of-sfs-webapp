// Simple event system for navigation without page redirects
class NavigationEventManager {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

export const navigationEvents = new NavigationEventManager();

// Event types
export const NAVIGATION_EVENTS = {
  SWITCH_TO_ACCOUNT: 'switch_to_account',
  SWITCH_TO_AGENCY: 'switch_to_agency',
  SWITCH_TO_CLIENT: 'switch_to_client',
} as const;
