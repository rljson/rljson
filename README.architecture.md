# Architecture

This document describes the architecture of the Rljson file format.

## Table of contents

- [Table of contents](#table-of-contents)
- [Principles](#principles)
  - [JSON](#json)
  - [Relational](#relational)
  - [Deeply Hashed](#deeply-hashed)
  - [Immutability](#immutability)
  - [Easy comparison](#easy-comparison)
  - [Database compatibility](#database-compatibility)
  - [Decentralized](#decentralized)
- [Tables](#tables)

## Principles

### JSON

Rljson uses JSON as base format.

### Relational

Data is organized as normalized tables as relational database do it.

### Deeply Hashed

We add hashes to all data using the package `@rljson/hash`.

### Immutability

Hashes are used as primary keys. Thus data sets are immutable by default.

### Easy comparison

Hashes allow easy comparison of Rljson data.

### Database compatibility

Because Rljson has a database oriented structure, import and export tod
databases is eased.

### Decentralized

The hashes used by Rljson can be created without needing a server.
Thus the format is well prepared for Web 3.0 application.

## Tables

The top level structure of Rljson is a dictionary of tables:

```js
{
  table0: {},
  table1: {},
  table2: {},
}
```

The key is the table name. The value are the table data.

The table name must be `lower camelcase` containing only numbers and letters and
underscore.
