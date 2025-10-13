// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { isTimeId, timeId } from '../../src/tools/time-id';

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
    expect(isTimeId('abcd:1234567890')).toBe(true);
    expect(isTimeId('abc:1234567890')).toBe(false);
    expect(isTimeId('abcd:abc')).toBe(false);
    expect(isTimeId('abcd-1234567890')).toBe(false);
    expect(isTimeId('abcd:1234567890:extra')).toBe(false);
    expect(isTimeId('')).toBe(false);
  });
});
