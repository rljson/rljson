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
export interface IndexedRljson {
  [tableName: string]: {
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
export const rljsonIndexed = (rljson: Rljson): IndexedRljson => {
  const result: IndexedRljson = {};

  // Iterate all items of the rljson object
  for (const key in rljson) {
    // If item is not an object, add it to the result
    const item = rljson[key];
    if (item! instanceof Object) {
      result[key] = item as any;
    }

    // Item has not _data field, add it to the result
    if (!('_data' in item)) {
      result[key] = item;
    }

    const dataIndexed: { [rowHash: string]: Json } = {};

    // Iterate all rows of the item
    for (const row of item!._data) {
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
