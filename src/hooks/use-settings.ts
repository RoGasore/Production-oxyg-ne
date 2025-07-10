import { useData } from '@/components/data-sync-provider';

export interface AppSettings {
  defaultProducer: string;
  companyName: string;
}

export function useSettings() {
  const { settings, updateSettings } = useData();
  return { settings, updateSettings };
}
