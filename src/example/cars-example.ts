// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';
import { Json } from '@rljson/json';

import { ComponentsTable } from '../content/components.ts';
import { Layer, LayersTable } from '../content/layers.ts';
import { Rljson } from '../rljson.ts';


// .............................................................................
export interface CarIndex extends Json {
  VIN: string;
}

// .............................................................................
export interface CarGeneral extends Json {
  manufacturer: string;
  type: string;
  doors: number;
}

// .............................................................................
export interface CarTechnical extends Json {
  engine: string;
  gears: number;
  transmission: 'Manual' | 'Automatic';
}

// .............................................................................
export interface CarColor extends Json {
  sides: string;
  roof: string;
  highlights: string;
}

// .............................................................................
export interface WheelIndex extends Json {
  SN: string;
}

// .............................................................................
export interface WheelManufacturer extends Json {
  manufacturer: string;
}

// .............................................................................
export interface WheelDimensions extends Json {
  dimensions: string;
}

// .............................................................................
export interface Cars extends Rljson {
  carIndexComponents: ComponentsTable<CarIndex>;
  carGeneralComponents: ComponentsTable<CarGeneral>;
  carTechnicalComponents: ComponentsTable<CarTechnical>;
  carColorComponents: ComponentsTable<CarColor>;
  carIndexLayer: LayersTable<Layer>;
  carGeneralLayer: LayersTable<Layer>;
  carTechnicalLayer: LayersTable<Layer>;
  carColorLayer: LayersTable<Layer>;
  carRepository: LayersTable<Layer>;
  wheelIndexComponents: ComponentsTable<WheelIndex>;
  wheelManufacturerComponents: ComponentsTable<WheelManufacturer>;
  wheelDimensionsComponents: ComponentsTable<WheelDimensions>;
  wheelIndexLayer: LayersTable<Layer>;
  wheelManufacturerLayer: LayersTable<Layer>;
  wheelDimensionsLayer: LayersTable<Layer>;
  wheelRepository: LayersTable<Layer>;
  car2Wheel: LayersTable<Layer>;
}

// .............................................................................
export const carExample = (): Cars => {
  // .............................................................................
  /**
   * Car Structure
   */
  const carIndexComponents = hip<ComponentsTable<CarIndex>>({
    _data: [
      {
        VIN: '2AFB34',
        _hash: '',
      },
      {
        VIN: 'C235F3',
        _hash: '',
      },
    ],
    _hash: '',
  });

  const carGeneralComponents = hip<ComponentsTable<CarGeneral>>({
    _data: [
      {
        manufacturer: 'Volkswagen',
        type: 'Golf',
        doors: 5,
        _hash: '',
      },
      {
        manufacturer: 'BMW',
        type: 'X3',
        doors: 5,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const carTechnicalComponents = hip<ComponentsTable<CarTechnical>>({
    _data: [
      {
        engine: '2.0 TDI',
        gears: 6,
        transmission: 'Manual',
        _hash: '',
      },
      {
        engine: '3.0 Diesel',
        gears: 8,
        transmission: 'Automatic',
        _hash: '',
      },
    ],
    _hash: '',
  });

  const carColorComponents = hip<ComponentsTable<CarColor>>({
    _data: [
      {
        sides: 'Blue',
        roof: 'White',
        highlights: 'Black',
        _hash: '',
      },
      {
        sides: 'Black',
        roof: 'Black',
        highlights: 'Silver',
        _hash: '',
      },
    ],
    _hash: '',
  });

  const carIndexLayer = hip<LayersTable<Layer>>({
    _data: [
      {
        items: [
          { _indexRef: carIndexComponents._data[0]._hash as string, _hash: '' },
          { _indexRef: carIndexComponents._data[1]._hash as string, _hash: '' },
        ],
        _hash: '',
      },
    ],
  });

  const carGeneralLayer = hip<LayersTable<Layer>>({
    _data: [
      {
        items: [
          {
            _indexRef: carIndexComponents._data[0]._hash as string,
            _Ref: carGeneralComponents._data[0]._hash as string,
            _hash: '',
          },
          {
            _indexRef: carIndexComponents._data[1]._hash as string,
            _Ref: carGeneralComponents._data[1]._hash as string,
            _hash: '',
          },
        ],
        _hash: '',
      },
    ],
  });

  const carTechnicalLayer = hip<LayersTable<Layer>>({
    _data: [
      {
        items: [
          {
            _indexRef: carIndexComponents._data[0]._hash as string,
            _Ref: carTechnicalComponents._data[0]._hash as string,
            _hash: '',
          },
          {
            _indexRef: carIndexComponents._data[1]._hash as string,
            _Ref: carTechnicalComponents._data[1]._hash as string,
            _hash: '',
          },
        ],
        _hash: '',
      },
    ],
  });

  const carColorLayer = hip<LayersTable<Layer>>({
    _data: [
      {
        items: [
          {
            _indexRef: carIndexComponents._data[0]._hash as string,
            _Ref: carColorComponents._data[0]._hash as string,
            _hash: '',
          },
          {
            _indexRef: carIndexComponents._data[1]._hash as string,
            _Ref: carColorComponents._data[1]._hash as string,
            _hash: '',
          },
        ],
        _hash: '',
      },
    ],
  });

  // .............................................................................
  /**
   * Wheel Structure
   */

  const wheelIndexComponents = hip<ComponentsTable<WheelIndex>>({
    _data: [
      {
        SN: 'CDF744',
        _hash: '',
      },
      {
        SN: '01B223',
        _hash: '',
      },
    ],
    _hash: '',
  });

  const wheelManufacturerComponents = hip<ComponentsTable<WheelManufacturer>>({
    _data: [
      {
        manufacturer: 'Borbet',
        _hash: '',
      },
      {
        manufacturer: 'BBS',
        _hash: '',
      },
    ],
    _hash: '',
  });

  const wheelDimensionsComponents = hip<ComponentsTable<WheelDimensions>>({
    _data: [
      {
        dimensions: '8Jx18H2 ET35',
        _hash: '',
      },
      {
        dimensions: '9Jx19H2 ET40',
        _hash: '',
      },
    ],
    _hash: '',
  });

  const wheelIndexLayer = hip<LayersTable<Layer>>({
    _data: [
      {
        items: [
          {
            _indexRef: wheelIndexComponents._data[0]._hash as string,
            _hash: '',
          },
          {
            _indexRef: wheelIndexComponents._data[1]._hash as string,
            _hash: '',
          },
        ],
        _hash: '',
      },
    ],
  });

  const wheelManufacturerLayer = hip<LayersTable<Layer>>({
    _data: [
      {
        items: [
          {
            _indexRef: wheelIndexComponents._data[0]._hash as string,
            _Ref: wheelManufacturerComponents._data[0]._hash as string,
            _hash: '',
          },
          {
            _indexRef: wheelIndexComponents._data[1]._hash as string,
            _Ref: wheelManufacturerComponents._data[1]._hash as string,
            _hash: '',
          },
        ],
        _hash: '',
      },
    ],
  });

  const wheelDimensionsLayer = hip<LayersTable<Layer>>({
    _data: [
      {
        items: [
          {
            _indexRef: wheelIndexComponents._data[0]._hash as string,
            _Ref: wheelDimensionsComponents._data[0]._hash as string,
            _hash: '',
          },
          {
            _indexRef: wheelIndexComponents._data[1]._hash as string,
            _Ref: wheelDimensionsComponents._data[1]._hash as string,
            _hash: '',
          },
        ],
        _hash: '',
      },
    ],
  });

  const car2Wheel = hip<LayersTable<Layer>>({
    _data: [
      {
        items: [
          {
            _indexRef: carIndexLayer._data[0].items[0]._hash as string,
            Ref: wheelIndexLayer._data[0].items[0]._hash as string,
            _hash: '',
          },
          {
            _indexRef: carIndexLayer._data[0].items[0]._hash as string,
            Ref: wheelIndexLayer._data[0].items[0]._hash as string,
            _hash: '',
          },
          {
            _indexRef: carIndexLayer._data[0].items[0]._hash as string,
            Ref: wheelIndexLayer._data[0].items[0]._hash as string,
            _hash: '',
          },
          {
            _indexRef: carIndexLayer._data[0].items[0]._hash as string,
            Ref: wheelIndexLayer._data[0].items[0]._hash as string,
            _hash: '',
          },
          {
            _indexRef: carIndexLayer._data[0].items[1]._hash as string,
            Ref: wheelIndexLayer._data[0].items[1]._hash as string,
            _hash: '',
          },
          {
            _indexRef: carIndexLayer._data[0].items[1]._hash as string,
            Ref: wheelIndexLayer._data[0].items[1]._hash as string,
            _hash: '',
          },
          {
            _indexRef: carIndexLayer._data[0].items[1]._hash as string,
            Ref: wheelIndexLayer._data[0].items[1]._hash as string,
            _hash: '',
          },
          {
            _indexRef: carIndexLayer._data[0].items[1]._hash as string,
            Ref: wheelIndexLayer._data[0].items[1]._hash as string,
            _hash: '',
          },
        ],
        _hash: '',
      },
    ],
  });

  const wheelRepository = hip<LayersTable<Layer>>({
    _data: [
      {
        items: [
          {
            _indexRef: wheelIndexLayer._data[0]._hash as string,
            manufacturerRef: wheelManufacturerLayer._data[0]._hash as string,
            dimensionsRef: wheelDimensionsLayer._data[0]._hash as string,
            carRef: car2Wheel._data[0]._hash as string,
            _hash: '',
          },
        ],
        _hash: '',
      },
    ],
  });

  const carRepository = hip<LayersTable<Layer>>({
    _data: [
      {
        items: [
          {
            _indexRef: carIndexLayer._data[0]._hash as string,
            generalRef: carGeneralLayer._data[0]._hash as string,
            technicalRef: carTechnicalLayer._data[0]._hash as string,
            colorRef: carColorLayer._data[0]._hash as string,
            wheelRef: car2Wheel._data[0]._hash as string,
            _hash: '',
          },
        ],
        _hash: '',
      },
    ],
  });

  const result: Cars = {
    carIndexComponents,
    carGeneralComponents,
    carTechnicalComponents,
    carColorComponents,
    carIndexLayer,
    carGeneralLayer,
    carTechnicalLayer,
    carColorLayer,
    carRepository,
    wheelIndexComponents,
    wheelManufacturerComponents,
    wheelDimensionsComponents,
    wheelIndexLayer,
    wheelManufacturerLayer,
    wheelDimensionsLayer,
    wheelRepository,
    car2Wheel,
  };

  return result;
};
