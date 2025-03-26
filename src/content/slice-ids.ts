// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { bakeryExample } from '../example/bakery-example.ts';
import { RljsonTable } from '../rljson.ts';
import { Ref, SliceId } from '../typedefs.ts';

// .............................................................................
/**
 * An SliceIdsRef is a hash pointing to an Ids
 */
export type SliceIdsRef = Ref;

// .............................................................................
/**
 * A list of slice ids
 */
export interface SliceIds extends Json {
  /**
   * The base list of slice ids
   */
  base?: SliceIdsRef;

  /**
   * The slice ids added to base
   */
  add: SliceId[];

  /**
   * The slice ids removed from base
   */
  remove?: SliceId[];
}

// .............................................................................
/**
 * A table containing slice ids
 */
export type SliceIdsTable = RljsonTable<SliceIds, 'idSets'>;

// .............................................................................
/**
 * Returns one of the layers of the example cake
 */
export const exampleSliceIdsTable = (): SliceIdsTable => bakeryExample().slices;
