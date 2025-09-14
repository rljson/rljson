<!--
@license
Copyright (c) 2025 Rljson

Use of this source code is governed by terms that can be
found in the LICENSE file in the root of this package.
-->

# Rljson Architecture

This document describes the architecture of the Rljson format.

## Table of Contents <!-- omit in toc -->

- [What is Rljson?](#what-is-rljson)
- [Principles](#principles)
  - [JSON](#json)
  - [Relational](#relational)
  - [Normalized](#normalized)
  - [Deeply Hashed](#deeply-hashed)
  - [Immutable](#immutable)
  - [Comparable](#comparable)
  - [Database-Oriented](#database-oriented)
  - [Decentralized](#decentralized)
- [Concepts](#concepts)
  - [Tables](#tables)
  - [Rows \& Columns](#rows--columns)
  - [Column Data Types](#column-data-types)
  - [Hashes](#hashes)
  - [Linking Tables Using References](#linking-tables-using-references)
- [Data Types](#data-types)
  - [Components](#components)
  - [Layer](#layer)
  - [Stack](#stack)
  - [Repository](#repository)
  - [Relation](#relation)
  - [Cluster](#cluster)

## What is Rljson?

Rljson is a JSON-based exchange format inspired by relational databases,
designed for efficient synchronization of large datasets across networks.

## Principles

### JSON

Rljson uses JSON as its base format.

### Relational

Data is organized into normalized tables, similar to relational databases. This
allows Rljson data to be easily imported into existing database systems.

### Normalized

Rljson is designed to transmit normalized, redundancy-free data that can be
efficiently joined on the client side.

### Deeply Hashed

Hashes are added to all data using the `@rljson/hash` package.

### Immutable

Hashes serve as primary keys, making datasets immutable by default.

### Comparable

Hashes enable easy comparison of Rljson data.

### Database-Oriented

Since Rljson follows a database-oriented structure, importing and exporting data
to and from databases is streamlined.

### Decentralized

Rljson hashes can be created without requiring a server, making it well-suited
for Web 3.0 applications.

## Concepts

### Tables

An Rljson file consists of a collection of tables. The table name is the key,
and the table data is structured as dictionaries:

```json
{
  "table0": {},
  "table1": {},
  "table2": {}
}
```

Each table follows the `RljsonTable` interface, which defines a `_data` property
containing the table rows.

```json
{
  "table0": {
    "_data": []
  }
}
```

### Rows & Columns

The `_data` section in an Rljson file contains a list of rows. Each row is a
JSON object that maps column names to values. The example below shows a table
with two columns, `language` and `greeting`, and two rows for English (`en`) and
German (`de`):

```json
{
  "table0": {
    "_data": [
      { "language": "en", "greeting": "Hello" },
      { "language": "de", "greeting": "Hallo" }
    ]
  }
}
```

### Column Data Types

Columns can contain any of the Rljson-supported data types: `string | number |
boolean | null | Json | JsonArray`.

### Hashes

Rljson uses hashes to identify and reference data. Using the `hash-in-place`
(`hip`) method from `@rljson/hash`, hashes are deeply embedded into Rljson data:

```js
const jsonWithHashes = hip({
  a: {
    _data: [{ a: 10 }],
  },
});
```

This results in:

```json
{
  "_hash": "D1CtRUBswzGVc1o9yHQKEh",
  "a": {
    "_data": [
      {
        "_hash": "LeFJOCQVgToOfbUuKJQ-GO",
        "a": 10
      }
    ],
    "_hash": "FfCIOVQsrK1g5o5_G-AxP4"
  }
}
```

### Linking Tables Using References

Hashes allow tables to be linked using the `Ref` prefix. In the example below,
table `b` references table `a` using `aRef`:

```json
{
  "b": {
    "_data": [{ "aRef": "LeFJOCQVgToOfbUuKJQ-GO" }]
  }
}
```

This reference structure enables automated denormalization of JSON data.

## Data Types

Rljson provides several core data structures and table types to manage and
synchronize large datasets.

### Components

`Components` are the fundamental data concept. Components contains
key-value pairs of simple and similar data.

#### Data Components

In this example we hold general properties of real world cars in corresponding
Components.

```json
"carGeneral": {
    "_data": [
      {
        "manufacturer": "Volkswagen",
        "type": "Golf",
        "doors": 5,
        "_hash": "GRZx0nnsDNXu7A_XtJq0ew"
      },
      {
        "manufacturer": "BMW",
        "type": "X3",
        "doors": 5,
        "_hash": "JWRWlfLU0hJTf1FqpU-Ftp"
      }
    ],
    "_hash": "bIqYR8lTDIlZjJJyMuWCHy"
  },
```

#### Index Components

A special type of Component is `Index Components`. Index Components only hold
indices of real world objects. These Index Components, as well as any other
Components, can contain single key-value pairs as well as several key-value
pairs. In this example below `vin` (Vehicle Identity Number) serves as an index
for this real world example of cars.

```json
"carIndex": {
    "_data": [
      {
        "vin": "2AFB34",
        "_hash": "Odlff4D-HNegyejRQ-5OhS"
      },
      {
        "vin": "C235F3",
        "_hash": "DizwEA1fNsBkMIUXYdL5KK"
      }
    ],
    "_hash": "pa0EVpvRWGHMDz2VrFwtZr"
  }
```

### Layer

`Layers` link `Index Components` to `Data Components`. Think of it like
associational tables in relational databases models, often used for M:N
relations. But other than in the databases, it does not contain any data,
it contains only references to the linking components.

#### Data Layer

In this example we link the car's VINs to their general properties.

```json
"carGeneralLayer": {
    "_data": [
      {
        "carIndexRef": "Odlff4D-HNegyejRQ-5OhS",
        "carGeneralRef": "GRZx0nnsDNXu7A_XtJq0ew",
        "_hash": "66L1zLPAXQGCr1i5McLwJ7"
      },
      {
        "carIndexRef": "DizwEA1fNsBkMIUXYdL5KK",
        "carGeneralRef": "JWRWlfLU0hJTf1FqpU-Ftp",
        "_hash": "Pcd7kTmoctJgm1ql9OB8EG"
      }
    ],
    "_hash": "47YcDGPtTxiNz-gsGBU120"
  }
```

#### Index Layer

As well as there is the concept of the Index Components, there is the
`Index Layer`. It just holds the current set of indices references. We hold
separate index layers, for being able to revision, update and expand them
independently from the corresponding data layers.

```json
  "carIndexLayer": {
    "_data": [
      {
        "carIndexRef": "Odlff4D-HNegyejRQ-5OhS",
        "_hash": "WptSZpANOVfnPwm8iQn_9e"
      },
      {
        "carIndexRef": "DizwEA1fNsBkMIUXYdL5KK",
        "_hash": "rTMqW446E83SC_hyzYN8bN"
      }
    ],
    "_hash": "fWK68a5DeJgYSQcOmsMFJ_"
  }
```

### Stack

A `Stack` contains a list of Layers. We use it for managing revisions of
layer definitions. You can think of it like some kind of a repository where all
changes in corresponding Index-Data relations lead to new versions of layer
definitions.

```json
  "carGeneralStack": {
    "_type": "stack",
    "_data": [
      {
        "carGeneralLayer": "47YcDGPtTxiNz-gsGBU120",
        "_hash": "hwhEVLgx7DpJe1p1rd5Zet"
      }
    ],
    "_hash": "Yv9H7EeP7kVRo1q5_PkFnS"
  }
```

### Repository

A `Repository` contains the Index Layer as well as any corresponding Data Layer
necessary or chosen for composing the real world object representations we need.

```json
  "carRepository": {
    "_data": [
      {
        "carIndexLayer": "fWK68a5DeJgYSQcOmsMFJ_",
        "carGeneralLayer": "47YcDGPtTxiNz-gsGBU120",
        "carTechnicalLayer": "ttRVgGBZSWytTv7tq2iQrX",
        "carColorLayer": "kvs4H_PkIU2JnvB6e8cDdu",
        "car2WheelLayer": "Bl5fBYbp0VOVCclxBWt6li",
        "_hash": "bn6d-EyurHjvDU3Y-zppBm"
      }
    ],
    "_hash": "8AWADuxs70tK3LF4LDSacl"
  }
```

### Relation

A `Relation` is a Layer which links two Indices of two Index Layers.

In this example we have two Indices. First the indices of Cars. As you know,
the Index of one real world Object consists of its Components and a corresponding
Layer.

So here we have the Car's Index Components.

```json
  "carIndex": {
    "_data": [
      {
        "vin": "2AFB34",
        "_hash": "Odlff4D-HNegyejRQ-5OhS"
      },
      {
        "vin": "C235F3",
        "_hash": "DizwEA1fNsBkMIUXYdL5KK"
      }
    ],
    "_hash": "pa0EVpvRWGHMDz2VrFwtZr"
  }
```

And here we have the corresponding Layer.

```json
  "carIndexLayer": {
    "_data": [
      {
        "carIndexRef": "Odlff4D-HNegyejRQ-5OhS",
        "_hash": "WptSZpANOVfnPwm8iQn_9e"
      },
      {
        "carIndexRef": "DizwEA1fNsBkMIUXYdL5KK",
        "_hash": "rTMqW446E83SC_hyzYN8bN"
      }
    ],
    "_hash": "fWK68a5DeJgYSQcOmsMFJ_"
  }
```

And now we will take a look to Wheels. Here we have the Index Components.

```json
  "wheelIndex": {
    "_data": [
      {
        "sn": "CDF744",
        "_hash": "ggdByNSc5Lnq69GBh1PICs"
      },
      {
        "sn": "01B223",
        "_hash": "sSTay_Oc_o3X7PHtZ5UftI"
      }
    ],
    "_hash": "D_SHAVfcxBRGL57O4ftamc"
  }
```

And here we have the corresponding Index Layer.

```json
  "wheelIndexLayer": {
    "_data": [
      {
        "wheelIndexRef": "ggdByNSc5Lnq69GBh1PICs",
        "_hash": "vhlaHQha-6rmCIv1vhMJ9u"
      },
      {
        "wheelIndexRef": "sSTay_Oc_o3X7PHtZ5UftI",
        "_hash": "hS29Gw7FsklkY1Ulb6KABj"
      }
    ],
    "_hash": "N2MRMyMZG3vGYeLLfeDLy6"
  }
```

And now we introduce the Relation Layer Linking them both together.
As you may notice, both of the cars have four wheels of different types each.

```json
"car2WheelLayer": {
    "_data": [
      {
        "carIndexRef": "Odlff4D-HNegyejRQ-5OhS",
        "wheelIndexRef": "ggdByNSc5Lnq69GBh1PICs",
        "_hash": "DKJhnfvqrGtAscH0NM_kYk"
      },
      {
        "carIndexRef": "DizwEA1fNsBkMIUXYdL5KK",
        "wheelIndexRef": "sSTay_Oc_o3X7PHtZ5UftI",
        "_hash": "cCnZXeSiQs0g6SEH_gykb6"
      }
    ],
    "_hash": "Bl5fBYbp0VOVCclxBWt6li"
  }
```

### Cluster

A `Cluster` is a helping structure, hence it is just a list of table instances.
It defines the whole set of instances ensuring that the Quadruple of Components,
Layers, Stacks and Repositories is present for any given real world object representation we provide.

This is the minimum Cluster configuration you need for Cars.

```typescript
  const cluster = Cluster<'Car'> = {
    carIndex,
    carIndexLayer,
    carIndexStack,
    carRepository,
  };
```
