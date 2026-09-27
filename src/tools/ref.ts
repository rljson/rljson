// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { RljsonTable } from '../rljson.ts';
import { ContentType, Ref, Row } from '../typedefs.ts';

/**
 * Returns the reference to a row: the hash that `hip` has written into it.
 *
 * Other rows refer to the row by this reference.
 * @param row - A row hashed with `hip` from `@rljson/hash`
 * @returns The hash of the row
 * @throws Error if the row has no hash
 */
export const ref = (row: Row): Ref => {
  const hash = row._hash;
  if (!hash) {
    throw new Error('ref: The row has no _hash. Hash it with hip first.');
  }

  return hash;
};

/**
 * Follows a reference: returns the row of a table that has the given hash.
 *
 * Searches the rows one by one.
 * @param table - The table to search
 * @param hash - The reference to the row: its hash
 * @returns The row with the given hash
 * @throws Error if the table has no row with the given hash
 */
export const rowOf = <T extends Row>(
  table: RljsonTable<T, ContentType>,
  hash: Ref,
): T => {
  const row = table._data.find((row) => row._hash === hash);
  if (!row) {
    throw new Error(`rowOf: The table has no row with hash "${hash}".`);
  }

  return row;
};
