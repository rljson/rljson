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
 * A reference to a ingredients row in a ingredients table
 */
export type IngredientsRef = Ref;

// .............................................................................
/**
 * A table containing ingredients
 */
export type IngredientsTable<T extends JsonWithId> = RljsonTable<T>;

/**
 * Provides an example ingredients table for test purposes
 */
export const exampleIngredientsTable =
  (): IngredientsTable<NutritionalValues> => bakeryExample().nutritionalValues;
