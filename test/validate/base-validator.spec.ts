// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip, hsh } from '@rljson/hash';
import { Json } from '@rljson/json';

import { describe, expect, it } from 'vitest';

import { CakesTable } from '../../src/content/cake.ts';
import { Layer, LayersTable } from '../../src/content/layer.ts';
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
      const rljson: Rljson =
        Example.broken.base.brokenTableKey() as unknown as Rljson;

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
              tableOne: { _type: 'components', _data: [] },
              tableTwo: { _type: 'components', _data: [] },
            });
            expect(r).toEqual({ hasErrors: false });
          });
        });

        it('when private keys like _type or _hash are contained', () => {
          const r = validate({
            _type: 'components',
            _data: [],
          });
          expect(r).toEqual({ hasErrors: false });
        });
      });

      describe('returns an error JSON', () => {
        it('when a table name starts with a number', () => {
          const r = validate({
            '1table': { _type: 'components', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['1table'],
          });
        });
        it('when a table name contains a space', () => {
          const r = validate({
            'table one': { _type: 'components', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['table one'],
          });
        });

        it('when a table name contains a dash', () => {
          const r = validate({
            'table-one': { _type: 'components', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['table-one'],
          });
        });

        it('when a table name contains an underscore', () => {
          const r = validate({
            table_one: { _type: 'components', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['table_one'],
          });
        });

        it('when a table name contains a capital letter', () => {
          const r = validate({
            TableOne: { _type: 'components', _data: [] },
          });
          expect(r.tableKeysNotLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableKeys: ['TableOne'],
          });
        });

        it('when multiple table names are invalid', () => {
          const r = validate({
            '1table': { _type: 'components', _data: [] },
            'table one': { _type: 'components', _data: [] },
            'table-one': { _type: 'components', _data: [] },
            table_one: { _type: 'components', _data: [] },
            TableOne: { _type: 'components', _data: [] },
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
            '': { _type: 'components', _data: [] },
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
              tableOne: { _type: 'components', _data: [] },
              tableTwo: { _type: 'components', _data: [] },
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
            tableOneRef: { _type: 'components', _data: [] },
          });
          expect(r.tableKeysDoNotEndWithRef).toEqual({
            error: 'Table names must not end with "Ref"',
            invalidTableKeys: ['tableOneRef'],
          });
        });

        it('when multiple table names end with "Ref"', () => {
          const r = validate({
            tableOneRef: { _type: 'components', _data: [] },
            tableTwoRef: { _type: 'components', _data: [] },
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
            tableOne: { _type: 'components', _data: [{ columnOne: 123 }] },
            tableTwo: { _type: 'components', _data: [{ columnTwo: 456 }] },
          });
          expect(r).toEqual({ hasErrors: false });
        });

        it('when private keys are like _type or _hash are contained', () => {
          const r = validate({
            tableOne: {
              _type: 'components',
              _data: [{ _type: 123 }],
            },
          });
          expect(r).toEqual({ hasErrors: false });
        });
      });

      describe('returns an error JSON', () => {
        it('when a column name starts with a number', () => {
          const r = validate({
            tableOne: { _type: 'components', _data: [{ '1column': 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['1column'] },
          });
        });

        it('when a column name contains a space', () => {
          const r = validate({
            tableOne: { _type: 'components', _data: [{ 'column one': 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['column one'] },
          });
        });

        it('when a column name contains a dash', () => {
          const r = validate({
            tableOne: { _type: 'components', _data: [{ 'column-one': 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['column-one'] },
          });
        });

        it('when a column name contains an underscore', () => {
          const r = validate({
            tableOne: { _type: 'components', _data: [{ column_one: 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['column_one'] },
          });
        });

        it('when a column name contains a capital letter', () => {
          const r = validate({
            tableOne: { _type: 'components', _data: [{ ColumnOne: 123 }] },
          });
          expect(r.columnNamesNotLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['ColumnOne'] },
          });
        });

        it('when multiple column names are invalid', () => {
          const r = validate({
            tableOne: {
              _type: 'components',
              _data: [
                { '1column': 123, 'column one': 456, 'column-one': 789 },
                { column_one: 101, ColumnOne: 202 },
              ],
            },

            tableTwo: {
              _type: 'components',
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
            tableOne: { _type: 'components', _data: [{ '': 123 }] },
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
              tableOne: { _type: 'components', _data: [] },
              tableTwo: { _type: 'components', _data: [] },
            }).hasErrors,
          ).toBe(false);
        });

        it('when there are valid hashes', () => {
          expect(
            validate(
              hip({
                tableOne: { _type: 'components', _data: [] },
                tableTwo: { _type: 'components', _data: [] },
              }),
            ).hasErrors,
          ).toBe(false);
        });
      });

      describe('throws', () => {
        it('when hashes are invalid', () => {
          const errors = validate({
            tableOne: { _type: 'components', _data: [], _hash: 'invalid' },
          });

          expect(errors).toEqual({
            hasErrors: true,
            hashesNotValid: {
              error:
                'Hash "invalid" does not match the newly calculated one "tpbDwaQADV4jPexwWgCTBJ". ' +
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
            tableOne: { _type: 'components', _data: [] },
            tableTwo: { _type: 'components', _data: [] },
          }),
        ).toEqual({
          hasErrors: false,
        });
      });

      it('returns an error when data is not found', () => {
        expect(
          validate({
            tableOne: { _type: 'components' },
            tableTwo: { _type: 'components', _data: [] },
            tableThree: { _type: 'components' },
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
            tableOne: { _type: 'components', _data: [] },
            tableTwo: { _type: 'components', _data: [] },
          }),
        ).toEqual({
          hasErrors: false,
        });
      });

      it('returns an error when data is not an array', () => {
        expect(
          validate({
            tableOne: { _type: 'components', _data: {} },
            tableTwo: { _type: 'components', _data: [] },
            tableThree: { _type: 'components', _data: 'string' },
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
          {
            key: 'name',
            type: 'string',
            titleLong: 'Name',
            titleShort: 'Name',
          },
          { key: 'id', type: 'string', titleLong: 'ID', titleShort: 'ID' },
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
            _type: 'components',
            _tableCfg: tableCfg._hash as string,
            _data: [row],
          },

          tableCfgs: {
            _type: 'components',
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
        const columns: ColumnCfg[] = [
          {
            key: 'name',
            type: 'string',
            titleLong: 'Name',
            titleShort: 'Name',
          },
        ];

        if (config.addIdColumn) {
          columns.push({
            key: 'id',
            type: 'string',
            titleLong: 'ID',
            titleShort: 'ID',
          });
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
            _type: 'components',
            _tableCfg: tableCfg._hash as string,
            _data: [row],
          },

          tableCfgs: {
            _type: 'components',
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
                row: 'P_QrIhtZow4q86_mj2k5uY',
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
        delete row._hash;
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

  describe('tree errors', () => {
    it('returns no errors when all children refs are found', () => {
      expect(validate(Example.ok.tree())).toEqual({
        hasErrors: false,
      });
    });

    it('returns an error when a child ref is not found', () => {
      const brokenTree = Example.broken.trees.missingChildNodes();

      expect(validate(brokenTree)).toEqual({
        treeChildNodesNotFound: {
          error: 'Child nodes are missing',
          brokenTrees: [
            {
              brokenTree: brokenTree.recipesTreeTable._data[0]._hash,
              missingChildNode:
                brokenTree.recipesTreeTable._data[0].children[0],
              treesTable: 'recipesTreeTable',
            },
          ],
        },
        hasErrors: true,
      });
    });

    it('returns an error when a cycle is detected', () => {
      const brokenTree = Example.broken.trees.cyclicTree();
      const brokenTreeReHashed = hsh(brokenTree, {
        updateExistingHashes: true,
        throwOnWrongHashes: false,
      });

      //Hashing will be affected by the cycle change, because the children's hashes are part of the parent's hash

      expect(validate(brokenTree)).toEqual({
        hashesNotValid: {
          error: `Hash "${brokenTree.recipesTreeTable._data[0]._hash}" does not match the newly calculated one "${brokenTreeReHashed.recipesTreeTable._data[0]._hash}". Please make sure that all systems are producing the same hashes.`,
        },
        hasErrors: true,
      });
    });

    it('returns an error when a tree has duplicate child node ids', () => {
      const brokenTree = Example.broken.trees.duplicateChildNodeIds();
      expect(validate(brokenTree)).toEqual({
        treeDuplicateNodeIdsAsSibling: {
          error: 'Trees have duplicate sibling node IDs',
          trees: [
            {
              duplicateChildIds: [brokenTree.recipesTreeTable._data[1]._hash],
              tree: brokenTree.recipesTreeTable._data[0]._hash,
              treesTable: 'recipesTreeTable',
            },
          ],
        },
        hasErrors: true,
      });
    });

    it('returns an error when a tree is not a parent, but has children', () => {
      const brokenTree = Example.broken.trees.nonParentWithChildren();

      expect(validate(brokenTree)).toEqual({
        treeIsNotParentButHasChildren: {
          error: 'Trees marked as non-parents have children',
          trees: [
            {
              children: [brokenTree.recipesTreeTable._data[1]._hash],
              isParent: false,
              tree: brokenTree.recipesTreeTable._data[0]._hash,
              treesTable: 'recipesTreeTable',
            },
          ],
        },
        hasErrors: true,
      });
    });
  });

  describe('reference errors', () => {
    describe('refsNotFound', () => {
      it('returns no errors when single ref is found', () => {
        expect(validate(Example.ok.singleRef())).toEqual({
          hasErrors: false,
        });
      });
      it('returns no errors when multiple refs are found', () => {
        expect(validate(Example.ok.multiRef())).toEqual({
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
                sourceItemHash: 'P4pe2yhHla7KrnhRF9MMcD',
                sourceKey: 'propertyAFromTableA',
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
                sourceItemHash: 'P4pe2yhHla7KrnhRF9MMcD',
                sourceKey: 'propertyAFromTableA',
                targetItemHash: 'MISSINGREF',
                sourceTable: 'tableB',
                targetTable: 'tableA',
              },
            ],
          },
          hasErrors: true,
        });
      });

      it('returns an error when a multiref is not found', () => {
        expect(validate(Example.broken.base.missingMultiRef())).toEqual({
          refsNotFound: {
            error: 'Broken references',
            missingRefs: [
              {
                error: 'Table "tableA" has no item with hash "MISSINGREF"',
                sourceItemHash: '3LYcCeTgV3Ij2mNczRy_hI',
                sourceKey: 'propertyAFromTableA',
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
        const layer = rljson.abLayers._data[1];
        expect(validate(rljson)).toEqual({
          layerBasesNotFound: {
            brokenLayers: [
              {
                brokenLayer: layer._hash,
                layersTable: 'abLayers',
                missingBaseLayer: 'MISSING',
              },
            ],
            error: 'Base layers are missing',
          },
          hasErrors: true,
        });
      });
    });

    describe('layerSliceIdsTableNotFound()', () => {
      it('returns an error when an reference sliceIds table is not found', () => {
        const rljson = Example.ok.complete();
        const layer0 = rljson.abLayers._data[0];
        const layer1 = rljson.abLayers._data[1];
        delete rljson.sliceIds;
        hip(rljson, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });

        expect(validate(rljson)).toEqual({
          layerSliceIdsTableNotFound: {
            brokenLayers: [
              {
                layerHash: layer0._hash,
                layersTable: 'abLayers',
                missingSliceIdsTable: 'sliceIds',
              },
              {
                layerHash: layer1._hash,
                layersTable: 'abLayers',
                missingSliceIdsTable: 'sliceIds',
              },
            ],
            error: 'Id sets tables are missing',
          },
          hasErrors: true,
        });
      });
    });

    describe('layerSliceIdsRowNotFound()', () => {
      it('returns an error when idSetRef is not found', () => {
        const rljson = Example.broken.layers.missingSliceIdSet();
        const layer = (rljson.abLayers as LayersTable)._data[1];
        expect(layer.sliceIdsTableRow).toBe('MISSING1');

        expect(validate(rljson)).toEqual({
          layerSliceIdsRowNotFound: {
            brokenLayers: [
              {
                layerHash: layer._hash,
                layersTable: 'abLayers',
                missingSliceIdsRow: 'MISSING1',
              },
            ],
            error: 'Id sets of layers are missing',
          },
          hasErrors: true,
        });
      });
    });

    describe('layerComponentAssignmentsNotFound', () => {
      it('returns an error when the components table is not foun', () => {
        const rljson = Example.broken.layers.missingAssignedComponentTable();
        const layer0 = rljson.abLayers._data[0];
        const layer1 = rljson.abLayers._data[1];

        expect(validate(rljson)).toEqual({
          layerComponentTablesNotFound: {
            layers: [
              {
                brokenLayer: layer0._hash,
                missingComponentTable: 'components',
                layersTable: 'abLayers',
              },
              {
                brokenLayer: layer1._hash,
                layersTable: 'abLayers',
                missingComponentTable: 'components',
              },
            ],
            error: 'Layer component tables do not exist',
          },
          hasErrors: true,
        });
      });

      it('returns an error when an assigned component is not found', () => {
        const rljsonOk = Example.ok.complete();
        const component = rljsonOk.components._data[1];

        const rljson = Example.broken.layers.missingAssignedComponent();
        const layer0 = rljson.abLayers._data[0];
        const layer1 = rljson.abLayers._data[1];

        expect(validate(rljson)).toEqual({
          layerComponentAssignmentsNotFound: {
            brokenAssignments: [
              {
                brokenAssignment: 'id1',
                brokenLayer: layer0._hash,
                layersTable: 'abLayers',
                missingComponent: 'mv6w8rID8lQxLsje1EHQMY',
                referencedComponentTable: 'components',
              },
              {
                brokenLayer: layer1._hash,
                brokenAssignment: 'id1',
                missingComponent: component._hash,
                referencedComponentTable: 'components',
                layersTable: 'abLayers',
              },
            ],
            error: 'Layer component assignments are broken',
          },
          hasErrors: true,
        });
      });
    });

    describe('layerAssignmentsDoNotMatchSliceIds', () => {
      it('returns no errors when all assignments match', () => {
        expect(validate(Example.ok.complete())).toEqual({
          hasErrors: false,
        });
      });

      it('returns an error when the assignments do not match', () => {
        const rljson = Example.ok.complete();
        const layer = rljson.abLayers._data[1] as Layer;
        delete layer.add.id0;
        delete layer.add.id1;
        hip(rljson, {
          throwOnWrongHashes: false,
          updateExistingHashes: true,
        });

        expect(validate(rljson)).toEqual({
          hasErrors: true,
          layerAssignmentsDoNotMatchSliceIds: {
            error: 'Layers have missing assignments',
            layers: [
              {
                brokenLayer: layer._hash,
                layersTable: 'abLayers',
                unassignedSliceIds: ['id0', 'id1'],
              },
            ],
          },
        });
      });
    });
  });

  describe('cake errors', () => {
    describe('cakeSliceIdsNotFound', () => {
      it('returns no errors when all sliceIds are found', () => {
        expect(validate(Example.ok.complete())).toEqual({
          hasErrors: false,
        });
      });

      it('returns no errors when no sliceIds is specified', () => {
        const rljson = Example.ok.complete();
        delete rljson.cakes._data[0].sliceIds;
        hip(rljson, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });

        // Update buffet slices
        const buffet = rljson.buffets._data[0];
        buffet.items[0].ref = rljson.cakes._data[0]._hash;
        buffet.items[1].ref = rljson.abLayers._data[1]._hash;
        hip(rljson, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });

        // Validate
        expect(validate(rljson)).toEqual({
          hasErrors: false,
        });
      });

      it('returns an error when slice ids are not found', () => {
        const rljson = Example.broken.cakes.missingSliceIdSet();
        const cake = rljson.cakes._data[0];
        expect(validate(rljson)).toEqual({
          cakeSliceIdsNotFound: {
            brokenCakes: [
              {
                brokenCake: cake._hash,
                cakeTable: 'cakes',
                missingSliceIdsRow: 'MISSING',
              },
            ],
            error: 'Id sets of cakes are missing',
          },
          hasErrors: true,
        });
      });
    });

    describe('cakeSliceIdsTableNotFound', () => {
      it('returns an error when an referenced sliceIds is not found', () => {
        const rljson = Example.ok.complete();
        const cake = (rljson.cakes as CakesTable)._data[0];
        cake.sliceIdsTable = 'MISSING';
        hip(rljson, {
          updateExistingHashes: true,
          throwOnWrongHashes: false,
        });

        expect(validate(rljson)).toEqual({
          cakeSliceIdsTableNotFound: {
            brokenCakes: [
              {
                brokenCake: cake._hash,
                cakeTable: 'cakes',
                missingSliceIdsTable: 'MISSING',
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
      it('returns an error when the version of a layer is not found', () => {
        const rljson = Example.broken.cakes.missingCakeLayer();
        const cake = rljson.cakes._data[0];
        expect(validate(rljson)).toEqual({
          cakeLayersNotFound: {
            brokenCakes: [
              {
                brokenCake: cake._hash,
                cakeTable: 'cakes',
                layersTable: 'abLayers',
                missingLayer: 'MISSING0',
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
                itemTable: 'abLayers',
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
