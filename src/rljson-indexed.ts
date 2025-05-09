// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hsh } from '@rljson/hash';
import { Json } from '@rljson/json';

import { Rljson } from './rljson.ts';

// .............................................................................
/**
 * An Rljson object where all tables' rows are indexed by their hash.
 */
export interface RljsonIndexed {
  [tableKey: string]: {
    _data: { [rowHash: string]: Json };
  };

  [key: `_${string}`]: any;
}

// .............................................................................
/**
 * Returns an rljson where all tables' rows are indexed by their hash.
 * @param rljson - The Rljson object to index
 * @returns The indexed Rljson object
 */
export const rljsonIndexed = (rljson: Rljson): RljsonIndexed => {
  const result: RljsonIndexed = {};

  // Iterate all slices of the rljson object
  for (const key in rljson) {
    // If slice is not an object, add it to the result
    const slice = rljson[key];
    if (typeof slice != 'object') {
      result[key] = slice as any;
      continue;
    }

    // Item has not _data field, add it to the result
    const dataIndexed: { [rowHash: string]: Json } = {};
    result[key] = { ...slice } as any;

    // Iterate all rows of the slice
    if (!Array.isArray(slice!._data)) {
      continue;
    }

    for (const row of slice!._data) {
      // Get or create the hash of the row
      const hashedRow = row._hash ? row : hsh(row);
      const hash = hashedRow._hash;

      // Write the row to the indexed data
      dataIndexed[hash] = hashedRow;
    }

    result[key]._data = dataIndexed;
  }

  return result;
};
