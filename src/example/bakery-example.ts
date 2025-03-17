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
  ingredientTypesRef: string;
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
  return {
    // Every rljson object has a list of id-sets other objects can refer to
    _idSets: {
      _type: 'idSets',
      _data: [
        {
          add: ['slice0', 'slice1'],
          _hash: 'KAwCRFD4mdx8b1bzxBb2_O',
        },
      ],
    },

    // A bakery offers a variety of buffets containing different pastries
    buffets: {
      _type: 'buffets',
      _data: [
        {
          items: [{ table: 'cakes', ref: 'fw8IrV05Z1ZekPXTdUdmt8' }],
        },
      ],
    },

    // A cake is a collection of layers, i.e. a base, a filling and a topping.
    // Each layer of the cake has the same slice structure.
    cakes: {
      _type: 'cakes',
      _data: [
        {
          idSet: 'KAwCRFD4mdx8b1bzxBb2_O',
          collections: 'layers',
          layers: {
            _hash: '50ZHxZ8KeUYJ3NC7ax5CbR',
          },
          _hash: 'gMqFPTkYU66L32jDYZiZ79',
        },
      ],
      _hash: 'fw8IrV05Z1ZekPXTdUdmt8',
    },

    // Cakes are cut into slices. The cake layers are shared among the slices.
    slices: {
      _type: 'idSets',
      _data: [
        {
          add: ['slice0', 'slice1'],
          remove: [],
        },
      ],
    },

    // A layer is a collection of ingredients described by a recipe
    layers: {
      _type: 'collections',
      _data: [
        {
          properties: 'recipes',
          assign: {
            slice0: 'VXUW79JrkOAG_pQ-75ahH5',
            slice1: 'VXUW79JrkOAG_pQ-75ahH5',
            _hash: 'Di4uG3-DHSq3_ArFu0V68m',
          },
          _hash: 'IIg0e-6Qr73s7sNZe0RhKs',
        },
      ],
      _hash: 'e3utfEf_VS1-ljAMgqesua',
    },

    // Recipes are sets of ingredients
    recipes: {
      _type: 'collections',
      _data: [
        {
          properties: 'recipeIngredients',
          assign: {
            flour: 'mqLl7Q44V1t2MotJvaVRM_',
            _hash: 'UImWlyWZTSGhNAMC1JUzF1',
          },
          _hash: 'G1YV_P8-_vTxtkXXHJeNBI',
        },
      ],
      _hash: 'r3lw7VsnywyasRmtynZqIt',
    },

    // A recipe ingredient combines an ingredient type with a quantity
    recipeIngredients: {
      _type: 'properties',
      _data: [
        {
          ingredientTypesRef: 'WOfnFT1svec3iJ6x',
          quantity: 500,
          _hash: 'mqLl7Q44V1t2MotJvaVRM_',
        },
      ],
      _hash: 'J7GJEjCRXLNfdAHARg_fzx',
    },

    // A table describing basic properties of ingredients
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

    // A table with nutritive values of ingredients
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
};
