// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { carExample, CarIndex } from '../example/cars-example.ts';
import { RljsonTable } from '../rljson.ts';
import { JsonWithId, Ref } from '../typedefs.ts';


// .............................................................................

/**
 * A reference to a single Components row in a Components table
 */
export type ComponentsRef = Ref;

// .............................................................................
/**
 * A table containing Components
 */
export type ComponentsTable<T extends JsonWithId> = RljsonTable<T>;

/**
 * Provides an example components table for test purposes
 */
export const exampleComponentsTable = (): ComponentsTable<CarIndex> =>
  carExample().carIndex;
