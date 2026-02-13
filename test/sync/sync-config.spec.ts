// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import {
  SyncConfig,
  syncConfigCausalOnlyExample,
  syncConfigDefault,
  syncConfigFullExample,
} from '../../src/sync/sync-config.ts';

describe('SyncConfig', () => {
  describe('syncConfigDefault()', () => {
    it('returns an empty object (all features disabled)', () => {
      const config = syncConfigDefault();
      expect(config).toEqual({});
    });

    it('has no flags set', () => {
      const config = syncConfigDefault();
      expect(config.causalOrdering).toBeUndefined();
      expect(config.requireAck).toBeUndefined();
      expect(config.ackTimeoutMs).toBeUndefined();
      expect(config.includeClientIdentity).toBeUndefined();
    });
  });

  describe('syncConfigFullExample()', () => {
    it('returns a config with all features enabled', () => {
      const config = syncConfigFullExample();
      expect(config.causalOrdering).toBe(true);
      expect(config.requireAck).toBe(true);
      expect(config.ackTimeoutMs).toBe(5_000);
      expect(config.includeClientIdentity).toBe(true);
    });
  });

  describe('syncConfigCausalOnlyExample()', () => {
    it('has causalOrdering enabled and nothing else', () => {
      const config = syncConfigCausalOnlyExample();
      expect(config.causalOrdering).toBe(true);
      expect(config.requireAck).toBeUndefined();
      expect(config.ackTimeoutMs).toBeUndefined();
      expect(config.includeClientIdentity).toBeUndefined();
    });
  });

  describe('type structure', () => {
    it('allows partial configuration', () => {
      const ackOnly: SyncConfig = { requireAck: true, ackTimeoutMs: 3_000 };
      expect(ackOnly.requireAck).toBe(true);
      expect(ackOnly.ackTimeoutMs).toBe(3_000);
      expect(ackOnly.causalOrdering).toBeUndefined();
    });

    it('allows identity-only configuration', () => {
      const identityOnly: SyncConfig = { includeClientIdentity: true };
      expect(identityOnly.includeClientIdentity).toBe(true);
      expect(identityOnly.causalOrdering).toBeUndefined();
    });

    it('supports explicit false values', () => {
      const allOff: SyncConfig = {
        causalOrdering: false,
        requireAck: false,
        includeClientIdentity: false,
      };
      expect(allOff.causalOrdering).toBe(false);
      expect(allOff.requireAck).toBe(false);
      expect(allOff.includeClientIdentity).toBe(false);
    });

    it('supports ackTimeoutMs of zero (immediate)', () => {
      const immediate: SyncConfig = { requireAck: true, ackTimeoutMs: 0 };
      expect(immediate.ackTimeoutMs).toBe(0);
    });
  });
});
