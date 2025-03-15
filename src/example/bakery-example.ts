// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

/* eslint-disable jsdoc/require-jsdoc */

import { Json } from '@rljson/json';

import { BuffetsTable } from '../content/buffet.ts';
import { CakesTable } from '../content/cake.ts';
import { CollectionsTable } from '../content/collection.ts';
import { IdSetsTable } from '../content/id-set.ts';
import { PropertiesTable } from '../content/properties.ts';
import { Rljson } from '../rljson.ts';

// .............................................................................
export interface NutritiveValues extends Json {
  energy: number;

  fat: number;

  protein: number;

  carbohydrates: number;
}

// .............................................................................
export interface Bakery extends Rljson {
  buffets: BuffetsTable;

  cakes: CakesTable;

  layers: CollectionsTable;

  sliceIds: IdSetsTable;

  nutritiveValues: PropertiesTable<NutritiveValues>;
}

// .............................................................................
/**
 * Bakery example
 */
export const bakeryExample: Bakery = {
  buffets: {
    _type: 'buffets',
    _data: [
      // Counter
      {
        items: [
          // Angle pie
          {
            table: 'cakes',
            ref: 'ap',
          },

          // Cumb cake
          {
            table: 'cakes',
            ref: 'cc',
          },
        ],
      },

      // Fridge
      {
        id: 'fridge',
        items: [
          // Black forest cake
          {
            table: 'cakes',
            ref: 'bfc',
          },

          // Lemon cheese cake
          {
            table: 'cakes',
            ref: 'lcc',
          },
        ],
      },
    ],
  },

  cakes: {
    _type: 'cakes',
    _data: [],
  },

  layers: {
    _type: 'collections',
    _data: [],
  },

  sliceIds: {
    _type: 'idSets',
    _data: [
      {
        base: null,
        add: [
          'slice0',
          'slice1',
          'slice2',
          'slice3',
          'slice4',
          'slice5',
          'slice6',
          'slice7',
          'slice8',
          'slice9',
          'slice10',
          'slice11',
        ],
        remove: [],
      },
    ],
  },

  nutritiveValues: {
    _type: 'properties',
    _data: [],
  },
};
