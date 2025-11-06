// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import {
  getTimeIdTimestamp,
  getTimeIdUniquePart,
  isTimeId,
  timeId,
} from '../../src/tools/time-id';

describe('timeId', () => {
  it('returns different timeIds everytime', () => {
    const t1 = timeId();
    const t2 = timeId();
    expect(t1).not.toBe(t2);
    expect(t1.split(':').length).toBe(2);
    expect(t2.split(':').length).toBe(2);
  });
});
describe('isTimeId', () => {
  it('checks if id is timeId', () => {
    expect(isTimeId(timeId())).toBe(true);
    expect(isTimeId('invalid:id')).toBe(false);
    expect(isTimeId('1234567890:abcd')).toBe(true);
    expect(isTimeId('1234567890:abc')).toBe(false);
    expect(isTimeId('notanumber:abcd')).toBe(false);
    expect(isTimeId('')).toBe(false);
  });
});

describe('getTimeIdTimestamp', () => {
  it('extracts timestamp from timeId', () => {
    const id = timeId();
    const timestamp = Number(id.split(':')[0]);
    expect(timestamp).toBe(getTimeIdTimestamp(id));
    expect(timestamp).toBeLessThanOrEqual(Date.now());
    expect(timestamp).toBeGreaterThan(Date.now() - 1000);

    expect(getTimeIdTimestamp('invalid:id')).toBeNull();
  });
});

describe('getTimeIdUniquePart', () => {
  it('extracts unique part from timeId', () => {
    const id = timeId();
    const uniquePart = id.split(':')[1];
    expect(uniquePart.length).toBe(4);
    expect(uniquePart).toBe(getTimeIdUniquePart(id));

    expect(getTimeIdUniquePart('invalid:id')).toBeNull();
  });
});
