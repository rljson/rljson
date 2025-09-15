// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { bakeryExample, NutritionalValues } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { JsonWithId, Ref } from '../typedefs.ts';

// .............................................................................

/**
 * A reference to a components row in a components table
 */
export type ComponentRef = Ref;

// .............................................................................
/**
 * A table containing components
 */
export type ComponentsTable<T extends JsonWithId> = RljsonTable<T>;

/**
 * Provides an example components table for test purposes
 */
export const exampleComponentsTable = (): ComponentsTable<NutritionalValues> =>
  bakeryExample().nutritionalValues;
