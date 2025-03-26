// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';

import { describe, expect, it } from 'vitest';

import { TableCfg } from '../../src/content/table-cfg.ts';
import { Example } from '../../src/example.ts';
import { Rljson, RljsonPrivate } from '../../src/rljson.ts';
import {
  BaseValidator,
  isValidFieldName,
} from '../../src/validate/base-validator.ts';
import { Errors } from '../../src/validate/validate.ts';

describe('BaseValidator', async () => {
  const validate = (rljson: any): Errors => {
    return new BaseValidator().validateSync(rljson);
  };

  describe('base errors', () => {
    it('validate', async () => {
      // Define the expected result
      const expectedResult = {
        hasErrors: true,
        tableKeysNotLowerCamelCase: {
          error: 'Table names must be lower camel case',
          invalidTableKeys: ['brok$en'],
        },
      };

      // Take a broken rljson object
      const rljson: Rljson = Example.broken.base.brokenTableKey() as Rljson;

      // Validate it
      const resultSync = new BaseValidator().validateSync(rljson);
      const resultAsync = await new BaseValidator().validate(rljson);

      // Check
      expect(resultSync).toEqual(expectedResult);
      expect(resultAsync).toEqual(expectedResult);
    });

    describe('tableKeysNotLowerCamelCase()', () => {
      describe('returns no errors', () => {
        describe('when all table names have camel case fields', () => {
          it('for an empy rljson object', () => {
            const r = validate({});
            expect(r).toEqual({ hasErrors: false });
          });

          it('for an rljson object with valid table names', () => {
            const r = validate({
              tableOne: { _type: 'properties', _data: [] },
              tableTwo: { _type: 'properties', _data: [] },
            });
            expect(r).toEqual({ hasErrors: false });
          });
        });

        it('when private keys like _type or _hash are contained', () => {
          const r = validate({
            _type: 'properties',
            _data: [],
          });
          expect(r).toEqual({ hasErrors: false });
        });
      });

      describe('returns an error JSON', () => {
        it('when a table name starts with a number', () => {
          const r = validate({
            '1table': { _type: 'properties', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['1table'],
          });
        });
        it('when a table name contains a space', () => {
          const r = validate({
            'table one': { _type: 'properties', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['table one'],
          });
        });

        it('when a table name contains a dash', () => {
          const r = validate({
            'table-one': { _type: 'properties', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['table-one'],
          });
        });

        it('when a table name contains an underscore', () => {
          const r = validate({
            table_one: { _type: 'properties', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['table_one'],
          });
        });

        it('when a table name contains a capital letter', () => {
          const r = validate({
            TableOne: { _type: 'properties', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['TableOne'],
          });
        });

        it('when multiple table names are invalid', () => {
          const r = validate({
            '1table': { _type: 'properties', _data: [] },
            'table one': { _type: 'properties', _data: [] },
            'table-one': { _type: 'properties', _data: [] },
            table_one: { _type: 'properties', _data: [] },
            TableOne: { _type: 'properties', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: [
              '1table',
              'table one',
              'table-one',
              'table_one',
              'TableOne',
            ],
          });
        });

        it('when a table name is an empty string', () => {
          const r = validate({
            '': { _type: 'properties', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: [''],
          });
        });
      });
    });

    describe('tableKeysDoNotEndWithRef()', () => {
      describe('returns no errors', () => {
        it('when there are no table names ending with "Ref"', () => {
          expect(
            validate({
              tableOne: { _type: 'properties', _data: [] },
              tableTwo: { _type: 'properties', _data: [] },
            }).hasErrors,
          ).toBe(false);
        });

        it('when there are no table names', () => {
          expect(validate({}).hasErrors).toBe(false);
        });
      });

      describe('returns an error JSON', () => {
        it('when a table name ends with "Ref"', () => {
          const r = validate({
            tableOneRef: { _type: 'properties', _data: [] },
          });
          expect(r.tableKeysDoNotEndWithRef).toEqual({
            error: 'Table names must not end with "Ref"',
            invalidTableKeys: ['tableOneRef'],
          });
        });

        it('when multiple table names end with "Ref"', () => {
          const r = validate({
            tableOneRef: { _type: 'properties', _data: [] },
            tableTwoRef: { _type: 'properties', _data: [] },
          });
          expect(r.tableKeysDoNotEndWithRef).toEqual({
            error: 'Table names must not end with "Ref"',
            invalidTableKeys: ['tableOneRef', 'tableTwoRef'],
          });
        });
      });
    });

    describe('columnNamesNotLowerCamelCase()', () => {
      describe('returns "ok"', () => {
        it('when all column names have camel case fields', () => {
          const r = validate({
            tableOne: { _type: 'properties', _data: [{ columnOne: 123 }] },
            tableTwo: { _type: 'properties', _data: [{ columnTwo: 456 }] },
          });
          expect(r).toEqual({ hasErrors: false });
        });

        it('when private keys are like _type or _hash are contained', () => {
          const r = validate({
            tableOne: {
              _type: 'properties',
              _data: [{ _type: 123 }],
            },
          });
          expect(r).toEqual({ hasErrors: false });
        });
      });

      describe('returns an error JSON', () => {
        it('when a column name starts with a number', () => {
          const r = validate({
            tableOne: { _type: 'properties', _data: [{ '1column': 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['1column'] },
          });
        });

        it('when a column name contains a space', () => {
          const r = validate({
            tableOne: { _type: 'properties', _data: [{ 'column one': 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['column one'] },
          });
        });

        it('when a column name contains a dash', () => {
          const r = validate({
            tableOne: { _type: 'properties', _data: [{ 'column-one': 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['column-one'] },
          });
        });

        it('when a column name contains an underscore', () => {
          const r = validate({
            tableOne: { _type: 'properties', _data: [{ column_one: 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['column_one'] },
          });
        });

        it('when a column name contains a capital letter', () => {
          const r = validate({
            tableOne: { _type: 'properties', _data: [{ ColumnOne: 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['ColumnOne'] },
          });
        });

        it('when multiple column names are invalid', () => {
          const r = validate({
            tableOne: {
              _type: 'properties',
              _data: [
                { '1column': 123, 'column one': 456, 'column-one': 789 },
                { column_one: 101, ColumnOne: 202 },
              ],
            },

            tableTwo: {
              _type: 'properties',
              _data: [{ '1xyz': 123 }, { xy_38: 101 }],
            },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: {
              tableOne: [
                '1column',
                'column one',
                'column-one',
                'column_one',
                'ColumnOne',
              ],
              tableTwo: ['1xyz', 'xy_38'],
            },
          });
        });

        it('when a column name is an empty string', () => {
          const r = validate({
            tableOne: { _type: 'properties', _data: [{ '': 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: [''] },
          });
        });
      });
    });

    describe('hashesAreOk()', () => {
      describe('returns no errors', () => {
        it('when there are no hashes', () => {
          expect(
            validate({
              tableOne: { _type: 'properties', _data: [] },
              tableTwo: { _type: 'properties', _data: [] },
            }).hasErrors,
          ).toBe(false);
        });

        it('when there are valid hashes', () => {
          expect(
            validate(
              hip({
                tableOne: { _type: 'properties', _data: [] },
                tableTwo: { _type: 'properties', _data: [] },
              }),
            ).hasErrors,
          ).toBe(false);
        });
      });

      describe('throws', () => {
        it('when hashes are invalid', () => {
          const errors = validate({
            tableOne: { _type: 'properties', _data: [], _hash: 'invalid' },
          });

          expect(errors).toEqual({
            hasErrors: true,
            hashesNotValid: {
              error:
                'Hash "invalid" does not match the newly calculated one "DKwor-pULmCs6RY-sMyfrM". ' +
                'Please make sure that all systems are producing the same hashes.',
            },
          });
        });
      });
    });

    describe('isValidFieldName()', () => {
      it('returns true for valid field names', () => {
        expect(isValidFieldName('helloWorld')).toBe(true);
      });
      it('returns false for invalid field names', () => {
        expect(isValidFieldName('HelloWorld')).toBe(false);
        expect(isValidFieldName('hello$World')).toBe(false);
      });
    });

    describe('dataIsFound()', () => {
      it('returns no errors when data is found', () => {
        expect(
          validate({
            tableOne: { _type: 'properties', _data: [] },
            tableTwo: { _type: 'properties', _data: [] },
          }),
        ).toEqual({
          hasErrors: false,
        });
      });

      it('returns an error when data is not found', () => {
        expect(
          validate({
            tableOne: { _type: 'properties' },
            tableTwo: { _type: 'properties', _data: [] },
            tableThree: { _type: 'properties' },
          }),
        ).toEqual({
          dataNotFound: {
            error: '_data is missing in tables',
            tables: ['tableOne', 'tableThree'],
          },
          hasErrors: true,
        });
      });
    });

    describe('dataHasWrongType()', () => {
      it('returns no errors when data is an array', () => {
        expect(
          validate({
            tableOne: { _type: 'properties', _data: [] },
            tableTwo: { _type: 'properties', _data: [] },
          }),
        ).toEqual({
          hasErrors: false,
        });
      });

      it('returns an error when data is not an array', () => {
        expect(
          validate({
            tableOne: { _type: 'properties', _data: {} },
            tableTwo: { _type: 'properties', _data: [] },
            tableThree: { _type: 'properties', _data: 'string' },
          }),
        ).toEqual({
          dataHasWrongType: {
            error: '_data must be a list',
            tables: ['tableOne', 'tableThree'],
          },
          hasErrors: true,
        });
      });
    });

    describe('invalidTableTypes()', () => {
      it('returns no errors when table types are valid', () => {
        expect(
          validate({
            tableOne: { _type: 'xyz', _data: [] },
            tableTwo: { _type: 'abc', _data: [] },
            tableThree: { _type: 'properties', _data: [] },
          }),
        ).toEqual({
          hasErrors: true,
          invalidTableTypes: {
            error: 'Tables with invalid types',
            tables: [
              {
                allowedTypes: 'buffets | cakes | layers | idSets | properties',
                table: 'tableOne',
                type: 'xyz',
              },
              {
                allowedTypes: 'buffets | cakes | layers | idSets | properties',
                table: 'tableTwo',
                type: 'abc',
              },
            ],
          },
        });
      });
    });

    describe('tableTypesDoNotMatch()', () => {
      describe('returns an error', () => {
        it('when table type does not match the configured type', () => {
          const rljson = Example.ok.singleRow();
          const table = rljson.table;
          table._type = 'cakes';
          const tableCfg = rljson.tableCfgs._data[0]._hash;

          hip(rljson, true, false);

          const result = validate(rljson);
          expect(result).toEqual({
            hasErrors: true,
            tableTypesDoNotMatch: {
              error: 'Table types do not match table config',
              tables: [
                {
                  table: 'table',
                  typeInConfig: 'properties',
                  typeInTable: 'cakes',
                  tableCfg,
                },
              ],
            },
          });
        });
      });
    });
  });

  describe('tableCfg errors', () => {
    describe('tableCfgsReferencedTableKeyNotFound()', () => {
      it('returns an error when a table referenced in tableCfgs is not found', () => {
        const rljson = Example.ok.singleRow();
        (rljson as unknown as RljsonPrivate).tableCfgs!._data[0].key =
          'MISSING';
        hip(rljson, true, false);
        const tableCfg: TableCfg = rljson.tableCfgs._data[0];

        expect(validate(rljson)).toEqual({
          hasErrors: true,
          tableCfgsReferencedTableKeyNotFound: {
            brokenCfgs: [
              {
                brokenTableCfg: tableCfg._hash,
                tableKeyNotFound: 'MISSING',
              },
            ],
            error: 'Tables referenced in tableCfgs not found',
          },
        });
      });
    });

    describe('columnsHaveWrongType()', () => {
      it('returns an error when column types are not valid', () => {
        const table = Example.broken.tableCfg.wrongType();
        const tableCfg = table.tableCfgs._data[0];
        expect(validate(table)).toEqual({
          hasErrors: true,
          columnsHaveWrongType: {
            brokenCfgs: [
              {
                brokenColumnKey: 'int',
                brokenColumnType: 'numberBroken',
                brokenTableCfg: tableCfg._hash,
              },
            ],
            error:
              'Some of the columns have invalid types. ' +
              'Valid types are: string, number, boolean, null, undefined, ' +
              'json, jsonArray, jsonValue',
          },
        });
      });
    });

    describe('tableCfgReferencedNotFound()', () => {
      it('returns an error when a referenced table config is not found', () => {
        const rljson = Example.ok.singleRow();
        rljson.table._tableCfg = 'MISSING';
        hip(rljson, true, false);

        expect(validate(rljson)).toEqual({
          hasErrors: true,
          tableCfgReferencedNotFound: {
            error: 'Referenced table config not found',
            tableCfgNotFound: [
              {
                brokenTableCfgRef: 'MISSING',
                tableWithBrokenTableCfgRef: 'table',
              },
            ],
          },
        });
      });
    });

    describe('missingColumnConfigs', () => {
      it('returns an error when no config is found for a column', () => {
        const rljson = Example.ok.singleRow();
        const tableCfg = rljson.tableCfgs._data[0];
        const tableCfgRef = rljson.table._tableCfg;
        expect(tableCfgRef).toBe(tableCfg._hash);

        // Remove one column config
        delete tableCfg.columns['int'];
        hip(tableCfg, true, false);
        rljson.table._tableCfg = tableCfg._hash;
        hip(rljson, true, false);

        expect(validate(rljson)).toEqual({
          columnConfigNotFound: {
            error: 'Column configurations not found',
            missingColumnConfigs: [
              {
                column: 'int',
                row: 'r63TJIT73TYatXyqS4251G',
                tableCfg: rljson.table._tableCfg,
                table: 'table',
              },
            ],
          },
          hasErrors: true,
        });
      });
    });

    describe('dataDoesNotMatchColumnConfig', () => {
      it('returns an error when the data type does not match the column type', () => {
        const rljson = Example.ok.singleRow();
        const tableCfg = rljson.tableCfgs._data[0];
        const tableCfgRef = rljson.table._tableCfg;
        expect(tableCfgRef).toBe(tableCfg._hash);

        // Write a string into a number column
        const row = rljson.table._data[0];
        row.int = 'string';
        row.double = true;
        hip(tableCfg, true, false);
        const tableCfgHash = rljson.table._tableCfg;

        expect(validate(rljson)).toEqual({
          dataDoesNotMatchColumnConfig: {
            brokenValues: [
              {
                column: 'int',
                row: 'LNpv7AlHPSxqsyTRLy7e5Z',
                table: 'table',
                tableCfg: tableCfgHash,
              },
              {
                column: 'double',
                row: 'LNpv7AlHPSxqsyTRLy7e5Z',
                table: 'table',
                tableCfg: tableCfgHash,
              },
            ],
            error: 'Table values have wrong types',
          },
          hasErrors: true,
        });
      });
    });
  });

  describe('reference errors', () => {
    describe('refsNotFound', () => {
      it('returns no errors when all refs are found', () => {
        expect(validate(Example.ok.singleRef())).toEqual({
          hasErrors: false,
        });
      });

      it('returns an error when a reference table is not found', () => {
        expect(validate(Example.broken.base.missingReferencedTable())).toEqual({
          refsNotFound: {
            error: 'Broken references',
            missingRefs: [
              {
                error: 'Target table "tableA" not found.',
                sourceItemHash: 'nFaC4ql3MDVMhdWTBG-rdZ',
                sourceKey: 'tableARef',
                sourceTable: 'tableB',
                targetItemHash: 'MISSINGREF',
                targetTable: 'tableA',
              },
            ],
          },
          hasErrors: true,
        });
      });

      it('returns an error when a ref is not found', () => {
        expect(validate(Example.broken.base.missingRef())).toEqual({
          refsNotFound: {
            error: 'Broken references',
            missingRefs: [
              {
                error: 'Table "tableA" has no item with hash "MISSINGREF"',
                sourceKey: 'tableARef',
                sourceItemHash: 'nFaC4ql3MDVMhdWTBG-rdZ',
                targetItemHash: 'MISSINGREF',
                sourceTable: 'tableB',
                targetTable: 'tableA',
              },
            ],
          },
          hasErrors: true,
        });
      });
    });
  });

  describe('layer errors', () => {
    describe('layerBasesNotFound()', () => {
      it('returns no errors when all base refs are found', () => {
        expect(validate(Example.ok.complete())).toEqual({
          hasErrors: false,
        });
      });

      it('returns an error when a base ref is not found', () => {
        const rljson = Example.broken.layers.missingBase();
        const layer = rljson.layers._data[1];
        expect(validate(rljson)).toEqual({
          layerBasesNotFound: {
            brokenLayers: [
              {
                brokenLayer: layer._hash,
                layersTable: 'layers',
                missingBaseLayer: 'MISSING',
              },
            ],
            error: 'Base layers are missing',
          },
          hasErrors: true,
        });
      });
    });

    describe('layerIdSetsTableNotFound()', () => {
      it('returns an error when an reference idSets table is not found', () => {
        const rljson = Example.ok.complete();
        const layer0 = rljson.layers._data[0];
        const layer1 = rljson.layers._data[1];
        delete rljson.idSets;
        hip(rljson, true, false);

        expect(validate(rljson)).toEqual({
          layerIdSetsTableNotFound: {
            brokenLayers: [
              {
                layerHash: layer0._hash,
                layersTable: 'layers',
                missingIdSetsTable: 'idSets',
              },
              {
                layerHash: layer1._hash,
                layersTable: 'layers',
                missingIdSetsTable: 'idSets',
              },
            ],
            error: 'Id sets tables are missing',
          },
          hasErrors: true,
        });
      });
    });

    describe('layerIdSetNotFound()', () => {
      it('returns an error when idSetRef is not found', () => {
        const rljson = Example.broken.layers.missingIdSet();
        const layer = rljson.layers._data[1];
        expect(layer.idSet).toBe('MISSING1');

        expect(validate(rljson)).toEqual({
          layerIdSetNotFound: {
            brokenLayers: [
              {
                layerHash: layer._hash,
                layersTable: 'layers',
                missingIdSet: 'MISSING1',
              },
            ],
            error: 'Id sets of layers are missing',
          },
          hasErrors: true,
        });
      });

      it('return no error, when no idSetRef is defined', () => {
        // Set idSet to undefined
        const result = Example.ok.complete();
        expect(validate(result)).toEqual({
          hasErrors: false,
        });

        // delete idSet reference
        const layer1 = result.layers._data[1];
        delete layer1.idSet;
        hip(layer1, true, false);

        // Update cake layers
        const cake = result.cakes._data[0];
        cake.layers['layer1'] = layer1._hash;
        hip(cake, true, false);

        // Update buffet items
        const buffet = result.buffets._data[0];
        buffet.items[0].ref = cake._hash;
        buffet.items[1].ref = layer1._hash;

        hip(result, true, false);

        // Validate -> no error
        expect(validate(result)).toEqual({
          hasErrors: false,
        });
      });
    });

    describe('layerAssignedPropertiesFound', () => {
      it('returns an error when the properties table is not foun', () => {
        const rljson = Example.broken.layers.missingAssignedPropertyTable();
        const layer0 = rljson.layers._data[0];
        const layer1 = rljson.layers._data[1];

        expect(validate(rljson)).toEqual({
          layerPropertyTablesNotFound: {
            layers: [
              {
                brokenLayer: layer0._hash,
                missingPropertyTable: 'properties',
                layersTable: 'layers',
              },
              {
                brokenLayer: layer1._hash,
                layersTable: 'layers',
                missingPropertyTable: 'properties',
              },
            ],
            error: 'Layer property tables do not exist',
          },
          hasErrors: true,
        });
      });

      it('returns an error when an assigned property is not found', () => {
        const rljsonOk = Example.ok.complete();
        const property = rljsonOk.properties._data[1];

        const rljson = Example.broken.layers.missingAssignedProperty();
        const layer = rljson.layers._data[1];

        expect(validate(rljson)).toEqual({
          layerPropertyAssignmentsNotFound: {
            brokenAssignments: [
              {
                brokenLayer: layer._hash,
                brokenAssignment: 'id1',
                missingProperty: property._hash,
                referencedPropertyTable: 'properties',
                layersTable: 'layers',
              },
            ],
            error: 'Layer property assignments are broken',
          },
          hasErrors: true,
        });
      });
    });
  });

  describe('cake errors', () => {
    describe('cakeIdSetNotFound', () => {
      it('returns no errors when all idSets are found', () => {
        expect(validate(Example.ok.complete())).toEqual({
          hasErrors: false,
        });
      });

      it('returns no errors when no idSets is specified', () => {
        const rljson = Example.ok.complete();
        delete rljson.cakes._data[0].idSet;
        hip(rljson, true, false);

        // Update buffet items
        const buffet = rljson.buffets._data[0];
        buffet.items[0].ref = rljson.cakes._data[0]._hash;
        buffet.items[1].ref = rljson.layers._data[1]._hash;
        hip(rljson, true, false);

        // Validate
        expect(validate(rljson)).toEqual({
          hasErrors: false,
        });
      });

      it('returns an error when an idSet is not found', () => {
        const rljson = Example.broken.cakes.missingIdSet();
        const cake = rljson.cakes._data[0];
        expect(validate(rljson)).toEqual({
          cakeIdSetNotFound: {
            brokenCakes: [
              {
                brokenCake: cake._hash,
                cakeTable: 'cakes',
                missingIdSet: 'MISSING',
              },
            ],
            error: 'Id sets of cakes are missing',
          },
          hasErrors: true,
        });
      });
    });

    describe('cakeIdSetsTableNotFound', () => {
      it('returns no error when no idSets table is specified', () => {
        const rljson = Example.ok.complete();
        const cake = rljson.cakes._data[0];
        delete cake.idSetsTable;
        delete cake.idSet;
        delete rljson.buffets;
        hip(rljson, true, false);

        expect(validate(rljson)).toEqual({ hasErrors: false });
      });

      it('returns an error when an referenced idSets is not found', () => {
        const rljson = Example.ok.complete();
        const cake = rljson.cakes._data[0];
        cake.idSetsTable = 'MISSINGIDSET';
        hip(rljson, true, false);

        expect(validate(rljson)).toEqual({
          cakeIdSetsTableNotFound: {
            brokenCakes: [
              {
                brokenCake: cake._hash,
                cakeTable: 'cakes',
                missingIdSets: 'MISSINGIDSET',
              },
            ],
            error: 'Id sets tables referenced by cakes are missing',
          },
          hasErrors: true,
        });
      });
    });

    describe('cakeLayerTablesNotFound', () => {
      it('returns an error when the layer table is not found', () => {
        const rljson = Example.broken.cakes.missingLayersTable();
        const cake = rljson.cakes._data[0];
        expect(validate(rljson)).toEqual({
          cakeLayerTablesNotFound: {
            brokenCakes: [
              {
                brokenCake: cake._hash,
                cakeTable: 'cakes',
                missingLayersTable: 'MISSING',
              },
            ],
            error: 'Layer tables of cakes are missing',
          },
          hasErrors: true,
        });
      });
    });

    describe('cakeLayersNotFound', () => {
      it('returns an error when the layer of a layer is not found', () => {
        const rljson = Example.broken.cakes.missingCakeLayer();
        const cake = rljson.cakes._data[0];
        expect(validate(rljson)).toEqual({
          cakeLayersNotFound: {
            brokenCakes: [
              {
                brokenCake: cake._hash,
                brokenLayerName: 'layer0',
                cakeTable: 'cakes',
                layersTable: 'layers',
                missingLayer: 'MISSING0',
              },
              {
                brokenCake: cake._hash,
                brokenLayerName: 'layer1',
                cakeTable: 'cakes',
                layersTable: 'layers',
                missingLayer: 'MISSING1',
              },
            ],
            error: 'Layer layers of cakes are missing',
          },
          hasErrors: true,
        });
      });
    });
  });

  describe('buffet errors', () => {
    describe('buffetReferencedTablesNotFound', () => {
      it('returns an error when the referenced table is not found', () => {
        const rljson = Example.broken.buffets.missingTable();
        const buffet = rljson.buffets._data[0];

        expect(validate(rljson)).toEqual({
          buffetReferencedTablesNotFound: {
            brokenBuffets: [
              {
                brokenBuffet: buffet._hash,
                buffetTable: 'buffets',
                missingItemTable: 'MISSING0',
              },
              {
                brokenBuffet: buffet._hash,
                buffetTable: 'buffets',
                missingItemTable: 'MISSING1',
              },
            ],
            error: 'Referenced tables of buffets are missing',
          },
          hasErrors: true,
        });
      });
    });

    describe('buffetReferencedItemsNotFound', () => {
      it('returns an error when the referenced table is not found', () => {
        const rljson = Example.broken.buffets.missingItems();
        const buffet = rljson.buffets._data[0];
        expect(validate(rljson)).toEqual({
          buffetReferencedItemsNotFound: {
            brokenItems: [
              {
                brokenBuffet: buffet._hash,
                buffetTable: 'buffets',
                itemTable: 'cakes',
                missingItem: 'MISSING0',
              },
              {
                brokenBuffet: buffet._hash,
                buffetTable: 'buffets',
                itemTable: 'layers',
                missingItem: 'MISSING1',
              },
            ],
            error: 'Referenced items of buffets are missing',
          },
          hasErrors: true,
        });
      });
    });
  });
});
