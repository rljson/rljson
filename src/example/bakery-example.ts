// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Hashed, hip } from '@rljson/hash';
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
  nutritionalValuesRef: Ref;
}

export interface RecipeIngredient extends Json {
  ingredientsRef: string;
  quantity: number;
}

export type IngredientsTypeTable = PropertiesTable<Ingredient>;

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
  slices: IdSetsTable;
  layers: CollectionsTable;
  recipes: CollectionsTable;
  recipeIngredients: PropertiesTable<RecipeIngredient>;
  ingredients: PropertiesTable<Ingredient>;
  nutritionalValues: PropertiesTable<NutritionalValues>;
}

// .............................................................................
export const bakeryExample = (): Bakery => {
  const nutritionalValues: Hashed<PropertiesTable<any>> = hip({
    _type: 'properties',
    _data: [
      {
        energy: 364,
        fat: 0.98,
        protein: 10.33,
        carbohydrates: 76.31,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const ingredients: Hashed<PropertiesTable<any>> = hip({
    _type: 'properties',
    _data: [
      {
        name: 'flour',
        amountUnit: 'g',
        nutritionalValuesRef: nutritionalValues._data[0]._hash as string,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const recipeIngredients: Hashed<PropertiesTable<any>> = hip({
    _type: 'properties',
    _data: [
      {
        ingredientsRef: ingredients._data[0]._hash as string,
        quantity: 500,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const recipes: Hashed<CollectionsTable> = hip({
    _type: 'collections',
    _data: [
      {
        properties: 'recipeIngredients',
        assign: {
          flour: recipeIngredients._data[0]._hash as string,
        },
        _hash: '',
      },
    ],
  });

  const layers: Hashed<CollectionsTable> = hip({
    _type: 'collections',
    _data: [
      {
        properties: 'recipes',
        assign: {
          slice0: recipes._data[0]._hash as string,
          slice1: recipes._data[0]._hash as string,
        },
      },
    ],
  });

  const slices: Hashed<IdSetsTable> = hip({
    _type: 'idSets',
    _data: [
      {
        add: ['slice0', 'slice1'],
        remove: [],
        _hash: '',
      },
    ],
    _hash: '',
  });

  const _idSets: Hashed<IdSetsTable> = hip({
    _type: 'idSets',
    _data: [
      {
        add: ['slice0', 'slice1'],
        _hash: '',
      },
    ],
    _hash: '',
  });

  const cakes: Hashed<CakesTable> = hip({
    _type: 'cakes',
    _data: [
      {
        idSet: _idSets._data[0]._hash as string,
        collections: 'layers',
        layers: {
          flour: layers._data[0]._hash as string,
        },
        _hash: '',
      },
    ],
  });

  const buffets: BuffetsTable = hip({
    _type: 'buffets',
    _data: [
      {
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
    _idSets,
    buffets,
    cakes,
    slices,
    layers,
    recipes,
    recipeIngredients,
    ingredients,
    nutritionalValues,
  };

  return result;
};
