// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import {
  ConnectorPayload,
  connectorPayloadExample,
  connectorPayloadFullExample,
} from '../../src/sync/connector-payload.ts';

describe('ConnectorPayload', () => {
  describe('connectorPayloadExample()', () => {
    it('returns a minimal payload with only required fields', () => {
      const payload = connectorPayloadExample();
      expect(payload.o).toBe('1700000000000:AbCd');
      expect(payload.r).toBe('1700000000001:EfGh');
    });

    it('has no optional fields set', () => {
      const payload = connectorPayloadExample();
      expect(payload.c).toBeUndefined();
      expect(payload.t).toBeUndefined();
      expect(payload.seq).toBeUndefined();
      expect(payload.p).toBeUndefined();
      expect(payload.cksum).toBeUndefined();
    });
  });

  describe('connectorPayloadFullExample()', () => {
    it('returns a payload with all fields populated', () => {
      const payload = connectorPayloadFullExample();
      expect(payload.o).toBe('1700000000000:AbCd');
      expect(payload.r).toBe('1700000000001:EfGh');
      expect(payload.c).toBe('client_ExAmPlE12345');
      expect(payload.t).toBe(1700000000001);
      expect(payload.seq).toBe(42);
      expect(payload.p).toEqual(['1700000000000:XyZw']);
      expect(payload.cksum).toBe('sha256:abc123def456');
    });
  });

  describe('type structure', () => {
    it('is backward-compatible — old { o, r } payloads are valid', () => {
      const legacy: ConnectorPayload = { o: 'origin', r: 'ref' };
      expect(legacy.o).toBe('origin');
      expect(legacy.r).toBe('ref');
    });

    it('allows all optional fields to be set independently', () => {
      const withClientId: ConnectorPayload = {
        o: 'o',
        r: 'r',
        c: 'client_000000000000',
      };
      expect(withClientId.c).toBe('client_000000000000');

      const withTimestamp: ConnectorPayload = { o: 'o', r: 'r', t: 12345 };
      expect(withTimestamp.t).toBe(12345);

      const withSeq: ConnectorPayload = { o: 'o', r: 'r', seq: 1 };
      expect(withSeq.seq).toBe(1);

      const withPredecessors: ConnectorPayload = {
        o: 'o',
        r: 'r',
        p: ['a', 'b'],
      };
      expect(withPredecessors.p).toEqual(['a', 'b']);

      const withChecksum: ConnectorPayload = {
        o: 'o',
        r: 'r',
        cksum: 'sha256:xyz',
      };
      expect(withChecksum.cksum).toBe('sha256:xyz');
    });

    it('supports empty predecessors array', () => {
      const payload: ConnectorPayload = { o: 'o', r: 'r', p: [] };
      expect(payload.p).toEqual([]);
    });

    it('supports zero as valid sequence number', () => {
      const payload: ConnectorPayload = { o: 'o', r: 'r', seq: 0 };
      expect(payload.seq).toBe(0);
    });
  });
});
