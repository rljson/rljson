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
      tableNamesNotLowerCamelCase: {
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

  describe('tableNamesNotLowerCamelCase()', () => {
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
        expect(r.tableNamesNotLowerCamelCase).toEqual({
          error: 'Table names must be lower camel case',
          invalidTableNames: ['1table'],
        });
      });
      it('when a table name contains a space', () => {
        const r = validate({
          'table one': { _type: 'properties', _data: [] },
        });
        expect(r.tableNamesNotLowerCamelCase).toEqual({
          error: 'Table names must be lower camel case',
          invalidTableNames: ['table one'],
        });
      });

      it('when a table name contains a dash', () => {
        const r = validate({
          'table-one': { _type: 'properties', _data: [] },
        });
        expect(r.tableNamesNotLowerCamelCase).toEqual({
          error: 'Table names must be lower camel case',
          invalidTableNames: ['table-one'],
        });
      });

      it('when a table name contains an underscore', () => {
        const r = validate({
          table_one: { _type: 'properties', _data: [] },
        });
        expect(r.tableNamesNotLowerCamelCase).toEqual({
          error: 'Table names must be lower camel case',
          invalidTableNames: ['table_one'],
        });
      });

      it('when a table name contains a capital letter', () => {
        const r = validate({
          TableOne: { _type: 'properties', _data: [] },
        });
        expect(r.tableNamesNotLowerCamelCase).toEqual({
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
        expect(r.tableNamesNotLowerCamelCase).toEqual({
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
        expect(r.tableNamesNotLowerCamelCase).toEqual({
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

  describe('refsNotFound', () => {
    it('returns no errors when all refs are found', () => {
      expect(validate(Example.ok.singleRef())).toEqual({
        hasErrors: false,
      });
    });

    it('returns an error when a reference table is not found', () => {
      expect(validate(Example.broken.missingReferencedTable())).toEqual({
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
      expect(validate(Example.broken.missingRef())).toEqual({
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

  describe('collectionBasesNotFound()', () => {
    it('returns no errors when all base refs are found', () => {
      expect(validate(Example.ok.complete())).toEqual({
        hasErrors: false,
      });
    });

    it('returns an error when a base ref is not found', () => {
      expect(validate(Example.broken.collections.missingBase())).toEqual({
        collectionBasesNotFound: {
          brokenCollections: [
            {
              brokenCollection: 'XqBfCw2Gz7zZHJIiIYyZpw',
              collectionsTable: 'collections',
              missingBaseCollection: 'MISSING',
            },
          ],
          error: 'Base collections are missing',
        },
        hasErrors: true,
      });
    });
  });

  describe('collectionIdSetsExist()', () => {
    it('returns an error when idSetRef is not found', () => {
      expect(validate(Example.broken.collections.missingIdSet())).toEqual({
        collectionIdSetsExist: {
          brokenCollections: [
            {
              collectionHash: 'UW8eagu3IcuBkThxW5WZAQ',
              collectionsTable: 'collections',
              missingIdSet: 'MISSING1',
            },
          ],
          error: 'Id sets of collections are missing',
        },
        hasErrors: true,
      });
    });

    it('return no error, when no idSetRef is defined', () => {
      // Set idSet to undefined
      const result = Example.ok.complete();

      // delete idSet reference
      const collection1 = result.collections._data[1];
      delete collection1.idSet;
      hip(collection1, true, false);

      // Update cake layers
      const cake = result.cakes._data[0];
      cake.layers['layer1'] = collection1._hash;
      hip(cake, true, false);

      // Update buffet items
      const buffet = result.buffets._data[0];
      buffet.items[0].ref = cake._hash;
      buffet.items[1].ref = collection1._hash;

      // Validate -> no error
      expect(validate(result)).toEqual({
        hasErrors: false,
      });
    });
  });

  describe('collectionAssignedPropertiesFound', () => {
    it('returns an error when the properties table is not foun', () => {
      expect(
        validate(Example.broken.collections.missingAssignedPropertyTable()),
      ).toEqual({
        collectionPropertyTablesNotFound: {
          collections: [
            {
              brokenCollection: 'sxv2NCM6UNOcX-i9FhOs5W',
              missingPropertyTable: 'properties',
              collectionsTable: 'collections',
            },
            {
              brokenCollection: 'QB2JC6X_-rUAoixuldzWP-',
              collectionsTable: 'collections',
              missingPropertyTable: 'properties',
            },
          ],
          error: 'Collection property tables do not exist',
        },
        hasErrors: true,
      });
    });

    it('returns an error when an assigned property is not found', () => {
      expect(
        validate(Example.broken.collections.missingAssignedProperty()),
      ).toEqual({
        collectionPropertyAssignmentsNotFound: {
          brokenAssignments: [
            {
              brokenCollection: 'QB2JC6X_-rUAoixuldzWP-',
              brokenAssignment: 'id1',
              missingProperty: 'mv6w8rID8lQxLsje1EHQMY',
              referencedPropertyTable: 'properties',
              collectionsTable: 'collections',
            },
          ],
          error: 'Collection property assignments are broken',
        },
        hasErrors: true,
      });
    });
  });

  describe('cakeIdSetsNotFound', () => {
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
      buffet.items[1].ref = rljson.collections._data[1]._hash;
      hip(rljson, true, false);

      // Validate
      expect(validate(rljson)).toEqual({
        hasErrors: false,
      });
    });

    it('returns an error when an idSet is not found', () => {
      expect(validate(Example.broken.cakes.missingIdSet())).toEqual({
        cakeIdSetsNotFound: {
          brokenCakes: [
            {
              brokenCake: 'Pi2MlYagf-JTyy30pcKMYK',
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

  describe('cakeCollectionTablesNotFound', () => {
    it('returns an error when the collection table is not found', () => {
      expect(validate(Example.broken.cakes.missingCollectionsTable())).toEqual({
        cakeCollectionTablesNotFound: {
          brokenCakes: [
            {
              brokenCake: 'Wqh55SPELaDBhruppcUeXr',
              cakeTable: 'cakes',
              missingCollectionsTable: 'MISSING',
            },
          ],
          error: 'Collection tables of cakes are missing',
        },
        hasErrors: true,
      });
    });
  });

  describe('cakeLayerCollectionsNotFound', () => {
    it('returns an error when the collection of a layer is not found', () => {
      expect(validate(Example.broken.cakes.missingLayerCollection())).toEqual({
        cakeLayerCollectionsNotFound: {
          brokenCakes: [
            {
              brokenCake: 'u22NoYgg-_-lVq8xG1_adh',
              brokenLayerName: 'layer0',
              cakeTable: 'cakes',
              collectionsTable: 'collections',
              missingCollection: 'MISSING0',
            },
            {
              brokenCake: 'u22NoYgg-_-lVq8xG1_adh',
              brokenLayerName: 'layer1',
              cakeTable: 'cakes',
              collectionsTable: 'collections',
              missingCollection: 'MISSING1',
            },
          ],
          error: 'Layer collections of cakes are missing',
        },
        hasErrors: true,
      });
    });
  });

  describe('buffetReferencedTablesNotFound', () => {
    it('returns an error when the referenced table is not found', () => {
      expect(validate(Example.broken.buffets.missingTable())).toEqual({
        buffetReferencedTablesNotFound: {
          brokenBuffets: [
            {
              brokenBuffet: 'BkDp83m02JrqAJgVIP2dHE',
              buffetTable: 'buffets',
              missingItemTable: 'MISSING0',
            },
            {
              brokenBuffet: 'BkDp83m02JrqAJgVIP2dHE',
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
      expect(validate(Example.broken.buffets.missingItems())).toEqual({
        buffetReferencedItemsNotFound: {
          brokenItems: [
            {
              brokenBuffet: 'VxrIW8ttLpbYx1z7hOwQ4j',
              buffetTable: 'buffets',
              itemTable: 'cakes',
              missingItem: 'MISSING0',
            },
            {
              brokenBuffet: 'VxrIW8ttLpbYx1z7hOwQ4j',
              buffetTable: 'buffets',
              itemTable: 'collections',
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
