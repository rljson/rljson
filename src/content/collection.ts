// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { bakeryExample } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { ItemId, Ref, TableKey } from '../typedefs.ts';

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
  base?: CollectionRef;

  /**
   * The item ids of the collection. If present, the item ids in `assign`
   * must match these ids. The item id sets can be found in the idSets table.
   */
  idSet?: IdSetRef;

  /**
   * The table containing the item ids of the collection
   */
  idSetsTable?: TableKey;

  /**
   * The table containing the properties that are assigned to the items
   * with the assign property below
   */
  propertiesTable: TableKey;

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
export const exampleCollectionsTable = (): CollectionsTable =>
  bakeryExample().layers;
