// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hsh } from '@rljson/hash';
import { Json, jsonValueMatchesType, jsonValueTypes } from '@rljson/json';

import { LayerRef } from '../content/layers.ts';
import { Stack } from '../content/stack.ts';
import { ColumnCfg, TableCfg, TablesCfgTable } from '../content/table-cfg.ts';
import { RljsonIndexed, rljsonIndexed } from '../rljson-indexed.ts';
import { iterateTablesSync, Rljson, RljsonTable } from '../rljson.ts';

import { Errors, Validator } from './validate.ts';


// .............................................................................
export interface BaseErrors extends Errors {
  // Base errors
  tableKeysNotLowerCamelCase?: Json;
  columnNamesNotLowerCamelCase?: Json;
  tableKeysDoNotStartWithANumber?: Json;
  tableKeysDoNotEndWithRef?: Json;
  hashesNotValid?: Json;
  dataNotFound?: Json;
  dataHasWrongType?: Json;

  // Table config errors
  tableCfgsReferencedTableKeyNotFound?: Json;
  columnsHaveWrongType?: Json;
  tableCfgReferencedNotFound?: Json;
  columnConfigNotFound?: Json;
  dataDoesNotMatchColumnConfig?: Json;
  tableTypesDoNotMatch?: Json;
  rootOrHeadTableHasNoIdColumn?: Json;
  tableCfgHasRootHeadSharedError?: Json;

  // Reference errors
  refsNotFound?: Json;

  // Layer errors
  layerBasesNotFound?: Json;
  layerSliceIdsGivenButNoTable?: Json;
  layerSliceIdsTableNotFound?: Json;
  layerSliceIdsRowNotFound?: Json;
  layerIngredientTablesNotFound?: Json;
  layerIngredientAssignmentsNotFound?: Json;
  layerAssignmentsDoNotMatchSliceIds?: Json;

  // Cake errors
  cakeSliceIdsTableNotFound?: Json;
  cakeSliceIdsNotFound?: Json;
  cakeLayerTablesNotFound?: Json;
  cakeLayersNotFound?: Json;

  // Buffet errors
  buffetReferencedTablesNotFound?: Json;
  buffetReferencedItemsNotFound?: Json;
}

// .............................................................................
export class BaseValidator implements Validator {
  name = 'base';

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
    this.tableKeys = Object.keys(this.rljson).filter(
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
      // Base checks
      () => this._writeAndValidHashes(),
      () => this._tableKeysNotLowerCamelCase(),
      () => this._tableKeysDoNotEndWithRef(),
      () => this._columnNamesNotLowerCamelCase(),
      () => this._dataNotFound(),
      () => this._dataHasWrongType(),

      // Check table cfg
      () => this._tableCfgsReferencedTableKeyNotFound(),
      () => this._tableCfgsHaveWrongType(),
      () => this._tableCfgNotFound(),
      () => this._missingColumnConfigs(),
      () => this._dataDoesNotMatchColumnConfig(),
      () => this._tableCfgHasRootHeadSharedError(),
      () => this._rootOrHeadTableHasNoIdColumn(),

      // Check references
      () => this._refsNotFound(),

      // Check layers
      () => this._layerBasesNotFound(),

      // Check stacks
      () => this._stackReferencesNotFound(),
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

  tableKeys: string[];

  rljsonIndexed: RljsonIndexed;

  private _tableKeysNotLowerCamelCase(): void {
    const invalidTableKeys: string[] = [];

    for (const tableKey of this.tableKeys) {
      if (!BaseValidator.isValidFieldName(tableKey)) {
        invalidTableKeys.push(tableKey);
      }
    }

    if (invalidTableKeys.length > 0) {
      this.errors.tableKeysNotLowerCamelCase = {
        error: 'Table names must be lower camel case',
        invalidTableKeys: invalidTableKeys,
      };
    }
  }

  // ...........................................................................
  private _tableKeysDoNotEndWithRef(): void {
    const invalidTableKeys: string[] = [];

    for (const tableKey of this.tableKeys) {
      if (tableKey.endsWith('Ref')) {
        invalidTableKeys.push(tableKey);
      }
    }

    if (invalidTableKeys.length > 0) {
      this.errors.tableKeysDoNotEndWithRef = {
        error: 'Table names must not end with "Ref"',
        invalidTableKeys: invalidTableKeys,
      };
    }
  }

  // ...........................................................................
  private _columnNamesNotLowerCamelCase(): void {
    const invalidColumnNames: {
      [tableKey: string]: string[];
    } = {};

    let hadErrors = false;

    for (const tableKey of this.tableKeys) {
      const table = this.rljson[tableKey] as RljsonTable<any>;

      if (!table._data || !Array.isArray(table._data)) {
        continue;
      }

      for (const row of table._data) {
        for (const columnName in row) {
          if (columnName.startsWith('_')) {
            continue;
          }

          if (!BaseValidator.isValidFieldName(columnName)) {
            invalidColumnNames[tableKey] ??= [];
            invalidColumnNames[tableKey].push(columnName);
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

    for (const table of this.tableKeys) {
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
  private _tableCfgsReferencedTableKeyNotFound(): void {
    const tableCfgs = this.rljson.tableCfgs as TablesCfgTable;
    if (!tableCfgs) {
      return;
    }

    // Are all types valid?
    const brokenCfgs: Json[] = [];
    for (const item of tableCfgs._data) {
      const table = this.rljson[item.key];
      if (!table) {
        brokenCfgs.push({
          brokenTableCfg: item._hash,
          tableKeyNotFound: item.key,
        });
      }
    }

    if (brokenCfgs.length > 0) {
      this.errors.tableCfgsReferencedTableKeyNotFound = {
        error: 'Tables referenced in tableCfgs not found',
        brokenCfgs,
      };
    }
  }

  // ...........................................................................
  private _tableCfgsHaveWrongType(): void {
    const tableCfgs = this.rljson.tableCfgs as TablesCfgTable;
    if (!tableCfgs) {
      return;
    }

    // Are all types valid?
    const brokenCfgs: Json[] = [];
    for (const item of tableCfgs._data) {
      for (const columnCfg of item.columns as ColumnCfg[]) {
        const columnKey = columnCfg.key;
        const columnType = columnCfg.type;

        if (jsonValueTypes.indexOf(columnType) === -1) {
          brokenCfgs.push({
            brokenTableCfg: item._hash,
            brokenColumnKey: columnKey,
            brokenColumnType: columnType,
          });
        }
      }
    }

    if (brokenCfgs.length > 0) {
      this.errors.columnsHaveWrongType = {
        error:
          'Some of the columns have invalid types. Valid types are: ' +
          jsonValueTypes.join(', '),
        brokenCfgs,
      };
    }
  }

  // ...........................................................................
  private _tableCfgNotFound(): void {
    const tableCfgs = this.rljsonIndexed.tableCfgs;

    const tableCfgNotFound: Json[] = [];

    // Iterate all tables
    iterateTablesSync(this.rljson, (tableKey, table) => {
      // If table has no config reference, continue
      const tableCfgRef = table._tableCfg;
      if (!tableCfgRef) {
        return;
      }

      // Get the table config
      const tableCfgData = tableCfgs._data[tableCfgRef];

      // Referenced table config not found?
      if (!tableCfgData) {
        tableCfgNotFound.push({
          tableWithBrokenTableCfgRef: tableKey,
          brokenTableCfgRef: tableCfgRef,
        });
        return;
      }
    });

    if (tableCfgNotFound.length > 0) {
      this.errors.tableCfgReferencedNotFound = {
        error: 'Referenced table config not found',
        tableCfgNotFound,
      };
    }
  }

  // ...........................................................................
  private _missingColumnConfigs(): void {
    const tableCfgs = this.rljsonIndexed.tableCfgs;
    const missingColumnConfigs: Json[] = [];

    // Iterate all tables
    iterateTablesSync(this.rljson, (tableKey, table) => {
      // If table has no config reference, continue
      const tableCfgRef = table._tableCfg;
      if (!tableCfgRef) {
        return;
      }

      // Get the table config
      const tableCfgData = tableCfgs._data[tableCfgRef] as TableCfg;

      const processedColumnKeys: string[] = [];

      // Iterate all rows of the table
      for (const row of table._data) {
        // Iterate all columns of the row
        const columnKeys = Object.keys(row).filter(
          (key) => !key.startsWith('_'),
        );

        const newColumnKey = columnKeys.filter(
          (key) => processedColumnKeys.indexOf(key) === -1,
        );

        for (const columnKey of newColumnKey) {
          // If column is not in the referenced table config, write an error
          const columns = tableCfgData.columns! as ColumnCfg[];
          const columnConfig = columns.find(
            (column) => column.key === columnKey,
          );

          if (!columnConfig) {
            missingColumnConfigs.push({
              tableCfg: tableCfgRef,
              row: row._hash,
              column: columnKey,
              table: tableKey,
            });
          }

          processedColumnKeys.push(columnKey);
        }
      }
    });

    if (missingColumnConfigs.length > 0) {
      this.errors.columnConfigNotFound = {
        error: 'Column configurations not found',
        missingColumnConfigs,
      };
    }
  }

  // ...........................................................................
  private _dataDoesNotMatchColumnConfig(): void {
    const tableCfgs = this.rljsonIndexed.tableCfgs;
    const brokenValues: Json[] = [];

    // Iterate all tables
    iterateTablesSync(this.rljson, (tableKey, table) => {
      // If table has no config reference, continue
      const tableCfgRef = table._tableCfg;
      if (!tableCfgRef) {
        return;
      }

      // Get the table config
      const tableCfgData = tableCfgs._data[tableCfgRef];

      // Iterate all rows of the table
      for (const row of table._data) {
        // Iterate all columns of the row
        const columnKeys = Object.keys(row).filter(
          (key) => !key.startsWith('_'),
        );

        for (const columnKey of columnKeys) {
          // Continue when no columnConfig is available
          const columns = tableCfgData.columns as ColumnCfg[];
          const columnConfig = columns.find((e) => e.key === columnKey)!;

          // Ignore null or undefined values
          const value = (row as Record<string, string>)[columnKey];
          if (value == null || value == undefined) {
            continue;
          }

          // Compare type
          const typeShould = columnConfig.type;

          if (!jsonValueMatchesType(value, typeShould)) {
            jsonValueMatchesType(value, typeShould);
            brokenValues.push({
              table: tableKey,
              row: row._hash,
              column: columnKey,
              tableCfg: tableCfgRef,
            });
          }
        }
      }
    });

    if (brokenValues.length > 0) {
      this.errors.dataDoesNotMatchColumnConfig = {
        error: 'Table values have wrong types',
        brokenValues,
      };
    }
  }

  // ...........................................................................
  private _tableCfgHasRootHeadSharedError(): void {
    const rljson = this.rljson;
    const inconsistentTableCfgs: {
      table: string;
      tableCfg: string;
      error: string;
    }[] = [];

    // Iterate all tables
    for (const tableKey of this.tableKeys) {
      const table = rljson[tableKey];

      // Get table config
      const cfgRef = table._tableCfg;
      if (!cfgRef) {
        continue;
      }
      const cfg = this.rljsonIndexed.tableCfgs._data[cfgRef]! as TableCfg;
      const { isRoot, isHead, isShared } = cfg;
      if (isShared && (isRoot || isHead)) {
        inconsistentTableCfgs.push({
          error:
            'Tables with isShared = true must have isRoot = false and isHead = false',
          table: tableKey,
          tableCfg: cfgRef,
        });
      } else if (isRoot && !isHead) {
        inconsistentTableCfgs.push({
          error: 'Tables with isRoot = true must also have isHead = true',
          table: tableKey,
          tableCfg: cfgRef,
        });
      } else if (!isRoot && !isHead && !isShared) {
        inconsistentTableCfgs.push({
          error: 'Tables must be either root, root+head or shared',
          table: tableKey,
          tableCfg: cfgRef,
        });
      }
    }

    if (inconsistentTableCfgs.length > 0) {
      this.errors.tableCfgHasRootHeadSharedError = {
        error: 'Table configs have inconsistent root/head/shared settings',
        tables: inconsistentTableCfgs,
      };
    }
  }

  // ...........................................................................
  private _rootOrHeadTableHasNoIdColumn(): void {
    const rljson = this.rljson;
    const rootOrHeadTablesWithoutIdColumns: {
      table: string;
      tableCfg: string;
    }[] = [];

    // Iterate all tables
    for (const tableKey of this.tableKeys) {
      const table = rljson[tableKey];

      // Get table config
      const cfgRef = table._tableCfg;
      if (!cfgRef) {
        continue;
      }
      const cfg = this.rljsonIndexed.tableCfgs._data[cfgRef]! as TableCfg;

      const isRootOrHeadTable = cfg.isRoot || cfg.isHead;
      if (!isRootOrHeadTable) {
        continue;
      }

      // Make sure that the root or head table has an id field
      const columns = cfg.columns;
      const idField = columns.find((e) => e.key === 'id');

      if (!idField) {
        rootOrHeadTablesWithoutIdColumns.push({
          table: tableKey,
          tableCfg: cfgRef,
        });
      }
    }

    if (rootOrHeadTablesWithoutIdColumns.length > 0) {
      this.errors.rootOrHeadTableHasNoIdColumn = {
        error: 'Root or head tables must have an id column',
        tables: rootOrHeadTablesWithoutIdColumns,
      };
    }
  }

  // ...........................................................................
  private _dataHasWrongType(): void {
    const rljson = this.rljson;
    const tablesWithWrongType: string[] = [];

    for (const tableKey of this.tableKeys) {
      const tableData = rljson[tableKey];

      const items = tableData['_data'];

      if (!Array.isArray(items)) {
        tablesWithWrongType.push(tableKey);
      }
    }

    if (tablesWithWrongType.length > 0) {
      this.errors.dataHasWrongType = {
        error: '_data must be a list',
        tables: tablesWithWrongType,
      };
    }
  }

  // ...........................................................................
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
    iterateTablesSync(this.rljson, (tableKey, table) => {
      // Iterate all items in the table
      const tableData = table._data as Json[];
      for (const item of tableData) {
        for (const key of Object.keys(item)) {
          // If item is a reference
          if (key.endsWith('Ref')) {
            const targetItemHash = item[key] as string;

            // Get the referenced table
            const targetTableKey = key.substring(0, key.length - 3);
            const itemHash = item._hash as string;

            // If table is not found, write an error and continue
            if (this.tableKeys.indexOf(targetTableKey) === -1) {
              missingRefs.push({
                error: `Target table "${targetTableKey}" not found.`,
                sourceTable: tableKey,
                sourceKey: key,
                sourceItemHash: itemHash,
                targetItemHash: targetItemHash,
                targetTable: targetTableKey,
              });
              continue;
            }

            // If table is found, find the item in the target table
            const targetTableIndexed = this.rljsonIndexed[targetTableKey];
            const referencedItem = targetTableIndexed._data[targetItemHash];
            // If referenced item is not found, write an error
            if (referencedItem === undefined) {
              missingRefs.push({
                sourceTable: tableKey,
                sourceItemHash: itemHash,
                sourceKey: key,
                targetItemHash: targetItemHash,
                targetTable: targetTableKey,
                error: `Table "${targetTableKey}" has no item with hash "${targetItemHash}"`,
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

  private _layerBasesNotFound(): void {
    const brokenLayers: any[] = [];

    iterateTablesSync(this.rljson, (tableKey, table) => {
      const layersIndexed = this.rljsonIndexed[tableKey];

      const layersTable: Stack<{ [key: string]: LayerRef }> = table as Stack<{
        [key: string]: LayerRef;
      }>;
      for (const layer of layersTable._data) {
        const baseRef = layer.base;
        if (!baseRef) {
          continue;
        }

        const baseLayer = layersIndexed._data[baseRef];
        if (!baseLayer) {
          brokenLayers.push({
            layersTable: tableKey,
            brokenLayer: layer._hash,
            missingBaseLayer: baseRef,
          });
        }
      }
    });

    if (brokenLayers.length > 0) {
      this.errors.layerBasesNotFound = {
        error: 'Base layers are missing',
        brokenLayers,
      };
    }
  }

  private _stackReferencesNotFound(): void {
    const missingStacks: any[] = [];
    const missingLayerReferencesInOtherStacks: any[] = [];
    const missingLayers: any[] = [];

    iterateTablesSync(this.rljson, (tableKey, table) => {
      if (table._type !== 'stack') {
        return;
      }

      const stack: Stack<{ [key: string]: LayerRef }> = table as Stack<{
        [key: string]: LayerRef;
      }>;

      for (const stackItem of stack._data) {
        for (const layerKey in stackItem) {
          if (layerKey.startsWith('_') || layerKey === 'base') {
            continue;
          }

          const layerHash = stackItem[layerKey];
          const stackKey = layerKey.replace('Layer', 'Stack');

          if (stackKey !== tableKey) {
            //This is not the lowest Stack, search for referencing Stack and check if layer exists there
            const referencingStack = this.rljson[stackKey];
            if (!referencingStack) {
              missingStacks.push({
                stack: tableKey,
                brokenLayer: layerKey,
                missingLayerInStack: layerHash,
              });
              continue;
            }

            const isInReferencingStack = referencingStack._data
              .map((l) => (l as Record<string, LayerRef>)[layerKey])
              .includes(layerHash);
            if (!isInReferencingStack) {
              missingLayerReferencesInOtherStacks.push({
                stack: tableKey,
                brokenLayer: layerKey,
                missingLayerInStack: layerHash,
              });
            }
          }

          if (this.rljson[layerKey]._hash !== layerHash) {
            missingLayers.push({
              stack: tableKey,
              brokenLayer: layerKey,
              missingLayer: layerHash,
            });
          }
        }
      }
    });

    if (missingStacks.length > 0) {
      this.errors.stackReferencesNotFound = {
        error: 'For given Layer there is no referencing Stack',
        missingStacks: missingStacks,
      };
    }

    if (missingLayerReferencesInOtherStacks.length > 0) {
      this.errors.stackReferencesNotFound = {
        error: 'Layers in stacks are missing in referencing Stacks',
        missingLayerReferencesInOtherStacks:
          missingLayerReferencesInOtherStacks,
      };
    }

    if (missingLayers.length > 0) {
      this.errors.stackReferencesNotFound = {
        error: 'Layers in stacks are missing',
        missingLayers: missingLayers,
      };
    }
  }

  /* v8 ignore end */
}

/**
 * Validates an field name
 * @param fieldName - The field name to validate
 * @returns true if the field name is valid, false otherwise
 */
export const isValidFieldName = (fieldName: string): boolean =>
  BaseValidator.isValidFieldName(fieldName);
