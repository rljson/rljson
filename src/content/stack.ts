// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { carExample } from '../example/cars-example.ts';
import { RljsonTable } from '../rljson.ts';

import { LayerRef } from './layers.ts';


// .............................................................................
/**
 * A table containing Layers
 */
export type Stack<T> = RljsonTable<
  {
    _hash: string;
    base?: LayerRef;
  } & {
    [K in keyof T as `${string & K}`]: LayerRef;
  }
> & {
  _type: 'stack';
};

// .............................................................................
/**
 * Provides an example Stack for test purposes
 */
export const exampleStack = (): Stack<{
  carGeneralLayer: LayerRef;
}> => carExample().carGeneralStack;
