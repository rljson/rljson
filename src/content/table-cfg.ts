// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hsh } from '@rljson/hash';
import {
  Json,
  jsonValueType,
  JsonValueType,
  jsonValueTypes,
} from '@rljson/json';

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
   * The technical lower camel case json identifier of the column
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
  columns: ColumnCfg[];

  /**
   * The content type of the table
   */
  type: ContentType;

  /**
   * The previous version of the table
   */
  previous?: TableCfgRef;

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
export type TablesCfgTable = RljsonTable<TableCfg>;

// .............................................................................
/**
 * Throws an error if the table configuration is not valid.
 * @param tableCfg - The table configuration to check
 */
export const throwOnInvalidTableCfg = (tableCfg: TableCfg): void => {
  // Does the table have at least two columns?
  if (tableCfg.columns.length < 2) {
    throw new Error(
      `Invalid table configuration: Table "${tableCfg.key}" ` +
        `must have at least a _hash and a second column`,
    );
  }

  // Is the first column the _hash column?
  if (tableCfg.columns[0].key !== '_hash') {
    throw new Error(
      `Invalid table configuration: The first column of table ` +
        `"${tableCfg.key}" must be "_hash"`,
    );
  }

  // The first column must be of type string
  if (tableCfg.columns[0].type !== 'string') {
    throw new Error(
      `Invalid table configuration: The first _hash column of table ` +
        `"${tableCfg.key}" must be of type "string"`,
    );
  }

  // All column types must be one of the supported types
  for (const column of tableCfg.columns) {
    if (!jsonValueTypes.includes(column.type)) {
      throw new Error(
        `Invalid table configuration: Column "${column.key}" of table ` +
          `"${tableCfg.key}" has an unsupported type "${column.type}"`,
      );
    }
  }
};

// .............................................................................
/**
 * Validates the table configuration against the data.
 * @param rows - The rows to validate
 * @param tableCfg - The table configuration to validate against
 * @returns - An array of error messages
 */
export const validateRljsonAgainstTableCfg = (
  rows: Json[],
  tableCfg: TableCfg,
): string[] => {
  const errors: string[] = [];
  const tableKey = tableCfg.key as TableKey;

  // Check if column keys and types match
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (const columnKey in row) {
      const columnCfg = tableCfg.columns.find(
        (column) => column.key === columnKey,
      );

      if (!columnCfg) {
        errors.push(
          `Column "${columnKey}" in row ${i} of table "${tableKey}" does not exist.`,
        );
        continue;
      }

      // Does type match?
      const expectedType = columnCfg.type;
      const value = row[columnKey];
      if (value === undefined || value === null) {
        continue;
      }

      const actualType = jsonValueType(row[columnKey]!);
      if (expectedType !== actualType) {
        errors.push(
          `Column "${columnKey}" in row ${i} of "${tableKey}" ` +
            `has type "${actualType}", but expected "${expectedType}"`,
        );
      }
    }
  }

  return errors;
};

// .............................................................................
/**
 * Add columns to table config
 * @param tableCfg - The table configuration to add columns to
 * @param columns - The columns to add
 * @returns The updated table configuration
 * @throws Error if the columns already exist in the table configuration
 */
export const addColumnsToTableCfg = (
  tableCfg: TableCfg,
  columns: ColumnCfg[],
): TableCfg => {
  // Prüfe auf doppelte Keys
  const existingKeys = new Set(tableCfg.columns.map((c) => c.key));
  const duplicates = columns.filter((col) => existingKeys.has(col.key));

  if (duplicates.length > 0) {
    const keys = duplicates.map((d) => d.key).join(', ');
    throw new Error(
      `The following columns already exist in the table "${tableCfg.key}": ${keys}`,
    );
  }

  // Füge die neuen Spalten hinzu
  return hsh<TableCfg>(
    {
      ...tableCfg,
      columns: [...tableCfg.columns, ...columns],
    },
    {
      updateExistingHashes: true,
      throwOnWrongHashes: false,
    },
  );
};

// .............................................................................
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
    columns: tableCfg?.columns ?? [
      {
        key: '_hash',
        type: 'string',
      },
      {
        key: 'a',
        type: 'string',
      },
      {
        key: 'b',
        type: 'number',
      },
    ],
    type: tableCfg?.type ?? 'ingredients',
    isHead: true,
    isRoot: true,
    isShared: false,
  };
};
