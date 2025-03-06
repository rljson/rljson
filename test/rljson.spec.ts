// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

describe('Foo', () => {
  describe('foo()', () => {
    it('should return "bar"', () => {
      const foo = new Foo();
      expect(foo.foo()).toBe('bar');
    });
  });
});

export type Hashed<T> = T & { _hash: string };

export interface Foo {
  foo(): string;
}

export const f = <T>(v: T): Hashed<T> => {
  return { ...v, _hash: 'xyz' };
};
