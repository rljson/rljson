// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';
import { exampleJsonObject, Json } from '@rljson/json';

import { BuffetsTable } from './content/buffet.ts';
import { Cake, CakesTable } from './content/cake.ts';
import { ComponentsTable } from './content/components.ts';
import { Layer, LayersTable } from './content/layer.ts';
import { SliceIdsTable } from './content/slice-ids.ts';
import { ColumnCfg, TablesCfgTable } from './content/table-cfg.ts';
import { exampleTreesTable, TreesTable } from './content/tree.ts';
import { bakeryExample } from './example/bakery-example.ts';
import { Rljson } from './rljson.ts';


export class Example {
  static readonly ok = {
    bakery: (): Rljson => bakeryExample(),

    empty: (): Rljson => {
      return {};
    },

    binary: (): Rljson => {
      return {
        table: {
          _type: 'components',
          _data: [
            { a: false, b: false },
            { a: false, b: true },
            { a: true, b: false },
            { a: true, b: true },
          ],
        },
      };
    },

    singleRow: (): Rljson => {
      const tableCfgs = hip<TablesCfgTable>({
        _hash: '',
        _type: 'tableCfgs',
        _data: [
          {
            version: 0,
            _hash: '',
            key: 'table',
            type: 'components',
            isHead: false,
            isRoot: false,
            isShared: true,
            columns: [
              {
                key: '_hash',
                type: 'string',
                titleLong: 'Hash',
                titleShort: 'Hash',
              },
              {
                key: 'int',
                type: 'number',
                titleLong: 'Integer',
                titleShort: 'Int',
              },
              {
                key: 'double',
                type: 'number',
                titleLong: 'Double',
                titleShort: 'Double',
              },
              {
                key: 'string',
                type: 'string',
                titleLong: 'String',
                titleShort: 'String',
              },
              {
                key: 'boolean',
                type: 'boolean',
                titleLong: 'Boolean',
                titleShort: 'Boolean',
              },
              {
                key: 'null',
                type: 'string',
                titleLong: 'Null',
                titleShort: 'Null',
              },
              {
                key: 'jsonArray',
                type: 'jsonArray',
                titleLong: 'JSON Array',
                titleShort: 'JSONArray',
              },
              {
                key: 'json',
                type: 'json',
                titleLong: 'JSON Object',
                titleShort: 'JSONObject',
              },
              {
                key: 'jsonValue',
                type: 'jsonValue',
                titleLong: 'JSON Value',
                titleShort: 'JSONValue',
              },
            ],
          },
        ],
      });

      const result: Rljson = {
        tableCfgs: tableCfgs,
        table: {
          _tableCfg: tableCfgs._data[0]._hash as string,
          _type: 'components',
          _data: [hip(exampleJsonObject())],
          _hash: '',
        },
      };
      return result as Rljson;
    },

    multipleRows: (): Rljson => {
      return {
        table: {
          _type: 'components',
          _data: [
            {
              string: 'str0',
              boolean: true,
              number: 1,
              array: [1, 'str0', true, { a: { b: 'c' } }],
              object: { a: { b: 'c' } },
            },

            {
              string: 'str1',
              boolean: true,
              number: 1,
              array: [1, 'str1', true, { a: { b: 'c' } }],
              object: { a: { b: 'c' } },
            },

            {
              string: 'str2',
              boolean: false,
              number: 1,
              array: [1, 'str1', true, { a: { b: 'c' } }],
              object: { d: { e: 'f' } },
            },
          ],
        },
      };
    },

    singleRef: (): Rljson => {
      const tableCfgs = hip<TablesCfgTable>({
        _type: 'tableCfgs',
        _data: [
          {
            key: 'tableA',
            type: 'components',
            isHead: false,
            isRoot: false,
            isShared: true,
            columns: [
              {
                key: '_hash',
                type: 'string',
                titleLong: 'Hash',
                titleShort: 'Hash',
              },
              {
                key: 'propertyA',
                type: 'string',
                titleLong: 'Key',
                titleShort: 'Key',
              },
            ],
            _hash: '',
          },
          {
            key: 'tableB',
            type: 'components',
            isHead: false,
            isRoot: false,
            isShared: true,
            columns: [
              {
                key: '_hash',
                type: 'string',
                titleLong: 'Hash',
                titleShort: 'Hash',
              },
              {
                key: 'propertyAFromTableA',
                type: 'string',
                titleLong: 'Table A Reference',
                titleShort: 'TableARef',
                ref: {
                  tableKey: 'tableA',
                  columnKey: 'propertyA',
                },
              },
            ],
            _hash: '',
          },
        ],
      } as TablesCfgTable);

      const tableA = hip<ComponentsTable<Json>>({
        _type: 'components',
        _tableCfg: tableCfgs._data[0]._hash as string,
        _data: [
          {
            propertyA: 'a0',
          },
          {
            propertyA: 'a1',
          },
        ],
        _hash: '',
      });

      const tableB = hip<ComponentsTable<Json>>({
        _type: 'components',
        _tableCfg: tableCfgs._data[1]._hash as string,
        _data: [
          {
            propertyAFromTableA: tableA._data[0]._hash as string,
          },
        ],
        _hash: '',
      });

      return {
        tableCfgs,
        tableA,
        tableB,
      };
    },
    multiRef: (): Rljson => {
      const tableCfgs = hip<TablesCfgTable>({
        _type: 'tableCfgs',
        _data: [
          {
            key: 'tableA',
            type: 'components',
            isHead: false,
            isRoot: false,
            isShared: true,
            columns: [
              {
                key: '_hash',
                type: 'string',
                titleLong: 'Hash',
                titleShort: 'Hash',
              },
              {
                key: 'propertyA',
                type: 'string',
                titleLong: 'Key',
                titleShort: 'Key',
              },
            ],
            _hash: '',
          },
          {
            key: 'tableB',
            type: 'components',
            isHead: false,
            isRoot: false,
            isShared: true,
            columns: [
              {
                key: '_hash',
                type: 'string',
                titleLong: 'Hash',
                titleShort: 'Hash',
              },
              {
                key: 'propertyAFromTableA',
                type: 'jsonValue',
                titleLong: 'Table A Reference',
                titleShort: 'TableARef',
                ref: {
                  tableKey: 'tableA',
                  columnKey: 'propertyA',
                },
              },
            ],
            _hash: '',
          },
        ],
      } as TablesCfgTable);

      const tableA = hip<ComponentsTable<Json>>({
        _type: 'components',
        _tableCfg: tableCfgs._data[0]._hash as string,
        _data: [
          {
            propertyA: 'a0',
          },
          {
            propertyA: 'a1',
          },
        ],
        _hash: '',
      });

      const tableB = hip<ComponentsTable<Json>>({
        _type: 'components',
        _tableCfg: tableCfgs._data[1]._hash as string,
        _data: [
          {
            propertyAFromTableA: [
              tableA._data[0]._hash,
              tableA._data[1]._hash,
            ] as string[],
          },
        ],
        _hash: '',
      });

      return {
        tableCfgs,
        tableA,
        tableB,
      };
    },
    singleSliceIdRef: (): Rljson => {
      return {
        exampleSliceId: {
          _type: 'sliceIds',
          _data: [
            {
              add: ['id0', 'id1'],
            },
          ],
        } as SliceIdsTable,
        exampleComponent: {
          _type: 'components',
          _data: [
            {
              exampleSliceId: 'id0',
            },
          ],
        } as ComponentsTable<Json>,
      };
    },
    multiSliceIdRef: (): Rljson => {
      return {
        exampleSliceId: {
          _type: 'sliceIds',
          _data: [
            {
              add: ['id0', 'id1'],
            },
          ],
        } as SliceIdsTable,
        exampleComponent: {
          _type: 'components',
          _data: [
            {
              exampleSliceId: ['id0', 'id1'],
            },
          ],
        } as ComponentsTable<Json>,
      };
    },
    tree: (): Rljson => {
      return {
        recipesTreeTable: exampleTreesTable(),
      };
    },
    complete: (): Rljson => {
      const sliceIds = hip<SliceIdsTable>({
        _type: 'sliceIds',
        _data: [
          {
            add: ['id0', 'id1'],
          },
        ],
      });

      const components = hip<ComponentsTable<any>>({
        _type: 'components',
        _data: [{ a: '0' }, { a: '1' }],
      });
      const component0 = components._data[0];
      const component1 = components._data[1];

      const abLayer0 = hip<Layer>({
        sliceIdsTable: 'sliceIds',
        sliceIdsTableRow: 'MgHRBYSrhpyl4rvsOmAWcQ',
        componentsTable: 'components',
        add: {
          id0: component0._hash,
          id1: component1._hash,
        },
      });

      const abLayer1 = hip<Layer>({
        base: abLayer0._hash as string,
        sliceIdsTable: 'sliceIds',
        sliceIdsTableRow: 'MgHRBYSrhpyl4rvsOmAWcQ',
        componentsTable: 'components',
        add: {
          id0: component0._hash,
          id1: component1._hash,
        },
      });

      const abLayers = hip<LayersTable>({
        _type: 'layers',
        _data: [abLayer0, abLayer1],
      });

      const cake = hip<Cake>({
        sliceIdsTable: 'sliceIds',
        sliceIdsRow: sliceIds._data[0]._hash as string,
        layers: {
          abLayers: abLayer1._hash as string,
        },
      });

      const cakes = hip<CakesTable>({
        _type: 'cakes',
        _data: [cake],
      });

      const buffets = hip<BuffetsTable>({
        _type: 'buffets',
        _data: [
          {
            items: [
              {
                table: 'cakes',
                ref: cakes._data[0]._hash as string,
              },
              {
                table: 'abLayers',
                ref: abLayer0._hash as string,
              },
            ],
          },
        ],
      });

      return {
        sliceIds,
        components,
        abLayers,
        cakes,
        buffets,
      };
    },
  };

  static readonly broken = {
    base: {
      brokenTableKey: () => {
        return {
          brok$en: {
            _data: [],
          },
        };
      },

      missingData: () => {
        return {
          table: {},
        } as unknown as Rljson;
      },

      dataNotBeingAnArray: () => {
        return {
          table: {
            _data: {},
          },
        } as unknown as Rljson;
      },

      missingRef: (): Rljson => {
        const tableCfgs = hip<TablesCfgTable>({
          _type: 'tableCfgs',
          _data: [
            {
              key: 'tableA',
              type: 'components',
              isHead: false,
              isRoot: false,
              isShared: true,
              columns: [
                {
                  key: '_hash',
                  type: 'string',
                  titleLong: 'Hash',
                  titleShort: 'Hash',
                },
                {
                  key: 'propertyA',
                  type: 'string',
                  titleLong: 'Key',
                  titleShort: 'Key',
                },
              ],
              _hash: '',
            },
            {
              key: 'tableB',
              type: 'components',
              isHead: false,
              isRoot: false,
              isShared: true,
              columns: [
                {
                  key: '_hash',
                  type: 'string',
                  titleLong: 'Hash',
                  titleShort: 'Hash',
                },
                {
                  key: 'propertyAFromTableA',
                  type: 'jsonValue',
                  titleLong: 'Table A Reference',
                  titleShort: 'TableARef',
                  ref: {
                    tableKey: 'tableA',
                    columnKey: 'propertyA',
                  },
                },
              ],
              _hash: '',
            },
          ],
        } as TablesCfgTable);

        const tableA = hip<ComponentsTable<Json>>({
          _type: 'components',
          _tableCfg: tableCfgs._data[0]._hash as string,
          _data: [
            {
              propertyA: 'a0',
            },
            {
              propertyA: 'a1',
            },
          ],
          _hash: '',
        });

        const tableB = hip<ComponentsTable<Json>>({
          _type: 'components',
          _tableCfg: tableCfgs._data[1]._hash as string,
          _data: [
            {
              propertyAFromTableA: 'MISSINGREF', // Missing reference
            },
          ],
          _hash: '',
        });

        return {
          tableCfgs,
          tableA,
          tableB,
        };
      },

      missingMultiRef: (): Rljson => {
        const tableCfgs = hip<TablesCfgTable>({
          _type: 'tableCfgs',
          _data: [
            {
              key: 'tableA',
              type: 'components',
              isHead: false,
              isRoot: false,
              isShared: true,
              columns: [
                {
                  key: '_hash',
                  type: 'string',
                  titleLong: 'Hash',
                  titleShort: 'Hash',
                },
                {
                  key: 'propertyA',
                  type: 'string',
                  titleLong: 'Key',
                  titleShort: 'Key',
                },
              ],
              _hash: '',
            },
            {
              key: 'tableB',
              type: 'components',
              isHead: false,
              isRoot: false,
              isShared: true,
              columns: [
                {
                  key: '_hash',
                  type: 'string',
                  titleLong: 'Hash',
                  titleShort: 'Hash',
                },
                {
                  key: 'propertyAFromTableA',
                  type: 'jsonValue',
                  titleLong: 'Table A Reference',
                  titleShort: 'TableARef',
                  ref: {
                    tableKey: 'tableA',
                    columnKey: 'propertyA',
                  },
                },
              ],
              _hash: '',
            },
          ],
        } as TablesCfgTable);

        const tableA = hip<ComponentsTable<Json>>({
          _type: 'components',
          _tableCfg: tableCfgs._data[0]._hash as string,
          _data: [
            {
              propertyA: 'a0',
            },
            {
              propertyA: 'a1',
            },
          ],
          _hash: '',
        });

        const tableB = hip<ComponentsTable<Json>>({
          _type: 'components',
          _tableCfg: tableCfgs._data[1]._hash as string,
          _data: [
            {
              propertyAFromTableA: [tableA._data[0]._hash, 'MISSINGREF'], // Missing reference
            },
          ],
          _hash: '',
        });

        return {
          tableCfgs,
          tableA,
          tableB,
        };
      },

      missingReferencedTable: (): Rljson => {
        const tableCfgs = hip<TablesCfgTable>({
          _type: 'tableCfgs',
          _data: [
            {
              key: 'tableB',
              type: 'components',
              isHead: false,
              isRoot: false,
              isShared: true,
              columns: [
                {
                  key: '_hash',
                  type: 'string',
                  titleLong: 'Hash',
                  titleShort: 'Hash',
                },
                {
                  key: 'propertyAFromTableA',
                  type: 'jsonValue',
                  titleLong: 'Table A Reference',
                  titleShort: 'TableARef',
                  ref: {
                    tableKey: 'tableA', // Referenced table missing
                    columnKey: 'propertyA',
                  },
                },
              ],
              _hash: '',
            },
          ],
        } as TablesCfgTable);

        const tableB = hip<ComponentsTable<Json>>({
          _type: 'components',
          _tableCfg: tableCfgs._data[0]._hash as string,
          _data: [
            {
              propertyAFromTableA: 'MISSINGREF', // Missing reference
            },
          ],
          _hash: '',
        });

        return {
          tableCfgs,
          tableB,
        };
      },

      missingSliceId: (): Rljson => {
        return {
          exampleSliceId: {
            _type: 'sliceIds',
            _data: [
              {
                add: ['id0', 'id1'],
              },
            ],
          } as SliceIdsTable,
          exampleComponent: {
            _type: 'components',
            _data: [
              {
                exampleSliceId: 'id2',
              },
            ],
          } as ComponentsTable<Json>,
        };
      },

      missingSliceIdTable: (): Rljson => {
        return {
          exampleComponent: {
            _type: 'components',
            _data: [
              {
                exampleSliceId: 'id0',
              },
            ],
          } as ComponentsTable<Json>,
        };
      },
    },

    tableCfg: {
      wrongType: () => {
        const result = Example.ok.singleRow();
        const columns = result.tableCfgs._data[0].columns as ColumnCfg[];
        const intColumn = columns.find((c) => c.key === 'int')!;
        intColumn.type = 'numberBroken' as any; // Break one of the types
        return hip(result, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });
      },
    },

    trees: {
      missingChildNodes: (): Rljson => {
        const result = Example.ok.tree();
        const treeTable = result.recipesTreeTable as TreesTable;

        treeTable._data.pop(); // Remove child node from _data array

        return hip(result, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });
      },

      cyclicTree: (): Rljson => {
        const result = Example.ok.tree();
        const treeTable = result.recipesTreeTable as TreesTable;

        // Introduce a cycle
        treeTable._data[0].children = [treeTable._data[0]._hash as string];

        return { recipesTreeTable: treeTable } as Rljson;
      },
    },
    layers: {
      missingBase: (): Rljson => {
        const result = Example.ok.complete();
        const layer1 = result.abLayers._data[1];
        layer1.base = 'MISSING'; // Missing base

        // Recalculate hashes
        return hip(result, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });
      },

      missingSliceIdSet: (): Rljson => {
        const result = Example.ok.complete();
        const layer1 = (result.abLayers as LayersTable)._data[1];

        layer1.sliceIdsTableRow = 'MISSING1';

        // Recalculate hashes
        return hip(result, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });
      },

      missingAssignedComponentTable: (): Rljson => {
        const result = Example.ok.complete();
        delete result.components; // Remove components table
        return result;
      },

      missingAssignedComponent: (): Rljson => {
        const result = Example.ok.complete();
        result.components._data.splice(1, 2); // Remove an component that is assigned
        return hip(result, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });
      },
    },

    cakes: {
      missingSliceIdSet: (): Rljson => {
        const result = Example.ok.complete();
        (result.cakes as CakesTable)._data[0].sliceIdsRow = 'MISSING'; // Missing ID set

        hip(result.cakes, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });

        (result.buffets as BuffetsTable)._data[0].items[0].ref = result.cakes
          ._data[0]._hash as string; // Update buffet reference

        hip(result.buffets, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });

        return result;
      },

      missingLayersTable: (): Rljson => {
        const result = Example.ok.complete();
        result.cakes._data[0].layers = { MISSING: 'HASH' }; // Missing layers table
        hip(result.cakes, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });
        return result;
      },

      missingCakeLayer: (): Rljson => {
        const result = Example.ok.complete();
        result.cakes._data[0].layers['abLayers'] = 'MISSING0';
        hip(result.cakes, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });
        return result;
      },
    },

    buffets: {
      missingTable: (): Rljson => {
        const result = Example.ok.complete();
        const buffet = result.buffets._data[0];
        buffet.items[0].table = 'MISSING0';
        buffet.items[1].table = 'MISSING1';
        hip(result, { updateExistingHashes: true, throwOnWrongHashes: false });
        return result;
      },

      missingItems: (): Rljson => {
        const result = Example.ok.complete();
        const buffet = result.buffets._data[0];
        buffet.items[0].ref = 'MISSING0';
        buffet.items[1].ref = 'MISSING1';
        hip(result, { updateExistingHashes: true, throwOnWrongHashes: false });
        return result;
      },
    },
  };
}
