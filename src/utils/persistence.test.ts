import { describe, it, expect, beforeEach, vi } from 'vitest';

// Define the custom safe storage wrapper logic for testing
const makeSafeStorage = (customStorage: Storage | null) => {
  const inMemoryStore: Record<string, string> = {};
  
  return {
    getItem: (key: string): string | null => {
      try {
        if (!customStorage) throw new Error("Restricted storage");
        return customStorage.getItem(key);
      } catch {
        return inMemoryStore[key] || null;
      }
    },
    setItem: (key: string, value: string): void => {
      try {
        if (!customStorage) throw new Error("Restricted storage");
        customStorage.setItem(key, value);
      } catch {
        inMemoryStore[key] = value;
      }
    },
    removeItem: (key: string): void => {
      try {
        if (!customStorage) throw new Error("Restricted storage");
        customStorage.removeItem(key);
      } catch {
        delete inMemoryStore[key];
      }
    }
  };
};

describe('Incognito Storage Sandbox Test Suite', () => {
  let mockLocalStorage: Record<string, string> = {};
  let storageStub: Storage;

  beforeEach(() => {
    mockLocalStorage = {};
    storageStub = {
      getItem: (key: string) => mockLocalStorage[key] || null,
      setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
      removeItem: (key: string) => { delete mockLocalStorage[key]; },
      clear: () => { mockLocalStorage = {}; },
      length: 0,
      key: (index: number) => null,
    } as unknown as Storage;
  });

  it('behaves correctly under normal standard mode (localStorage acts successfully)', () => {
    const storageWrapper = makeSafeStorage(storageStub);
    
    // Save state
    storageWrapper.setItem('ecoslate_activities', '["test-1"]');
    
    // Check it wrote to both underlying stub and is readable
    expect(mockLocalStorage['ecoslate_activities']).toBe('["test-1"]');
    expect(storageWrapper.getItem('ecoslate_activities')).toBe('["test-1"]');
    
    // Remove state
    storageWrapper.removeItem('ecoslate_activities');
    expect(mockLocalStorage['ecoslate_activities']).toBeUndefined();
    expect(storageWrapper.getItem('ecoslate_activities')).toBeNull();
  });

  it('fails gracefully under extreme Incognito mode (localStorage.setItem throws SecurityError)', () => {
    // Create a broken localStorage that throws upon any access (just like strict browser privacy settings)
    const restrictedStorageStub = {
      getItem: () => { throw new Error('Uncaught SecurityError: The operation is insecure.'); },
      setItem: () => { throw new Error('Uncaught SecurityError: The operation is insecure.'); },
      removeItem: () => { throw new Error('Uncaught SecurityError: The operation is insecure.'); }
    } as unknown as Storage;

    const storageWrapper = makeSafeStorage(restrictedStorageStub);

    // Assert that setting item does NOT crash our app/render tree
    expect(() => {
      storageWrapper.setItem('ecoslate_activities', '["test-incognito"]');
    }).not.toThrow();

    // Assert that it safely fell back to the in-memory state and is readable
    expect(storageWrapper.getItem('ecoslate_activities')).toBe('["test-incognito"]');

    // Assert that removing items does not crash
    expect(() => {
      storageWrapper.removeItem('ecoslate_activities');
    }).not.toThrow();
    
    expect(storageWrapper.getItem('ecoslate_activities')).toBeNull();
  });
});
