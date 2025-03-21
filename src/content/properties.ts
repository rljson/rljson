// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { bakeryExample, NutritionalValues } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { Ref } from '../typedefs.ts';

// .............................................................................

/**
 * A reference to a properties row in a properties table
 */
export type PropertiesRef = Ref;

// .............................................................................
/**
 * A table containing item properties
 */
export type PropertiesTable<T extends Json> = RljsonTable<T, 'properties'>;

/**
 * Provides an example collectionsTable for test purposes
 */
export const examplePropertiesTable = (): PropertiesTable<NutritionalValues> =>
  bakeryExample().nutritionalValues;
