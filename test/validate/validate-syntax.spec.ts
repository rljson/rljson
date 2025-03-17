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

  it('validate', async () => {
    // Define the expected result
    const expectedResult = {
      hasErrors: true,
      tableNamesAreLowerCamelCase: {
        error: 'Table names must be lower camel case',
        invalidTableNames: ['brok$en'],
      },
    };

    // Take a broken rljson object
    const rljson: Rljson = Example.broken.brokenTableName() as Rljson;

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
        hasData: {
          error: '_data is missing in tables',
          tables: ['tableOne', 'tableThree'],
        },
        hasErrors: true,
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

  describe('allRefsExist', () => {
    it('returns no errors when all refs are found', () => {
      expect(validate(Example.ok.singleRef())).toEqual({
        hasErrors: false,
      });
    });

    it('returns an error when a reference table is not found', () => {
      expect(validate(Example.broken.missingReferencedTable())).toEqual({
        allRefsExist: {
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
      expect(validate(Example.broken.missingRef())).toEqual({
        allRefsExist: {
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

  describe('collectionBaseRefsExist()', () => {
    it('returns no errors when all base refs are found', () => {
      expect(validate(Example.ok.collection())).toEqual({
        hasErrors: false,
      });
    });

    it('returns an error when a base ref is not found', () => {
      expect(validate(Example.broken.collection.missingBase())).toEqual({
        collectionBaseRefsExist: {
          base: 'sxv2NCM6UNOcX-i9FhOs5W',
          error:
            'Collection "QB2JC6X_-rUAoixuldzWP-": Base collection "sxv2NCM6UNOcX-i9FhOs5W" not found',
          item: 'QB2JC6X_-rUAoixuldzWP-',
          table: 'collection',
        },
        hasErrors: true,
      });
    });
  });

  describe('collectionIdSetsExist()', () => {
    it('returns an error when idSetRef is not found', () => {
      expect(validate(Example.broken.collection.missingIdSet())).toEqual({
        collectionIdSetsExist: {
          brokenCollections: [
            {
              missingIdSet: 'MgHRBYSrhpyl4rvsOmAWcQ',
              collectionHash: 'sxv2NCM6UNOcX-i9FhOs5W',
              collectionsTable: 'collection',
            },
            {
              missingIdSet: 'MgHRBYSrhpyl4rvsOmAWcQ',
              collectionHash: 'QB2JC6X_-rUAoixuldzWP-',
              collectionsTable: 'collection',
            },
          ],
          error: 'Id sets of collections are missing',
        },
        hasErrors: true,
      });
    });

    it('return no error, when no idSetRef is defined', () => {
      // Set idSet to undefined
      const result = Example.ok.collection();

      // delete idSet reference
      delete result.collection._data[1].idSet;
      hip(result, true, false);

      // Validate -> no error
      expect(validate(result)).toEqual({
        hasErrors: false,
      });
    });
  });

  describe('collectionAssignedPropertiesFound', () => {
    it('returns an error when the properties table is not foun', () => {
      expect(
        validate(Example.broken.collection.missingAssignedPropertyTable()),
      ).toEqual({
        collectionPropertyTablesExist: {
          collections: [
            {
              collection: 'sxv2NCM6UNOcX-i9FhOs5W',
              missingPropertyTable: 'properties',
              table: 'collection',
            },
            {
              collection: 'QB2JC6X_-rUAoixuldzWP-',
              missingPropertyTable: 'properties',
              table: 'collection',
            },
          ],
          error: 'Collection property tables do not exist',
        },
        hasErrors: true,
      });
    });

    it('returns an error when an assigned property is not found', () => {
      expect(
        validate(Example.broken.collection.missingAssignedProperty()),
      ).toEqual({
        collectionAssignedPropertiesExist: {
          brokenAssignments: [
            {
              collection: 'QB2JC6X_-rUAoixuldzWP-',
              itemId: 'id1',
              missingProperty: 'mv6w8rID8lQxLsje1EHQMY',
              propertyTable: 'properties',
              table: 'collection',
            },
          ],
          error: 'Collection property assignments are broken',
        },
        hasErrors: true,
      });
    });
  });

  describe('cakeIdSetsExist', () => {
    it('returns no errors when all idSets are found', () => {
      expect(validate(Example.ok.complete())).toEqual({
        hasErrors: false,
      });
    });

    it('returns no errors when no idSets is specified', () => {
      const rljson = Example.ok.complete();
      delete rljson.cakes._data[0].idSet;

      expect(validate(rljson)).toEqual({
        hasErrors: false,
      });
    });

    it('returns an error when an idSet is not found', () => {
      expect(validate(Example.broken.cake.missingIdSet())).toEqual({
        cakeIdSetsExist: {
          brokenCakes: [
            {
              cakeHash: 'Pi2MlYagf-JTyy30pcKMYK',
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
});
