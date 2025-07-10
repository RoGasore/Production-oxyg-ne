
import { useState, useEffect } from 'react';

// This hook syncs state to local storage so that it persists through a page refresh.
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // This effect runs only on the client, after the initial render.
  // This prevents a hydration mismatch between server-rendered and client-rendered HTML.
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        // The reviver function handles converting ISO date strings back to Date objects.
        const value = JSON.parse(item, (k, v) => {
          if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(v)) {
              return new Date(v);
          }
          return v;
        });
        setStoredValue(value);
      }
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
