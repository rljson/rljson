// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { EditValidator, validateEdit } from '../../src/edit/edit-validator';
import { Edit, exampleEditsTable } from '../../src/edit/edit.ts';

import { expectGolden } from '../setup/goldens.ts';


describe('Edit', () => {
  describe('EditsTable', () => {
    it('provides a list of edits', async () => {
      await expectGolden('edit/edits.json').toBe(exampleEditsTable());
    });
  });
  describe('EditsValidator', () => {
    it('can be instantiated', async () => {
      const edit: Edit<any> = {
        route: 'a/b/c',
        command: 'add',
        value: { x: { y: { z: true } } },
      };
      const ev = EditValidator.create(edit);
      await expect(ev).toBeInstanceOf(EditValidator);

      const errors = validateEdit(edit);
      await expect(errors).toEqual({ hasErrors: false });
    });

    it('validates edit', async () => {
      const edit: Edit<any> = {
        route: 'a/b/c',
        command: 'add',
        value: { x: { y: { z: true } } },
      };
      const ev = new EditValidator(edit);
      const errors = ev.validate();

      await expect(errors).toEqual({ hasErrors: false });
    });
    it('throws on invalid required parameters', async () => {
      const edit: Edit<any> = {
        route: '',
        command: 'invalid' as any,
        value: null,
      };
      const ev = new EditValidator(edit);
      const errors = ev.validate();

      await expect(errors).toEqual({
        hasErrors: true,
        parameterRouteInvalid: {
          error: 'Edit route must be a non-empty string.',
          parameter: '',
        },
        parameterCommandInvalid: {
          error: "Edit command must be starting with either 'add' or 'remove'.",
          parameter: 'invalid',
        },
        parameterValueInvalid: {
          error: 'Edit value must be a non-null object.',
          parameter: null,
        },
        routeInvalid: {
          error: 'Edit route is not valid.',
          route: '',
        },
      });
    });

    it('throws on invalid optional parameters', async () => {
      const edit: Edit<any> = {
        route: 'a/b/c',
        command: 'add',
        value: { x: { y: { z: true } } },
        origin: 123 as any,
      };
      const ev = new EditValidator(edit);
      const errors = ev.validate();

      await expect(errors).toEqual({
        hasErrors: true,
        parameterOriginInvalid: {
          error: 'Edit origin must be a string if defined.',
          parameter: 123,
        },
      });
    });
    it('throws on route - value mismatch', async () => {
      const edit: Edit<any> = {
        route: 'a/b/c',
        command: 'add',
        value: { x: 1, y: 2 },
      };
      const ev = new EditValidator(edit);
      const errors = ev.validate();

      await expect(errors).toEqual({
        hasErrors: true,
        dataRouteMismatch: {
          error:
            'Edit route depth does not match value depth. Route depth must match the depth of the value object.',
          route: 'a/b/c',
          routeDepth: 3,
          valueDepth: 1,
        },
      });
    });

    it('throws on nested Component mismatch', async () => {
      // a route /a with value { bRef: 'ref:123' } is valid
      const edit: Edit<any> = {
        route: 'a',
        command: 'add',
        value: { bRef: 'ref:123' },
      };
      const ev = new EditValidator(edit);
      const errors = ev.validate();

      await expect(errors).toEqual({
        hasErrors: false,
      });

      // a route /a/b with bRef as object is valid
      const edit2: Edit<any> = {
        route: 'a/b',
        command: 'add',
        value: {
          someAKey: 'someAValue',
          bRef: {
            someBKey: 'someBValue',
          },
        },
      };
      const ev2 = new EditValidator(edit2);
      const errors2 = ev2.validate();

      await expect(errors2).toEqual({
        hasErrors: false,
      });

      // a route /a/b with cRef as object is invalid
      const edit3: Edit<any> = {
        route: 'a/b',
        command: 'add',
        value: {
          someAKey: 'someAValue',
          cRef: {
            someCKey: 'someCValue',
          },
        },
      };
      const ev3 = new EditValidator(edit3);
      const errors3 = ev3.validate();

      await expect(errors3).toEqual({
        hasErrors: true,
        parameterInvalid: {
          error:
            'Edit value has a reference key "cRef" that does not match the next route segment.',
          parameter: {
            cRef: {
              someCKey: 'someCValue',
            },
            someAKey: 'someAValue',
          },
        },
      });

      // a route /a/b/c with bRef and cRef as objects is valid
      const edit4: Edit<any> = {
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
      const ev4 = new EditValidator(edit4);
      const errors4 = ev4.validate();

      await expect(errors4).toEqual({
        hasErrors: false,
      });
    });
  });
});
