// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';

import { describe, expect, it } from 'vitest';

import { SliceIds, SliceIdsTable } from '../../src/content/slice-ids';
import { ref } from '../../src/tools/ref';
import {
  mergeSliceIds,
  resolveSliceIds,
} from '../../src/tools/resolve-slice-ids';

const cars2025 = hip<SliceIds>({ add: ['taycan', 'macan', 'ex30', 'xc40'] });
const cars2026 = hip<SliceIds>({
  base: ref(cars2025),
  add: ['ex90'],
  remove: ['macan'],
});
const cars2027 = hip<SliceIds>({
  base: ref(cars2026),
  add: ['macan'],
  remove: ['ex30'],
});
const catalogs = hip<SliceIdsTable>({
  _type: 'sliceIds',
  _data: [cars2025, cars2026, cars2027],
});

describe('mergeSliceIds(base, row)', () => {
  it('returns the slice ids of a row without a base', () => {
    expect(mergeSliceIds([], cars2025)).toEqual([
      'taycan',
      'macan',
      'ex30',
      'xc40',
    ]);
  });

  it('adds and removes slice ids of the base', () => {
    expect(mergeSliceIds(['a', 'b'], { add: ['c'], remove: ['a'] })).toEqual([
      'b',
      'c',
    ]);
  });

  it('keeps each slice id once', () => {
    expect(mergeSliceIds(['a', 'b'], { add: ['b', 'c', 'c'] })).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('removes a slice id that the row adds and removes', () => {
    expect(mergeSliceIds([], { add: ['a', 'b'], remove: ['a'] })).toEqual([
      'b',
    ]);
  });
});

describe('resolveSliceIds(table, row)', () => {
  it('returns the slice ids of a row without a base', () => {
    expect(resolveSliceIds(catalogs, cars2025)).toEqual([
      'taycan',
      'macan',
      'ex30',
      'xc40',
    ]);
  });

  it('resolves a derived row', () => {
    expect(resolveSliceIds(catalogs, cars2026)).toEqual([
      'taycan',
      'ex30',
      'xc40',
      'ex90',
    ]);
  });

  it('resolves a chain of bases', () => {
    expect(resolveSliceIds(catalogs, cars2027)).toEqual([
      'taycan',
      'xc40',
      'ex90',
      'macan',
    ]);
  });

  it('throws if a base is not in the table', () => {
    const table = hip<SliceIdsTable>({ _type: 'sliceIds', _data: [cars2025] });

    // cars2027 builds on cars2026, which is missing
    expect(() => resolveSliceIds(table, cars2027)).toThrow(
      `rowOf: The table has no row with hash "${ref(cars2026)}".`,
    );
  });

  it('throws if the bases form a cycle', () => {
    // Hashed rows cannot form a cycle, so write the hashes by hand
    const a: SliceIds = { _hash: 'A', base: 'B', add: ['a'] };
    const b: SliceIds = { _hash: 'B', base: 'A', add: ['b'] };
    const table = { _type: 'sliceIds', _data: [a, b] } as SliceIdsTable;

    expect(() => resolveSliceIds(table, a)).toThrow(
      'resolveSliceIds: The bases of the row form a cycle at "B".',
    );
  });
});
