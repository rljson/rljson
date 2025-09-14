// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';
import { exampleJsonObject, Json } from '@rljson/json';

import { ComponentsTable } from './content/components.ts';
import { Layer, LayerRef } from './content/layers.ts';
import { Stack } from './content/stack.ts';
import { ColumnCfg, TableCfg, TablesCfgTable } from './content/table-cfg.ts';
import { carExample } from './example/cars-example.ts';
import { Rljson } from './rljson.ts';


export class Example {
  static readonly ok = {
    cars: (): Rljson => carExample(),

    empty: (): Rljson => {
      return {};
    },

    binary: (): Rljson => {
      return {
        table: {
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
                key: 'int',
                type: 'number',
              },
              {
                key: 'double',
                type: 'number',
              },
              {
                key: 'string',
                type: 'string',
              },
              {
                key: 'boolean',
                type: 'boolean',
              },
              {
                key: 'null',
                type: 'string',
              },
              {
                key: 'jsonArray',
                type: 'jsonArray',
              },
              {
                key: 'json',
                type: 'json',
              },
              {
                key: 'jsonValue',
                type: 'jsonValue',
              },
            ],
          },
        ],
      });

      const result: Rljson = {
        tableCfgs: tableCfgs,
        table: {
          _tableCfg: tableCfgs._data[0]._hash as string,
          _data: [exampleJsonObject()],
          _hash: '',
        },
      };
      return result as Rljson;
    },

    multipleRows: (): Rljson => {
      return {
        table: {
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
      return {
        tableA: {
          _data: [
            {
              keyA0: 'a0',
            },
            {
              keyA1: 'a1',
            },
          ],
        },
        tableB: {
          _data: [
            {
              tableARef: 'KFQrf4mEz0UPmUaFHwH4T6',
            },
          ],
        },
      };
    },
    complete: (): {
      index?: ComponentsTable<Json>;
      value: ComponentsTable<Json>;
      indexLayer: Layer<{ index: LayerRef }>;
      valueLayer: Layer<{ index: LayerRef; value: LayerRef }>;
      valueLayer2: Layer<{ index: LayerRef; value: LayerRef }>;
      indexStack?: Stack<{ indexLayer: LayerRef }>;
      valueStack: Stack<{ valueLayer: LayerRef }>;
      repository: Stack<{ indexLayer: LayerRef; valueLayer: LayerRef }>;
    } => {
      const index = hip<ComponentsTable<Json>>({
        _data: [{ id: '0' }, { id: '1' }],
      });
      const idxComponent0 = index._data[0];
      const idxComponent1 = index._data[1];

      const value = hip<ComponentsTable<Json>>({
        _data: [{ a: '0' }, { a: '1' }],
      });
      const valueComponent0 = value._data[0];
      const valueComponent1 = value._data[1];

      const indexLayer = hip<Layer<{ index: LayerRef }>>({
        _data: [
          {
            indexRef: idxComponent0._hash as string,
            _hash: '',
          },
          {
            indexRef: idxComponent1._hash as string,
            _hash: '',
          },
        ],
        _hash: '',
      });

      const valueLayer = hip<Layer<{ index: LayerRef; value: LayerRef }>>({
        _data: [
          {
            indexRef: idxComponent0._hash as string,
            valueRef: valueComponent0._hash as string,
            _hash: '',
          },
          {
            indexRef: idxComponent1._hash as string,
            valueRef: valueComponent1._hash as string,
            _hash: '',
          },
        ],
        _hash: '',
      });

      const valueLayer2 = hip<Layer<{ index: LayerRef; value: LayerRef }>>({
        _data: [
          {
            indexRef: idxComponent0._hash as string,
            valueRef: valueComponent0._hash as string,
            _hash: '',
          },
          {
            indexRef: idxComponent1._hash as string,
            valueRef: valueComponent1._hash as string,
            _hash: '',
          },
        ],
        _hash: '',
      });

      const indexStack = hip<Stack<{ indexLayer: LayerRef }>>({
        _type: 'stack',
        _data: [
          {
            indexLayer: indexLayer._hash as string,
            _hash: '',
          },
        ],
        _hash: '',
      });

      const valueStack = hip<Stack<{ valueLayer: LayerRef }>>({
        _type: 'stack',
        _data: [
          {
            valueLayer: valueLayer._hash as string,
            _hash: '',
          },
          {
            valueLayer: valueLayer2._hash as string,
            base: (hip({ valueLayer: valueLayer._hash as string }) as any)
              ._hash as string,
            _hash: '',
          },
        ],
        _hash: '',
      });

      const repository = hip<
        Stack<{ indexLayer: LayerRef; valueLayer: LayerRef }>
      >({
        _type: 'stack',
        _data: [
          {
            indexLayer: indexStack._data[0].indexLayer as string,
            valueLayer: valueStack._data[0].valueLayer as string,
            _hash: '',
          },
        ],
      });

      return {
        index,
        value,
        indexLayer,
        valueLayer,
        valueLayer2,
        indexStack,
        valueStack,
        repository,
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
        return {
          tableA: {
            _data: [
              {
                keyA0: 'a0',
              },
              {
                keyA1: 'a1',
              },
            ],
          },
          tableB: {
            _data: [
              {
                tableARef: 'MISSINGREF', // MISSINGREF does not exist in tableA
              },
            ],
          },
        };
      },

      missingReferencedTable: (): Rljson => {
        return {
          tableB: {
            _data: [
              {
                tableARef: 'MISSINGREF', // tableA is missing
              },
            ],
          },
        };
      },
    },

    tableCfg: {
      wrongType: () => {
        const result = Example.ok.singleRow();
        const columns = (result.tableCfgs._data[0] as TableCfg)
          .columns as ColumnCfg[];
        const intColumn = columns.find((c) => c.key === 'int')!;
        intColumn.type = 'numberBroken' as any; // Break one of the types
        return hip(result, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });
      },
    },

    layers: {
      missingBase: (): Rljson => {
        const result = Example.ok.complete();
        const layer = result.valueStack._data[1];
        layer.base = 'MISSING'; // Missing base

        // Recalculate hashes
        return hip(result, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });
      },
    },

    stack: {
      missingCorrespondingStack: (): Rljson => {
        const result = Example.ok.complete();

        delete result.indexStack; // Missing index stack

        hip(result.repository, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });
        return result;
      },
      missingCorrespondingLayer: (): Rljson => {
        const result = Example.ok.complete();

        result.repository._data[0].indexLayer = 'MISSING';

        hip(result.repository, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });
        return result;
      },
    },
  };
}
