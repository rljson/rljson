// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';

import { describe, expect, it } from 'vitest';

import { Example } from '../../src/example';
import { Rljson } from '../../src/rljson';
import { Errors } from '../../src/validate/validate';
import {
  isValidFieldName,
  ValidateSyntax,
} from '../../src/validate/validate-syntax';

describe('Validate', async () => {
  const validate = (rljson: any): Errors => {
    return new ValidateSyntax().validateSync(rljson);
  };

  describe('validate, validateSync', () => {
    it('return a validation result', async () => {
      // Define the expected result
      const expectedResult = {
        hasErrors: true,
        tableNamesAreLowerCamelCase: {
          error: 'Table names must be lower camel case',
          invalidTableNames: ['brok$en'],
        },
      };

      // Take a broken rljson object
      const rljson: Rljson = Example.with.brokenTableName();

      // Validate it
      const resultSync = new ValidateSyntax().validateSync(rljson);
      const resultAsync = await new ValidateSyntax().validate(rljson);

      // Check
      expect(resultSync).toEqual(expectedResult);
      expect(resultAsync).toEqual(expectedResult);
    });

    describe('tableNamesAreLowerCamelCase()', () => {
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
          expect(r.tableNamesAreLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableNames: ['1table'],
          });
        });
        it('when a table name contains a space', () => {
          const r = validate({
            'table one': { _type: 'properties', _data: [] },
          });
          expect(r.tableNamesAreLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableNames: ['table one'],
          });
        });

        it('when a table name contains a dash', () => {
          const r = validate({
            'table-one': { _type: 'properties', _data: [] },
          });
          expect(r.tableNamesAreLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableNames: ['table-one'],
          });
        });

        it('when a table name contains an underscore', () => {
          const r = validate({
            table_one: { _type: 'properties', _data: [] },
          });
          expect(r.tableNamesAreLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableNames: ['table_one'],
          });
        });

        it('when a table name contains a capital letter', () => {
          const r = validate({
            TableOne: { _type: 'properties', _data: [] },
          });
          expect(r.tableNamesAreLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableNames: ['TableOne'],
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
          expect(r.tableNamesAreLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableNames: [
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
          expect(r.tableNamesAreLowerCamelCase).toEqual({
            error: 'Table names must be lower camel case',
            invalidTableNames: [''],
          });
        });
      });
    });

    describe('tableNamesDoNotEndWithRef()', () => {
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
          expect(r.tableNamesDoNotEndWithRef).toEqual({
            error: 'Table names must not end with "Ref"',
            invalidTableNames: ['tableOneRef'],
          });
        });

        it('when multiple table names end with "Ref"', () => {
          const r = validate({
            tableOneRef: { _type: 'properties', _data: [] },
            tableTwoRef: { _type: 'properties', _data: [] },
          });
          expect(r.tableNamesDoNotEndWithRef).toEqual({
            error: 'Table names must not end with "Ref"',
            invalidTableNames: ['tableOneRef', 'tableTwoRef'],
          });
        });
      });
    });

    describe('columnNamesAreLowerCamelCase()', () => {
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
          expect(r.columnNamesAreLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['1column'] },
          });
        });

        it('when a column name contains a space', () => {
          const r = validate({
            tableOne: { _type: 'properties', _data: [{ 'column one': 123 }] },
          });
          expect(r.columnNamesAreLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['column one'] },
          });
        });

        it('when a column name contains a dash', () => {
          const r = validate({
            tableOne: { _type: 'properties', _data: [{ 'column-one': 123 }] },
          });
          expect(r.columnNamesAreLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['column-one'] },
          });
        });

        it('when a column name contains an underscore', () => {
          const r = validate({
            tableOne: { _type: 'properties', _data: [{ column_one: 123 }] },
          });
          expect(r.columnNamesAreLowerCamelCase).toEqual({
            error: 'Column names must be lower camel case',
            invalidColumnNames: { tableOne: ['column_one'] },
          });
        });

        it('when a column name contains a capital letter', () => {
          const r = validate({
            tableOne: { _type: 'properties', _data: [{ ColumnOne: 123 }] },
          });
          expect(r.columnNamesAreLowerCamelCase).toEqual({
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
          expect(r.columnNamesAreLowerCamelCase).toEqual({
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
          expect(r.columnNamesAreLowerCamelCase).toEqual({
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
            hasValidHashes: {
              error:
                'Hash at /tableOne "invalid" is wrong. Should be "DKwor-pULmCs6RY-sMyfrM".',
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
          hasData: {
            error: '_data is missing in tables',
            tables: ['tableOne', 'tableThree'],
          },
          hasErrors: true,
        });
      });
    });
  });

  describe('dataHasRightType()', () => {
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
        dataHasRightType: {
          error: '_data must be a list',
          tables: ['tableOne', 'tableThree'],
        },
        hasErrors: true,
      });
    });
  });
});
