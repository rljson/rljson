// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { SliceIds, SliceIdsTable } from '../content/slice-ids.ts';
import { SliceId } from '../typedefs.ts';

import { rowOf } from './ref.ts';

/**
 * Merges a row of slice ids with the resolved slice ids of its base.
 *
 * Starts with the slice ids of the base, adds the slice ids of the row and
 * drops the removed ones. Each slice id appears once, in the order it was
 * added first.
 * @param base - The resolved slice ids of `row.base`, or [] without a base
 * @param row - The row of slice ids
 * @returns The slice ids of the row
 */
export const mergeSliceIds = (base: SliceId[], row: SliceIds): SliceId[] => {
  const result = new Set<SliceId>([...base, ...row.add]);
  for (const sliceId of row.remove ?? []) {
    result.delete(sliceId);
  }
  return Array.from(result);
};

/**
 * Resolves a row of slice ids: follows its `base` chain within the table
 * and merges each row with its base.
 * @param table - The table that holds the row and its bases
 * @param row - The row of slice ids, e.g. a derived catalog
 * @returns The slice ids of the row
 * @throws Error if a base is not in the table, or if the bases form a cycle
 */
export const resolveSliceIds = (
  table: SliceIdsTable,
  row: SliceIds,
): SliceId[] => {
  // Collect the chain from the row down to the first row without a base
  const chain: SliceIds[] = [row];
  const visited = new Set<string>();
  let current = row;
  while (current.base) {
    if (visited.has(current.base)) {
      throw new Error(
        `resolveSliceIds: The bases of the row form a cycle at "${current.base}".`,
      );
    }
    visited.add(current.base);
    current = rowOf(table, current.base);
    chain.push(current);
  }

  // Merge from the first base up to the row
  return chain.reduceRight<SliceId[]>(mergeSliceIds, []);
};
