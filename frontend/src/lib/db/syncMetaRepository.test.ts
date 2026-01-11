import { describe, it, expect, beforeEach } from 'vitest';
import { db, syncMetaRepository } from './index';

describe('syncMetaRepository', () => {
  beforeEach(async () => {
    await db.syncMeta.clear();
  });

  describe('setLastSyncTime', () => {
    it('stores sync time for a connection', async () => {
      await syncMetaRepository.setLastSyncTime('conn-1', 1234567890);

      const meta = await db.syncMeta.get('conn-1');
      expect(meta?.lastSyncTime).toBe(1234567890);
    });

    it('stores sync cursor when provided', async () => {
      await syncMetaRepository.setLastSyncTime(
        'conn-1',
        1234567890,
        'cursor123'
      );

      const meta = await db.syncMeta.get('conn-1');
      expect(meta?.lastSyncCursor).toBe('cursor123');
    });

    it('stores null cursor when not provided', async () => {
      await syncMetaRepository.setLastSyncTime('conn-1', 1234567890);

      const meta = await db.syncMeta.get('conn-1');
      expect(meta?.lastSyncCursor).toBeNull();
    });

    it('updates existing record', async () => {
      await syncMetaRepository.setLastSyncTime('conn-1', 1000);
      await syncMetaRepository.setLastSyncTime('conn-1', 2000, 'new-cursor');

      const meta = await db.syncMeta.get('conn-1');
      expect(meta?.lastSyncTime).toBe(2000);
      expect(meta?.lastSyncCursor).toBe('new-cursor');
    });
  });

  describe('getLastSyncTime', () => {
    it('returns undefined for non-existent connection', async () => {
      const time = await syncMetaRepository.getLastSyncTime('non-existent');
      expect(time).toBeUndefined();
    });

    it('returns the stored sync time', async () => {
      await syncMetaRepository.setLastSyncTime('conn-1', 1234567890);

      const time = await syncMetaRepository.getLastSyncTime('conn-1');
      expect(time).toBe(1234567890);
    });
  });

  describe('put', () => {
    it('stores a sync meta record', async () => {
      const meta = {
        id: 'test-conn',
        lastSyncTime: 12345,
        lastSyncCursor: 'abc123',
      };

      const id = await syncMetaRepository.put(meta);
      expect(id).toBe('test-conn');

      const stored = await db.syncMeta.get('test-conn');
      expect(stored).toEqual(meta);
    });
  });

  describe('get', () => {
    it('returns undefined for non-existent id', async () => {
      const result = await syncMetaRepository.get('non-existent');
      expect(result).toBeUndefined();
    });

    it('returns the stored meta', async () => {
      const meta = {
        id: 'test-conn',
        lastSyncTime: 12345,
        lastSyncCursor: null,
      };
      await db.syncMeta.put(meta);

      const result = await syncMetaRepository.get('test-conn');
      expect(result).toEqual(meta);
    });
  });
});
