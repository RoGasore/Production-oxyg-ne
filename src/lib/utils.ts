import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as formatDateFns } from 'date-fns/format';
import { fr } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(milliseconds: number) {
  if (isNaN(milliseconds) || milliseconds < 0) {
    return "-";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
}

export function formatTime(date: Date | null | undefined) {
    if (!date) return '-';
    // Ensure date is a Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDateFns(dateObj, 'HH:mm', { locale: fr });
}

export function formatDate(date: Date | null | undefined) {
    if (!date) return '-';
    // Ensure date is a Date object
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDateFns(dateObj, 'P', { locale: fr });
}
