// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { JsonH } from '@rljson/json';

import { carExample } from '../example/cars-example.ts';
import { RljsonTable } from '../rljson.ts';
import { Ref } from '../typedefs.ts';


// .............................................................................

/**
 * A reference to a single Layers row in a Layers table
 */
export type LayersRef = Ref;

// .............................................................................

/**
 * A single item in a Layers table
 */
export type LayersItem = {
  _indexRef: LayersRef;
  [key: `${string}Ref`]: LayersRef;
} & JsonH;

export type Layer = { items: Array<LayersItem> } & { _hash: string };

// .............................................................................
/**
 * A table containing Layer items
 */
export type LayersTable<T extends Layer> = RljsonTable<T>;

// .............................................................................
/**
 * Provides an example components table for test purposes
 */
export const exampleLayersTable = (): LayersTable<Layer> =>
  carExample().carIndexLayer;
