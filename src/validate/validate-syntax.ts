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
  constructor(private rljson: Rljson) {}

  errors: SyntaxErrors = { hasErrors: false };

  validate(): SyntaxErrors {
    this._tableNamesAreLowerCamelCase();
    this._tableNamesDoNotEndWithRef();
    this._columnNamesAreLowerCamelCase();
    this._hasValidHashes();
    this._hasData();
    this._dataHasRightType();
    this.errors.hasErrors = Object.keys(this.errors).length > 1;

    return this.errors;
  }

  // ######################
  // Private
  // ######################

  private _tableNamesAreLowerCamelCase(): void {
    const invalidTableNames: string[] = [];

    for (const tableName in this.rljson) {
      if (tableName.startsWith('_')) {
        continue;
      }

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

    for (const tableName in this.rljson) {
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

    for (const tableName in this.rljson) {
      if (tableName.startsWith('_')) {
        continue;
      }

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

    for (const table of Object.keys(rljson)) {
      /* v8 ignore next */
      if (table.startsWith('_')) continue;
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
  /// Checks if data is valid
  private _dataHasRightType(): void {
    const rljson = this.rljson;
    const tablesWithWrongType: string[] = [];

    for (const table of Object.keys(rljson)) {
      /* v8 ignore next */
      if (table.startsWith('_')) continue;
      const tableData = rljson[table];
      if (!tableData._data) {
        continue;
      }

      const items = tableData['_data'];

      if (!Array.isArray(items)) {
        tablesWithWrongType.push(table);
      }
    }

    if (tablesWithWrongType.length > 0) {
      this.errors.dataHasRightType = {
        error: '_data must be a list',
        tables: tablesWithWrongType,
      };
    }
  }
}

/**
 * Validates an field name
 * @param fieldName - The field name to validate
 * @returns true if the field name is valid, false otherwise
 */
export const isValidFieldName = (fieldName: string): boolean =>
  ValidateSyntax.isValidFieldName(fieldName);
