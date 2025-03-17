// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hsh } from '@rljson/hash';
import { Json } from '@rljson/json';

import { BuffetsTable } from '../content/buffet.ts';
import { CakesTable } from '../content/cake.ts';
import { CollectionsTable } from '../content/collection.ts';
import { RljsonIndexed, rljsonIndexed } from '../rljson-indexed.ts';
import { iterateTables, Rljson, RljsonTable } from '../rljson.ts';

import { Errors, Validator } from './validate.ts';

// .............................................................................
export interface BaseErrors extends Errors {
  tableNamesNotLowerCamelCase?: Json;
  columnNamesNotLowerCamelCase?: Json;
  tableNamesDoNotStartWithANumber?: Json;
  tableNamesDoNotEndWithRef?: Json;
  hashesNotValid?: Json;
  dataNotFound?: Json;
  dataHasWrongType?: Json;
  refsNotFound?: Json;
  collectionBasesNotFound?: Json;
  collectionIdSetsNotFound?: Json;
  collectionPropertyTablesNotFound?: Json;
  collectionPropertyAssignmentsNotFound?: Json;
  cakeIdSetsNotFound?: Json;
  cakeCollectionTablesNotFound?: Json;
  cakeLayerCollectionsNotFound?: Json;
  buffetReferencedTablesNotFound?: Json;
  buffetReferencedItemsNotFound?: Json;
}

// .............................................................................
export class BaseValidator implements Validator {
  name = 'syntax';

  async validate(rljson: Rljson): Promise<Errors> {
    return this.validateSync(rljson);
  }

  validateSync(rljson: Rljson): BaseErrors {
    return new _BaseValidator(rljson).validate();
  }

  static isValidFieldName(fieldName: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(fieldName);
  }
}

// .............................................................................
class _BaseValidator {
  constructor(private rljson: Rljson) {
    this.tableNames = Object.keys(this.rljson).filter(
      (table) => !table.startsWith('_'),
    );

    this.rljsonIndexed = rljsonIndexed(rljson);
  }

  errors: BaseErrors = { hasErrors: false };

  get hasErrors(): boolean {
    return Object.keys(this.errors).length > 1;
  }

  validate(): BaseErrors {
    const steps = [
      () => this._writeAndValidHashes(),
      () => this._tableNamesNotLowerCamelCase(),
      () => this._tableNamesDoNotEndWithRef(),
      () => this._columnNamesNotLowerCamelCase(),
      () => this._dataNotFound(),
      () => this._dataHasWrongType(),
      () => this._refsNotFound(),
      () => this._collectionBasesNotFound(),
      () => this._collectionIdSetsExist(),
      () => this._collectionPropertyAssignmentsNotFound(),
      () => this._cakeIdSetsNotFound(),
      () => this._cakeCollectionTablesNotFound(),
      () => this._buffetReferencedTableNotFound(),
    ];

    for (const step of steps) {
      step();
      if (this.hasErrors) {
        break;
      }
    }

    this.errors.hasErrors = this.hasErrors;
    return this.errors;
  }

  // ######################
  // Private
  // ######################

  tableNames: string[];

  rljsonIndexed: RljsonIndexed;

  private _tableNamesNotLowerCamelCase(): void {
    const invalidTableNames: string[] = [];

    for (const tableName of this.tableNames) {
      if (!BaseValidator.isValidFieldName(tableName)) {
        invalidTableNames.push(tableName);
      }
    }

    if (invalidTableNames.length > 0) {
      this.errors.tableNamesNotLowerCamelCase = {
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
  private _columnNamesNotLowerCamelCase(): void {
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

          if (!BaseValidator.isValidFieldName(columnName)) {
            invalidColumnNames[tableName] ??= [];
            invalidColumnNames[tableName].push(columnName);
            hadErrors = true;
          }
        }
      }
    }

    if (hadErrors) {
      this.errors.columnNamesNotLowerCamelCase = {
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
        this.errors.hashesNotValid = {
          error: error.message,
        };
        /* v8 ignore start */
      } else {
        this.errors.hashesNotValid = {
          error: 'Unknown error',
        };
      }
      /* v8 ignore stop */
    }
  }

  // ...........................................................................
  /// Checks if data is valid
  private _dataNotFound(): void {
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
      this.errors.dataNotFound = {
        error: '_data is missing in tables',
        tables: tablesWithMissingData,
      };
    }
  }

  // ...........................................................................
  private _dataHasWrongType(): void {
    const rljson = this.rljson;
    const tablesWithWrongType: string[] = [];

    for (const tableName of this.tableNames) {
      const tableData = rljson[tableName];

      const items = tableData['_data'];

      if (!Array.isArray(items)) {
        tablesWithWrongType.push(tableName);
      }
    }

    if (tablesWithWrongType.length > 0) {
      this.errors.dataHasWrongType = {
        error: '_data must be a list',
        tables: tablesWithWrongType,
      };
    }
  }

  private _refsNotFound(): void {
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
    iterateTables(this.rljson, (tableName, table) => {
      // Iterate all items in the table
      const tableData = table._data as Json[];
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
                sourceTable: tableName,
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
                sourceTable: tableName,
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
    });

    if (missingRefs.length > 0) {
      this.errors.refsNotFound = {
        error: 'Broken references',
        missingRefs: missingRefs,
      };
    }
  }

  private _collectionBasesNotFound(): void {
    const brokenCollections: any[] = [];

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
          brokenCollections.push({
            collectionsTable: tableName,
            brokenCollection: collection._hash,
            missingBaseCollection: baseRef,
          });
        }
      }
    });

    if (brokenCollections.length > 0) {
      this.errors.collectionBasesNotFound = {
        error: 'Base collections are missing',
        brokenCollections,
      };
    }
  }

  private _collectionIdSetsExist(): void {
    const brokenCollections: any[] = [];

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
          brokenCollections.push({
            collectionsTable: tableName,
            collectionHash: collection._hash,
            missingIdSet: idSetRef,
          });
        }
      }
    });

    if (brokenCollections.length > 0) {
      this.errors.collectionIdSetsExist = {
        error: 'Id sets of collections are missing',
        brokenCollections,
      };
    }
  }

  private _collectionPropertyAssignmentsNotFound(): void {
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
            brokenCollection: collection._hash,
            collectionsTable: tableName,
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
              collectionsTable: tableName,
              brokenCollection: collection._hash,
              referencedPropertyTable: propertyTableName,
              brokenAssignment: itemId,
              missingProperty: propertyHash,
            });
          }
        }
      }
    });

    if (missingPropertyTables.length > 0) {
      this.errors.collectionPropertyTablesNotFound = {
        error: 'Collection property tables do not exist',
        collections: missingPropertyTables,
      };
    }

    if (brokenAssignments.length > 0) {
      this.errors.collectionPropertyAssignmentsNotFound = {
        error: 'Collection property assignments are broken',
        brokenAssignments: brokenAssignments,
      };
    }
  }

  private _cakeIdSetsNotFound(): void {
    const brokenCakes: any[] = [];

    iterateTables(this.rljson, (tableName, table) => {
      if (table._type !== 'cakes') {
        return;
      }

      const idSets = this.rljsonIndexed._idSets;

      const cakesTable: CakesTable = table as CakesTable;
      for (const cake of cakesTable._data) {
        const idSetRef = cake.idSet;
        if (!idSetRef) {
          continue;
        }

        const idSet = idSets._data[idSetRef];
        if (!idSet) {
          brokenCakes.push({
            cakeTable: tableName,
            brokenCake: cake._hash,
            missingIdSet: idSetRef,
          });
        }
      }
    });

    if (brokenCakes.length > 0) {
      this.errors.cakeIdSetsNotFound = {
        error: 'Id sets of cakes are missing',
        brokenCakes,
      };
    }
  }

  private _cakeCollectionTablesNotFound(): void {
    const missingCollectionTables: any[] = [];
    const missingLayerCollections: any[] = [];

    iterateTables(this.rljson, (tableName, table) => {
      if (table._type !== 'cakes') {
        return;
      }

      const cakesTable: CakesTable = table as CakesTable;
      for (const cake of cakesTable._data) {
        const collectionsTableName = cake.collections;
        const collectionsTable = this.rljsonIndexed[collectionsTableName];
        if (!collectionsTable) {
          missingCollectionTables.push({
            cakeTable: tableName,
            brokenCake: cake._hash,
            missingCollectionsTable: collectionsTableName,
          });

          continue;
        }

        for (const layer in cake.layers) {
          if (layer.startsWith('_')) {
            continue;
          }

          const collectionRef = cake.layers[layer];
          const collection = collectionsTable._data[collectionRef];

          if (!collection) {
            missingLayerCollections.push({
              cakeTable: tableName,
              brokenCake: cake._hash,
              brokenLayerName: layer,
              collectionsTable: collectionsTableName,
              missingCollection: collectionRef,
            });
          }
        }
      }
    });

    if (missingCollectionTables.length > 0) {
      this.errors.cakeCollectionTablesNotFound = {
        error: 'Collection tables of cakes are missing',
        brokenCakes: missingCollectionTables,
      };
    }

    if (missingLayerCollections.length > 0) {
      this.errors.cakeLayerCollectionsNotFound = {
        error: 'Layer collections of cakes are missing',
        brokenCakes: missingLayerCollections,
      };
    }
  }

  private _buffetReferencedTableNotFound(): void {
    const missingTables: Json[] = [];
    const missingItems: Json[] = [];

    iterateTables(this.rljson, (tableName, table) => {
      if (table._type !== 'buffets') {
        return;
      }

      const buffetsTable: BuffetsTable = table as BuffetsTable;
      for (const buffet of buffetsTable._data) {
        for (const item of buffet.items) {
          // Table available?
          const itemTableName = item.table;
          const itemTable = this.rljsonIndexed[itemTableName];
          if (!itemTable) {
            missingTables.push({
              buffetTable: tableName,
              brokenBuffet: buffet._hash,
              missingItemTable: itemTableName,
            });
            continue;
          }

          // Referenced item available?
          const ref = item.ref;
          const referencedItem = itemTable._data[ref];
          if (!referencedItem) {
            missingItems.push({
              buffetTable: tableName,
              brokenBuffet: buffet._hash,
              itemTable: itemTableName,
              missingItem: ref,
            });
          }
        }
      }
    });

    if (missingTables.length > 0) {
      this.errors.buffetReferencedTablesNotFound = {
        error: 'Referenced tables of buffets are missing',
        brokenBuffets: missingTables,
      };
    }

    if (missingItems.length > 0) {
      this.errors.buffetReferencedItemsNotFound = {
        error: 'Referenced items of buffets are missing',
        brokenItems: missingItems,
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
  BaseValidator.isValidFieldName(fieldName);
