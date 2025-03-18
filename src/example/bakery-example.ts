// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/json';

import { BuffetsTable } from '../content/buffet.ts';
import { CakesTable } from '../content/cake.ts';
import { CollectionsTable } from '../content/collection.ts';
import { IdSetsTable } from '../content/id-set.ts';
import { PropertiesTable } from '../content/properties.ts';
import { Rljson } from '../rljson.ts';
import { Ref } from '../typedefs.ts';

// .............................................................................
export interface Ingredient extends Json {
  name: string;
  amountUnit: 'g' | 'ml';
  nutritiveValuesRef: Ref;
}

export interface RecipeIngredient extends Json {
  ingredientsRef: string;
  quantity: number;
}

export type IngredientsTypeTable = PropertiesTable<Ingredient>;

export interface NutritiveValues extends Json {
  energy: number;
  fat: number;
  protein: number;
  carbohydrates: number;
}
// Recipe
// .............................................................................
export interface Bakery extends Rljson {
  buffets: BuffetsTable;
  cakes: CakesTable;
  slices: IdSetsTable;
  layers: CollectionsTable;
  recipes: CollectionsTable;
  recipeIngredients: PropertiesTable<RecipeIngredient>;
  ingredients: PropertiesTable<Ingredient>;
  nutritiveValues: PropertiesTable<NutritiveValues>;
}

// .............................................................................
export const bakeryExample = (): Bakery => {
  const result: Bakery = {
    _idSets: {
      _type: 'idSets',
      _data: [
        {
          add: ['slice0', 'slice1'],
          _hash: 'Ko990SJfgPJvNGxC63CRf7',
        },
      ],
      _hash: 'NiojsJvZ7iEU7WeMWttzyJ',
    },
    buffets: {
      _type: 'buffets',
      _data: [
        {
          items: [
            {
              table: 'cakes',
              ref: 'KdLv3zTftqKKUeqYrTtO2r',
            },
          ],
        },
      ],
    },
    cakes: {
      _type: 'cakes',
      _data: [
        {
          idSet: 'Ko990SJfgPJvNGxC63CRf7',
          collections: 'layers',
          layers: {
            _hash: 'RBNvo1WzZ4oRRq0W9-hknp',
          },
          _hash: 'KdLv3zTftqKKUeqYrTtO2r',
        },
      ],
    },
    slices: {
      _type: 'idSets',
      _data: [
        {
          add: ['slice0', 'slice1'],
          remove: [],
          _hash: 'wyYfK5E4ArrMKQ_zvi2-EE',
        },
      ],
      _hash: 'Qt6FzyzwHdEdYC3fKUXaAm',
    },
    layers: {
      _type: 'collections',
      _data: [
        {
          properties: 'recipes',
          assign: {
            slice0: 'uRTo_Jmt9lOA09e2QnwB9W',
            slice1: 'uRTo_Jmt9lOA09e2QnwB9W',
          },
        },
      ],
    },
    recipes: {
      _type: 'collections',
      _data: [
        {
          properties: 'recipeIngredients',
          assign: {
            flour: 'RCA4yzQe6mYOqquoLijKop',
          },
          _hash: 'uRTo_Jmt9lOA09e2QnwB9W',
        },
      ],
    },
    recipeIngredients: {
      _type: 'properties',
      _data: [
        {
          ingredientsRef: 'CdSJV-WOfnFT1svec3iJ6x',
          quantity: 500,
          _hash: 'RCA4yzQe6mYOqquoLijKop',
        },
      ],
      _hash: 'R6dJq4ZJ3QDa9Bz8QJDhNq',
    },
    ingredients: {
      _type: 'properties',
      _data: [
        {
          name: 'flour',
          amountUnit: 'g',
          nutritiveValuesRef: 'gZXFSlrl5QAs5hOVsq5sWB',
          _hash: 'CdSJV-WOfnFT1svec3iJ6x',
        },
      ],
      _hash: 'FgJeTM0NcZvXwFcU-PD8Jf',
    },
    nutritiveValues: {
      _type: 'properties',
      _data: [
        {
          energy: 364,
          fat: 0.98,
          protein: 10.33,
          carbohydrates: 76.31,
          _hash: 'gZXFSlrl5QAs5hOVsq5sWB',
        },
      ],
      _hash: '7k4OqQtk71w3yVGMoA9F6p',
    },
  };

  return result;
};
