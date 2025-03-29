// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { bakeryExample } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { TableKey } from '../typedefs.ts';

import { LayerRef } from './layer.ts';
import { SliceIdsRef } from './slice-ids.ts';

// .............................................................................
/**
 * A `CakeLayerId` assigns an id or name to a cake layer
 */
export type CakeLayerId = string;

// .............................................................................
/**
 * A cake is a collection of layers.
 *
 * A layer is a collection of slices.
 * All layers of a cake refer to the same slices.
 */
export interface Cake extends Json {
  /**
   * The slice ids of the layer. If present, the slice ids of the cake
   * must match these slice ids of the layers.
   * The slice ids can be found in the idSet table.
   */
  sliceIds?: SliceIdsRef;

  /**
   * The table containing the slice ids of the layer
   */
  sliceIdsTable?: TableKey;

  /**
   * The table containing the slice layers defining the layers
   */
  layersTable: TableKey;

  /**
   * Assigns a layer to each layer of the cake.
   */
  layers: {
    [layerId: CakeLayerId]: LayerRef;
  };
}

// .............................................................................
/**
 * A table containing cakes
 */
export type CakesTable = RljsonTable<Cake, 'cakes'>;

// .............................................................................
/**
 * Provides an example cakes table for test purposes
 */
export const exampleCakesTable = (): CakesTable => bakeryExample().cakes;
