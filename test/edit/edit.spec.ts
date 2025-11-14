// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { describe, it } from 'vitest';

import { createEditTableCfg } from '../../src/edit/edit';
import { createEditHistoryTableCfg } from '../../src/edit/edit-history';
import { createMultiEditTableCfg } from '../../src/edit/multi-edit';

import { expectGolden } from '../setup/goldens';

describe('Edit', () => {
  describe('Edit', () => {
    describe('createEditTableCfg', () => {
      it('provides a TableCfg for MultiEdits', async () => {
        const json = createEditTableCfg('exampleEdits');
        await expectGolden('content/edit/createEditTableCfg.json').toBe(json);
      });
    });
  });
  describe('MultiEdit', () => {
    describe('createMultiEditTableCfg', () => {
      it('provides a TableCfg for MultiEdits', async () => {
        const json = createMultiEditTableCfg('exampleMultiEdits');
        await expectGolden('content/edit/createMultiEditTableCfg.json').toBe(
          json,
        );
      });
    });
  });
  describe('EditHistory', () => {
    describe('createEditHistoryTableCfg', () => {
      it('provides a TableCfg for EditHistory', async () => {
        const json = createEditHistoryTableCfg('exampleEditHistory');
        await expectGolden('content/edit/createEditHistoryTableCfg.json').toBe(
          json,
        );
      });
    });
  });
});
