// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json, JsonValueType } from '@rljson/json';

import { RljsonTable } from '../rljson.ts';
import { Ref } from '../typedefs.ts';

export type JsonKey = string;

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
  jsonKey: JsonKey;

  /**
   * A short name of the column to be shown in the table header
   */
  nameShort: string;

  /**
   * A unshorted name to be shown in the tool tip
   */
  name: string;

  /**
   * Average number of characters in the column
   */
  avgChars?: number;

  /**
   * The type of the column
   */
  type: JsonValueType;
}

/**
 * Describes the configuration of a table, i.e. table metadata and columns
 */
export interface TableCfg extends Json {
  name: string;
  columns: Record<JsonKey, ColumnCfg>;
}

/**
 * A table containing columns
 */
export type TablesCfgTable = RljsonTable<TableCfg, 'properties'>;

/**
 * Example matching allTypesRow
 */
export const exampleColumnsCfgTable = (): TablesCfgTable => {
  return {
    _data: [],
    _type: 'properties',
  };
};
