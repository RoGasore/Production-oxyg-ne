import useLocalStorage from './use-local-storage';

export interface AppSettings {
  defaultProducer: string;
  companyName: string;
}

const defaultSettings: AppSettings = {
  defaultProducer: 'Rodrigue Gasore',
  companyName: 'OxyTrack',
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('oxytrack-settings', defaultSettings);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({...prev, ...newSettings}));
  }

  return { settings, updateSettings };
}
