// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';
import { exampleJsonObject } from '@rljson/json';

import { BuffetsTable } from './content/buffet.ts';
import { Cake, CakesTable } from './content/cake.ts';
import { Collection, CollectionsTable } from './content/collection.ts';
import { IdSetsTable } from './content/id-set.ts';
import { PropertiesTable } from './content/properties.ts';
import { TablesCfgTable } from './content/table-cfg.ts';
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
          _type: 'properties',
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
      const tableCfgs: TablesCfgTable = hip({
        _hash: '',

        _type: 'properties',
        _data: [
          {
            version: 0,
            _hash: '',
            key: 'table',
            type: 'properties',
            columns: {
              int: {
                key: 'int',
                type: 'number',
              },
              double: {
                key: 'double',
                type: 'number',
              },
              string: {
                key: 'string',
                type: 'string',
              },
              boolean: {
                key: 'boolean',
                type: 'boolean',
              },
              null: {
                key: 'null',
                type: 'null',
              },
              jsonArray: {
                key: 'jsonArray',
                type: 'jsonArray',
              },
              json: {
                key: 'json',
                type: 'json',
              },
              jsonValue: {
                key: 'jsonValue',
                type: 'jsonValue',
              },
            },
          },
        ],
      });

      const result: Rljson = {
        tableCfgs: tableCfgs,
        table: {
          _type: 'properties',
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
          _type: 'properties',
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
          _type: 'properties',
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
          _type: 'properties',
          _data: [
            {
              tableARef: 'KFQrf4mEz0UPmUaFHwH4T6',
            },
          ],
        },
      };
    },
    complete: (): Rljson => {
      const idSets: IdSetsTable = hip({
        _type: 'idSets',
        _data: [
          {
            add: ['id0', 'id1'],
          },
        ],
      });

      const properties: PropertiesTable<any> = hip({
        _type: 'properties',
        _data: [{ a: '0' }, { a: '1' }],
      });
      const property0 = properties._data[0];
      const property1 = properties._data[1];

      const collection0: Collection = hip({
        idSetsTable: 'idSets',
        idSet: 'MgHRBYSrhpyl4rvsOmAWcQ',
        propertiesTable: 'properties',
        assign: {},
      });

      const collection1: Collection = hip({
        base: collection0._hash as string,
        idSetsTable: 'idSets',
        idSet: 'MgHRBYSrhpyl4rvsOmAWcQ',
        propertiesTable: 'properties',
        assign: {
          id0: property0._hash,
          id1: property1._hash,
        },
      });

      const collections: CollectionsTable = hip({
        _type: 'collections',
        _data: [collection0, collection1],
      } as CollectionsTable);

      const cake: Cake = hip({
        idSetsTable: 'idSets',
        idSet: idSets._data[0]._hash as string,
        collectionsTable: 'collections',
        layers: {
          layer0: collection0._hash as string,
          layer1: collection1._hash as string,
        },
      });

      const cakes: CakesTable = hip({
        _type: 'cakes',
        _data: [cake],
      });

      const buffets: BuffetsTable = hip({
        _type: 'buffets',
        _data: [
          {
            items: [
              {
                table: 'cakes',
                ref: cakes._data[0]._hash as string,
              },
              {
                table: 'collections',
                ref: collection0._hash as string,
              },
            ],
          },
        ],
      });

      return {
        idSets,
        properties,
        collections,
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
            _type: 'properties',
            _data: [],
          },
        };
      },

      missingData: () => {
        return {
          table: {
            _type: 'properties',
          },
        } as unknown as Rljson;
      },

      dataNotBeingAnArray: () => {
        return {
          table: {
            _type: 'properties',
            _data: {},
          },
        } as unknown as Rljson;
      },

      missingRef: (): Rljson => {
        return {
          tableA: {
            _type: 'properties',
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
            _type: 'properties',
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
            _type: 'properties',
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
        const tableCfg = result.tableCfgs._data[0];
        tableCfg.columns['int'].type = 'numberBroken'; // Break one of the types
        return hip(result, true, false);
      },
    },

    collections: {
      missingBase: (): Rljson => {
        const result = Example.ok.complete();
        const collection1 = result.collections._data[1];
        collection1.base = 'MISSING'; // Missing base

        // Recalculate hashes
        return hip(result, true, false);
      },

      missingIdSet: (): Rljson => {
        const result = Example.ok.complete();
        const collection1 = result.collections._data[1];

        collection1.idSet = 'MISSING1';

        // Recalculate hashes
        return hip(result, true, false);
      },

      missingAssignedPropertyTable: (): Rljson => {
        const result = Example.ok.complete();
        delete result.properties; // Remove properties table
        return result;
      },

      missingAssignedProperty: (): Rljson => {
        const result = Example.ok.complete();
        result.properties._data.splice(1, 2); // Remove an property that is assigned
        return hip(result, true, false);
      },
    },

    cakes: {
      missingIdSet: (): Rljson => {
        const result = Example.ok.complete();
        result.cakes._data[0].idSet = 'MISSING'; // Missing ID set
        hip(result.cakes, true, false);
        return result;
      },

      missingCollectionsTable: (): Rljson => {
        const result = Example.ok.complete();
        result.cakes._data[0].collectionsTable = 'MISSING'; // Missing collections table
        hip(result.cakes, true, false);
        return result;
      },

      missingLayerCollection: (): Rljson => {
        const result = Example.ok.complete();
        result.cakes._data[0].layers['layer0'] = 'MISSING0';
        result.cakes._data[0].layers['layer1'] = 'MISSING1';
        hip(result.cakes, true, false);
        return result;
      },
    },

    buffets: {
      missingTable: (): Rljson => {
        const result = Example.ok.complete();
        const buffet = result.buffets._data[0];
        buffet.items[0].table = 'MISSING0';
        buffet.items[1].table = 'MISSING1';
        hip(result, true, false);
        return result;
      },

      missingItems: (): Rljson => {
        const result = Example.ok.complete();
        const buffet = result.buffets._data[0];
        buffet.items[0].ref = 'MISSING0';
        buffet.items[1].ref = 'MISSING1';
        hip(result, true, false);
        return result;
      },
    },
  };
}
