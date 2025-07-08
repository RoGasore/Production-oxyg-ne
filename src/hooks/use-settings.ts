
import useLocalStorage from './use-local-storage';

export interface AppSettings {
  defaultProducer: string;
}

const defaultSettings: AppSettings = {
  defaultProducer: 'Rodrigue Gasore',
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('oxytrack-settings', defaultSettings);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({...prev, ...newSettings}));
  }

  return { settings, updateSettings };
}
