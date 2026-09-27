// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { bakeryExample } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { Ref, SliceId } from '../typedefs.ts';

import { TableCfg } from './table-cfg.ts';

// .............................................................................
/**
 * A reference to a row of type `SliceIds`: the hash of that row
 */
export type SliceIdsRef = Ref;

// .............................................................................
/**
 * A set of slice ids, e.g. the cars of a catalog.
 *
 * A row can extend a base row. Its slice ids are then the slice ids of the
 * base, plus `add`, minus `remove`. So a derived row stores only the
 * difference.
 * @example
 * ```ts
 * const cars2025 = hip<SliceIds>({ add: ['taycan', 'macan', 'ex30'] });
 *
 * // The cars of 2026: taycan, ex30, ex90
 * const cars2026 = hip<SliceIds>({
 *   base: ref(cars2025),
 *   add: ['ex90'],
 *   remove: ['macan'],
 * });
 * ```
 */
export interface SliceIds extends Json {
  /**
   * Optional: the reference to the row of slice ids that this row extends
   */
  base?: SliceIdsRef;

  /**
   * The slice ids added to the base
   */
  add: SliceId[];

  /**
   * Optional: the slice ids removed from the base
   */
  remove?: SliceId[];
}

// .............................................................................
/**
 * A table of type `sliceIds` whose rows are sets of slice ids
 */
export type SliceIdsTable = RljsonTable<SliceIds, 'sliceIds'>;

// .............................................................................
/**
 * Returns the slice ids table of the bakery example
 */
export const exampleSliceIdsTable = (): SliceIdsTable => bakeryExample().slices;

// .............................................................................
/**
 * Creates the table configuration of a slice ids table
 * @param tableKey - the table key
 * @returns the table configuration
 */
export const createSliceIdsTableCfg = (tableKey: string): TableCfg =>
  ({
    key: tableKey,
    type: 'sliceIds',
    columns: [
      { key: '_hash', type: 'string', titleLong: 'Hash', titleShort: 'Hash' },
      {
        key: 'base',
        type: 'string',
        titleLong: 'Base SliceIds',
        titleShort: 'Base',
      },
      {
        key: 'add',
        type: 'jsonArray',
        titleLong: 'Added SliceIds',
        titleShort: 'Add',
      },
      {
        key: 'remove',
        type: 'jsonArray',
        titleLong: 'Removed SliceIds',
        titleShort: 'Remove',
      },
    ],
    isHead: false,
    isRoot: false,
    isShared: true,
  } as TableCfg);
