// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { InsertValidator, validateInsert } from '../../src/insert/insert-validator.ts';
import { exampleInsert, Insert } from '../../src/insert/insert.ts';
import { exampleInsertHistoryTable } from '../../src/insertHistory/insertHistory.ts';

import { expectGolden } from '../setup/goldens.ts';


describe('Insert', () => {
  describe('Insert', () => {
    it('can be instantiated', async () => {
      const insert = exampleInsert();
      expect(insert).toBeDefined();
    });
  });
  describe('InsertsTable', () => {
    it('provides a list of inserts', async () => {
      await expectGolden('insert/inserts.json').toBe(
        exampleInsertHistoryTable(),
      );
    });
  });
  describe('InsertsValidator', () => {
    it('can be instantiated', async () => {
      const insert: Insert<any> = {
        route: 'a/b/c',
        command: 'add',
        value: { x: { y: { z: true } } },
      };
      const ev = InsertValidator.create(insert);
      await expect(ev).toBeInstanceOf(InsertValidator);

      const errors = validateInsert(insert);
      await expect(errors).toEqual({ hasErrors: false });
    });

    it('validates insert', async () => {
      const insert: Insert<any> = {
        route: 'a/b/c',
        command: 'add',
        value: { x: { y: { z: true } } },
      };
      const ev = new InsertValidator(insert);
      const errors = ev.validate();

      await expect(errors).toEqual({ hasErrors: false });
    });
    it('throws on invalid required parameters', async () => {
      const insert: Insert<any> = {
        route: '',
        command: 'invalid' as any,
        value: null,
      };
      const ev = new InsertValidator(insert);
      const errors = ev.validate();

      await expect(errors).toEqual({
        hasErrors: true,
        parameterRouteInvalid: {
          error: 'Insert route must be a non-empty string.',
          parameter: '',
        },
        parameterCommandInvalid: {
          error:
            "Insert command must be starting with either 'add' or 'remove'.",
          parameter: 'invalid',
        },
        parameterValueInvalid: {
          error: 'Insert value must be a non-null object.',
          parameter: null,
        },
        routeInvalid: {
          error: 'Insert route is not valid.',
          route: '',
        },
      });
    });

    it('throws on invalid optional parameters', async () => {
      const insert: Insert<any> = {
        route: 'a/b/c',
        command: 'add',
        value: { x: { y: { z: true } } },
        origin: 123 as any,
      };
      const ev = new InsertValidator(insert);
      const errors = ev.validate();

      await expect(errors).toEqual({
        hasErrors: true,
        parameterOriginInvalid: {
          error: 'Insert origin must be a string if defined.',
          parameter: 123,
        },
      });
    });
    it('throws on route - value mismatch', async () => {
      const insert: Insert<any> = {
        route: 'a/b/c',
        command: 'add',
        value: { x: 1, y: 2 },
      };
      const ev = new InsertValidator(insert);
      const errors = ev.validate();

      await expect(errors).toEqual({
        hasErrors: true,
        dataRouteMismatch: {
          error:
            'Insert route depth does not match value depth. Route depth must be lower than the depth of the value object.',
          route: 'a/b/c',
          routeDepth: 3,
          valueDepth: 1,
        },
      });
    });

    it('throws on nested Component mismatch', async () => {
      // a route /a with value { bRef: 'ref:123' } is valid
      const insert: Insert<any> = {
        route: 'a',
        command: 'add',
        value: { bRef: 'ref:123' },
      };
      const ev = new InsertValidator(insert);
      const errors = ev.validate();

      await expect(errors).toEqual({
        hasErrors: false,
      });

      // a route /a/b with bRef as object is valid
      const insert2: Insert<any> = {
        route: 'a/b',
        command: 'add',
        value: {
          someAKey: 'someAValue',
          bRef: {
            someBKey: 'someBValue',
          },
        },
      };
      const ev2 = new InsertValidator(insert2);
      const errors2 = ev2.validate();

      await expect(errors2).toEqual({
        hasErrors: false,
      });

      // a route /a/b with cRef as object is invalid
      const insert3: Insert<any> = {
        route: 'a/b',
        command: 'add',
        value: {
          someAKey: 'someAValue',
          cRef: {
            someCKey: 'someCValue',
          },
        },
      };
      const ev3 = new InsertValidator(insert3);
      const errors3 = ev3.validate();

      await expect(errors3).toEqual({
        hasErrors: true,
        parameterInvalid: {
          error:
            'Insert value has a reference key "cRef" that does not match the next route segment.',
          parameter: {
            cRef: {
              someCKey: 'someCValue',
            },
            someAKey: 'someAValue',
          },
        },
      });

      // a route /a/b/c with bRef and cRef as objects is valid
      const insert4: Insert<any> = {
        route: 'a/b/c',
        command: 'add',
        value: {
          someAKey: 'someAValue',
          bRef: {
            someBKey: 'someBValue',
            cRef: {
              someCKey: 'someCValue',
            },
          },
        },
      };
      const ev4 = new InsertValidator(insert4);
      const errors4 = ev4.validate();

      await expect(errors4).toEqual({
        hasErrors: false,
      });
    });
  });
});
