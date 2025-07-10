import { Logo } from '@/components/logo';

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="animate-pulse">
        <Logo className="h-24 w-24" />
      </div>
    </div>
  );
}
