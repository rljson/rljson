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
  "tableA": {
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
    "_data": [{ "tableARef": "LeFJOCQVgToOfbUuKJQ-GO" }]
  }
}
```

This reference structure enables automated denormalization of JSON data.

## Data Types

Rljson provides several core data structures and table types to manage and
synchronize large datasets.

### Components

`Components` are the fundamental data concept. An `ComponentsTable` contains
key-value pairs assigning values to component names.

```json
{
  "ingredients": {
    "_type": "components",
    "_data": [
      {
        "id": "flour",
        "amountUnit": "g",
        "nutritionalValuesRef": "R165gWZn_Pcj_je3AwSsXI",
        "_hash": "A5d-4if1fQpQERfwFsjKqb"
      }
    ],
    "_hash": "t5oZrLJOxAj-5nlE1ZV488"
  },
  "nutritionalValues": {
    "_type": "components",
    "_data": [
      {
        "id": "flour",
        "energy": 364,
        "fat": 0.98,
        "protein": 10.33,
        "carbohydrates": 76.31,
        "_hash": "R165gWZn_Pcj_je3AwSsXI"
      },
      {
        "id": "flour",
        "energy": 364.1,
        "fat": 0.981,
        "protein": 10.331,
        "carbohydrates": 76.311,
        "_hash": "IqeoWJjZQNlr-NVk2QT15B"
      }
    ],
    "_hash": "4tYazUV23SSH0tW9sQznO1"
  },
  "recipeIngredients": {
    "_type": "components",
    "_data": [
      {
        "id": "flour",
        "ingredientsRef": "A5d-4if1fQpQERfwFsjKqb",
        "quantity": 500,
        "_hash": "4coxp7hPCsH7hSnAVeUVZj"
      }
    ],
    "_hash": "nJ4SAM641VlxYxekNiXkKI"
  }
}
```

### SliceIds

For efficient management of large layers, slice IDs are separated from their
components. This allows fetching IDs first and retrieving details later. The
following `SliceIds` define a set of three slice IDs:

```json
{
  "slices": {
    "_type": "sliceIds",
    "_data": [
      {
        "add": ["slice0", "slice1"],
        "remove": [],
        "_hash": "wyYfK5E4ArrMKQ_zvi2-EE"
      }
    ],
    "_hash": "cnGg1WO4AHE2QX2CO2_aQL"
  }
}
```

Derived `SliceIds` can be created by modifying an existing set:

```json
{
  "slices": {
    "_type": "sliceIds",
    "_data": [
      {
        "add": ["slice0", "slice1"],
        "remove": [],
        "_hash": "wyYfK5E4ArrMKQ_zvi2-EE"
      },
      {
        "base": "wyYfK5E4ArrMKQ_zvi2-EE", // Hash of first id set
        "add": ["slice2"],
        "remove": ["slice0"]
      }
    ]
  },

  "ingredientTypes": {
    "_type": "sliceIds",
    "_data": [
      {
        "add": ["flour"],
        "remove": [],
        "_hash": "UNxHIyPK7AACyUsbISW7bp"
      }
    ],
    "_hash": "c1w4IVG4J4JANpcTu8p7Jd"
  }
}
```

### Layer

Layers assign components to slices.

```json
{
  "recipes": {
    "_type": "layers",
    "_data": [
      {
        "id": "tastyCake",
        "componentsTable": "recipeIngredients",
        "sliceIdsTable": "ingredientTypes",
        "sliceIdsTableRow": "UNxHIyPK7AACyUsbISW7bp",
        "add": {
          "flour": "4coxp7hPCsH7hSnAVeUVZj",
          "_hash": "5LxOnZOPBtIqV3PlOC_ulB"
        },
        "_hash": "NOVdgwVKlShXT1FTLaLrqK"
      }
    ],
    "_hash": "FFblMN2aS4hPtJKPTMspXl"
  }
}
```

### Cake

A `Cake` consists of layers of slices.
All layers share the same slice structure, i.e. the same slice ids.
Each layer assigns different components to slices.

```json
{
  "cakes": {
    "_type": "cakes",
    "_data": [
      {
        "id": "cake1",
        "sliceIdsTable": "slices",
        "sliceIdsRow": "wyYfK5E4ArrMKQ_zvi2-EE",
        "layers": {
          "recipeLayers": "PZhgu3fmAtLceImvnW7fTj",
          "_hash": "fudiDz_SXuMQbcqmAd-JOp"
        },
        "_hash": "Mge0ULLEbsemMq1ndUNZ6b"
      }
    ],
    "_hash": "NeM6k972PwtYT8uXM9w27T"
  }
}
```

### Buffet

A `Buffet` is a heterogeneous collection of different but related items,
such as cakes, layers, or components:

```json
{
  "buffets": {
    "_type": "buffets",
    "_data": [
      {
        "id": "salesCounter",
        "items": [
          {
            "table": "cakes",
            "ref": "Mge0ULLEbsemMq1ndUNZ6b",
            "_hash": "VC_7itbevmNKG3Rc4XWyJz"
          }
        ],
        "_hash": "G7ZX04bp0TdBG9fHDR7Sgu"
      }
    ],
    "_hash": "0RyzLpZX1Nkfxej2WgXbEF"
  }
}
```
