// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';
import { Json } from '@rljson/json';

import { describe, expect, it } from 'vitest';

import { ColumnCfg, TableCfg } from '../../src/content/table-cfg.ts';
import { Example } from '../../src/example.ts';
import { Rljson, RljsonPrivate } from '../../src/rljson.ts';
import { BaseValidator, isValidFieldName } from '../../src/validate/base-validator.ts';
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
              tableOne: { _type: 'ingredients', _data: [] },
              tableTwo: { _type: 'ingredients', _data: [] },
            });
            expect(r).toEqual({ hasErrors: false });
          });
        });

        it('when private keys like _type or _hash are contained', () => {
          const r = validate({
            _type: 'ingredients',
            _data: [],
          });
          expect(r).toEqual({ hasErrors: false });
        });
      });

      describe('returns an error JSON', () => {
        it('when a table name starts with a number', () => {
          const r = validate({
            '1table': { _type: 'ingredients', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['1table'],
          });
        });
        it('when a table name contains a space', () => {
          const r = validate({
            'table one': { _type: 'ingredients', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['table one'],
          });
        });

        it('when a table name contains a dash', () => {
          const r = validate({
            'table-one': { _type: 'ingredients', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['table-one'],
          });
        });

        it('when a table name contains an underscore', () => {
          const r = validate({
            table_one: { _type: 'ingredients', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['table_one'],
          });
        });

        it('when a table name contains a capital letter', () => {
          const r = validate({
            TableOne: { _type: 'ingredients', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['TableOne'],
          });
        });

        it('when multiple table names are invalid', () => {
          const r = validate({
            '1table': { _type: 'ingredients', _data: [] },
            'table one': { _type: 'ingredients', _data: [] },
            'table-one': { _type: 'ingredients', _data: [] },
            table_one: { _type: 'ingredients', _data: [] },
            TableOne: { _type: 'ingredients', _data: [] },
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
            '': { _type: 'ingredients', _data: [] },
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
              tableOne: { _type: 'ingredients', _data: [] },
              tableTwo: { _type: 'ingredients', _data: [] },
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
            tableOneRef: { _type: 'ingredients', _data: [] },
          });
          expect(r.tableKeysDoNotEndWithRef).toEqual({
            error: 'Table names must not end with "Ref"',
            invalidTableKeys: ['tableOneRef'],
          });
        });

        it('when multiple table names end with "Ref"', () => {
          const r = validate({
            tableOneRef: { _type: 'ingredients', _data: [] },
            tableTwoRef: { _type: 'ingredients', _data: [] },
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
            tableOne: { _type: 'ingredients', _data: [{ columnOne: 123 }] },
            tableTwo: { _type: 'ingredients', _data: [{ columnTwo: 456 }] },
          });
          expect(r).toEqual({ hasErrors: false });
        });

        it('when private keys are like _type or _hash are contained', () => {
          const r = validate({
            tableOne: {
              _type: 'ingredients',
              _data: [{ _type: 123 }],
            },
          });
          expect(r).toEqual({ hasErrors: false });
        });
      });

      describe('returns an error JSON', () => {
        it('when a column name starts with a number', () => {
          const r = validate({
            tableOne: { _type: 'ingredients', _data: [{ '1column': 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['1column'] },
          });
        });

        it('when a column name contains a space', () => {
          const r = validate({
            tableOne: { _type: 'ingredients', _data: [{ 'column one': 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['column one'] },
          });
        });

        it('when a column name contains a dash', () => {
          const r = validate({
            tableOne: { _type: 'ingredients', _data: [{ 'column-one': 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['column-one'] },
          });
        });

        it('when a column name contains an underscore', () => {
          const r = validate({
            tableOne: { _type: 'ingredients', _data: [{ column_one: 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['column_one'] },
          });
        });

        it('when a column name contains a capital letter', () => {
          const r = validate({
            tableOne: { _type: 'ingredients', _data: [{ ColumnOne: 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['ColumnOne'] },
          });
        });

        it('when multiple column names are invalid', () => {
          const r = validate({
            tableOne: {
              _type: 'ingredients',
              _data: [
                { '1column': 123, 'column one': 456, 'column-one': 789 },
                { column_one: 101, ColumnOne: 202 },
              ],
            },

            tableTwo: {
              _type: 'ingredients',
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
            tableOne: { _type: 'ingredients', _data: [{ '': 123 }] },
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
              tableOne: { _type: 'ingredients', _data: [] },
              tableTwo: { _type: 'ingredients', _data: [] },
            }).hasErrors,
          ).toBe(false);
        });

        it('when there are valid hashes', () => {
          expect(
            validate(
              hip({
                tableOne: { _type: 'ingredients', _data: [] },
                tableTwo: { _type: 'ingredients', _data: [] },
              }),
            ).hasErrors,
          ).toBe(false);
        });
      });

      describe('throws', () => {
        it('when hashes are invalid', () => {
          const errors = validate({
            tableOne: { _type: 'ingredients', _data: [], _hash: 'invalid' },
          });

          expect(errors).toEqual({
            hasErrors: true,
            hashesNotValid: {
              error:
                'Hash "invalid" does not match the newly calculated one "2Mdbi9i3x8M8rrr6dAs2Hf". ' +
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
            tableOne: { _type: 'ingredients', _data: [] },
            tableTwo: { _type: 'ingredients', _data: [] },
          }),
        ).toEqual({
          hasErrors: false,
        });
      });

      it('returns an error when data is not found', () => {
        expect(
          validate({
            tableOne: { _type: 'ingredients' },
            tableTwo: { _type: 'ingredients', _data: [] },
            tableThree: { _type: 'ingredients' },
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
            tableOne: { _type: 'ingredients', _data: [] },
            tableTwo: { _type: 'ingredients', _data: [] },
          }),
        ).toEqual({
          hasErrors: false,
        });
      });

      it('returns an error when data is not an array', () => {
        expect(
          validate({
            tableOne: { _type: 'ingredients', _data: {} },
            tableTwo: { _type: 'ingredients', _data: [] },
            tableThree: { _type: 'ingredients', _data: 'string' },
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

    describe('tableCfgHasRootHeadSharedError()', () => {
      const create = (config: {
        isHead: boolean;
        isRoot: boolean;
        isShared: boolean;
      }) => {
        const columns: ColumnCfg[] = [
          { key: 'name', type: 'string' },
          { key: 'id', type: 'string' },
        ];

        const tableCfg = hip<TableCfg>({
          key: 'tableOne',
          type: 'components',
          columns,
          isHead: config.isHead,
          isRoot: config.isRoot,
          isShared: config.isShared,
        });

        const row: Json = { name: 'item1', id: 'id1' };

        const rljson = {
          tableOne: {
            _type: 'ingredients',
            _tableCfg: tableCfg._hash as string,
            _data: [row],
          },

          tableCfgs: {
            _type: 'ingredients',
            _data: [tableCfg],
          },
        };

        return rljson;
      };

      describe('returns errors', () => {
        it('when root table is not also an head table', () => {
          const rljson = create({
            isRoot: true,
            isHead: false,
            isShared: false,
          });
          expect(validate(rljson)).toEqual({
            hasErrors: true,
            tableCfgHasRootHeadSharedError: {
              error:
                'Table configs have inconsistent root/head/shared settings',
              tables: [
                {
                  error:
                    'Tables with isRoot = true must also have isHead = true',
                  table: 'tableOne',
                  tableCfg: rljson.tableCfgs._data[0]._hash,
                },
              ],
            },
          });
        });

        it('when a shared table is also a root table', () => {
          const rljson = create({
            isRoot: true,
            isHead: false,
            isShared: true,
          });
          expect(validate(rljson)).toEqual({
            hasErrors: true,
            tableCfgHasRootHeadSharedError: {
              error:
                'Table configs have inconsistent root/head/shared settings',

              tables: [
                {
                  error:
                    'Tables with isShared = true must have isRoot = false and isHead = false',
                  table: 'tableOne',
                  tableCfg: rljson.tableCfgs._data[0]._hash,
                },
              ],
            },
          });
        });

        it('when a table is not head, root or shared', () => {
          const rljson = create({
            isRoot: false,
            isHead: false,
            isShared: false,
          });
          expect(validate(rljson)).toEqual({
            hasErrors: true,
            tableCfgHasRootHeadSharedError: {
              error:
                'Table configs have inconsistent root/head/shared settings',

              tables: [
                {
                  error: 'Tables must be either root, root+head or shared',

                  table: 'tableOne',
                  tableCfg: rljson.tableCfgs._data[0]._hash,
                },
              ],
            },
          });
        });
      });

      describe('returns no errors', () => {
        it('when isRoot is true + isHead is true and isShared is false', () => {
          const rljson = create({
            isRoot: true,
            isHead: true,
            isShared: false,
          });
          expect(validate(rljson)).toEqual({ hasErrors: false });
        });

        it('when isRoot is false, isHead is true and isShared is false', () => {
          const rljson = create({
            isRoot: false,
            isHead: true,
            isShared: false,
          });
          expect(validate(rljson)).toEqual({ hasErrors: false });
        });

        it('when isRoot is false, isHead is false and isShared is true', () => {
          const rljson = create({
            isRoot: false,
            isHead: false,
            isShared: true,
          });
          expect(validate(rljson)).toEqual({ hasErrors: false });
        });
      });
    });

    describe('rootOrHeadTableHasNoIdColumn()', () => {
      const create = (config: {
        isHead: boolean;
        isRoot: boolean;
        addIdColumn: boolean;
      }) => {
        const columns: ColumnCfg[] = [{ key: 'name', type: 'string' }];

        if (config.addIdColumn) {
          columns.push({ key: 'id', type: 'string' });
        }

        const tableCfg = hip<TableCfg>({
          key: 'tableOne',
          type: 'components',
          columns,
          isHead: config.isHead,
          isRoot: config.isRoot,
          isShared: !config.isHead && !config.isRoot,
        });

        const row: Json = { name: 'item1' };
        if (config.addIdColumn) {
          row.id = 'item1';
        }

        const rljson = {
          tableOne: {
            _type: 'ingredients',
            _tableCfg: tableCfg._hash as string,
            _data: [row],
          },

          tableCfgs: {
            _type: 'ingredients',
            _data: [tableCfg],
          },
        };

        return rljson;
      };

      describe('returns no errors when root or head tables have an id column', () => {
        it('with head tables', () => {
          const rljson = create({
            isHead: true,
            isRoot: false,
            addIdColumn: true,
          });
          expect(validate(rljson)).toEqual({ hasErrors: false });
        });

        it('with root tables', () => {
          const rljson = create({
            isHead: true,
            isRoot: true,
            addIdColumn: true,
          });
          expect(validate(rljson)).toEqual({ hasErrors: false });
        });
      });

      describe('returns an error when a root or head table does not have an id column', () => {
        it('with head tables', () => {
          const rljson = create({
            isHead: true,
            isRoot: false,
            addIdColumn: false,
          });

          const tableCfgRef = rljson.tableCfgs._data[0]._hash;

          expect(validate(rljson)).toEqual({
            hasErrors: true,
            rootOrHeadTableHasNoIdColumn: {
              error: 'Root or head tables must have an id column',
              tables: [
                {
                  table: 'tableOne',
                  tableCfg: tableCfgRef,
                },
              ],
            },
          });
        });

        it('with root tables', () => {
          const rljson = create({
            isHead: true,
            isRoot: true,
            addIdColumn: false,
          });

          const tableCfgRef = rljson.tableCfgs._data[0]._hash;

          expect(validate(rljson)).toEqual({
            hasErrors: true,
            rootOrHeadTableHasNoIdColumn: {
              error: 'Root or head tables must have an id column',
              tables: [
                {
                  table: 'tableOne',
                  tableCfg: tableCfgRef,
                },
              ],
            },
          });
        });
      });

      it('returns no errors when non-root or non-head tables do not have an id column', () => {
        const rljson = create({
          isHead: false,
          isRoot: false,
          addIdColumn: false,
        });

        expect(validate(rljson)).toEqual({ hasErrors: false });
      });
    });
  });

  describe('tableCfg errors', () => {
    describe('tableCfgsReferencedTableKeyNotFound()', () => {
      it('returns an error when a table referenced in tableCfgs is not found', () => {
        const rljson = Example.ok.singleRow();
        (rljson as unknown as RljsonPrivate).tableCfgs!._data[0].key =
          'MISSING';
        hip(rljson, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });
        const tableCfg: TableCfg = rljson.tableCfgs._data[0] as TableCfg;

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
              'Valid types are: ' +
              'string, number, boolean, json, jsonArray, jsonValue',
          },
        });
      });
    });

    describe('tableCfgReferencedNotFound()', () => {
      it('returns an error when a referenced table config is not found', () => {
        const rljson = Example.ok.singleRow();
        rljson.table._tableCfg = 'MISSING';
        hip(rljson, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });

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
        const tableCfg = rljson.tableCfgs._data[0] as TableCfg;
        const tableCfgRef = rljson.table._tableCfg;
        expect(tableCfgRef).toBe(tableCfg._hash);

        // Remove column 'int'
        const index = tableCfg.columns.findIndex((e) => e.key === 'int');
        tableCfg.columns.splice(index, 1);
        hip(tableCfg, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });

        rljson.table._tableCfg = tableCfg._hash as string;

        hip(rljson, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });

        expect(validate(rljson)).toEqual({
          columnConfigNotFound: {
            error: 'Column configurations not found',
            missingColumnConfigs: [
              {
                column: 'int',
                row: 'Cxg2P0ZWlEbBX6pYOlOw8l',
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
        const row = rljson.table._data[0] as Json;
        row.int = 'string';
        row.double = true;
        hip(tableCfg, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });
        const tableCfgHash = rljson.table._tableCfg;

        expect(validate(rljson)).toEqual({
          dataDoesNotMatchColumnConfig: {
            brokenValues: [
              {
                column: 'int',
                row: '9ZLjUYyBMJvPjuj7MV_c62',
                table: 'table',
                tableCfg: tableCfgHash,
              },
              {
                column: 'double',
                row: '9ZLjUYyBMJvPjuj7MV_c62',
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
        const layer = rljson.valueStack._data[1];

        expect(validate(rljson)).toEqual({
          layerBasesNotFound: {
            brokenLayers: [
              {
                brokenLayer: layer._hash,
                layersTable: 'valueStack',
                missingBaseLayer: 'MISSING',
              },
            ],
            error: 'Base layers are missing',
          },
          hasErrors: true,
        });
      });
    });
  });

  describe('stack errors', () => {
    describe('stackReferencesNotFound()', () => {
      it('returns no errors when all references are set correctly', () => {
        expect(validate(Example.ok.complete())).toEqual({
          hasErrors: false,
        });
      });

      it('returns an error if an corresponding stack is missing', () => {
        const rljson = Example.broken.stack.missingCorrespondingStack();
        const layer = rljson.indexLayer;

        expect(validate(rljson)).toEqual({
          stackReferencesNotFound: {
            missingStacks: [
              {
                brokenLayer: 'indexLayer',
                missingLayerInStack: layer._hash,
                stack: 'repository',
              },
            ],
            error: 'For given Layer there is no referencing Stack',
          },
          hasErrors: true,
        });
      });

      it('returns an error if an layer is missing on corresponding stacks', () => {
        const rljson = Example.broken.stack.missingCorrespondingLayer();

        expect(validate(rljson)).toEqual({
          stackReferencesNotFound: {
            missingLayers: [
              {
                brokenLayer: 'indexLayer',
                missingLayer: 'MISSING',
                stack: 'repository',
              },
            ],
            error: 'Layers in stacks are missing',
          },
          hasErrors: true,
        });
      });
    });
  });
});
