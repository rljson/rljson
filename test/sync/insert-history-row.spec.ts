// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import {
  createInsertHistoryTableCfg,
  InsertHistoryRow,
} from '../../src/insertHistory/insertHistory.ts';
import { TableCfg } from '../../src/content/table-cfg.ts';

describe('InsertHistoryRow', () => {
  describe('clientTimestamp field', () => {
    it('is optional and can be omitted', () => {
      const row: InsertHistoryRow<'test'> = {
        testRef: 'ref1',
        timeId: '1700000000000:AbCd',
        route: '/test',
      };
      expect(row.clientTimestamp).toBeUndefined();
    });

    it('can hold a numeric timestamp in ms', () => {
      const now = Date.now();
      const row: InsertHistoryRow<'test'> = {
        testRef: 'ref1',
        timeId: '1700000000000:AbCd',
        route: '/test',
        clientTimestamp: now,
      };
      expect(row.clientTimestamp).toBe(now);
    });

    it('coexists with origin and previous', () => {
      const row: InsertHistoryRow<'test'> = {
        testRef: 'ref1',
        timeId: '1700000000000:AbCd',
        route: '/test',
        origin: 'client_ExAmPlE12345',
        previous: ['1699999999999:ZzZz'],
        clientTimestamp: 1700000000000,
      };
      expect(row.origin).toBe('client_ExAmPlE12345');
      expect(row.previous).toEqual(['1699999999999:ZzZz']);
      expect(row.clientTimestamp).toBe(1700000000000);
    });
  });

  describe('origin field', () => {
    it('accepts a ClientId string', () => {
      const row: InsertHistoryRow<'test'> = {
        testRef: 'ref1',
        timeId: '1700000000000:AbCd',
        route: '/test',
        origin: 'client_000000000001',
      };
      expect(row.origin).toBe('client_000000000001');
    });

    it('accepts a legacy Ref string for backward compatibility', () => {
      const row: InsertHistoryRow<'test'> = {
        testRef: 'ref1',
        timeId: '1700000000000:AbCd',
        route: '/test',
        origin: 'some-legacy-ref-hash',
      };
      expect(row.origin).toBe('some-legacy-ref-hash');
    });
  });

  describe('createInsertHistoryTableCfg', () => {
    it('includes clientTimestamp column', () => {
      const tableCfg: TableCfg = {
        key: 'myTable',
        type: 'layers',
        columns: [],
        isHead: false,
        isRoot: false,
        isShared: false,
      };
      const cfg = createInsertHistoryTableCfg(tableCfg);
      const clientTimestampCol = cfg.columns.find(
        (c) => c.key === 'clientTimestamp',
      );
      expect(clientTimestampCol).toBeDefined();
      expect(clientTimestampCol!.type).toBe('number');
      expect(clientTimestampCol!.titleLong).toBe('Client Timestamp');
    });

    it('has all expected columns in correct order', () => {
      const tableCfg: TableCfg = {
        key: 'example',
        type: 'components',
        columns: [],
        isHead: false,
        isRoot: false,
        isShared: false,
      };
      const cfg = createInsertHistoryTableCfg(tableCfg);
      const columnKeys = cfg.columns.map((c) => c.key);
      expect(columnKeys).toEqual([
        '_hash',
        'timeId',
        'exampleRef',
        'route',
        'origin',
        'previous',
        'clientTimestamp',
      ]);
    });
  });
});
