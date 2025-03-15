// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { bakeryExample } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { ItemId, Ref, TableName } from '../typedefs.ts';

// .............................................................................
/**
 * A buffet id is a name or id of a buffet
 */
export type BuffetId = ItemId;

// .............................................................................
/**
 * A buffet is a collection of arbitrary but related items, e.g. cakes,
 * collections, or items.
 */
export interface Buffet extends Json {
  /**
   * The items of the buffet
   */
  items: Array<{
    table: TableName;
    ref: Ref;
    // [key: string]: JsonValue;
  }>;
}

// .............................................................................
/**
 * A table containing buffets
 */
export type BuffetsTable = RljsonTable<Buffet, 'buffets'>;

// .............................................................................

export const exampleBuffetsTable: BuffetsTable = bakeryExample.buffets;
