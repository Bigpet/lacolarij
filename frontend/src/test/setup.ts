import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { db } from '@/lib/db';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Reset IndexedDB before each test
beforeEach(async () => {
  // Close the Dexie database connection before deleting
  await db.close();
  const databases = await indexedDB.databases();
  for (const dbInfo of databases) {
    if (dbInfo.name) {
      await indexedDB.deleteDatabase(dbInfo.name);
    }
  }
  // Reopen the database
  await db.open();
});
