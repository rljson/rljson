// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip, rmhsh } from '@rljson/hash';

import { describe, expect, it } from 'vitest';

import { Rljson } from '../../dist/rljson';
import { removeDuplicates } from '../../src/tools/remove-duplicates';

describe('remove duplicates', () => {
  it('does nothing on empty rljson', () => {
    const rljson: Rljson = {};
    removeDuplicates(rljson);
    expect(rljson).toStrictEqual({});
  });

  it('removes duplicates from a table', () => {
    const rljson: Rljson = hip({
      tableA: {
        _type: 'components',
        _data: [
          { value: 1 },
          { value: 2 },
          { value: 1 }, // duplicate
          { value: 3 },
          { value: 2 }, // duplicate
        ],
      },

      tableB: {
        _type: 'components',
        _data: [
          { value: 'Hello' },
          { value: 'World' },
          { value: 'Hello' }, // duplicate
          { value: 'World' }, // duplicate
          { value: 'Hello' }, // duplicate
        ],
      },
    });

    const rljsonNoDup = rmhsh(removeDuplicates(rljson));

    expect(rljsonNoDup).toEqual({
      tableA: {
        _data: [{ value: 1 }, { value: 2 }, { value: 3 }],
        _type: 'components',
      },
      tableB: {
        _data: [{ value: 'Hello' }, { value: 'World' }],
        _type: 'components',
      },
    });
  });
});
