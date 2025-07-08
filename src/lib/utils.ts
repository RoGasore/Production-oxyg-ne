
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(milliseconds: number) {
  if (isNaN(milliseconds) || milliseconds < 0) {
    return "N/A";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
}

export function formatTime(date: Date | null) {
    if (!date) return 'N/A';
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date | null) {
    if (!date) return 'N/A';
    return date.toLocaleDateString('fr-FR');
}
