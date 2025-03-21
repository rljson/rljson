// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { bakeryExample } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { ItemId, Ref } from '../typedefs.ts';

// .............................................................................
/**
 * An IdSetRef is a hash pointing to an Ids
 */
export type IdSetRef = Ref;

// .............................................................................
/**
 * An Ids manages list of item ids
 */
export interface IdSet extends Json {
  /**
   * The hash of another item id list which is extended by this one.
   * Must be empty or null, when the list is the root.
   */
  base?: IdSetRef;

  /**
   * The item ids added to base
   */
  add: ItemId[];

  /**
   * The item ids removed from base
   */
  remove?: ItemId[];
}

// .............................................................................
/**
 * A table containing item ids
 */
export type IdSetsTable = RljsonTable<IdSet, 'idSets'>;

// .............................................................................
/**
 * Returns one of the layers of the example cake
 */
export const exampleIdSetsTable = (): IdSetsTable => bakeryExample().slices;
