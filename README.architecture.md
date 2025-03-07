# Rljson Architecture

This document describes the architecture of the Rljson file format.

## Table of contents <!-- omit in toc -->

- [What is Rljson?](#what-is-rljson)
- [Principles](#principles)
  - [JSON](#json)
  - [Relational](#relational)
  - [Normalized](#normalized)
  - [Deeply hashed](#deeply-hashed)
  - [Immutable](#immutable)
  - [Comparable](#comparable)
  - [Database oriented](#database-oriented)
  - [Decentralized](#decentralized)
- [Concepts](#concepts)
  - [Tables](#tables)
  - [Rows \& columns](#rows--columns)
  - [Column data types](#column-data-types)
  - [Hashes](#hashes)
  - [Linking tables using refs](#linking-tables-using-refs)
- [Data types](#data-types)
  - [Properties](#properties)
  - [IdSet](#idset)
  - [Collection](#collection)
  - [Cake](#cake)
  - [Buffet](#buffet)

## What is Rljson?

Rljson is a JSON-based exchange format inspired by relational databases,
designed for efficient synchronization of large datasets across networks.

## Principles

### JSON

Rljson uses JSON as base format.

### Relational

Data is organized as normalized tables as relational database do it. Thus
Rljson can be easily imported into existing databases.

### Normalized

Rljson is designed to transmit normalized, redundancy free data that can be
easily joined at the client side.

### Deeply hashed

We add hashes to all data using the package `@rljson/hash`.

### Immutable

Hashes are used as primary keys. Thus data sets are immutable by default.

### Comparable

Hashes allow easy comparison of Rljson data.

### Database oriented

Because Rljson has a database oriented structure, import and export tod
databases is eased.

### Decentralized

The hashes used by Rljson can be created without needing a server.
Thus the format is well prepared for Web 3.0 application.

## Concepts

### Tables

An Rljson file is just a collection of tables. The table name is used as id,
the table data are assigned as dictionaries:

```js
{
  table0: {},
  table1: {},
  table2: {},
}
```

Each table implements the interface `RljsonTable` which defines a `_data`
property, containing the table rows as well a `_type` property describing the
table type.

```js
{
  table0: {
    _type: 'properties',
    _data: [],
  },
}
```

### Rows & columns

The `_data` section in an Rljson file is a list of rows. Each row is a JSON
object, which assigns values to columns. The example below shows a table with
two columns `language` and `greeting` as well two rows for `en` and `de`.

```js
{
  table0: {
    _data: [
      {
        language: 'en',
        greeting: 'Hello',

      },
      {
        language: 'de',
        greeting: 'Hallo',
      }
    ],
  }
}
```

### Column data types

Columns can have each of the Rljson data types, i.e.
`string | number | boolean | null | Json | JsonArray`.

### Hashes

Rljson uses hashes to identify and reference data.

Using `@rljson/hash`'s
`hash in place` method `hip`, hashes are deeply added to Rljson data:

```js
const jsonWithHashes = hip({
  a: {
    _data: [{ a: 10 }],
    _type: 'properties',
  },
});
```

will result in

```js
{
  _hash: 'D1CtRUBswzGVc1o9yHQKEh',
  a: {
    _data: [
      {
        _hash: 'LeFJOCQVgToOfbUuKJQ-GO',
        a: 10,
      },
    ],
    _hash: 'FfCIOVQsrK1g5o5_G-AxP4',
    _type: 'properties',
  },
}
```

### Linking tables using refs

Through the hashes tables can be linked using the `Ref` prefix.

In the example below, table `b` uses `aRef` to link to table `a`.

```js
{
  b: {
    _data: [
      {
        aRef: 'LeFJOCQVgToOfbUuKJQ-GO',
      },
    ],
    _type: 'properties',
  },
}
```

Through this reference standard it is possible to denormalize Json data fully
automated.

## Data types

Rljson offers a number of core data concepts and table types. These concepts
aim to manage and synchronize large data collections.

### Properties

`properties` are the most fundamental data concept.

A `PropertiesTable` describes a set of properties. Each row in the table
assigns property values to property keys.

```js
{
  sizes: {
    _type: 'properties',
    _data: [
      { w: 10, h: 20 },
      { w: 30, h: 40 }
    ]
  }
}
```

### IdSet

To effectively manage large collections it is necessary to separate the item ids
from the actual item properties. Thus it is possible to first fetch the item
ids from a server and later ask for details.

This instance of `IdSet` defines a set of three ids `id0` to `id2`:

```js
// IdSet
{
  add: ['id0', 'id1', 'id2'],
  _hash: 'IDS0',
}
```

Real live collections can contain hundred of thousands of items. To efficiently
update id sets, it is possible to create an id set by modifying an existing one:

```js
// Derived IdSet
{
  base: `IDS0`,
  add: ['id3', 'id4'],
  remove: ['ID0'],
  _hash. 'IDS1',
}
```

The example above creates an id set containing the values `id1` .. `id4`.

### Collection

Rljson implements collections by taking an id set and linking each of the ids
to properties:

```js
// Collection
{
  idSetsTable: 'personIds',
  idSet: 'IDS0',
  properties: 'addresses',
  assign: {
    id0: 'P0HASH',
    id1: 'P1HASH',
    // ...
  _hash: 'C0HASH'
  }
}
```

The `idSetsTable` specifies the table containing the ids of the items of this
collection.

The `idSet` specifies the actual id set of the collection.

`properties` specifies the table containing the properties assigned to the items
of the collection.

By `assign` finally assigns properties to collection items by assigning the
hash of the appropriate row in the properties table to the item id.

Like IdSets, Collections can be created by modifying base collections:

```js
// Derived collection
{
  base: 'C0HASH',
  idSet: 'IDS1',
  assign: {
    ID3: 'P3HASH',
    ID4: 'P4HASH',
  }
}
```

### Cake

![Cake](doc/img/rljson-logo-simple-light-512.jpg.webp)

Rljson supports the `Cake` as native data structure:

- Cakes are collections of layers which again are collections of items (slices)
- All layers of the cake share the same item ids (slice structure)
- Each layer assigns different properties to a given item (slice)

Rljson offers the cake as data structure to facilitate the following operations:

- Reading complete cakes
- Reading one or more cake layers
- Reading complete items (slices) containing all layers
- Reading items partly containing only certain layers

As shown below, a cake is first defined by specifying an table containing the
ids of the items (slices) of the cake.

Second, we need to define where the layers of the cake are defined.

Lastly concrete collections are assigned to each layer:

```js
// Cake
{

  itemIdsTable: 'ingredientIds',
  itemIds: 'IDS1',
  layersTable: 'HASH',
  assign: {
    'base': 'HASH15',
    'cherries': 'HASH16',
    'Creme': 'HASH17',
  }
}
```

### Buffet

The `Buffet` is a collection of different but related items. It can
contain different data types, i.e. cakes, collections, properties.

```js
// Buffet
items: [
  {
    table: 'drinks',
    ref: 'HASH20',
  },
  {
    table: 'cakes',
    ref: 'HASH21',
  },
];
```
