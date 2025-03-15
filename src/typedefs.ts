// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

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
export type TableName = ItemId;

/**
 * Types of tables that can be stored in an Rljson object
 *
 * - `buffets` Tables containing buffets
 * - `cakes` Tables containing cakes
 * - `collections` Tables containing collections
 * - `ids` Tables containing item ids
 * - `properties` Tables containing item properties
 */
export type ContentType =
  | 'buffets'
  | 'cakes'
  | 'collections'
  | 'idSets'
  | 'properties';

/**
 * An example object using the typedefs
 */
export const exampleTypedefs: {
  ref: Ref;
  itemId: ItemId;
  tableName: TableName;
  contentType: ContentType;
} = Object.freeze({
  ref: 'ref',
  itemId: 'itemId',
  tableName: 'tableName',
  contentType: 'collections',
});
