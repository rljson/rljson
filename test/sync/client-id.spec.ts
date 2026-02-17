// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import {
  clientId,
  clientIdExample,
  isClientId,
} from '../../src/sync/client-id.ts';

describe('ClientId', () => {
  describe('clientId()', () => {
    it('generates a string starting with "client_"', () => {
      const id = clientId();
      expect(id.startsWith('client_')).toBe(true);
    });

    it('generates a 19-character string (7 prefix + 12 suffix)', () => {
      const id = clientId();
      expect(id.length).toBe(19);
    });

    it('generates unique ids on every call', () => {
      const ids = new Set(Array.from({ length: 100 }, () => clientId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('isClientId()', () => {
    it('returns true for valid client ids', () => {
      expect(isClientId(clientId())).toBe(true);
      expect(isClientId('client_123456789012')).toBe(true);
      expect(isClientId('client_abcdefABCDEF')).toBe(true);
    });

    it('returns false for strings without client_ prefix', () => {
      expect(isClientId('server_123456789012')).toBe(false);
      expect(isClientId('123456789012345678')).toBe(false);
      expect(isClientId('')).toBe(false);
    });

    it('returns false for strings with wrong suffix length', () => {
      expect(isClientId('client_short')).toBe(false);
      expect(isClientId('client_toolongstring!')).toBe(false);
      expect(isClientId('client_')).toBe(false);
    });
  });

  describe('clientIdExample()', () => {
    it('returns a valid ClientId', () => {
      const example = clientIdExample();
      expect(isClientId(example)).toBe(true);
      expect(example).toBe('client_ExAmPlE12345');
    });
  });
});
