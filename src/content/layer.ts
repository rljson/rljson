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
import { TableCfg } from './table-cfg.ts';


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
   * `base` an optional base layer that is extended or shrinked by this layer
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
   * Assigns component properties to slice ids.
   *
   * If base is defined this will add
   * or override assignments of the base layer.
   */
  add: Record<SliceId, ComponentRef>;

  /**
   * Use this property to remove assignments from the base layer.
   */
  remove?: Record<SliceId, ComponentRef>;
}

// .............................................................................
/**
 * A table containing layers
 */
export type LayersTable = RljsonTable<Layer, 'layers'>;

// .............................................................................
/**
 * Sample Table as BoilerPlate for Tests and Examples
 * @param layerKey - the key of the layer table
 */
export const createLayerTableCfg = (layerKey: string): TableCfg => ({
  key: layerKey,
  type: 'layers',
  columns: [
    { key: '_hash', type: 'string', titleLong: 'Hash', titleShort: 'Hash' },
    { key: 'base', type: 'string', titleLong: 'Base', titleShort: 'Base' },
    {
      key: 'sliceIdsTable',
      type: 'string',
      titleLong: 'Slice Ids Table',
      titleShort: 'Slice Ids Table',
    },
    {
      key: 'sliceIdsTableRow',
      type: 'string',
      titleLong: 'Slice Ids Table Row',
      titleShort: 'Slice Ids Table Row',
    },
    {
      key: 'componentsTable',
      type: 'string',
      titleLong: 'Components Table',
      titleShort: 'Components Table',
    },
    { key: 'add', type: 'json', titleLong: 'Add', titleShort: 'Add' },
    { key: 'remove', type: 'json', titleLong: 'Remove', titleShort: 'Remove' },
  ],
  isHead: false,
  isRoot: false,
  isShared: true,
});

/**
 * Provides an example layersTable for test purposes
 */
export const exampleLayersTable = (): LayersTable =>
  bakeryExample().recipeLayers;
