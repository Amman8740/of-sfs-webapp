import { mutate } from 'swr';

// Generic optimistic update function
export const optimisticUpdate = async <T>(
  key: string,
  updateFn: (data: T) => T,
  rollbackFn?: () => void,
) => {
  try {
    // Get current data
    const currentData = await mutate(key);
    
    // Apply optimistic update
    const updatedData = updateFn(currentData as T);
    await mutate(key, updatedData, false);
    
    return updatedData;
  } catch (error) {
    // Rollback on error
    if (rollbackFn) {
      rollbackFn();
    }
    throw error;
  }
};

// Generic optimistic create function
export const optimisticCreate = async <T>(
  key: string,
  newItem: T,
  rollbackFn?: () => void,
) => {
  try {
    // Get current data
    const currentData = await mutate(key);
    
    // Apply optimistic create
    const updatedData = Array.isArray(currentData) ? [newItem, ...currentData] : [newItem];
    await mutate(key, updatedData, false);
    
    return updatedData;
  } catch (error) {
    // Rollback on error
    if (rollbackFn) {
      rollbackFn();
    }
    throw error;
  }
};

// Generic optimistic update item function
export const optimisticUpdateItem = async <T>(
  key: string,
  itemId: string | number,
  updates: Partial<T>,
  rollbackFn?: () => void,
) => {
  try {
    // Get current data
    const currentData = await mutate(key);
    
    // Apply optimistic update
    const updatedData = Array.isArray(currentData)
      ? currentData.map((item: any) =>
          item.id === itemId ? { ...item, ...updates } : item,
        )
      : currentData;
    
    await mutate(key, updatedData, false);
    
    return updatedData;
  } catch (error) {
    // Rollback on error
    if (rollbackFn) {
      rollbackFn();
    }
    throw error;
  }
};

// Generic optimistic delete function
export const optimisticDelete = async <T>(
  key: string,
  itemId: string | number,
  rollbackFn?: () => void,
) => {
  try {
    // Get current data
    const currentData = await mutate(key);
    
    // Apply optimistic delete
    const updatedData = Array.isArray(currentData)
      ? currentData.filter((item: any) => item.id !== itemId)
      : currentData;
    
    await mutate(key, updatedData, false);
    
    return updatedData;
  } catch (error) {
    // Rollback on error
    if (rollbackFn) {
      rollbackFn();
    }
    throw error;
  }
};

// Batch optimistic update function
export const batchOptimisticUpdate = async <T>(
  updates: Array<{ key: string; updateFn: (data: T) => T }>,
  rollbackFn?: () => void,
) => {
  try {
    const results = await Promise.all(
      updates.map(({ key, updateFn }) => optimisticUpdate(key, updateFn)),
    );
    
    return results;
  } catch (error) {
    // Rollback on error
    if (rollbackFn) {
      rollbackFn();
    }
    throw error;
  }
};

// Supabase-specific optimistic create
export const supabaseOptimisticCreate = async <T>(
  key: string,
  newItem: T,
  supabaseFn: () => Promise<any>,
  rollbackFn?: () => void,
) => {
  try {
    // Apply optimistic update
    const optimisticData = await optimisticCreate(key, newItem);
    
    // Make actual API call
    await supabaseFn();
    
    // Revalidate to ensure consistency
    await mutate(key);
    
    return optimisticData;
  } catch (error) {
    // Rollback on error
    if (rollbackFn) {
      rollbackFn();
    }
    throw error;
  }
};

// Supabase-specific optimistic update
export const supabaseOptimisticUpdate = async <T>(
  key: string,
  itemId: string | number,
  updates: Partial<T>,
  supabaseFn: () => Promise<any>,
  rollbackFn?: () => void,
) => {
  try {
    // Apply optimistic update
    const optimisticData = await optimisticUpdateItem(key, itemId, updates);
    
    // Make actual API call
    await supabaseFn();
    
    // Revalidate to ensure consistency
    await mutate(key);
    
    return optimisticData;
  } catch (error) {
    // Rollback on error
    if (rollbackFn) {
      rollbackFn();
    }
    throw error;
  }
};

// Supabase-specific optimistic delete
export const supabaseOptimisticDelete = async <T>(
  key: string,
  itemId: string | number,
  supabaseFn: () => Promise<any>,
  rollbackFn?: () => void,
) => {
  try {
    // Apply optimistic update
    const optimisticData = await optimisticDelete(key, itemId);
    
    // Make actual API call
    await supabaseFn();
    
    // Revalidate to ensure consistency
    await mutate(key);
    
    return optimisticData;
  } catch (error) {
    // Rollback on error
    if (rollbackFn) {
      rollbackFn();
    }
    throw error;
  }
};
