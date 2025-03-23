// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { bakeryExample } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { ItemId, TableKey } from '../typedefs.ts';

import { CollectionRef } from './collection.ts';
import { IdSetRef } from './id-set.ts';

// .............................................................................
/**
 * A `CakeLayerId` assigns an id or name to a cake layer
 */
export type CakeLayerId = ItemId;

// .............................................................................
/**
 * A cake is a collection of layers.
 *
 * A layer is a collection of items.
 * All layers of a cake refer to the same items.
 */
export interface Cake extends Json {
  /**
   * The item ids of the collection. If present, the item ids in the layers
   * must match these ids. The item id sets can be found in the idSets table.
   */
  idSet?: IdSetRef;

  /**
   * The table containing the item collections defining the layers
   */
  collections: TableKey;

  /**
   * Assigns a collection to each layer of the cake.
   */
  layers: {
    [layerId: CakeLayerId]: CollectionRef;
  };
}

// .............................................................................
/**
 * A table containing cakes
 */
export type CakesTable = RljsonTable<Cake, 'cakes'>;

// .............................................................................
/**
 * Provides an example collectionsTable for test purposes
 */
export const exampleCakesTable = (): CakesTable => bakeryExample().cakes;
