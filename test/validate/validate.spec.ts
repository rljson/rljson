// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { Example } from '../../src/example';
import { exampleRljson, Rljson } from '../../src/rljson';
import { BaseValidator } from '../../src/validate/base-validator';
import { Errors, Validate, Validator } from '../../src/validate/validate';

describe('Validate', () => {
  describe('validate(rljson)', () => {
    describe('applies the rljson to all validators set with addValidator before', () => {
      it('with validators throwing errors', async () => {
        // v0 has errors
        const v0: Validator = {
          name: 'v0',
          validate(): Promise<Errors> {
            return Promise.resolve({
              someError: { details: 'error' },
              hasErrors: true,
            });
          },
        };

        // v1 has errors too
        const v1: Validator = {
          name: 'v1',
          validate(): Promise<Errors> {
            return Promise.resolve({
              anotherError: { details: 'error' },
              hasErrors: true,
            });
          },
        };

        // v2 has no errors
        const v2: Validator = {
          name: 'v2',
          validate(): Promise<Errors> {
            return Promise.resolve({ hasErrors: false });
          },
        };

        // Create a validate object
        const validate = new Validate();

        // Add validators
        validate.addValidator(v0);
        validate.addValidator(v1);
        validate.addValidator(v2);

        // Run validation
        const result = await validate.run(exampleRljson());

        // The errors produced by v0 and v1 should be in the result
        // v2 has no errors, so it should not be in the result
        expect(result).toEqual({
          v0: {
            hasErrors: true,
            someError: {
              details: 'error',
            },
          },
          v1: {
            anotherError: {
              details: 'error',
            },
            hasErrors: true,
          },
        });
      });

      it('with validators not throwing errors', async () => {
        // v has no errors
        const v: Validator = {
          name: 'v2',
          validate(): Promise<Errors> {
            return Promise.resolve({ hasErrors: false });
          },
        };

        // Create a validate object
        const validate = new Validate();

        // Add validators
        validate.addValidator(v);

        // Run validation
        const result = await validate.run(exampleRljson());

        expect(result).toEqual({});
      });
    });

    describe('with BaseValidator', () => {
      it('returns an empty object on no errors', async () => {
        // Create a validate object
        const validate = new Validate();
        validate.addValidator(new BaseValidator());

        // Run validation
        const result = await validate.run(Example.ok.complete());

        expect(result).toEqual({});
      });

      it('returns an error object on errors', async () => {
        const validate = new Validate();
        validate.addValidator(new BaseValidator());

        const result = await validate.run(
          Example.broken.base.brokenTableName() as Rljson,
        );
        expect(result).toEqual({
          base: {
            hasErrors: true,
            tableNamesNotLowerCamelCase: {
              error: 'Table names must be lower camel case',
              invalidTableNames: ['brok$en'],
            },
          },
        });
      });
    });
  });
});
