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
  - [Trees](#trees)
- [Schema System](#schema-system)
  - [TableCfg](#tablecfg)
  - [Validation](#validation)
- [Edit Protocol](#edit-protocol)
  - [Insert](#insert)
  - [InsertHistory](#inserthistory)
  - [Edits \& MultiEdits](#edits--multiedits)
  - [EditHistory](#edithistory)
- [Routing](#routing)
- [Sync Protocol](#sync-protocol)
  - [ConnectorPayload](#connectorpayload)
  - [AckPayload](#ackpayload)
  - [GapFill](#gapfill)
  - [SyncConfig](#syncconfig)
  - [SyncEventNames](#synceventnames)
  - [ClientId](#clientid)
- [Package Structure](#package-structure)

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

### Trees

Trees represent hierarchical, content-addressed data structures. Each
`Tree` node has an optional `id` (unique among siblings), a boolean `isParent`
flag, a `meta` field (`Json | null`) for arbitrary metadata, and a `children`
array (`Array<TreeRef> | null`) containing hashes of child nodes.

Trees are stored as **separate rows with parent-child relationships**, not as
a single denormalized structure. Parent nodes reference children via hash:

```json
{
  "projectTree": {
    "_type": "trees",
    "_data": [
      {
        "id": "src",
        "isParent": true,
        "meta": null,
        "children": ["def456", "ghi789"],
        "_hash": "abc123"
      },
      {
        "id": "index.ts",
        "isParent": false,
        "meta": { "type": "file" },
        "children": null,
        "_hash": "def456"
      },
      {
        "id": "utils.ts",
        "isParent": false,
        "meta": { "type": "file" },
        "children": null,
        "_hash": "ghi789"
      }
    ]
  }
}
```

The helper function `treeFromObject()` converts a plain JavaScript object into
an array of hashed `Tree` entries.

## Schema System

### TableCfg

Every table in RLJSON can have an associated `TableCfg` that describes its
schema — the table key, content type, column definitions, and metadata flags:

```json
{
  "tableCfgs": {
    "_type": "tableCfgs",
    "_data": [
      {
        "key": "ingredients",
        "type": "components",
        "columns": [
          { "key": "_hash", "type": "string", "titleLong": "Hash", "titleShort": "Hash" },
          { "key": "name", "type": "string", "titleLong": "Name", "titleShort": "Name" },
          { "key": "amount", "type": "number", "titleLong": "Amount", "titleShort": "Amt" }
        ],
        "isHead": false,
        "isRoot": false,
        "isShared": false
      }
    ]
  }
}
```

Supported column types: `string`, `number`, `boolean`, `json`, `jsonArray`.

Columns can reference other tables via a `ref` property, enabling foreign-key
relationships:

```json
{
  "key": "ingredientsRef",
  "type": "string",
  "titleLong": "Ingredient",
  "titleShort": "Ing",
  "ref": { "tableKey": "ingredients", "type": "components" }
}
```

`createInsertHistoryTableCfg()` auto-generates the schema for InsertHistory
tables from any base `TableCfg`.

### Validation

The `Validate` class performs comprehensive structural validation of RLJSON
objects:

- **Naming**: Table keys, column keys must be valid identifiers
- **Hashes**: All `_hash` values must match the actual content
- **References**: All `*Ref` columns must point to existing rows
- **Trees**: No cycles, all child hashes must resolve, correct node types
- **Layers**: Component and SliceId tables must exist
- **Cakes**: Layer tables must exist and share the same slice structure
- **Buffets**: Referenced items must exist in their declared tables

The `BaseValidator` provides an extensible validator framework — multiple
validators can run in parallel and merge their results.

## Edit Protocol

### Insert

An `Insert` describes a data modification operation:

```json
{
  "route": "/ingredients",
  "command": "add",
  "value": { "name": "butter", "amountUnit": "g" }
}
```

The `InsertValidator` class validates insert operations — checking that the
route is valid, the command is supported, and the value is present.

### InsertHistory

`InsertHistory` tracks every insert operation as an append-only log.
Each `InsertHistoryRow` contains:

| Field             | Type                    | Description                                     |
| ----------------- | ----------------------- | ----------------------------------------------- |
| `timeId`          | `InsertHistoryTimeId`   | Unique row identifier (timestamp + random)      |
| `<table>Ref`      | `string`                | Hash of the data that was inserted              |
| `route`           | `RouteRef`              | Route that was modified                         |
| `origin`          | `ClientId \| Ref`       | Who performed the insert (optional)             |
| `previous`        | `InsertHistoryTimeId[]` | Causal predecessors — supports merge (optional) |
| `clientTimestamp` | `number`                | Client-side wall-clock timestamp (optional)     |

The `previous` field enables **causal ordering**: each insert can declare
which prior inserts it depends on. When multiple clients insert concurrently,
the result is a DAG (directed acyclic graph) rather than a linear chain,
supporting merge semantics.

### Edits & MultiEdits

- **Edit**: A named action with a type and data payload
- **MultiEdit**: Chains edits into a linked list via `previousRef`, enabling
  undo/redo and conflict resolution
- **EditHistory**: An append-only log of multi-edits with timestamps

### EditHistory

`EditHistory` links multi-edits together with `timeId` and `dataRef`:

```json
{
  "editHistory": {
    "_type": "editHistory",
    "_data": [
      {
        "timeId": "1700000000000:AbCd",
        "multiEditRef": "xyz...",
        "dataRef": "abc...",
        "previous": ["1699999999999:ZzZz"]
      }
    ]
  }
}
```

## Routing

The `Route` class is the addressing system for all data paths in RLJSON.
A route identifies a specific location in the data hierarchy.

**Flat string format**: `/tableKey@ref/childTableKey`

Components of a route segment:

| Part          | Syntax          | Example            |
| ------------- | --------------- | ------------------ |
| Table key     | plain name      | `ingredients`      |
| Ref           | `@hash`         | `@A5d...`          |
| InsertHistory | `@timestamp:id` | `@1700000000:AbCd` |
| Slice IDs     | `(id1,id2)`     | `(flour,sugar)`    |

```javascript
// Parsing
const route = Route.fromFlat('/ingredients@A5d.../nutritionalValues');

// Navigation
route.top;         // { tableKey: 'ingredients', ingredientsRef: 'A5d...' }
route.root;        // last segment: { tableKey: 'nutritionalValues' }
route.segment(0);  // { tableKey: 'ingredients', ingredientsRef: 'A5d...' }
route.segment(1);  // { tableKey: 'nutritionalValues' }
route.flat;        // '/ingredients@A5d.../nutritionalValues'
route.isRoot;      // false (more than one segment)

// Navigating up/down
route.upper();     // Route with only '/ingredients@A5d...'
route.deeper();    // Route with only '/nutritionalValues'
```

Routes are used by the Connector, Db, and Server to identify which data
a message refers to.

## Sync Protocol

The `sync/` module defines wire-protocol types for the messaging hardening
system. These types are consumed by `@rljson/db` (Connector) and
`@rljson/server` (Server relay).

All fields beyond `o` (origin) and `r` (ref) are optional — existing code
that sends `{ o, r }` continues to work unchanged. New features activate
only when the corresponding `SyncConfig` flags are set.

### ConnectorPayload

The payload transmitted on the wire between Connector and Server:

| Field   | Type                    | Concept           | Purpose                               |
| ------- | ----------------------- | ----------------- | ------------------------------------- |
| `r`     | `string`                | existing          | The ref being announced               |
| `o`     | `string`                | existing          | Ephemeral origin for self-echo filter |
| `c`     | `ClientId`              | Client identity   | Stable client id across reconnections |
| `t`     | `number`                | Client identity   | Client-side wall-clock timestamp (ms) |
| `seq`   | `number`                | Predecessor chain | Monotonic counter per (client, route) |
| `p`     | `InsertHistoryTimeId[]` | Predecessor chain | Causal predecessor timeIds            |
| `cksum` | `string`                | Acknowledgment    | Content checksum for ACK verification |

### AckPayload

Server → Client acknowledgment that all (or some) receivers successfully
received and processed a ref:

| Field          | Type      | Description                         |
| -------------- | --------- | ----------------------------------- |
| `r`            | `string`  | The ref being acknowledged          |
| `ok`           | `boolean` | All clients confirmed?              |
| `receivedBy`   | `number`  | Count of confirming clients         |
| `totalClients` | `number`  | Total receiver clients at broadcast |

### GapFill

When a Connector detects a gap in sequence numbers from a peer, it requests
the missing refs from the server:

- **`GapFillRequest`**: Client → Server — route + `afterSeq` (+ optional
  `afterTimeId`)
- **`GapFillResponse`**: Server → Client — ordered list of missing
  `ConnectorPayload` entries

### SyncConfig

Feature flags for hardened sync behavior:

| Flag                    | Concept           | Effect when enabled                   |
| ----------------------- | ----------------- | ------------------------------------- |
| `causalOrdering`        | Predecessor chain | Attach `seq` + `p` to payloads;       |
|                         |                   | detect gaps; request gap-fill         |
| `requireAck`            | Acknowledgment    | Wait for server ACK after send        |
| `ackTimeoutMs`          | Acknowledgment    | Timeout before treating ACK as failed |
| `includeClientIdentity` | Client identity   | Attach `c` + `t` to payloads          |

### SyncEventNames

Helper to generate typed socket event names from a route:

| Event Name             | Direction       | Purpose                  |
| ---------------------- | --------------- | ------------------------ |
| `${route}`             | bidirectional   | Ref broadcast (existing) |
| `${route}:ack`         | server → client | Delivery acknowledgment  |
| `${route}:ack:client`  | client → server | Individual client ACK    |
| `${route}:gapfill:req` | client → server | Request missing refs     |
| `${route}:gapfill:res` | server → client | Supply missing refs      |

### ClientId

A stable client identity that persists across reconnections. Unlike the
ephemeral Connector `origin` (which changes on every instantiation), a
`ClientId` should be generated once and stored for reuse.

Format: `"client_"` + 12-character nanoid (e.g. `"client_V1StGXR8_Z5j"`).

## Package Structure

```
src/
├── index.ts                    # Re-exports everything
├── rljson.ts                   # Core Rljson type, RljsonTable, iterators
├── rljson-indexed.ts           # Hash-indexed Rljson for O(1) lookups
├── typedefs.ts                 # Base types: Ref, SliceId, TableKey, ContentType
├── example.ts                  # Example class with valid/invalid data
│
├── content/                    # Data model types
│   ├── buffet.ts               # Buffet, BuffetsTable
│   ├── cake.ts                 # Cake, CakesTable
│   ├── components.ts           # ComponentsTable
│   ├── layer.ts                # Layer, LayersTable
│   ├── revision.ts             # Revision, RevisionsTable
│   ├── slice-ids.ts            # SliceIds, SliceIdsTable
│   ├── table-cfg.ts            # TableCfg, ColumnCfg, validation
│   └── tree.ts                 # TreeNode, TreesTable, treeFromObject
│
├── edit/                       # Edit protocol
│   ├── edit.ts                 # Edit, EditsTable
│   ├── edit-history.ts         # EditHistory, EditHistoryTable
│   └── multi-edit.ts           # MultiEdit, MultiEditsTable
│
├── insert/                     # Insert operations
│   ├── insert.ts               # Insert type, InsertCommand
│   └── insert-validator.ts     # InsertValidator, validateInsert
│
├── insertHistory/              # Insert tracking
│   └── insertHistory.ts        # InsertHistoryRow, InsertHistoryTable
│
├── route/                      # Data path addressing
│   └── route.ts                # Route class, RouteSegment, RouteRef
│
├── sync/                       # Sync protocol types
│   ├── ack-payload.ts          # AckPayload
│   ├── client-id.ts            # ClientId, clientId(), isClientId()
│   ├── connector-payload.ts    # ConnectorPayload
│   ├── gap-fill.ts             # GapFillRequest, GapFillResponse
│   ├── sync-config.ts          # SyncConfig
│   └── sync-events.ts          # SyncEventNames, syncEvents()
│
├── tools/                      # Utilities
│   ├── object-depth.ts         # objectDepth() (internal)
│   ├── remove-duplicates.ts    # removeDuplicates()
│   └── time-id.ts              # TimeId, timeId(), isTimeId()
│
├── validate/                   # Validation framework
│   ├── base-validator.ts       # BaseValidator, ValidatorInterface
│   └── validate.ts             # Validate class (full structural validator)
│
└── example/                    # Example data
    └── bakery-example.ts       # bakeryExample() — canonical test dataset
```
