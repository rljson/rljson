// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hsh } from '@rljson/hash';
import { Json, jsonValueMatchesType, jsonValueTypes } from '@rljson/json';

import { BuffetsTable } from '../content/buffet.ts';
import { CakesTable } from '../content/cake.ts';
import { LayersTable } from '../content/layer.ts';
import { ColumnCfg, TableCfg, TablesCfgTable } from '../content/table-cfg.ts';
import { RljsonIndexed, rljsonIndexed } from '../rljson-indexed.ts';
import { iterateTables, Rljson, RljsonTable } from '../rljson.ts';
import { contentTypes } from '../typedefs.ts';

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
  invalidTableTypes?: Json;

  // Table config errors
  tableCfgsReferencedTableKeyNotFound?: Json;
  columnsHaveWrongType?: Json;
  tableCfgReferencedNotFound?: Json;
  columnConfigNotFound?: Json;
  dataDoesNotMatchColumnConfig?: Json;
  tableTypesDoNotMatch?: Json;

  // Reference errors
  refsNotFound?: Json;

  // Layer errors
  layerBasesNotFound?: Json;
  layerSliceIdsTableNotFound?: Json;
  layerSliceIdsNotFound?: Json;
  layerIngredientTablesNotFound?: Json;
  layerIngredientAssignmentsNotFound?: Json;

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
      () => this._invalidTableTypes(),

      // Check table cfg
      () => this._tableCfgsReferencedTableKeyNotFound(),
      () => this._tableCfgsHaveWrongType(),
      () => this._tableCfgNotFound(),
      () => this._missingColumnConfigs(),
      () => this._dataDoesNotMatchColumnConfig(),
      () => this._tableTypesDoNotMatch(),

      // Check references
      () => this._refsNotFound(),

      // Check layers
      () => this._layerBasesNotFound(),
      () => this._layerSliceIdsTableNotFound(),
      () => this._layerSliceIdsNotFound(),
      () => this._layerIngredientAssignmentsNotFound(),

      // Check cakes
      () => this._cakeSliceIdsTableNotFound(),
      () => this._cakeSliceIdsNotFound(),
      () => this._cakeLayerTablesNotFound(),

      // Check buffets
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
      const table = this.rljson[tableKey] as RljsonTable<any, any>;

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
      for (const columnKey in item.columns) {
        if (columnKey.startsWith('_')) {
          continue;
        }
        const column = item.columns[columnKey];
        if (jsonValueTypes.indexOf(column.type) === -1) {
          brokenCfgs.push({
            brokenTableCfg: item._hash,
            brokenColumnKey: columnKey,
            brokenColumnType: column.type,
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
    iterateTables(this.rljson, (tableKey, table) => {
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
    iterateTables(this.rljson, (tableKey, table) => {
      // If table has no config reference, continue
      const tableCfgRef = table._tableCfg;
      if (!tableCfgRef) {
        return;
      }

      // Get the table config
      const tableCfgData = tableCfgs._data[tableCfgRef];

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
          const columns = tableCfgData.columns! as Json;
          if (!columns[columnKey]) {
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
    iterateTables(this.rljson, (tableKey, table) => {
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
          const columns = tableCfgData.columns as Json;
          const columnConfig = columns[columnKey] as ColumnCfg;

          // Ignore null or undefined values
          const value = row[columnKey];
          if (value == null || value == undefined) {
            continue;
          }

          // Compare type
          const typeShould = columnConfig.type;

          if (!jsonValueMatchesType(value, typeShould)) {
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
  private _tableTypesDoNotMatch(): void {
    const rljson = this.rljson;
    const tablesWithTypeMissmatch: {
      table: string;
      typeInTable: string;
      typeInConfig: string;
      tableCfg: string;
    }[] = [];

    // Iterate all tables
    for (const tableKey of this.tableKeys) {
      const table = rljson[tableKey];

      // Get reference table config
      const cfgRef = table._tableCfg;
      if (!cfgRef) {
        continue;
      }
      const cfg = this.rljsonIndexed.tableCfgs._data[cfgRef]! as TableCfg;

      // Make sure that the table type matches the table config type
      const typeShould = cfg.type;
      const typeIs = table._type;
      if (typeShould !== typeIs) {
        tablesWithTypeMissmatch.push({
          table: tableKey,
          typeInTable: typeIs,
          typeInConfig: typeShould,
          tableCfg: cfgRef,
        });
      }
    }

    if (tablesWithTypeMissmatch.length > 0) {
      this.errors.tableTypesDoNotMatch = {
        error: 'Table types do not match table config',
        tables: tablesWithTypeMissmatch,
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
  private _invalidTableTypes(): void {
    const rljson = this.rljson;
    const tablesWithWrongType: {
      readonly table: string;
      readonly type: string;
      readonly allowedTypes: string;
    }[] = [];

    for (const tableKey of this.tableKeys) {
      const table = rljson[tableKey];
      const type = table._type;
      if (contentTypes.indexOf(type) === -1) {
        tablesWithWrongType.push({
          table: tableKey,
          type,
          allowedTypes: contentTypes.join(' | '),
        });
      }
    }

    if (tablesWithWrongType.length > 0) {
      this.errors.invalidTableTypes = {
        error: 'Tables with invalid types',
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
    iterateTables(this.rljson, (tableKey, table) => {
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

    iterateTables(this.rljson, (tableKey, table) => {
      if (table._type !== 'layers') {
        return;
      }

      const layersIndexed = this.rljsonIndexed[tableKey];

      const layersTable: LayersTable = table as LayersTable;
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

  private _layerSliceIdsTableNotFound(): void {
    const brokenLayers: any[] = [];

    iterateTables(this.rljson, (tableKey, table) => {
      if (table._type !== 'layers') {
        return;
      }

      const layersTable: LayersTable = table as LayersTable;
      for (const layer of layersTable._data) {
        const idSets = layer.idSetsTable;
        if (!idSets) {
          continue;
        }

        const idSetsTable = this.rljsonIndexed[idSets];

        if (!idSetsTable) {
          brokenLayers.push({
            layersTable: tableKey,
            layerHash: layer._hash,
            missingSliceIdsTable: idSets,
          });
        }
      }
    });

    if (brokenLayers.length > 0) {
      this.errors.layerSliceIdsTableNotFound = {
        error: 'Id sets tables are missing',
        brokenLayers,
      };
    }
  }

  private _layerSliceIdsNotFound(): void {
    const brokenLayers: any[] = [];

    iterateTables(this.rljson, (tableKey, table) => {
      if (table._type !== 'layers') {
        return;
      }

      const layersTable: LayersTable = table as LayersTable;
      for (const layer of layersTable._data) {
        const idSetRef = layer.idSet;
        if (!idSetRef) {
          continue;
        }

        const idSets = layer.idSetsTable as string;
        const idSetsTable = this.rljsonIndexed[idSets];

        const idSet = idSetsTable._data[idSetRef];
        if (!idSet) {
          brokenLayers.push({
            layersTable: tableKey,
            layerHash: layer._hash,
            missingSliceIds: idSetRef,
          });
        }
      }
    });

    if (brokenLayers.length > 0) {
      this.errors.layerSliceIdsNotFound = {
        error: 'Id sets of layers are missing',
        brokenLayers,
      };
    }
  }

  private _layerIngredientAssignmentsNotFound(): void {
    const missingIngredientTables: any[] = [];
    const brokenAssignments: any[] = [];

    iterateTables(this.rljson, (tableKey, table) => {
      if (table._type !== 'layers') {
        return;
      }

      const layersTable: LayersTable = table as LayersTable;
      for (const layer of layersTable._data) {
        const ingredientTableKey = layer.ingredientsTable;
        const ingredientsTable = this.rljsonIndexed[ingredientTableKey];
        if (!ingredientsTable) {
          missingIngredientTables.push({
            brokenLayer: layer._hash,
            layersTable: tableKey,
            missingIngredientTable: ingredientTableKey,
          });
          continue;
        }

        const assignments = layer.assign;
        for (const sliceId in assignments) {
          if (sliceId.startsWith('_')) {
            continue;
          }

          const ingredientHash = assignments[sliceId];
          if (!ingredientsTable._data[ingredientHash]) {
            brokenAssignments.push({
              layersTable: tableKey,
              brokenLayer: layer._hash,
              referencedIngredientTable: ingredientTableKey,
              brokenAssignment: sliceId,
              missingIngredient: ingredientHash,
            });
          }
        }
      }
    });

    if (missingIngredientTables.length > 0) {
      this.errors.layerIngredientTablesNotFound = {
        error: 'Layer ingredient tables do not exist',
        layers: missingIngredientTables,
      };
    }

    if (brokenAssignments.length > 0) {
      this.errors.layerIngredientAssignmentsNotFound = {
        error: 'Layer ingredient assignments are broken',
        brokenAssignments: brokenAssignments,
      };
    }
  }

  private _cakeSliceIdsTableNotFound(): void {
    const brokenCakes: any[] = [];

    iterateTables(this.rljson, (tableKey, table) => {
      if (table._type !== 'cakes') {
        return;
      }

      const cakesTable: CakesTable = table as CakesTable;
      for (const cake of cakesTable._data) {
        const idSetsRef = cake.idSetsTable;
        if (!idSetsRef) {
          continue;
        }

        const idSets = this.rljsonIndexed[idSetsRef];

        if (!idSets) {
          brokenCakes.push({
            cakeTable: tableKey,
            brokenCake: cake._hash,
            missingSliceIds: idSetsRef,
          });
        }
      }
    });

    if (brokenCakes.length > 0) {
      this.errors.cakeSliceIdsTableNotFound = {
        error: 'Id sets tables referenced by cakes are missing',
        brokenCakes,
      };
    }
  }

  private _cakeSliceIdsNotFound(): void {
    const brokenCakes: any[] = [];

    iterateTables(this.rljson, (tableKey, table) => {
      if (table._type !== 'cakes') {
        return;
      }

      const cakesTable: CakesTable = table as CakesTable;
      for (const cake of cakesTable._data) {
        const idSetRef = cake.idSet;
        if (!idSetRef) {
          continue;
        }

        const idSetsRef = cake.idSetsTable as string;
        const idSets = this.rljsonIndexed[idSetsRef];

        const idSet = idSets._data[idSetRef];
        if (!idSet) {
          brokenCakes.push({
            cakeTable: tableKey,
            brokenCake: cake._hash,
            missingSliceIds: idSetRef,
          });
        }
      }
    });

    if (brokenCakes.length > 0) {
      this.errors.cakeSliceIdsNotFound = {
        error: 'Id sets of cakes are missing',
        brokenCakes,
      };
    }
  }

  private _cakeLayerTablesNotFound(): void {
    const missingLayerTables: any[] = [];
    const missingCakeLayers: any[] = [];

    iterateTables(this.rljson, (tableKey, table) => {
      if (table._type !== 'cakes') {
        return;
      }

      const cakesTable: CakesTable = table as CakesTable;
      for (const cake of cakesTable._data) {
        const layersTableKey = cake.layersTable;
        const layersTable = this.rljsonIndexed[layersTableKey];
        if (!layersTable) {
          missingLayerTables.push({
            cakeTable: tableKey,
            brokenCake: cake._hash,
            missingLayersTable: layersTableKey,
          });

          continue;
        }

        for (const layerKey in cake.layers) {
          if (layerKey.startsWith('_')) {
            continue;
          }

          const layerRef = cake.layers[layerKey];
          const layer = layersTable._data[layerRef];

          if (!layer) {
            missingCakeLayers.push({
              cakeTable: tableKey,
              brokenCake: cake._hash,
              brokenLayerName: layerKey,
              layersTable: layersTableKey,
              missingLayer: layerRef,
            });
          }
        }
      }
    });

    if (missingLayerTables.length > 0) {
      this.errors.cakeLayerTablesNotFound = {
        error: 'Layer tables of cakes are missing',
        brokenCakes: missingLayerTables,
      };
    }

    if (missingCakeLayers.length > 0) {
      this.errors.cakeLayersNotFound = {
        error: 'Layer layers of cakes are missing',
        brokenCakes: missingCakeLayers,
      };
    }
  }

  private _buffetReferencedTableNotFound(): void {
    const missingTables: Json[] = [];
    const missingItems: Json[] = [];

    iterateTables(this.rljson, (tableKey, table) => {
      if (table._type !== 'buffets') {
        return;
      }

      const buffetsTable: BuffetsTable = table as BuffetsTable;
      for (const buffet of buffetsTable._data) {
        for (const item of buffet.items) {
          // Table available?
          const itemTableKey = item.table;
          const itemTable = this.rljsonIndexed[itemTableKey];
          if (!itemTable) {
            missingTables.push({
              buffetTable: tableKey,
              brokenBuffet: buffet._hash,
              missingItemTable: itemTableKey,
            });
            continue;
          }

          // Referenced item available?
          const ref = item.ref;
          const referencedItem = itemTable._data[ref];
          if (!referencedItem) {
            missingItems.push({
              buffetTable: tableKey,
              brokenBuffet: buffet._hash,
              itemTable: itemTableKey,
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
