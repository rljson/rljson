// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { BuffetsTable } from './content/buffet.ts';
import { CakesTable } from './content/cake.ts';
import { ComponentsTable } from './content/components.ts';
import { LayersTable } from './content/layer.ts';
import { RevisionsTable } from './content/revision.ts';
import { SliceIdsTable } from './content/slice-ids.ts';
import { TableCfgRef, TablesCfgTable } from './content/table-cfg.ts';
import { EditHistoryTable } from './edit/edit-history.ts';
import { EditsTable } from './edit/edit.ts';
import { MultiEditsTable } from './edit/multi-edit.ts';
import { Example } from './example.ts';
import { InsertHistoryTable } from './insertHistory/insertHistory.ts';
import { ContentType, Ref, TableKey } from './typedefs.ts';

// .............................................................................
export const reservedFieldNames = ['_data'];

export const reservedTableKeys = [
  '_hash',
  'sliceIds',
  'tableCfgs',
  'reverseRefs',
  'revisions',
];

// .............................................................................
/**
 * One of the supported Rljson table types
 */
export type TableType =
  | BuffetsTable
  | ComponentsTable<any>
  | LayersTable
  | SliceIdsTable
  | CakesTable
  | RevisionsTable
  | TablesCfgTable
  | InsertHistoryTable<any>
  | EditsTable
  | MultiEditsTable
  | EditHistoryTable;

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
export interface RljsonTable<Data extends Json, T extends ContentType>
  extends Json {
  /** The data rows of the table */
  _data: Data[];

  /** The columns configuration of the table */
  _tableCfg?: TableCfgRef;

  /** The type of the table. Must match the one in table cfg table */
  _type: T;
}

const _isTable = (value: TableType): value is RljsonTable<any, any> => {
  return !(typeof value !== 'object' || !Array.isArray(value._data));
};

/**
 * Iterates over all tables of an Rljson object.
 * Skips private members starting with _
 * @param rljson - The Rljson object to iterate
 * @param callback - The callback to call for each table
 */
export const iterateTablesSync = (
  rljson: Rljson,
  callback: (tableKey: string, table: TableType) => void,
) => {
  for (const tableKey in rljson) {
    const value = rljson[tableKey];
    if (!_isTable(value)) {
      continue;
    }

    callback(tableKey, rljson[tableKey]);
  }
};

/**
 * Iterates over all tables of an Rljson object.
 * Skips private members starting with _
 * @param rljson - The Rljson object to iterate
 * @param callback - The callback to call for each table
 *
 * Note: The callbacks are executed in parallel.
 */
export const iterateTables = async (
  rljson: Rljson,
  callback: (tableKey: string, table: TableType) => Promise<void>,
): Promise<void> => {
  const array: Promise<void>[] = [];
  const errors: { tableKey: string; error: any }[] = [];

  for (const tableKey in rljson) {
    const value = rljson[tableKey];
    if (!_isTable(value)) {
      continue;
    }

    const promise = callback(tableKey, rljson[tableKey]).catch((error) => {
      errors.push({ tableKey, error });
    });
    array.push(promise);
  }

  await Promise.all(array);
  if (errors.length) {
    throw errors;
  }
};
