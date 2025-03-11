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
containing the table rows and a `_type` property describing the table type:

```json
{
  "table0": {
    "_type": "properties",
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
    _type: 'properties',
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
    "_hash": "FfCIOVQsrK1g5o5_G-AxP4",
    "_type": "properties"
  }
}
```

### Linking Tables Using References

Hashes allow tables to be linked using the `Ref` prefix. In the example below,
table `b` references table `a` using `aRef`:

```json
{
  "b": {
    "_data": [{ "aRef": "LeFJOCQVgToOfbUuKJQ-GO" }],
    "_type": "properties"
  }
}
```

This reference structure enables automated denormalization of JSON data.

## Data Types

Rljson provides several core data structures and table types to manage and
synchronize large datasets.

### Properties

`Properties` are the fundamental data concept. A `PropertiesTable` contains
key-value pairs representing property assignments:

```json
{
  "sizes": {
    "_type": "properties",
    "_data": [
      { "w": 10, "h": 20 },
      { "w": 30, "h": 40 }
    ]
  }
}
```

### IdSet

For efficient management of large collections, item IDs are separated from their
properties. This allows fetching IDs first and retrieving details later. The
following `IdSet` defines a set of three IDs:

```json
{
  "add": ["id0", "id1", "id2"],
  "_hash": "IDS0"
}
```

Derived `IdSets` can be created by modifying an existing set:

```json
{
  "base": "IDS0",
  "add": ["id3", "id4"],
  "remove": ["id0"],
  "_hash": "IDS1"
}
```

### Collection

A `Collection` consists of an `IdSet` and a mapping that links item IDs to their
properties:

```json
{
  "idSetsTable": "personIds",
  "idSet": "IDS0",
  "properties": "addresses",
  "assign": {
    "id0": "P0HASH",
    "id1": "P1HASH"
  },
  "_hash": "C0HASH"
}
```

### Cake

Rljson supports `Cake` as a native data structure:

- A `Cake` consists of layers, each representing a collection of items (slices).
- All layers share the same item IDs (slice structure).
- Each layer assigns different properties to the same items.

```json
{
  "itemIdsTable": "ingredientIds",
  "itemIds": "IDS1",
  "layersTable": "HASH",
  "assign": {
    "base": "HASH15",
    "cherries": "HASH16",
    "creme": "HASH17"
  }
}
```

### Buffet

A `Buffet` is a heterogeneous collection of different but related items, such as
cakes, collections, or properties:

```json
{
  "items": [
    { "table": "drinks", "ref": "HASH20" },
    { "table": "cakes", "ref": "HASH21" }
  ]
}
```
