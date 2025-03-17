// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { BuffetsTable } from './content/buffet.ts';
import { CakesTable } from './content/cake.ts';
import { CollectionsTable } from './content/collection.ts';
import { IdSetsTable } from './content/id-set.ts';
import { PropertiesTable } from './content/properties.ts';
import { Example } from './example.ts';
import { ContentType, Ref, TableName } from './typedefs.ts';

// .............................................................................
export const reservedFieldNames = ['_type', '_data'];

export const reservedTableNames = ['_hash', '_tables', '_columns'];

// .............................................................................
/**
 * One of the supported Rljson table types
 */
export type TableType =
  | BuffetsTable
  | PropertiesTable<any>
  | CollectionsTable
  | IdSetsTable
  | CakesTable;

// .............................................................................
/** The rljson data format */
export interface Rljson extends Json {
  [tableId: TableName]: TableType;
}

/**
 * Rljson set with private fields
 */
export type RljsonPrivate = {
  /**
   * Contains id sets used accross the Rljson object
   */
  _idSets: IdSetsTable;

  /**
   * Used by validation. If external references are not present,
   * validation does not throw an error.
   */
  _externalRefs: Ref[];
};

/** An example rljson object */
export const exampleRljson = (): Rljson => Example.ok.singleRow();

/** A table in the rljson format */
export interface RljsonTable<Data extends Json, Type extends ContentType>
  extends Json {
  /** The data rows of the table */
  _data: Data[];

  /**  The type of the table. If not set, the type is "properties" */
  _type: Type;
}

/**
 * Iterates over all tables of an Rljson object.
 * Skips private members starting with _
 * @param rljson - The Rljson object to iterate
 * @param callback - The callback to call for each table
 */
export const iterate = (
  rljson: Rljson,
  callback: (tableName: string, table: TableType) => void,
) => {
  for (const tableName in rljson) {
    if (tableName.startsWith('_')) {
      continue;
    }

    callback(tableName, rljson[tableName]);
  }
};
