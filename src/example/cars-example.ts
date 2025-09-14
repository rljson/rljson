// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { hip } from '@rljson/hash';
import { Json } from '@rljson/json';

import { Cluster } from '../content/cluster.ts';
import { ComponentsTable } from '../content/components.ts';
import { Layer, LayerRef } from '../content/layers.ts';
import { Stack } from '../content/stack.ts';


// .............................................................................
export interface CarIndex extends Json {
  vin: string;
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
  sn: string;
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
export interface Cars extends Cluster<'Car' | 'Wheel'> {
  //Car Cluster
  // --> Components
  carIndex: ComponentsTable<CarIndex>;
  carGeneral: ComponentsTable<CarGeneral>;
  carTechnical: ComponentsTable<CarTechnical>;
  carColor: ComponentsTable<CarColor>;
  // --> Layers
  carIndexLayer: Layer<{ carIndex: LayerRef }>;
  carGeneralLayer: Layer<{ carIndex: LayerRef; carGeneral: LayerRef }>;
  carTechnicalLayer: Layer<{ carIndex: LayerRef; carTechnical: LayerRef }>;
  carColorLayer: Layer<{ carIndex: LayerRef; carColor: LayerRef }>;
  carRepository: Stack<{
    carIndexLayer: LayerRef;
    carGeneralLayer: LayerRef;
    carTechnicalLayer: LayerRef;
    carColorLayer: LayerRef;
    car2WheelLayer: LayerRef;
  }>;
  // --> Stacks
  carIndexStack: Stack<{ carIndexLayer: LayerRef }>;
  carGeneralStack: Stack<{ carGeneralLayer: LayerRef }>;
  carTechnicalStack: Stack<{ carTechnicalLayer: LayerRef }>;
  carColorStack: Stack<{ carColorLayer: LayerRef }>;

  //Wheel Cluster
  // --> Components
  wheelIndex: ComponentsTable<WheelIndex>;
  wheelManufacturer: ComponentsTable<WheelManufacturer>;
  wheelDimension: ComponentsTable<WheelDimensions>;
  // --> Layers
  wheelIndexLayer: Layer<{ wheelIndex: LayerRef }>;
  wheelManufacturerLayer: Layer<{
    wheelIndex: LayerRef;
    wheelManufacturer: LayerRef;
  }>;
  wheelDimensionLayer: Layer<{
    wheelIndex: LayerRef;
    wheelDimension: LayerRef;
  }>;
  // --> Stack
  wheelIndexStack: Stack<{ wheelIndexLayer: LayerRef }>;
  wheelDimensionStack: Stack<{ wheelDimensionLayer: LayerRef }>;
  wheelManufacturerStack: Stack<{ wheelManufacturerLayer: LayerRef }>;

  wheelRepository: Stack<{
    wheelIndexLayer: LayerRef;
    wheelManufacturerLayer: LayerRef;
    wheelDimensionLayer: LayerRef;
    car2WheelLayer: LayerRef;
  }>;

  //Relations
  car2WheelLayer: Layer<{ carIndex: LayerRef; wheelIndex: LayerRef }>;
  car2WheelStack: Stack<{ car2WheelLayer: LayerRef }>;
}

// .............................................................................
export const carExample = (): Cars => {
  // .............................................................................
  /**
   * Car Structure
   */
  const carIndex = hip<ComponentsTable<CarIndex>>({
    _data: [
      {
        vin: '2AFB34',
        _hash: '',
      },
      {
        vin: 'C235F3',
        _hash: '',
      },
    ],
    _hash: '',
  });

  const carGeneral = hip<ComponentsTable<CarGeneral>>({
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

  const carTechnical = hip<ComponentsTable<CarTechnical>>({
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

  const carColor = hip<ComponentsTable<CarColor>>({
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

  const carIndexLayer = hip<Layer<{ carIndex: LayerRef }>>({
    _data: [
      {
        carIndexRef: carIndex._data[0]._hash as string,
        _hash: '',
      },
      {
        carIndexRef: carIndex._data[1]._hash as string,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const carIndexStack = hip<Stack<{ carIndexLayer: LayerRef }>>({
    _type: 'stack',
    _data: [
      {
        carIndexLayer: carIndexLayer._hash as string,
        _hash: '',
      },
    ],
  });

  const carGeneralLayer = hip<
    Layer<{ carIndex: LayerRef; carGeneral: LayerRef }>
  >({
    _data: [
      {
        carIndexRef: carIndex._data[0]._hash as string,
        carGeneralRef: carGeneral._data[0]._hash as string,
        _hash: '',
      },
      {
        carIndexRef: carIndex._data[1]._hash as string,
        carGeneralRef: carGeneral._data[1]._hash as string,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const carGeneralStack = hip<Stack<{ carGeneralLayer: LayerRef }>>({
    _type: 'stack',
    _data: [
      {
        carGeneralLayer: carGeneralLayer._hash as string,
        _hash: '',
      },
    ],
  });

  const carTechnicalLayer = hip<
    Layer<{ carIndex: LayerRef; carTechnical: LayerRef }>
  >({
    _data: [
      {
        carIndexRef: carIndex._data[0]._hash as string,
        carTechnicalRef: carTechnical._data[0]._hash as string,
        _hash: '',
      },
      {
        carIndexRef: carIndex._data[1]._hash as string,
        carTechnicalRef: carTechnical._data[1]._hash as string,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const carTechnicalStack = hip<Stack<{ carTechnicalLayer: LayerRef }>>({
    _type: 'stack',
    _data: [
      {
        carTechnicalLayer: carTechnicalLayer._hash as string,
        _hash: '',
      },
    ],
  });

  const carColorLayer = hip<Layer<{ carIndex: LayerRef; carColor: LayerRef }>>({
    _data: [
      {
        carIndexRef: carIndex._data[0]._hash as string,
        carColorRef: carColor._data[0]._hash as string,
        _hash: '',
      },
      {
        carIndexRef: carIndex._data[1]._hash as string,
        carColorRef: carColor._data[1]._hash as string,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const carColorStack = hip<Stack<{ carColorLayer: LayerRef }>>({
    _type: 'stack',
    _data: [
      {
        carColorLayer: carColorLayer._hash as string,
        _hash: '',
      },
    ],
  });

  // .............................................................................
  /**
   * Wheel Structure
   */

  const wheelIndex = hip<ComponentsTable<WheelIndex>>({
    _data: [
      {
        sn: 'CDF744',
        _hash: '',
      },
      {
        sn: '01B223',
        _hash: '',
      },
    ],
    _hash: '',
  });

  const wheelManufacturer = hip<ComponentsTable<WheelManufacturer>>({
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

  const wheelDimension = hip<ComponentsTable<WheelDimensions>>({
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

  const wheelIndexLayer = hip<Layer<{ wheelIndex: LayerRef }>>({
    _data: [
      {
        wheelIndexRef: wheelIndex._data[0]._hash as string,
        _hash: '',
      },
      {
        wheelIndexRef: wheelIndex._data[1]._hash as string,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const wheelIndexStack = hip<Stack<{ wheelIndexLayer: LayerRef }>>({
    _type: 'stack',
    _data: [
      {
        wheelIndexLayer: wheelIndexLayer._hash as string,
        _hash: '',
      },
    ],
  });

  const wheelManufacturerLayer = hip<
    Layer<{ wheelIndex: LayerRef; wheelManufacturer: LayerRef }>
  >({
    _data: [
      {
        wheelIndexRef: wheelIndex._data[0]._hash as string,
        wheelManufacturerRef: wheelManufacturer._data[0]._hash as string,
        _hash: '',
      },
      {
        wheelIndexRef: wheelIndex._data[1]._hash as string,
        wheelManufacturerRef: wheelManufacturer._data[1]._hash as string,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const wheelManufacturerStack = hip<
    Stack<{ wheelManufacturerLayer: LayerRef }>
  >({
    _type: 'stack',
    _data: [
      {
        wheelManufacturerLayer: wheelManufacturerLayer._hash as string,
        _hash: '',
      },
    ],
  });

  const wheelDimensionLayer = hip<
    Layer<{
      wheelIndex: LayerRef;
      wheelDimension: LayerRef;
    }>
  >({
    _data: [
      {
        wheelIndexRef: wheelIndex._data[0]._hash as string,
        wheelDimensionRef: wheelDimension._data[0]._hash as string,
        _hash: '',
      },
      {
        wheelIndexRef: wheelIndex._data[1]._hash as string,
        wheelDimensionRef: wheelDimension._data[1]._hash as string,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const wheelDimensionStack = hip<Stack<{ wheelDimensionLayer: LayerRef }>>({
    _type: 'stack',
    _data: [
      {
        wheelDimensionLayer: wheelDimensionLayer._hash as string,
        _hash: '',
      },
    ],
  });

  const car2WheelLayer = hip<
    Layer<{ carIndex: LayerRef; wheelIndex: LayerRef }>
  >({
    _data: [
      {
        carIndexRef: carIndexLayer._data[0].carIndexRef as string,
        wheelIndexRef: wheelIndexLayer._data[0].wheelIndexRef as string,
        _hash: '',
      },
      {
        carIndexRef: carIndexLayer._data[1].carIndexRef as string,
        wheelIndexRef: wheelIndexLayer._data[1].wheelIndexRef as string,
        _hash: '',
      },
    ],
    _hash: '',
  });

  const car2WheelStack = hip<Stack<{ car2WheelLayer: LayerRef }>>({
    _type: 'stack',
    _data: [
      {
        car2WheelLayer: car2WheelLayer._hash as string,
        _hash: '',
      },
    ],
  });

  const wheelRepository = hip<
    Stack<{
      wheelIndexLayer: LayerRef;
      wheelManufacturerLayer: LayerRef;
      wheelDimensionLayer: LayerRef;
      car2WheelLayer: LayerRef;
    }>
  >({
    _type: 'stack',
    _data: [
      {
        wheelIndexLayer: wheelIndexStack._data[0].wheelIndexLayer as string,
        wheelManufacturerLayer: wheelManufacturerStack._data[0]
          .wheelManufacturerLayer as string,
        wheelDimensionLayer: wheelDimensionStack._data[0]
          .wheelDimensionLayer as string,
        car2WheelLayer: car2WheelStack._data[0].car2WheelLayer as string,
        _hash: '',
      },
    ],
  });

  const carRepository = hip<
    Stack<{
      carIndexLayer: LayerRef;
      carGeneralLayer: LayerRef;
      carTechnicalLayer: LayerRef;
      carColorLayer: LayerRef;
      car2WheelLayer: LayerRef;
    }>
  >({
    _type: 'stack',
    _data: [
      {
        carIndexLayer: carIndexStack._data[0].carIndexLayer as string,
        carGeneralLayer: carGeneralStack._data[0].carGeneralLayer as string,
        carTechnicalLayer: carTechnicalStack._data[0]
          .carTechnicalLayer as string,
        carColorLayer: carColorStack._data[0].carColorLayer as string,
        car2WheelLayer: car2WheelStack._data[0].car2WheelLayer as string,
        _hash: '',
      },
    ],
  });

  const result: Cars = {
    carIndex,
    carGeneral,
    carTechnical,
    carColor,
    carIndexLayer,
    carGeneralLayer,
    carTechnicalLayer,
    carColorLayer,
    carRepository,
    carIndexStack,
    carGeneralStack,
    carTechnicalStack,
    carColorStack,

    wheelIndex,
    wheelManufacturer,
    wheelDimension,
    wheelIndexLayer,
    wheelManufacturerLayer,
    wheelDimensionLayer,
    wheelIndexStack,
    wheelManufacturerStack,
    wheelDimensionStack,
    wheelRepository,

    car2WheelLayer,
    car2WheelStack,
  };

  return result;
};
