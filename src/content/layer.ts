// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { bakeryExample } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { ItemId, Ref, TableKey } from '../typedefs.ts';

import { IngredientsRef } from './ingredients.ts';
import { SliceIdsRef } from './slice-ids.ts';

// .............................................................................
/**
 * A LayerRef is a hash pointing to a layer
 */
export type LayerRef = Ref;

// .............................................................................
/**
 * A layer assigns ingredients to item ids
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
  idSet?: SliceIdsRef;

  /**
   * The table containing the item ids of the layer
   */
  idSetsTable?: TableKey;

  /**
   * The table containing the ingredients that are assigned to the items
   * with the assign property below
   */
  ingredientsTable: TableKey;

  /**
   * Assign ingredients to each item of the layer.
   */
  assign: Record<ItemId, IngredientsRef>;
}

// .............................................................................
/**
 * A table containing layers
 */
export type LayersTable = RljsonTable<Layer, 'layers'>;

/**
 * Provides an example layersTable for test purposes
 */
export const exampleLayersTable = (): LayersTable => bakeryExample().layers;
