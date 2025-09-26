// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json, JsonH, JsonValueH } from '@rljson/json';

import { bakeryExample, Ingredient } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { Ref } from '../typedefs.ts';

// .............................................................................

/**
 * A reference to a Edit row in a Edit table
 */
export type EditRef = Ref;

export type Edit<T extends Json> = {
  value: T & JsonValueH;
  route: string;
  origin?: Ref;
  previous?: EditRef;
  acknowledged?: boolean;
} & JsonH;

// .............................................................................
/**
 * A table containing components
 */
export type EditsTable<T extends Json> = RljsonTable<Edit<T>, 'edits'>;

/**
 * Provides an example Edits table for test purposes
 */
export const exampleEditsTable = (): EditsTable<Ingredient> =>
  bakeryExample().ingredientsEdits;
