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
  - [Ingredients](#ingredients)
  - [SliceIds](#sliceids)
  - [Layer](#layer)
  - [Cake](#cake)
  - [Buffet](#buffet)

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

### Ingredients

`Ingredients` are the fundamental data concept. An `IngredientsTable` contains
key-value pairs assigning values to ingredient names.

```json
{
  "ingredients": {
    "_data": [
      {
        "name": "flour",
        "amountUnit": "g",
        "nutritionalValuesRef": "gZXFSlrl5QAs5hOVsq5sWB"
      }
    ]
  },

  "nutritionalValues": {
    "_data": [
      {
        "energy": 364,
        "fat": 0.98,
        "protein": 10.33,
        "carbohydrates": 76.31,
        "_hash": "gZXFSlrl5QAs5hOVsq5sWB"
      }
    ]
  }
}
```

### SliceIds

For efficient management of large layers, slice IDs are separated from their
ingredients. This allows fetching IDs first and retrieving details later. The
following `SliceIds` define a set of three slice IDs:

```json
{
  "slices": {
    "_data": [
      {
        "add": ["slice0", "slice1"],
        "remove": [],
        "_hash": "wyYfK5E4ArrMKQ_zvi2-EE"
      }
    ]
  }
}
```

Derived `SliceIds` can be created by modifying an existing set:

```json
{
  "slices": {
    "_data": [
      {
        "add": ["slice0", "slice1"],
        "remove": [],
        "_hash": "wyYfK5E4ArrMKQ_zvi2-EE"
      },
      {
        "base": "wyYfK5E4ArrMKQ_zvi2-EE",
        "add": ["slice2"],
        "remove": []
      }
    ]
  }
}
```

### Layer

Cake layers assign ingredients to slices.

```json
{
  "layers": {
    "_data": [
      {
        "ingredientsTable": "recipes",
        "assign": {
          "slice0": "H8KK9vMjOxxQr_G_9XeDM-",
          "slice1": "H8KK9vMjOxxQr_G_9XeDM-"
        },
        "_hash": "rrFBguLFLhXjrDqAxJx1p-"
      }
    ]
  }
}
```

### Cake

A `Cake` consists of layers of slices.
All layers share the same slice structure, i.e. the same slice ids.
Each layer assigns different ingredients to slices.

```json
{
  "cakes": {
    "_data": [
      {
        "sliceIdsTable": "slices",
        "idSet": "wyYfK5E4ArrMKQ_zvi2-EE",
        "layersTable": "layers",
        "layers": {
          "flour": "rrFBguLFLhXjrDqAxJx1p-",
          "_hash": "JSoUx1N6lso-18vkzG63Pm"
        },
        "_hash": "bOlQ1lPpZEYB00F14nGvOP"
      }
    ],
    "_hash": "hsL7dD0mFDqmT2i-1fx_1a"
  }
}
```

### Buffet

A `Buffet` is a heterogeneous collection of different but related items,
such as cakes, layers, or ingredients:

```json
{
  "buffets": {
    "_data": [
      {
        "items": [
          {
            "table": "cakes",
            "ref": "bOlQ1lPpZEYB00F14nGvOP",
            "_hash": "ma47UGAZbu5Ql5yXWFHLAT"
          }
        ],
        "_hash": "jPv5bXjs3XVOLRbQvoWcjw"
      }
    ],
    "_hash": "FYK9ItHMDCe2CnD_TGRs8_"
  }
}
```
