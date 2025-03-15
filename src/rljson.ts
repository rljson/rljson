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
import { ContentType, TableName } from './typedefs.ts';

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
export type Rljson = {
  [tableId: TableName]: TableType;
};

/** An example rljson object */
export const exampleRljson = (): Rljson => Example.withAllJsonTypes();

/** A table in the rljson format */
export interface RljsonTable<Data extends Json, Type extends ContentType>
  extends Json {
  /** The data rows of the table */
  _data: Data[];

  /**  The type of the table */
  _type: Type;
}
