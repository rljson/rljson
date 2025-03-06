// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/hash';

export type TableName = string;
export type ItemId = string;
export type ContainerRef = string;
export type LayerRef = string;
export type PropertyRef = string;
export type PackageRef = string;
export type ContainerId = string;

// ...........................................................................
/** A table in the rljson format */
export interface RljsonTable<T extends Json> extends Json {
  /** The data rows of the table */
  _data: T[];

  /**
   * The type of the table
   * - containers have packages
   * - packages have items
   * - items have layers
   * - layers have properties
   */
  _type: 'containers' | 'packages' | 'items' | 'layers' | 'properties';
}

// ...........................................................................
/** Describes the properties of items */
export interface RljsonProperties extends RljsonTable<Json> {
  _type: 'properties';
}

// ...........................................................................
/** A layer assigns ingredients to slices */
export interface RljsonLayer extends Json {
  /** Describes the properties of this layer */
  properties: TableName;

  /** Assigs properties to items */
  assign: {
    [itemId: ItemId]: PropertyRef;
  };
}

/** Describes the layers in an Rljson file */
export interface RljsonLayers extends RljsonTable<RljsonLayer> {
  _type: 'layers';
}

// ...........................................................................
/**
 * Assigns a layerRef to a containerId
 */
export interface RljsonContainer extends Json {
  /** The id of the container */
  id: ContainerId;
  assign: {
    [containerId: string]: LayerRef;
  };

  _type: 'container';
}

/**
 * A table containing packages
 */
export interface Rljsonpackages extends RljsonTable<RljsonContainer> {
  _type: 'packages';
}

// ...........................................................................
/** The rljson data format */
export interface Rljson extends Json {
  [key: string]: Rljsonpackages | RljsonLayers | RljsonProperties | string;
}

// ...........................................................................
/** @returns an example rljson object */
export const exampleRljson = (): Record<string, any> => {
  return {
    packages: {
      _data: [
        // Describe a complete catalog
        {
          id: '0069622_articles',
          catalog: '0069622',
          contentType: 'articles',
          itemIds: 'HAS034A',
          layers: {
            basicShapes: 'HASH0',
            shortTitlesDe: 'HASH1',
            shortTitlesEn: 'HASH2',
            titlesDe: 'HASH3',
            titlesEn: 'HASH4',
          },
        },

        {
          id: '0069622_programs_and_variants',
          catalog: '0069622',
          contentType: 'programs_and_variants',
          layers: {
            colors: 'HASH0',
            materials: 'HASH1',
          },
        },
      ],
    },

    packageItems: {
      _data: [
        {
          package: '0069622_articles',
          itemIds: ['ITEM0', 'ITEM1', 'ITEM2'],
        },
      ],
    },

    layers: {
      _data: [
        // Describe a complete layer
        {
          layer: 'basicShapes',
          itemProperties: {
            item0: 'HASH6',
            item1: 'HASH7',
            item2: 'HASH8',
          },
        },
      ],
    },

    basicShapes: {
      _data: [
        {
          id: '0',
          type: 'circle',
          radius: 10,
        },
        {
          id: '1',
          type: 'square',
          side: 10,
        },
        {
          id: '2',
          type: 'triangle',
          side: 10,
        },
      ],
    },
  };
};

// Ganz simple:

export interface Rljson2 {
  // A cake is a collection of layers
  box: {
    _data: {
      id: string;
      layers: {
        [name: string]: string;
      };
    }[];
  };

  // A layer is a collection of properties
  layers: {
    _data: {
      id: string;
      properties: [
        'basicShapes',
        'shortTitlesDe',
        'shortTitlesEn',
        'titlesDe',
        'titlesEn',
      ];
    };
  };

  // A slice is a collection of
}
