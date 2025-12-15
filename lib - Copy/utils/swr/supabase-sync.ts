import mutate from 'swr';
import { createClient } from '@/lib/utils/supabase/client';

// Real-time subscription manager for Supabase
export class SupabaseRealtimeSync {
  private subscriptions: Map<string, any> = new Map();
  private supabase = createClient();

  // Subscribe to table changes and automatically update SWR cache
  subscribeToTable(
    tableName: string,
    userId?: string,
    options: {
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
      filter?: string;
    } = {},
  ) {
    const { event = '*', filter } = options;
    const key = `${tableName}-${userId || 'global'}`;
    
    // Unsubscribe if already subscribed
    if (this.subscriptions.has(key)) {
      this.unsubscribeFromTable(tableName, userId);
    }

    const channel = this.supabase
      .channel(`${tableName}-changes`)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table: tableName,
          filter: filter || (userId ? `user_id=eq.${userId}` : undefined),
        },
        (payload: any) => {
          this.handleTableChange(tableName, userId, payload);
        },
      )
      .subscribe();

    this.subscriptions.set(key, channel);
    
    return () => this.unsubscribeFromTable(tableName, userId);
  }

  // Handle table changes and update SWR cache
  private async handleTableChange(
    tableName: string,
    userId: string | undefined,
    payload: any,
  ) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Generate the SWR key based on table and user
    const swrKey = userId ? `${tableName}-${userId}` : tableName;
    
    try {
      // Get current data from SWR cache
      const currentData = await mutate(swrKey);
      
      if (eventType === 'INSERT') {
        // Add new record to cache
        if (currentData && Array.isArray(currentData)) {
          const updatedData = [newRecord, ...currentData];
          await mutate(swrKey, updatedData, false);
        }
      } else if (eventType === 'UPDATE') {
        // Update existing record in cache
        if (currentData && Array.isArray(currentData)) {
          const updatedData = currentData.map((item: any) =>
            item.id === newRecord.id ? { ...item, ...newRecord } : item,
          );
          await mutate(swrKey, updatedData, false);
        }
      } else if (eventType === 'DELETE') {
        // Remove deleted record from cache
        if (currentData && Array.isArray(currentData)) {
          const updatedData = currentData.filter((item: any) => item.id !== oldRecord.id);
          await mutate(swrKey, updatedData, false);
        }
      }
      
      // Trigger revalidation to ensure data consistency
      await mutate(swrKey);
      
    } catch (error) {
      console.error(`Error handling ${tableName} change:`, error);
    }
  }

  // Unsubscribe from table changes
  unsubscribeFromTable(tableName: string, userId?: string) {
    const key = `${tableName}-${userId || 'global'}`;
    const subscription = this.subscriptions.get(key);
    
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  // Unsubscribe from all tables
  unsubscribeFromAll() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  // Get subscription status
  isSubscribed(tableName: string, userId?: string): boolean {
    const key = `${tableName}-${userId || 'global'}`;
    return this.subscriptions.has(key);
  }
}

// Global instance
export const supabaseRealtimeSync = new SupabaseRealtimeSync();

// Utility functions for common operations - only use existing tables
export const syncUserData = (userId: string) => {
  // Subscribe to existing tables only
  supabaseRealtimeSync.subscribeToTable('users', userId);
  supabaseRealtimeSync.subscribeToTable('subscriptions', userId);
  supabaseRealtimeSync.subscribeToTable('customers', userId);
  // Note: products and prices are global, not user-specific
  supabaseRealtimeSync.subscribeToTable('products');
  supabaseRealtimeSync.subscribeToTable('prices');
};

export const stopUserDataSync = (userId: string) => {
  // Unsubscribe from existing tables only
  supabaseRealtimeSync.unsubscribeFromTable('users', userId);
  supabaseRealtimeSync.unsubscribeFromTable('subscriptions', userId);
  supabaseRealtimeSync.unsubscribeFromTable('customers', userId);
  supabaseRealtimeSync.unsubscribeFromTable('products');
  supabaseRealtimeSync.unsubscribeFromTable('prices');
};

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    supabaseRealtimeSync.unsubscribeFromAll();
  });
}
