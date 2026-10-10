// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import {
  compareRefStamp,
  isRefStamp,
  RefStamp,
  refStampExample,
  StampPayload,
  stampPayloadExample,
} from '../../src/sync/ref-stamp.ts';

const stamp = (
  domain: string,
  epoch: number,
  hub: string,
  n: number,
): RefStamp => ({ domain, epoch, hub, n });

describe('RefStamp', () => {
  describe('compareRefStamp()', () => {
    it('returns 0 for equal stamps', () => {
      expect(compareRefStamp(stamp('d', 1, 'h', 1), stamp('d', 1, 'h', 1))).toBe(
        0,
      );
    });

    it('orders by domain first, whatever the other fields say', () => {
      const a = stamp('a', 9, 'z', 9);
      const b = stamp('b', 1, 'a', 1);
      expect(compareRefStamp(a, b)).toBeLessThan(0);
      expect(compareRefStamp(b, a)).toBeGreaterThan(0);
    });

    it('orders by epoch within one domain, numerically', () => {
      const a = stamp('d', 2, 'z', 9);
      const b = stamp('d', 10, 'a', 1);
      expect(compareRefStamp(a, b)).toBeLessThan(0);
      expect(compareRefStamp(b, a)).toBeGreaterThan(0);
    });

    it('orders by hub within one epoch — a split brain stays ordered', () => {
      const a = stamp('d', 3, 'hub-a', 9);
      const b = stamp('d', 3, 'hub-b', 1);
      expect(compareRefStamp(a, b)).toBeLessThan(0);
      expect(compareRefStamp(b, a)).toBeGreaterThan(0);
    });

    it('orders by n within one hub, numerically', () => {
      const a = stamp('d', 3, 'h', 9);
      const b = stamp('d', 3, 'h', 10);
      expect(compareRefStamp(a, b)).toBeLessThan(0);
      expect(compareRefStamp(b, a)).toBeGreaterThan(0);
    });

    it('is a total order: sorting any permutation gives one result', () => {
      const stamps = [
        stamp('b', 1, 'h', 1),
        stamp('a', 2, 'h', 1),
        stamp('a', 1, 'h2', 1),
        stamp('a', 1, 'h1', 2),
        stamp('a', 1, 'h1', 1),
      ];
      const expected = [
        stamp('a', 1, 'h1', 1),
        stamp('a', 1, 'h1', 2),
        stamp('a', 1, 'h2', 1),
        stamp('a', 2, 'h', 1),
        stamp('b', 1, 'h', 1),
      ];
      expect([...stamps].sort(compareRefStamp)).toEqual(expected);
      expect([...stamps].reverse().sort(compareRefStamp)).toEqual(expected);
    });

    it('is transitive', () => {
      const a = stamp('a', 1, 'h', 1);
      const b = stamp('a', 1, 'h', 2);
      const c = stamp('a', 2, 'h', 0);
      expect(compareRefStamp(a, b)).toBeLessThan(0);
      expect(compareRefStamp(b, c)).toBeLessThan(0);
      expect(compareRefStamp(a, c)).toBeLessThan(0);
    });
  });

  describe('isRefStamp()', () => {
    it('accepts a well-formed stamp', () => {
      expect(isRefStamp(refStampExample())).toBe(true);
      expect(isRefStamp(stamp('', 0, '', 0))).toBe(true);
    });

    it('rejects what is not an object', () => {
      expect(isRefStamp(undefined)).toBe(false);
      expect(isRefStamp(null)).toBe(false);
      expect(isRefStamp('d:1:h:1')).toBe(false);
      expect(isRefStamp(42)).toBe(false);
    });

    it('rejects a missing or mistyped string field', () => {
      expect(isRefStamp({ epoch: 1, hub: 'h', n: 1 })).toBe(false);
      expect(isRefStamp({ domain: 1, epoch: 1, hub: 'h', n: 1 })).toBe(false);
      expect(isRefStamp({ domain: 'd', epoch: 1, n: 1 })).toBe(false);
      expect(isRefStamp({ domain: 'd', epoch: 1, hub: 7, n: 1 })).toBe(false);
    });

    it('rejects an epoch or n that is not a non-negative integer', () => {
      const base = refStampExample();
      expect(isRefStamp({ ...base, epoch: -1 })).toBe(false);
      expect(isRefStamp({ ...base, epoch: 1.5 })).toBe(false);
      expect(isRefStamp({ ...base, epoch: '1' })).toBe(false);
      expect(isRefStamp({ ...base, n: -1 })).toBe(false);
      expect(isRefStamp({ ...base, n: Number.NaN })).toBe(false);
      expect(isRefStamp({ ...base, n: undefined })).toBe(false);
    });
  });

  describe('examples', () => {
    it('refStampExample() is a valid stamp', () => {
      expect(refStampExample()).toEqual({
        domain: 'example',
        epoch: 1,
        hub: 'hub_ExAmPlE',
        n: 1,
      });
    });

    it('stampPayloadExample() pairs a ref with a valid stamp', () => {
      const payload: StampPayload = stampPayloadExample();
      expect(payload.r).toBe('1700000000001:EfGh');
      expect(isRefStamp(payload.stamp)).toBe(true);
    });
  });
});
