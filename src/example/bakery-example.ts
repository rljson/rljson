// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';
import { Json } from '@rljson/json';

import { BuffetsTable } from '../content/buffet.ts';
import { CakesTable } from '../content/cake.ts';
import { IngredientsTable } from '../content/ingredients.ts';
import { LayersTable } from '../content/layer.ts';
import { SliceIdsTable } from '../content/slice-ids.ts';
import { Rljson } from '../rljson.ts';
import { Ref } from '../typedefs.ts';

// .............................................................................
export interface Ingredient extends Json {
  name: string;
  amountUnit: 'g' | 'ml';
  nutritionalValuesRef: Ref;
}

export interface RecipeIngredient extends Json {
  ingredientsRef: string;
  quantity: number;
}

export type IngredientsTypeTable = IngredientsTable<Ingredient>;

export interface NutritionalValues extends Json {
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
  slices: SliceIdsTable;
  layers: LayersTable;
  recipes: LayersTable;
  recipeIngredients: IngredientsTable<RecipeIngredient>;
  ingredients: IngredientsTable<Ingredient>;
  nutritionalValues: IngredientsTable<NutritionalValues>;
}

// .............................................................................
export const bakeryExample = (): Bakery => {
  const nutritionalValues = hip<IngredientsTable<any>>({
    _type: 'ingredients',
    _data: [
      {
        id: 'flour',
        energy: 364,
        fat: 0.98,
        protein: 10.33,
        carbohydrates: 76.31,
        _hash: '',
      },
      {
        id: 'flour',
        energy: 364.1,
        fat: 0.981,
        protein: 10.331,
        carbohydrates: 76.311,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const ingredients = hip<IngredientsTable<any>>({
    _type: 'ingredients',
    _data: [
      {
        id: 'flour',
        amountUnit: 'g',
        nutritionalValuesRef: nutritionalValues._data[0]._hash as string,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const recipeIngredients = hip<IngredientsTable<any>>({
    _type: 'ingredients',
    _data: [
      {
        id: 'flour',
        ingredientsRef: ingredients._data[0]._hash as string,
        quantity: 500,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const slices = hip<SliceIdsTable>({
    _type: 'sliceIds',
    _data: [
      {
        add: ['slice0', 'slice1'],
        remove: [],
      },
    ],
  });

  const ingredientTypes = hip<SliceIdsTable>({
    _type: 'sliceIds',
    _data: [
      {
        add: ['flour'],
        remove: [],
      },
    ],
  });

  const recipes = hip<LayersTable>({
    _type: 'layers',
    _data: [
      {
        id: 'tastyCake',
        ingredientsTable: 'recipeIngredients',
        sliceIdsTable: 'ingredientTypes',
        sliceIdsTableRow: ingredientTypes._data[0]._hash as string,
        assign: {
          flour: recipeIngredients._data[0]._hash as string,
        },
        _hash: '',
      },
    ],
  });

  const layers = hip<LayersTable>({
    _type: 'layers',
    _data: [
      {
        ingredientsTable: 'recipes',

        sliceIdsTable: 'slices',
        sliceIdsTableRow: slices._data[0]._hash as string,

        assign: {
          slice0: recipes._data[0]._hash as string,
          slice1: recipes._data[0]._hash as string,
        },
      },
    ],
  });

  const cakes = hip<CakesTable>({
    _type: 'cakes',
    _data: [
      {
        id: 'cake1',
        sliceIdsTable: 'slices',
        sliceIdsRow: slices._data[0]._hash as string,
        layersTable: 'layers',
        layers: {
          flour: layers._data[0]._hash as string,
        },
      },
    ],
  });

  const buffets = hip<BuffetsTable>({
    _type: 'buffets',
    _data: [
      {
        id: 'salesCounter',
        items: [
          {
            table: 'cakes',
            ref: cakes._data[0]._hash as string,
          },
        ],
      },
    ],
  });

  const result: Bakery = {
    buffets,
    cakes,
    slices,
    ingredientTypes,
    layers,
    recipes,
    recipeIngredients,
    ingredients,
    nutritionalValues,
  };

  return result;
};
