// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';
import { Json } from '@rljson/json';

import { Cake, CakesTable } from '../content/cake.ts';
import { ComponentRef, ComponentsTable } from '../content/components.ts';
import { Layer, LayerRef, LayersTable } from '../content/layer.ts';
import { SliceIdsRef, SliceIdsTable } from '../content/slice-ids.ts';
import { Rljson } from '../rljson.ts';
import { JsonWithId } from '../typedefs.ts';


type DecomposeSheet = {
  _id: string;
  _name?: string;
  _path?: string;
  _types?: DecomposeSheet[];
} & { [key: string]: string[] | string | DecomposeSheet[] };

const resolvePropertyReference = (
  ref: string,
  idx: number,
  nestedTypes: Rljson,
) => {
  if (ref.slice(-10).toLowerCase() === 'sliceidref') {
    //SliceIdRef
    const refSliceId = ref.slice(0, -3) as string;
    const slideIds = nestedTypes[refSliceId] as SliceIdsTable;
    const sliceId = slideIds._data[0].add[idx];
    return { [ref]: sliceId as SliceIdsRef };
  } else {
    //ComponentRef
    const refCompRef = ref.slice(0, -3) as string;
    const refComp = nestedTypes[refCompRef] as ComponentsTable<any>;
    const refCompRow = refComp._data[idx] as JsonWithId;
    return { [ref]: (refCompRow as any)._hash as ComponentRef };
  }
};

const nestedProperty = (
  obj: any,
  idx: number,
  path: string,
  nestedTypes: Rljson,
) => {
  const keys = path.split('/');
  const current = obj;

  if (keys.length === 1) {
    const key = keys[0];

    if (key.slice(-3) == 'Ref') {
      return resolvePropertyReference(key, idx, nestedTypes);
    } else return { [key]: current[key] };
  } else {
    return nestedProperty(
      current[keys[0]],
      idx,
      keys.slice(1).join('/'),
      nestedTypes,
    );
  }
};

export const fromJson = (
  json: Array<Json>,
  decomposeSheet: DecomposeSheet,
): Rljson => {
  const slideIdsName = decomposeSheet._name
    ? decomposeSheet._name.toLowerCase() + 'SliceId'
    : 'sliceId';
  const cakeName = decomposeSheet._name
    ? decomposeSheet._name.toLowerCase() + 'Cake'
    : 'cake';

  //Recursively decompose nested types
  const nestedTypes =
    decomposeSheet._types && Array.isArray(decomposeSheet._types)
      ? decomposeSheet._types
          .map((t) => t as DecomposeSheet)
          .map((t) =>
            fromJson(
              t._path
                ? json.flatMap((i) => (i as any)[t._path as string])
                : json,
              t,
            ),
          )
          .reduce((a, b) => ({ ...a, ...b }), {})
      : {};

  //This type
  const componentsName = (layerName: string, objName?: string) =>
    objName
      ? `${objName.toLowerCase()}${
          layerName.charAt(0).toUpperCase() + layerName.slice(1)
        }`
      : layerName.toLowerCase();

  const ids = json.map((item) => item[decomposeSheet._id]);
  const sliceIds: SliceIdsTable = hip({
    _type: 'sliceIds',
    _data: [
      {
        add: ids as SliceIdsRef[],
      },
    ],
  });

  const components: Record<string, ComponentsTable<Json>> = Object.entries(
    decomposeSheet,
  )
    .filter(([layerKey]) => !layerKey.startsWith('_'))
    .map(([layerKey, componentProperties]) =>
      Object.assign({
        [componentsName(layerKey, decomposeSheet._name)]: hip(
          Object.assign({
            _data: json.map((item, idx) =>
              (componentProperties as string[])
                .map((componentProperty) =>
                  nestedProperty(
                    item,
                    idx,
                    componentProperty as string,
                    nestedTypes,
                  ),
                )
                .reduce((a, b) => ({ ...a, ...b }), {}),
            ),
          } as ComponentsTable<Json>),
        ),
      } as Record<string, ComponentsTable<Json>>),
    )
    .reduce((a, b) => ({ ...a, ...b }), {});

  const layers = Object.entries(components)
    .map(
      ([componentKey, component]) =>
        Object.assign({
          [componentKey + 'Layer']: hip({
            _data: [
              {
                add: component._data
                  .map((compItem, idx) =>
                    Object.assign({
                      [ids[idx] as string]: (compItem as any)._hash,
                    }),
                  )
                  .reduce((a, b) => ({ ...a, ...b }), {}),
                sliceIdsTable: slideIdsName,
                sliceIdsTableRow: sliceIds._data[0]._hash as string,
                componentsTable: componentKey,
              } as Layer,
            ],
          } as LayersTable),
        }) as Record<string, LayersTable>,
    )
    .reduce((a, b) => ({ ...a, ...b }), {});

  const cake: CakesTable = {
    _type: 'cakes',
    _data: [
      {
        sliceIdsTable: slideIdsName,
        sliceIdsRow: sliceIds._data[0]._hash as string,
        layers: Object.entries(layers)
          .map(([layerKey, layer]) =>
            Object.assign({
              [layerKey]: layer._hash as string,
            }),
          )
          .reduce((a, b) => ({ ...a, ...b }), {}) as {
          [key: string]: LayerRef;
        },
      } as Cake,
    ],
  };

  return {
    [slideIdsName]: sliceIds,
    ...components,
    ...layers,
    [cakeName]: cake,
    ...nestedTypes,
  };
};

export const exampleFromJsonJson: Array<Json> = [
  {
    VIN: '47YcDGPtTxiNz-gsGBU121',
    brand: 'Volkswagen',
    type: 'Polo',
    doors: 5,
    engine: 'Diesel',
    gears: 6,
    transmission: 'Manual',
    colors: {
      sides: 'green',
      roof: 'white',
      highlights: 'chrome',
    },
    wheels: [
      {
        SN: 'BOB37382',
        brand: 'Borbet',
        dimension: '185/60 R16',
      },
    ],
  },
  {
    VIN: '47YcDGPtTxiNz-gsGBU120',
    brand: 'Volkswagen',
    type: 'Golf',
    doors: 3,
    engine: 'Petrol',
    gears: 7,
    transmission: 'Automatic',
    colors: {
      sides: 'blue',
      roof: 'black',
      highlights: 'chrome',
    },
    wheels: [
      {
        SN: 'BOB37383',
        brand: 'Borbet',
        dimension: '195/55 R16',
      },
    ],
  },
];

export const exampleFromJsonDecomposeSheet: DecomposeSheet = {
  _id: 'VIN',
  _name: 'Car',
  general: ['brand', 'type', 'doors'],
  technical: ['engine', 'transmission', 'gears'],
  color: ['colors/sides', 'colors/roof', 'colors/highlights'],
  wheel: ['wheelSliceIdRef', 'wheelBrandRef', 'wheelDimensionRef'],
  _types: [
    {
      _path: 'wheels',
      _id: 'SN',
      _name: 'Wheel',
      brand: ['brand'],
      dimension: ['dimension'],
    },
  ],
};
