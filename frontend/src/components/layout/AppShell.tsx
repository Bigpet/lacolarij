import * as React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useSyncStore } from "@/stores/syncStore";
import { Header } from "./Header";
import { ConflictBanner } from "@/components/sync/ConflictBanner";
import { ConflictResolver } from "@/components/sync/ConflictResolver";

export function AppShell() {
  const { token } = useAuthStore();
  const conflicts = useSyncStore((state) => state.conflicts);
  const activeConnectionId = useSyncStore((state) => state.activeConnectionId);

  const [showConflictResolver, setShowConflictResolver] = React.useState(false);
  const [currentConflictIndex, setCurrentConflictIndex] = React.useState(0);

  // Redirect to login if not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleReviewConflicts = () => {
    setCurrentConflictIndex(0);
    setShowConflictResolver(true);
  };

  const handleCloseResolver = () => {
    // Move to next conflict or close
    if (currentConflictIndex < conflicts.length - 1) {
      setCurrentConflictIndex(currentConflictIndex + 1);
    } else {
      setShowConflictResolver(false);
      setCurrentConflictIndex(0);
    }
  };

  const currentConflict = conflicts[currentConflictIndex];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ConflictBanner onReviewClick={handleReviewConflicts} />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Conflict resolver modal */}
      {showConflictResolver && currentConflict && activeConnectionId && (
        <ConflictResolver
          conflict={currentConflict}
          connectionId={activeConnectionId}
          onClose={handleCloseResolver}
        />
      )}
    </div>
  );
}
