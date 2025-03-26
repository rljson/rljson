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
 * A LayerRef is a hash pointing to a layer
 */
export type LayerRef = Ref;

// .............................................................................
/**
 * A layer assigns properties to item ids
 */
export interface Layer extends Json {
  /**
   * `base` an optional base layer that is extended by this layer
   */
  base?: LayerRef;

  /**
   * The item ids of the layer. If present, the item ids in `assign`
   * must match these ids. The item id sets can be found in the idSets table.
   */
  idSet?: IdSetRef;

  /**
   * The table containing the item ids of the layer
   */
  idSetsTable?: TableKey;

  /**
   * The table containing the properties that are assigned to the items
   * with the assign property below
   */
  propertiesTable: TableKey;

  /**
   * Assign properties to each item of the layer.
   */
  assign: Record<ItemId, PropertiesRef>;
}

// .............................................................................
/**
 * A table containing layers
 */
export type LayersTable = RljsonTable<Layer, 'layers'>;

/**
 * Provides an example layersTable for test purposes
 */
export const exampleLayersTable = (): LayersTable =>
  bakeryExample().layers;
