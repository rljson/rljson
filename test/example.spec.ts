// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import { Example } from '../src/example';
import { BaseValidator } from '../src/validate/base-validator';

import { expectGolden } from './setup/goldens';

describe('Example', () => {
  const convertToKebabCase = (str: string) =>
    str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  describe('ok', () => {
    describe('matches golden files', () => {
      for (const key in Example.ok) {
        it(key, async () => {
          const snakeCaseKey = convertToKebabCase(key);
          const example = Example.ok[key]();
          await expectGolden(`example/ok/${snakeCaseKey}.json`).toBe(example);
        });
      }
    });

    describe('withstands validation', () => {
      for (const key in Example.ok) {
        it(key, async () => {
          const example = Example.ok[key]();
          const result = new BaseValidator().validateSync(example);
          const message = JSON.stringify(result, null, 2);
          expect(result.hasErrors, message).toBe(false);
        });
      }
    });
  });

  describe('broken', () => {
    describe('matches golden files', () => {
      for (const category in Example.broken) {
        describe(category, () => {
          const categoryExamples = Example.broken[category];
          expect(typeof categoryExamples).toBe('object');
          for (const key in categoryExamples) {
            it(key, async () => {
              const example = categoryExamples[key];
              expect(typeof example).toBe('function');
              const categorySnakeCase = convertToKebabCase(category);
              const snakeCaseKey = convertToKebabCase(key);
              await expectGolden(
                `example/broken/${categorySnakeCase}/${snakeCaseKey}.json`,
              ).toBe(example());
            });
          }
        });
      }
    });
  });
});
