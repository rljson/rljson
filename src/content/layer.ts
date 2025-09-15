// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { bakeryExample } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { Ref, SliceId, TableKey } from '../typedefs.ts';

import { ComponentRef } from './components.ts';
import { SliceIdsRef } from './slice-ids.ts';

// .............................................................................
/**
 * A LayerRef is a hash pointing to a layer
 */
export type LayerRef = Ref;

// .............................................................................
/**
 * A layer assigns components to item ids
 */
export interface Layer extends Json {
  /**
   * `base` an optional base layer that is extended by this layer
   */
  base?: LayerRef;

  /**
   * The table containing the item ids of the layer
   */
  sliceIdsTable: TableKey;

  /**
   * A row in table, that contains the slice ids of the layer
   */
  sliceIdsTableRow: SliceIdsRef;

  /**
   * The table containing the components that are assigned to the items
   * with the assign property below
   */
  componentsTable: TableKey;

  /**
   * Assign components to each item of the layer.
   */
  assign: Record<SliceId, ComponentRef>;
}

// .............................................................................
/**
 * A table containing layers
 */
export type LayersTable = RljsonTable<Layer>;

/**
 * Provides an example layersTable for test purposes
 */
export const exampleLayersTable = (): LayersTable => bakeryExample().layers;
