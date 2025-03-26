// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { bakeryExample } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { ItemId, Ref, TableKey } from '../typedefs.ts';

// .............................................................................
/**
 * A buffet id is a name or id of a buffet
 */
export type BuffetId = ItemId;

// .............................................................................
/**
 * A buffet is a collection of arbitrary but related items, e.g. cakes,
 * layers, or items.
 */
export interface Buffet extends Json {
  /**
   * The items of the buffet
   */
  items: Array<{
    /**
     * The table the item is taken from
     */
    table: TableKey;

    /**
     * The hash of the item in the able
     */
    ref: Ref;
  }>;
}

// .............................................................................
/**
 * A table containing buffets
 */
export type BuffetsTable = RljsonTable<Buffet, 'buffets'>;

// .............................................................................
export const exampleBuffetsTable = (): BuffetsTable => bakeryExample().buffets;
