// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';
import { Json, JsonH } from '@rljson/json';

import { Cluster } from '../content/cluster.ts';
import { ComponentsTable } from '../content/components.ts';
import { Layer, LayerRef } from '../content/layers.ts';
import { Stack } from '../content/stack.ts';


type DecomposeSheet = {
  _index: string[];
  _name?: string;
  _path?: string;
  _types?: DecomposeSheet[];
} & { [key: string]: string[] | string | DecomposeSheet[] };

const nestedProperty = (obj: any, path: string) => {
  const keys = path.split('/');
  const current = obj;

  if (keys.length === 1) {
    return { [keys[0]]: current[keys[0]] };
  } else {
    return nestedProperty(current[keys[0]], keys.slice(1).join('/'));
  }
};

export const fromJson = <Str extends string>(
  json: Array<Json>,
  decomposeSheet: DecomposeSheet,
): Cluster<Str> => {
  const indexName = decomposeSheet._name
    ? decomposeSheet._name.toLowerCase() + 'Index'
    : 'index';
  const repositoryName = decomposeSheet._name
    ? decomposeSheet._name.toLowerCase() + 'Repository'
    : 'repository';

  const componentsName = (layerName: string, objName?: string) =>
    objName
      ? `${objName.toLowerCase()}${
          layerName.charAt(0).toUpperCase() + layerName.slice(1)
        }`
      : layerName.toLowerCase();

  const index: ComponentsTable<{ [key: string]: any }> = hip({
    _type: 'components',
    _data: json.map((item) =>
      decomposeSheet._index
        .map((key) => Object.assign({ [key]: item[key] }))
        .reduce((a, b) => ({ ...a, ...b }), {}),
    ),
    _hash: '',
  });

  let components = Object.entries(decomposeSheet)
    .filter(([layerKey]) => !layerKey.startsWith('_'))
    .map(([layerKey, componentProperties]) =>
      Object.assign({
        [componentsName(layerKey, decomposeSheet._name)]: hip(
          Object.assign({
            _type: 'components',
            _data: json.map((item) =>
              (componentProperties as string[])
                .map((componentProperty) =>
                  nestedProperty(item, componentProperty as string),
                )
                .reduce((a, b) => ({ ...a, ...b }), {}),
            ),
          }),
        ),
      }),
    )
    .reduce((a, b) => ({ ...a, ...b }), {});

  components = { ...components, ...{ [indexName]: index } };

  const layers = Object.entries(components)
    .map(([componentKey, component]) =>
      Object.assign({
        [componentKey + 'Layer']: hip(
          Object.assign({
            _type: 'layer',
            _data: (
              component as ComponentsTable<{ [key: string]: any }>
            )._data.map((comp, idx) =>
              Object.assign(
                {
                  [indexName + 'Ref']: (index._data[idx] as any)._hash,
                },
                indexName === componentKey
                  ? {}
                  : { [componentKey + 'Ref']: (comp as any)._hash },
              ),
            ),
          }),
        ),
      }),
    )
    .reduce((a, b) => ({ ...a, ...b }), {});

  const stacks = Object.entries(layers)
    .map(([layerKey, layer]) =>
      Object.assign({
        [layerKey.replace('Layer', 'Stack')]: hip({
          _type: 'stack',
          _data: [{ [layerKey]: (layer as JsonH)._hash }],
        }),
      }),
    )
    .reduce((a, b) => ({ ...a, ...b }), {});

  const repository: Stack<{
    [key: string]: LayerRef;
  }> = {
    _type: 'stack',
    _data: Object.entries(layers)
      .map(([layerKey, layer]) =>
        Object.assign({
          [layerKey]: (layer as JsonH)._hash,
        }),
      )
      .reduce((a, b) => ({ ...a, ...b }), {}),
  };

  const nested =
    decomposeSheet._types && Array.isArray(decomposeSheet._types)
      ? decomposeSheet._types
          .map((t) => t as DecomposeSheet)
          .map((t) => {
            const subCluster = fromJson(
              t._path
                ? json.flatMap((i) => (i as any)[t._path as string])
                : json,
              t,
            );
            const subIndexName = t._name
              ? t._name.toLowerCase() + 'Index'
              : 'index';
            const subIndex = subCluster[subIndexName];

            const relationLayer: Layer<{
              [key: string]: LayerRef;
            }> = hip({
              _type: 'layer',
              _data: index._data.map((indexComp, idx) =>
                Object.assign({
                  [indexName + 'Ref']: (indexComp as any)._hash,
                  [subIndexName + 'Ref']: (subIndex._data[idx] as any)._hash,
                }),
              ),
            });

            const relationName =
              t._name && decomposeSheet._name
                ? `${decomposeSheet._name.toLowerCase()}2${t._name}`
                : '';
            const layerName = relationName
              ? relationName + 'Layer'
              : 'relationLayer';
            const stackName = relationName
              ? relationName + 'Stack'
              : 'relationStack';

            const relationStack: Stack<{
              [key: string]: LayerRef;
            }> = hip({
              _type: 'stack',
              _data: [
                {
                  [layerName]: relationLayer._hash as string,
                  _hash: '',
                },
              ],
            });

            return {
              ...subCluster,
              ...{ [layerName]: relationLayer, [stackName]: relationStack },
            };
          })
          .reduce((a, b) => ({ ...a, ...b }), {})
      : {};

  return {
    ...components,
    ...layers,
    ...stacks,
    ...{ [repositoryName]: repository },
    ...nested,
  } as Cluster<Str>;
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
  _index: ['VIN'],
  _name: 'Car',
  general: ['brand', 'type', 'doors'],
  technical: ['engine', 'transmission', 'gears'],
  color: ['colors/sides', 'colors/roof', 'colors/highlights'],
  _types: [
    {
      _path: 'wheels',
      _index: ['SN'],
      _name: 'Wheel',
      brand: ['brand'],
      dimension: ['dimension'],
    },
  ],
};
