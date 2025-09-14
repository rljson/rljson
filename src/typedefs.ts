// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json, JsonKey } from '@rljson/json';


/**
 * A ref is a hash that references to another element
 */
export type Ref = string;

/**
 * An `id` is a *user defined* name or identifier of an slice.
 * It exists in parallel with the auto generated `_hash`.
 */
export type SliceId = string;

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
 * - `components` Tables containing basic data in key-value pairs
 * - `layer` Tables containing references between index components and data components
 * - `layerTable` Tables containing a list of references to layers
 */
export const contentTypes = ['components', 'layer', 'layerTable'] as const;

export type ContentType = (typeof contentTypes)[number];

/**
 * An example object using the typedefs
 */
export const exampleTypedefs = (): {
  ref: Ref;
  tableKey: TableKey;
  contentType: ContentType;
} => {
  return {
    ref: 'ref',
    tableKey: 'tableKey',
    contentType: 'layer',
  };
};

/**
 * A json object with an optional id
 */
export type JsonWithId = Json & { id?: string };
