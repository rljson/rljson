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

  validate(): SyntaxErrors {
    const errors: any = {};

    this._tableNamesAreLowerCamelCase(errors);
    this._columnNamesAreLowerCamelCase(errors);
    this._hasValidHashes(errors);
    this._hasData(errors);
    this._dataHasRightType(errors);
    errors.hasErrors = Object.keys(errors).length > 0;

    return errors as Errors;
  }

  // ######################
  // Private
  // ######################

  private _tableNamesAreLowerCamelCase(errors: SyntaxErrors): void {
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
      errors.tableNamesAreLowerCamelCase = {
        error: 'Table names must be lower camel case',
        invalidTableNames: invalidTableNames,
      };
    }
  }

  // ...........................................................................
  private _columnNamesAreLowerCamelCase(errors: SyntaxErrors): void {
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
      errors.columnNamesAreLowerCamelCase = {
        error: 'Column names must be lower camel case',
        invalidColumnNames: invalidColumnNames,
      };
    }
  }

  // ...........................................................................
  private _hasValidHashes(errors: Json): void {
    try {
      Hash.default.validate(this.rljson, { ignoreMissingHashes: true });
    } catch (error: any) {
      if (error instanceof Error) {
        errors.hasValidHashes = {
          error: error.message,
        };
        /* v8 ignore start */
      } else {
        errors.hasValidHashes = {
          error: 'Unknown error',
        };
      }
      /* v8 ignore stop */
    }
  }

  // ...........................................................................
  /// Checks if data is valid
  private _hasData(errors: SyntaxErrors): void {
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
      errors.hasData = {
        error: '_data is missing in tables',
        tables: tablesWithMissingData,
      };
    }
  }

  // ...........................................................................
  /// Checks if data is valid
  private _dataHasRightType(errors: SyntaxErrors): void {
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
      errors.dataHasRightType = {
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
