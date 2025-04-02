// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json, JsonValueType } from '@rljson/json';

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
  key: TableKey;

  /**
   * A short description of the table
   */
  columns: Record<ColumnKey, ColumnCfg>;

  /**
   * The content type of the table
   */
  type: ContentType;

  /**
   * The previous version of the table
   */
  previous?: TableCfgRef;

  /**
   * The version of the table.
   * Needs to be increased when new columns are added.
   */
  version: number;

  /**
   * Head tables serve as versioning entry points.
   *
   * - Head tables must contain an id column
   * - Rows in an head table must contain a non-null id
   * - Same row ids must refer to the same physical object
   * - Head tables have no or only one parent table
   */
  isHead: boolean;

  /**
   * Root tables are tables that have no parent table.
   *
   * - Root tables are also head tables
   */
  isRoot: boolean;

  /**
   * Shared tables are tables that are used by multiple parents.
   *
   * - The don't need an id column
   * - Same id can refer to different physical objects
   * - Shared tables can have multiple parents
   * - Shared tables can not be head or root tables
   */
  isShared: boolean;
}

/**
 * A table containing columns
 */
export type TablesCfgTable = RljsonTable<TableCfg, 'ingredients'>;

/**
 * Example matching allTypesRow
 */
export const exampleTableCfgTable = (): TablesCfgTable =>
  Example.ok.singleRow().tableCfgs! as TablesCfgTable;

export const exampleTableCfg = (
  tableCfg: Partial<TableCfg> | undefined = undefined,
): TableCfg => {
  return {
    key: tableCfg?.key ?? 'table',
    version: 1,
    columns: tableCfg?.columns ?? {
      a: {
        type: 'string',
      },
      b: {
        type: 'number',
      },
    },
    type: tableCfg?.type ?? 'ingredients',
    isHead: true,
    isRoot: true,
    isShared: false,
  };
};
