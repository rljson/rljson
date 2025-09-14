// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { carExample } from '../example/cars-example.ts';
import { RljsonTable } from '../rljson.ts';
import { Ref } from '../typedefs.ts';


// .............................................................................

/**
 * A reference to a single Layers row in a Layers table
 */
export type LayerRef = Ref;

// .............................................................................

/**
 * LayerItem type built by the referenced layers or components by passing
 * them as key-value pairs to the generic type
 */
export type LayerItem<T> = { _hash: string } & {
  [K in keyof T as `${string & K}Ref`]: LayerRef;
};

export type Layer<T> = RljsonTable<LayerItem<T>>;

// .............................................................................
/**
 * Provides an example components table for test purposes
 */
export const exampleLayer = (): Layer<{
  carIndex: LayerRef;
  carGeneral: LayerRef;
}> => carExample().carGeneralLayer;
