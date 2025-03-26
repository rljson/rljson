// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { BuffetsTable } from './content/buffet.ts';
import { CakesTable } from './content/cake.ts';
import { IngredientsTable } from './content/ingredients.ts';
import { LayersTable } from './content/layer.ts';
import { SliceIdsTable } from './content/slice-ids.ts';
import { TableCfgRef, TablesCfgTable } from './content/table-cfg.ts';
import { Example } from './example.ts';
import { ContentType, Ref, TableKey } from './typedefs.ts';

// .............................................................................
export const reservedFieldNames = ['_type', '_data'];

export const reservedTableKeys = ['_hash', 'sliceIds', 'tableCfgs'];

// .............................................................................
/**
 * One of the supported Rljson table types
 */
export type TableType =
  | BuffetsTable
  | IngredientsTable<any>
  | LayersTable
  | SliceIdsTable
  | CakesTable;

// .............................................................................
/** The rljson data format */
export interface Rljson extends Json {
  [tableId: TableKey]: TableType;
}

/**
 * Rljson set with private fields
 */
export type RljsonPrivate = {
  /**
   * The hash of the Rljson object
   */
  _hash: string;

  /**
   * Contains id sets used accross the Rljson object
   */
  _idSet?: SliceIdsTable;

  /**
   * References that are not part of the Rljson object
   */
  _externalRefs?: Ref[];

  /**
   * Referenced tables that are not part of the Rljson object
   */
  _externalTables?: Ref[];

  /**
   * Column configurations used accross the Rljson object
   */
  tableCfgs?: TablesCfgTable;
};

// .............................................................................
/** An example rljson object */
export const exampleRljson = (): Rljson => Example.ok.singleRow();

// .............................................................................
/** A table in the rljson format */
export interface RljsonTable<Data extends Json, Type extends ContentType>
  extends Json {
  /** The data rows of the table */
  _data: Data[];

  /**  The type of the table. If not set, the type is "ingredients" */
  _type: Type;

  /** The columns configuration of the table */
  _tableCfg?: TableCfgRef;
}

/**
 * Iterates over all tables of an Rljson object.
 * Skips private members starting with _
 * @param rljson - The Rljson object to iterate
 * @param callback - The callback to call for each table
 */
export const iterateTables = (
  rljson: Rljson,
  callback: (tableKey: string, table: TableType) => void,
) => {
  for (const tableKey in rljson) {
    const value = rljson[tableKey];
    if (typeof value !== 'object' || !Array.isArray(value._data)) {
      continue;
    }

    callback(tableKey, rljson[tableKey]);
  }
};
