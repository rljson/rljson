// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json, JsonKey, JsonValueType } from '@rljson/json';

import { Example } from '../example.ts';
import { RljsonTable } from '../rljson.ts';
import { ColumnKey, ContentType, Ref, TableKey } from '../typedefs.ts';

/**
 * A ColumnsRef is a hash pointing to columns metadata
 */
export type TableCfgRef = Ref;

/**
 * A column configuration
 */
export interface ColumnCfg extends Json {
  /**
   * The jsonKey of the column used in data
   */
  jsonKey: ColumnKey;

  /**
   * The type of the column
   */
  type: JsonValueType;
}

/**
 * Describes the configuration of a table, i.e. table metadata and columns
 */
export interface TableCfg extends Json {
  /**
   * Technical lower camel case json identifier of the table
   */
  jsonKey: TableKey;

  /**
   * A short description of the table
   */
  columns: Record<JsonKey, ColumnCfg>;

  /**
   * The content type of the table
   */
  type: ContentType;
}

/**
 * A table containing columns
 */
export type TablesCfgTable = RljsonTable<TableCfg, 'properties'>;

/**
 * Example matching allTypesRow
 */
export const exampleTableCfgTable = (): TablesCfgTable =>
  Example.ok.singleRow().tableCfgs! as TablesCfgTable;
