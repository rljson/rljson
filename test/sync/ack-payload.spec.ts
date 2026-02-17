// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import {
  AckPayload,
  ackPayloadExample,
  ackPayloadPartialExample,
} from '../../src/sync/ack-payload.ts';

describe('AckPayload', () => {
  describe('ackPayloadExample()', () => {
    it('returns a successful acknowledgment', () => {
      const ack = ackPayloadExample();
      expect(ack.r).toBe('1700000000001:EfGh');
      expect(ack.ok).toBe(true);
      expect(ack.receivedBy).toBe(3);
      expect(ack.totalClients).toBe(3);
    });
  });

  describe('ackPayloadPartialExample()', () => {
    it('returns a partial / timed-out acknowledgment', () => {
      const ack = ackPayloadPartialExample();
      expect(ack.r).toBe('1700000000001:EfGh');
      expect(ack.ok).toBe(false);
      expect(ack.receivedBy).toBe(1);
      expect(ack.totalClients).toBe(3);
    });
  });

  describe('type structure', () => {
    it('requires only r and ok', () => {
      const minimal: AckPayload = { r: 'someRef', ok: true };
      expect(minimal.r).toBe('someRef');
      expect(minimal.ok).toBe(true);
      expect(minimal.receivedBy).toBeUndefined();
      expect(minimal.totalClients).toBeUndefined();
    });

    it('supports zero receivedBy for total failure', () => {
      const failed: AckPayload = {
        r: 'ref',
        ok: false,
        receivedBy: 0,
        totalClients: 5,
      };
      expect(failed.receivedBy).toBe(0);
      expect(failed.ok).toBe(false);
    });

    it('supports single client scenario', () => {
      const single: AckPayload = {
        r: 'ref',
        ok: true,
        receivedBy: 1,
        totalClients: 1,
      };
      expect(single.receivedBy).toBe(1);
      expect(single.totalClients).toBe(1);
    });
  });
});
