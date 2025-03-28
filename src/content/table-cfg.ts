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
   * The key of the column used in data
   */
  key: ColumnKey;

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
        key: 'a',
        type: 'string',
      },
      b: {
        key: 'b',
        type: 'number',
      },
    },
    type: tableCfg?.type ?? 'ingredients',
  };
};
