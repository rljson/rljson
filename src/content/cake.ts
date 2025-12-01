// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { bakeryExample } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { Ref, SliceId, TableKey } from '../typedefs.ts';

import { LayerRef } from './layer.ts';
import { SliceIdsRef } from './slice-ids.ts';
import { TableCfg } from './table-cfg.ts';

// .............................................................................
/**
 * A `CakeLayerId` assigns an id or name to a cake layer
 */
export type CakeLayerId = string;

// .............................................................................
/**
 * A reference to a cake
 *
 * A cake reference can optionally restrict the slice ids that are used in the cake.
 */
export interface CakeReference extends Json {
  ref: Ref;
  sliceIds?: SliceId[];
}

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
  sliceIdsTable: TableKey;

  /**
   * A row in table, that contains the slice ids of the layer
   */
  sliceIdsRow: SliceIdsRef;

  /**
   * Assigns a layer to each layer of the cake.
   */
  layers: {
    [layerTable: TableKey]: LayerRef;
  };

  /**
   * An optional ID of the cake.
   */
  id?: string;
}

// .............................................................................
/**
 * A table containing cakes
 */
export type CakesTable = RljsonTable<Cake, 'cakes'>;

// .............................................................................
/**
 * Sample Table as BoilerPlate for Tests and Examples
 */
// .............................................................................
/**pnpm build
 * Sample Table as BoilerPlate for Tests and Examples
 * @param cakeKey - the key of the cake table cfg
 */
export const createCakeTableCfg = (cakeKey: string): TableCfg => ({
  key: cakeKey,
  type: 'cakes',
  columns: [
    { key: '_hash', type: 'string', titleLong: 'Hash', titleShort: 'Hash' },
    {
      key: 'sliceIdsTable',
      type: 'string',
      titleLong: 'Slice Ids Table',
      titleShort: 'Slice Ids Table',
    },
    {
      key: 'sliceIdsRow',
      type: 'string',
      titleLong: 'Slice Ids Row',
      titleShort: 'Slice Ids Row',
    },
    { key: 'layers', type: 'json', titleLong: 'Layers', titleShort: 'Layers' },
    { key: 'id', type: 'string', titleLong: 'ID', titleShort: 'ID' },
  ],
  isHead: false,
  isRoot: false,
  isShared: true,
});

// .............................................................................
/**
 * Provides an example cakes table for test purposes
 */
export const exampleCakesTable = (): CakesTable => bakeryExample().cakes;
