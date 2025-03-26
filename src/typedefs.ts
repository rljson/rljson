// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { JsonKey } from '@rljson/json';

/**
 * A ref is a hash that references to another element
 */
export type Ref = string;

/**
 * An `id` is a *user defined* name or identifier of an item.
 * It exists in parallel with the auto generated `_hash`.
 */
export type ItemId = string;

/**
 * A table id reference to a table. The table ids are used as keys in the top
 * level structure of an Rljson data object.
 */
export type TableKey = JsonKey;

/**
 * A column key is a key that references a column in a table
 */
export type ColumnKey = JsonKey;

/**
 * Types of tables that can be stored in an Rljson object
 *
 * - `buffets` Tables containing buffets
 * - `cakes` Tables containing cakes
 * - `layers` Tables containing layers
 * - `ids` Tables containing item ids
 * - `ingredients` Tables containing item ingredients
 */
export const contentTypes = [
  'buffets',
  'cakes',
  'layers',
  'idSets',
  'ingredients',
] as const;

export type ContentType = (typeof contentTypes)[number];

/**
 * An example object using the typedefs
 */
export const exampleTypedefs = (): {
  ref: Ref;
  sliceId: ItemId;
  tableKey: TableKey;
  contentType: ContentType;
} => {
  return {
    ref: 'ref',
    sliceId: 'sliceId',
    tableKey: 'tableKey',
    contentType: 'layers',
  };
};
