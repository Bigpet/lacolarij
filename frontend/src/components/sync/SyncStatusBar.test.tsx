/**
 * Tests for SyncStatusBar component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@/test/testUtils';
import { SyncStatusBar } from './SyncStatusBar';
import { useSyncStore } from '@/stores/syncStore';

describe('SyncStatusBar', () => {
  beforeEach(() => {
    // Reset store before each test
    useSyncStore.getState().reset();
  });

  it('should render synced state when idle and online', () => {
    useSyncStore.getState().setStatus('idle');
    useSyncStore.getState().setOnline(true);

    render(<SyncStatusBar />);

    expect(screen.getByText('Synced')).toBeInTheDocument();
    expect(screen.queryByText('Offline')).not.toBeInTheDocument();
  });

  it('should render syncing state', () => {
    useSyncStore.getState().setStatus('syncing');

    render(<SyncStatusBar />);

    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    useSyncStore.getState().setStatus('error');
    useSyncStore.getState().setError('Connection failed');

    render(<SyncStatusBar />);

    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should render offline indicator when offline', () => {
    useSyncStore.getState().setOnline(false);

    render(<SyncStatusBar />);

    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should not render offline indicator when online', () => {
    useSyncStore.getState().setOnline(true);

    render(<SyncStatusBar />);

    expect(screen.queryByText('Offline')).not.toBeInTheDocument();
  });

  it('should display pending count badge', () => {
    useSyncStore.getState().setPendingCount(5);

    render(<SyncStatusBar />);

    expect(screen.getByText('5 pending')).toBeInTheDocument();
  });

  it('should not display pending badge when count is zero', () => {
    useSyncStore.getState().setPendingCount(0);

    render(<SyncStatusBar />);

    expect(screen.queryByText(/pending/)).not.toBeInTheDocument();
  });

  it('should display single conflict badge', () => {
    useSyncStore.getState().addConflict({
      id: 'conflict-1',
      entityType: 'issue',
      entityId: 'issue-1',
      localValue: {},
      remoteValue: {},
      localTimestamp: Date.now(),
      remoteTimestamp: '2024-01-01',
    });

    render(<SyncStatusBar />);

    expect(screen.getByText('1 conflict')).toBeInTheDocument();
  });

  it('should display multiple conflicts badge', () => {
    useSyncStore.getState().addConflict({
      id: 'conflict-1',
      entityType: 'issue',
      entityId: 'issue-1',
      localValue: {},
      remoteValue: {},
      localTimestamp: Date.now(),
      remoteTimestamp: '2024-01-01',
    });
    useSyncStore.getState().addConflict({
      id: 'conflict-2',
      entityType: 'issue',
      entityId: 'issue-2',
      localValue: {},
      remoteValue: {},
      localTimestamp: Date.now(),
      remoteTimestamp: '2024-01-01',
    });

    render(<SyncStatusBar />);

    expect(screen.getByText('2 conflicts')).toBeInTheDocument();
  });

  it('should not display conflicts badge when no conflicts', () => {
    render(<SyncStatusBar />);

    expect(screen.queryByText(/conflict/)).not.toBeInTheDocument();
  });

  it('should display last sync time', () => {
    const now = new Date();
    useSyncStore.getState().setLastSync(now);

    render(<SyncStatusBar />);

    expect(screen.getByText(/Last sync:/)).toBeInTheDocument();
  });

  it("should display 'Never' when no last sync time", () => {
    useSyncStore.getState().setLastSync(null);

    render(<SyncStatusBar />);

    expect(screen.getByText('Last sync: Never')).toBeInTheDocument();
  });

  it('should display relative time for recent sync', () => {
    const justNow = new Date();
    useSyncStore.getState().setLastSync(justNow);

    render(<SyncStatusBar />);

    expect(screen.getByText(/Last sync: Just now/)).toBeInTheDocument();
  });

  it('should display both pending and conflicts badges', () => {
    useSyncStore.getState().setPendingCount(3);
    useSyncStore.getState().addConflict({
      id: 'conflict-1',
      entityType: 'issue',
      entityId: 'issue-1',
      localValue: {},
      remoteValue: {},
      localTimestamp: Date.now(),
      remoteTimestamp: '2024-01-01',
    });

    render(<SyncStatusBar />);

    expect(screen.getByText('3 pending')).toBeInTheDocument();
    expect(screen.getByText('1 conflict')).toBeInTheDocument();
  });

  it('should display offline indicator with synced state when offline', () => {
    useSyncStore.getState().setStatus('idle');
    useSyncStore.getState().setOnline(false);

    render(<SyncStatusBar />);

    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.queryByText('Synced')).not.toBeInTheDocument();
  });

  it('should display syncing indicator even when offline', () => {
    useSyncStore.getState().setStatus('syncing');
    useSyncStore.getState().setOnline(false);

    render(<SyncStatusBar />);

    expect(screen.getByText('Syncing...')).toBeInTheDocument();
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should display error message in title attribute', () => {
    useSyncStore.getState().setStatus('error');
    useSyncStore.getState().setError('Network timeout');

    render(<SyncStatusBar />);

    const errorElement = screen.getByText('Error');
    expect(errorElement).toHaveAttribute('title', 'Network timeout');
  });
});
