// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hsh } from '@rljson/hash';
import { Json } from '@rljson/json';

import { CollectionsTable } from '../content/collection.ts';
import { RljsonIndexed, rljsonIndexed } from '../rljson-indexed.ts';
import { iterateTables, Rljson, RljsonTable } from '../rljson.ts';

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
  allRefsExist?: Json;
  collectionBaseRefsExist?: Json;
  collectionIdSetsExistAre?: Json;
  collectionPropertyTablesExist?: Json;
  collectionAssignedPropertiesExist?: Json;
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

    this.rljsonIndexed = rljsonIndexed(rljson);
  }

  errors: SyntaxErrors = { hasErrors: false };

  get hasErrors(): boolean {
    return Object.keys(this.errors).length > 1;
  }

  validate(): SyntaxErrors {
    this._writeAndValidHashes();
    this._tableNamesAreLowerCamelCase();
    this._tableNamesDoNotEndWithRef();
    this._columnNamesAreLowerCamelCase();
    this._hasData();
    this._dataHasRightType();

    if (!this.hasErrors) {
      this._allRefsExist();
      this._collectionBaseRefsExist();
      this._collectionIdSetsExist();
      this._collectionAssignedPropertiesExist();
    }

    this.errors.hasErrors = this.hasErrors;

    return this.errors;
  }

  // ######################
  // Private
  // ######################

  tableNames: string[];

  rljsonIndexed: RljsonIndexed;

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
  private _writeAndValidHashes(): void {
    try {
      // Write hashes into rljson and write an error if that goes wrong
      this.rljson = hsh(this.rljson, {
        inPlace: false,
        updateExistingHashes: true,
        throwOnWrongHashes: true,
      });
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

  private _allRefsExist(): void {
    // Define a result object
    const missingRefs: {
      error: string;
      sourceTable: string;
      sourceItemHash: string;
      sourceKey: string;
      targetTable: string;
      targetItemHash: string;
    }[] = [];

    // Iterate all tables
    for (const table of this.tableNames) {
      // Iterate all items in the table
      const tableData = this.rljson[table]._data as Json[];
      for (const item of tableData) {
        for (const key of Object.keys(item)) {
          // If item is a reference
          if (key.endsWith('Ref')) {
            const targetItemHash = item[key] as string;

            // Get the referenced table
            const targetTableName = key.substring(0, key.length - 3);
            const itemHash = item._hash as string;

            // If table is not found, write an error and continue
            if (this.tableNames.indexOf(targetTableName) === -1) {
              missingRefs.push({
                error: `Target table "${targetTableName}" not found.`,
                sourceTable: table,
                sourceKey: key,
                sourceItemHash: itemHash,
                targetItemHash: targetItemHash,
                targetTable: targetTableName,
              });
              continue;
            }

            // If table is found, find the item in the target table
            const targetTableIndexed = this.rljsonIndexed[targetTableName];
            const referencedItem = targetTableIndexed._data[targetItemHash];
            // If referenced item is not found, write an error
            if (referencedItem === undefined) {
              missingRefs.push({
                sourceTable: table,
                sourceItemHash: itemHash,
                sourceKey: key,
                targetItemHash: targetItemHash,
                targetTable: targetTableName,
                error: `Table "${targetTableName}" has no item with hash "${targetItemHash}"`,
              });
            }
          }
        }
      }
    }

    if (missingRefs.length > 0) {
      this.errors.allRefsExist = {
        error: 'Broken references',
        missingRefs: missingRefs,
      };
    }
  }

  private _collectionBaseRefsExist(): void {
    iterateTables(this.rljson, (tableName, table) => {
      if (table._type !== 'collections') {
        return;
      }

      const collectionsIndexed = this.rljsonIndexed[tableName];

      const collectionsTable: CollectionsTable = table as CollectionsTable;
      for (const collection of collectionsTable._data) {
        const baseRef = collection.base;
        if (!baseRef) {
          continue;
        }

        const baseCollection = collectionsIndexed._data[baseRef];
        if (!baseCollection) {
          this.errors.collectionBaseRefsExist = {
            error: `Collection "${collection._hash}": Base collection "${baseRef}" not found`,
            table: tableName,
            item: collection._hash,
            base: baseRef,
          };
        }
      }
    });
  }

  private _collectionIdSetsExist(): void {
    iterateTables(this.rljson, (tableName, table) => {
      if (table._type !== 'collections') {
        return;
      }

      const idSets = this.rljsonIndexed._idSets;

      const collectionsTable: CollectionsTable = table as CollectionsTable;
      for (const collection of collectionsTable._data) {
        const idSetRef = collection.idSet;
        if (!idSetRef) {
          continue;
        }

        const idSet = idSets._data[idSetRef];
        if (!idSet) {
          this.errors.collectionIdSetsExist = {
            error: `IdSet "${idSetRef}" not found`,
            collection: collection._hash,
            table: tableName,
            item: collection._hash,
            idSet: idSetRef,
          };
        }
      }
    });
  }

  private _collectionAssignedPropertiesExist(): void {
    const missingPropertyTables: any[] = [];
    const brokenAssignments: any[] = [];

    iterateTables(this.rljson, (tableName, table) => {
      if (table._type !== 'collections') {
        return;
      }

      const collectionsTable: CollectionsTable = table as CollectionsTable;
      for (const collection of collectionsTable._data) {
        const propertyTableName = collection.properties;
        const propertiesTable = this.rljsonIndexed[propertyTableName];
        if (!propertiesTable) {
          missingPropertyTables.push({
            collection: collection._hash,
            table: tableName,
            missingPropertyTable: propertyTableName,
          });
          continue;
        }

        const assignments = collection.assign;
        for (const itemId in assignments) {
          if (itemId.startsWith('_')) {
            continue;
          }

          const propertyHash = assignments[itemId];
          if (!propertiesTable._data[propertyHash]) {
            brokenAssignments.push({
              table: tableName,
              collection: collection._hash,
              propertyTable: propertyTableName,
              itemId: itemId,
              missingProperty: propertyHash,
            });
          }
        }
      }
    });

    if (missingPropertyTables.length > 0) {
      this.errors.collectionPropertyTablesExist = {
        error: 'Collection property tables do not exist',
        collections: missingPropertyTables,
      };
    }

    if (brokenAssignments.length > 0) {
      this.errors.collectionAssignedPropertiesExist = {
        error: 'Collection property assignments are broken',
        brokenAssignments: brokenAssignments,
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
