// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Hash } from '@rljson/hash';
import { Json } from '@rljson/json';

import { Rljson, RljsonTable } from '../rljson.ts';

import { Errors, Validator } from './validate.ts';

// .............................................................................
export interface SyntaxErrors extends Errors {
  tableNamesAreLowerCamelCase?: Json;
  columnNamesAreLowerCamelCase?: Json;
  tableNamesDoNotStartWithANumber?: Json;
  tableNamesDoNotEndWithRef?: Json;
  hasValidHashes?: Json;
  hasData?: Json;
  dataHasRightType?: Json;
  allRefsAreFound?: Json;
}

// .............................................................................
export class ValidateSyntax implements Validator {
  name = 'syntax';

  async validate(rljson: Rljson): Promise<Errors> {
    return this.validateSync(rljson);
  }

  validateSync(rljson: Rljson): SyntaxErrors {
    return new _ValidateSyntax(rljson).validate();
  }

  static isValidFieldName(fieldName: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(fieldName);
  }
}

// .............................................................................
class _ValidateSyntax {
  constructor(private rljson: Rljson) {
    this.tableNames = Object.keys(this.rljson).filter(
      (table) => !table.startsWith('_'),
    );
  }

  errors: SyntaxErrors = { hasErrors: false };

  validate(): SyntaxErrors {
    this._tableNamesAreLowerCamelCase();
    this._tableNamesDoNotEndWithRef();
    this._columnNamesAreLowerCamelCase();
    this._hasValidHashes();
    this._hasData();
    this._dataHasRightType();
    // this._allRefsAreFound();
    this.errors.hasErrors = Object.keys(this.errors).length > 1;

    return this.errors;
  }

  // ######################
  // Private
  // ######################

  tableNames: string[];

  private _tableNamesAreLowerCamelCase(): void {
    const invalidTableNames: string[] = [];

    for (const tableName of this.tableNames) {
      if (!ValidateSyntax.isValidFieldName(tableName)) {
        invalidTableNames.push(tableName);
      }
    }

    if (invalidTableNames.length > 0) {
      this.errors.tableNamesAreLowerCamelCase = {
        error: 'Table names must be lower camel case',
        invalidTableNames: invalidTableNames,
      };
    }
  }

  // ...........................................................................
  private _tableNamesDoNotEndWithRef(): void {
    const invalidTableNames: string[] = [];

    for (const tableName of this.tableNames) {
      if (tableName.endsWith('Ref')) {
        invalidTableNames.push(tableName);
      }
    }

    if (invalidTableNames.length > 0) {
      this.errors.tableNamesDoNotEndWithRef = {
        error: 'Table names must not end with "Ref"',
        invalidTableNames: invalidTableNames,
      };
    }
  }

  // ...........................................................................
  private _columnNamesAreLowerCamelCase(): void {
    const invalidColumnNames: {
      [tableName: string]: string[];
    } = {};

    let hadErrors = false;

    for (const tableName of this.tableNames) {
      const table = this.rljson[tableName] as RljsonTable<any, any>;

      if (!table._data || !Array.isArray(table._data)) {
        continue;
      }

      for (const row of table._data) {
        for (const columnName in row) {
          if (columnName.startsWith('_')) {
            continue;
          }

          if (!ValidateSyntax.isValidFieldName(columnName)) {
            invalidColumnNames[tableName] ??= [];
            invalidColumnNames[tableName].push(columnName);
            hadErrors = true;
          }
        }
      }
    }

    if (hadErrors) {
      this.errors.columnNamesAreLowerCamelCase = {
        error: 'Column names must be lower camel case',
        invalidColumnNames: invalidColumnNames,
      };
    }
  }

  // ...........................................................................
  private _hasValidHashes(): void {
    try {
      Hash.default.validate(this.rljson, { ignoreMissingHashes: true });
    } catch (error: any) {
      if (error instanceof Error) {
        this.errors.hasValidHashes = {
          error: error.message,
        };
        /* v8 ignore start */
      } else {
        this.errors.hasValidHashes = {
          error: 'Unknown error',
        };
      }
      /* v8 ignore stop */
    }
  }

  // ...........................................................................
  /// Checks if data is valid
  private _hasData(): void {
    const rljson = this.rljson;
    const tablesWithMissingData: string[] = [];

    for (const table of this.tableNames) {
      const tableData = rljson[table];
      const items = tableData['_data'];
      if (items == null) {
        tablesWithMissingData.push(table);
      }
    }

    if (tablesWithMissingData.length > 0) {
      this.errors.hasData = {
        error: '_data is missing in tables',
        tables: tablesWithMissingData,
      };
    }
  }

  // ...........................................................................
  private _dataHasRightType(): void {
    const rljson = this.rljson;
    const tablesWithWrongType: string[] = [];

    for (const tableName of this.tableNames) {
      const tableData = rljson[tableName];
      if (!tableData._data) {
        continue;
      }

      const items = tableData['_data'];

      if (!Array.isArray(items)) {
        tablesWithWrongType.push(tableName);
      }
    }

    if (tablesWithWrongType.length > 0) {
      this.errors.dataHasRightType = {
        error: '_data must be a list',
        tables: tablesWithWrongType,
      };
    }
  }

  // ...........................................................................
  /// Throws if a link is not available
  /* private _allRefsAreFound(): void {
    // Define a result object
    const missingRefs: {
      table: string;
      item: string;
      ref: string;
      error: string;
    }[] = [];

    // Iterate all tables
    for (const table of this.tableNames) {
      // Iterate all items in the table
      const tableData = this.rljson[table]._data as Json[];
      for (const item of tableData) {
        for (const key of Object.keys(item)) {
          // If item is a reference
          if (key.endsWith('Ref')) {
            // Get the referenced table
            const targetTableName = key.substring(0, key.length - 3);
            const itemHash = item._hash as string;

            // If it is not found, write an error and continue
            if (this.tableNames.indexOf(targetTableName) === -1) {
              missingRefs.push({
                table: table,
                item: itemHash,
                ref: key,
                error: `Reference table "${targetTableName}" not found`,
              });
              continue;
            }

            // If it is found, find the item in the target table
            const targetTable = this.rljson[targetTableName]._data as Json[];

            if (this.rljson[targetTableName] == null) {
              missingRefs.push({ table: table, ref: targetTableName });
            }
          }
        }
      }

      for (const entry of Object.entries(tableData)) {
        const item = entry[1];
        for (const key of Object.keys(item)) {
          if (key === '_hash') continue;

          if (key.endsWith('Ref')) {
            // Check if linked table exists
            const tableName = key.substring(0, key.length - 3);
            const linkTable = this.dataIndexed[tableName];
            const hash = item['_hash'];

            if (linkTable == null) {
              throw new Error(
                `Table "${table}" has an item "${hash}" which links to not existing table "${key}".`,
              );
            }

            // Check if linked item exists
            const targetHash = item[key];
            const linkedItem = linkTable[targetHash];

            if (linkedItem == null) {
              throw new Error(
                `Table "${table}" has an item "${hash}" which links to not existing item "${targetHash}" in table "${tableName}".`,
              );
            }
          }
        }
      }
    }
  }*/
}

/**
 * Validates an field name
 * @param fieldName - The field name to validate
 * @returns true if the field name is valid, false otherwise
 */
export const isValidFieldName = (fieldName: string): boolean =>
  ValidateSyntax.isValidFieldName(fieldName);
