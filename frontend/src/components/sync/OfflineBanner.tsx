/**
 * Banner displayed when the user is offline.
 */

import { useSyncStore } from '@/stores/syncStore';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const isOnline = useSyncStore((state) => state.isOnline);
  const pendingCount = useSyncStore((state) => state.pendingCount);

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <WifiOff className="h-4 w-4" />
      <span>
        You&apos;re offline.
        {pendingCount > 0 &&
          ` ${pendingCount} pending change${pendingCount > 1 ? 's' : ''} will sync when you reconnect.`}
        {pendingCount === 0 && ' Changes will sync when you reconnect.'}
      </span>
    </div>
  );
}
