// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';
import { carExample } from '../example/cars-example.ts';
import { Rljson } from '../rljson.ts';
import { ComponentsTable } from './components.ts';
import { Layer, LayerRef } from './layers.ts';
import { Stack } from './stack.ts';

export type Cluster<Str extends string> = Rljson & {
  [Property in Str as `${Lowercase<
    string & Property
  >}Index`]: ComponentsTable<Json>;
} & {
  [Property in Str as `${Lowercase<string & Property>}IndexLayer`]: Layer<{
    [key: string]: LayerRef;
  }>;
} & {
  [Property in Str as `${Lowercase<string & Property>}IndexStack`]: Stack<{
    [key: string]: LayerRef;
  }>;
} & {
  [Property in Str as `${Lowercase<string & Property>}Repository`]: Stack<{
    [key: string]: LayerRef;
  }>;
};

// .............................................................................
/**
 * Provides an example Cluster for test purposes
 */
export const exampleCluster = (): Cluster<'Car' | 'Wheel'> => carExample();
