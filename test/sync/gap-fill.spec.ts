// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, expect, it } from 'vitest';

import {
  GapFillRequest,
  GapFillResponse,
  gapFillRequestExample,
  gapFillResponseExample,
} from '../../src/sync/gap-fill.ts';

describe('GapFill', () => {
  describe('GapFillRequest', () => {
    describe('gapFillRequestExample()', () => {
      it('returns a complete request', () => {
        const req = gapFillRequestExample();
        expect(req.route).toBe('/sharedTree');
        expect(req.afterSeq).toBe(5);
        expect(req.afterTimeId).toBe('1700000000000:AbCd');
      });
    });

    describe('type structure', () => {
      it('requires route and afterSeq', () => {
        const minimal: GapFillRequest = { route: '/myTree', afterSeq: 0 };
        expect(minimal.route).toBe('/myTree');
        expect(minimal.afterSeq).toBe(0);
        expect(minimal.afterTimeId).toBeUndefined();
      });

      it('supports afterTimeId as alternative anchor', () => {
        const withTimeId: GapFillRequest = {
          route: '/trees',
          afterSeq: 10,
          afterTimeId: '1700000000100:XyZw',
        };
        expect(withTimeId.afterTimeId).toBe('1700000000100:XyZw');
      });

      it('supports zero as valid afterSeq (no history)', () => {
        const fresh: GapFillRequest = { route: '/newTree', afterSeq: 0 };
        expect(fresh.afterSeq).toBe(0);
      });
    });
  });

  describe('GapFillResponse', () => {
    describe('gapFillResponseExample()', () => {
      it('returns a response with two missing refs', () => {
        const res = gapFillResponseExample();
        expect(res.route).toBe('/sharedTree');
        expect(res.refs).toHaveLength(2);
        expect(res.refs[0].seq).toBe(6);
        expect(res.refs[1].seq).toBe(7);
      });

      it('contains properly structured ConnectorPayloads', () => {
        const res = gapFillResponseExample();
        for (const ref of res.refs) {
          expect(ref.o).toBeDefined();
          expect(ref.r).toBeDefined();
        }
      });
    });

    describe('type structure', () => {
      it('supports empty refs array (no gaps)', () => {
        const noGaps: GapFillResponse = { route: '/myTree', refs: [] };
        expect(noGaps.refs).toHaveLength(0);
      });

      it('supports refs without optional fields (minimal payloads)', () => {
        const minimal: GapFillResponse = {
          route: '/tree',
          refs: [{ o: 'origin', r: 'ref1' }],
        };
        expect(minimal.refs[0].seq).toBeUndefined();
        expect(minimal.refs[0].c).toBeUndefined();
      });

      it('supports fully populated refs', () => {
        const full: GapFillResponse = {
          route: '/tree',
          refs: [
            {
              o: 'o1',
              r: 'r1',
              c: 'client_000000000001',
              t: 1700000000001,
              seq: 1,
              p: [],
              cksum: 'sha256:aaa',
            },
            {
              o: 'o1',
              r: 'r2',
              c: 'client_000000000001',
              t: 1700000000002,
              seq: 2,
              p: ['r1'],
              cksum: 'sha256:bbb',
            },
          ],
        };
        expect(full.refs).toHaveLength(2);
        expect(full.refs[1].p).toEqual(['r1']);
      });
    });
  });
});
