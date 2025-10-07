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
    it('Can be instantiated', async () => {
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

    it('Valid Edit', async () => {
      const edit: Edit<any> = {
        route: 'a/b/c',
        command: 'add',
        value: { x: { y: { z: true } } },
      };
      const ev = new EditValidator(edit);
      const errors = ev.validate();

      await expect(errors).toEqual({ hasErrors: false });
    });
    it('Invalid required Parameters', async () => {
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

    it('Invalid optional Parameters', async () => {
      const edit: Edit<any> = {
        route: 'a/b/c',
        command: 'add',
        value: { x: { y: { z: true } } },
        origin: 123 as any,
        previous: [123 as any, 'valid'] as any,
      };
      const ev = new EditValidator(edit);
      const errors = ev.validate();

      await expect(errors).toEqual({
        hasErrors: true,
        parameterOriginInvalid: {
          error: 'Edit origin must be a string if defined.',
          parameter: 123,
        },
        parameterPreviousInvalid: {
          error: 'Edit previous must be an array of strings if defined.',
          parameter: [123, 'valid'],
        },
      });
    });
    it('Route / Object mismatch', async () => {
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
  });
});
