// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';
import { Json } from '@rljson/json';

import { BuffetsTable } from '../content/buffet.ts';
import { CakesTable } from '../content/cake.ts';
import { ComponentsTable } from '../content/components.ts';
import { LayersTable } from '../content/layer.ts';
import { SliceIdsTable } from '../content/slice-ids.ts';
import { Rljson } from '../rljson.ts';
import { Ref } from '../typedefs.ts';

// .............................................................................
export interface Component extends Json {
  name: string;
  amountUnit: 'g' | 'ml';
  nutritionalValuesRef: Ref;
}

export interface RecipeComponent extends Json {
  componentsRef: string;
  quantity: number;
}

export type ComponentsTypeTable = ComponentsTable<Component>;

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
  recipes: LayersTable;
  recipeLayers: LayersTable;
  recipeComponents: ComponentsTable<RecipeComponent>;
  components: ComponentsTable<Component>;
  nutritionalValues: ComponentsTable<NutritionalValues>;
}

// .............................................................................
export const bakeryExample = (): Bakery => {
  const nutritionalValues = hip<ComponentsTable<any>>({
    _type: 'components',
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

  const components = hip<ComponentsTable<any>>({
    _type: 'components',
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

  const recipeComponents = hip<ComponentsTable<any>>({
    _type: 'components',
    _data: [
      {
        id: 'flour',
        componentsRef: components._data[0]._hash as string,
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

  const componentTypes = hip<SliceIdsTable>({
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
        componentsTable: 'recipeComponents',
        sliceIdsTable: 'componentTypes',
        sliceIdsTableRow: componentTypes._data[0]._hash as string,
        add: {
          flour: recipeComponents._data[0]._hash as string,
        },
        _hash: '',
      },
    ],
  });

  const recipeLayers = hip<LayersTable>({
    _type: 'layers',
    _data: [
      {
        componentsTable: 'recipes',

        sliceIdsTable: 'slices',
        sliceIdsTableRow: slices._data[0]._hash as string,

        add: {
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
        layers: {
          recipeLayers: recipeLayers._data[0]._hash as string,
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
    componentTypes,
    recipeLayers,
    recipes,
    recipeComponents,
    components,
    nutritionalValues,
  };

  return result;
};
