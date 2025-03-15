// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { bakeryExample } from '../example/bakery.ts';
import { RljsonTable } from '../rljson.ts';
import { ItemId, Ref, TableName } from '../typedefs.ts';

import { IdSetRef } from './id-set.ts';
import { PropertiesRef } from './properties.ts';

// .............................................................................
/**
 * A CollectionRef is a hash pointing to a collection
 */
export type CollectionRef = Ref;

// .............................................................................
/**
 * A collection assigns properties to item ids
 */
export interface Collection extends Json {
  /**
   * `base` an optional base collection that is extended by this collection
   */
  base: CollectionRef | null;

  /**
   * The table containing the item set of this collection
   */
  idSetsTable: TableName;

  /**
   * A reference to the ids of the items the collection is based on
   */
  idSet: IdSetRef;

  /**
   * The table containing the properties assigned to the items of this collection
   */
  properties: TableName;

  /**
   * Assign properties to each item of the collection.
   */
  assign: Record<ItemId, PropertiesRef>;
}

// .............................................................................
/**
 * A table containing collections
 */
export type CollectionsTable = RljsonTable<Collection, 'collections'>;

/**
 * Provides an example collectionsTable for test purposes
 */
export const exampleCollectionsTable: CollectionsTable = Object.freeze(
  bakeryExample.layers,
);
