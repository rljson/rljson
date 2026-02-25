<!--
@license
Copyright (c) 2025 Rljson

Use of this source code is governed by terms that can be
found in the LICENSE file in the root of this package.
-->

# @rljson/rljson

Core types, validation, and sync protocol for the RLJSON data format.

## Table of Contents <!-- omit in toc -->

- [Installation](#installation)
- [Overview](#overview)
- [Data Model Types](#data-model-types)
  - [Components](#components)
  - [SliceIds](#sliceids)
  - [Layers](#layers)
  - [Cakes](#cakes)
  - [Buffets](#buffets)
  - [Trees](#trees)
- [Schema System](#schema-system)
  - [TableCfg](#tablecfg)
  - [Validation](#validation)
- [Edit Protocol](#edit-protocol)
  - [Insert](#insert)
  - [InsertHistory](#inserthistory)
  - [Edits, MultiEdits, EditHistory](#edits-multiedits-edithistory)
- [Routing](#routing)
- [Sync Protocol](#sync-protocol)
  - [ConnectorPayload](#connectorpayload)
  - [AckPayload](#ackpayload)
  - [GapFill](#gapfill)
  - [SyncConfig](#syncconfig)
  - [SyncEventNames](#synceventnames)
  - [ClientId](#clientid)
- [Utilities](#utilities)
  - [TimeId](#timeid)
  - [RemoveDuplicates](#removeduplicates)
- [Ecosystem](#ecosystem)

## Installation

```bash
pnpm add @rljson/rljson
```

## Overview

`@rljson/rljson` is the foundational types package for the RLJSON ecosystem. It
defines the data format specification — a JSON-based, relational, normalized,
deeply-hashed exchange format designed for efficient synchronization of large
datasets.

```typescript
import {
  Rljson,
  Route,
  ConnectorPayload,
  SyncConfig,
  timeId,
} from '@rljson/rljson';
```

## Data Model Types

### Components

The fundamental data unit. A `ComponentsTable` contains key-value rows with an
auto-generated `_hash` serving as the primary key.

```typescript
import { ComponentsTable } from '@rljson/rljson';

const ingredients: ComponentsTable = {
  _type: 'components',
  _data: [
    { id: 'flour', amountUnit: 'g', _hash: 'A5d...' },
    { id: 'sugar', amountUnit: 'g', _hash: 'B7f...' },
  ],
  _hash: 't5o...',
};
```

### SliceIds

For efficient management of large layers, slice IDs are separated from their
data. This allows fetching IDs first and retrieving details on demand.

```typescript
import { SliceIds, SliceIdsTable } from '@rljson/rljson';

const slices: SliceIdsTable = {
  _type: 'sliceIds',
  _data: [
    { add: ['slice0', 'slice1'], remove: [], _hash: 'wyY...' },
  ],
  _hash: 'cnG...',
};
```

Derived sets can modify an existing set using `base`, `add`, and `remove`.

### Layers

Layers assign components to slices.

```typescript
import { Layer, LayersTable } from '@rljson/rljson';
```

A layer references a `componentsTable` and a `sliceIdsTable`, then maps each
slice ID to a component hash in its `add` block.

### Cakes

A `Cake` is a stack of layers sharing the same slice IDs. Each layer assigns
different component values to the shared slices.

```typescript
import { Cake, CakesTable } from '@rljson/rljson';
```

### Buffets

A `Buffet` is a heterogeneous collection of related items — references to rows
in any other table (cakes, layers, components, etc.).

```typescript
import { Buffet, BuffetsTable } from '@rljson/rljson';
```

### Trees

Hierarchical tree structures with content-addressed nodes. Each `Tree` has an
optional `id` (unique among siblings), an `isParent` flag, a `meta` field
(`Json | null`), and a `children` array of child hashes (or `null` for leaves).

```typescript
import { Tree, TreesTable, treeFromObject } from '@rljson/rljson';

// Convert a plain object into hashed tree nodes
const nodes = treeFromObject({ src: { 'index.ts': 'console.log("hello")' } });
```

## Schema System

### TableCfg

`TableCfg` defines the schema for any table — its key, content type, column
definitions, and metadata flags.

```typescript
import { TableCfg, ColumnCfg, throwOnInvalidTableCfg } from '@rljson/rljson';

const cfg: TableCfg = {
  key: 'ingredients',
  type: 'components',
  columns: [
    { key: '_hash', type: 'string', titleLong: 'Hash', titleShort: 'Hash' },
    { key: 'name', type: 'string', titleLong: 'Name', titleShort: 'Name' },
  ],
  isHead: false,
  isRoot: false,
  isShared: false,
};

throwOnInvalidTableCfg(cfg); // throws on invalid config
```

Column types: `string`, `number`, `boolean`, `json`, `jsonArray`.

Columns can reference other tables via the `ref` property on `ColumnCfgWithRef`.

### Validation

The `Validate` class coordinates multiple validators to check entire RLJSON
objects — naming conventions, hash integrity, reference validity, tree
structure, layer/cake/buffet consistency.

```typescript
import { Validate, BaseValidator } from '@rljson/rljson';

const validate = new Validate();
validate.addValidator(new BaseValidator());
const errors = await validate.run(myRljsonData);
// errors: { base: { hasErrors: false } }
```

The `BaseValidator` checks all core rules. Custom validators can be added by
implementing the `Validator` interface.

## Edit Protocol

### Insert

An `Insert` describes a data modification operation with a command (`add`),
a value, a route, and an optional origin.

```typescript
import { Insert, validateInsert } from '@rljson/rljson';

const insert: Insert<any> = {
  route: '/ingredients',
  command: 'add',
  value: { name: 'butter', amountUnit: 'g' },
};

const errors = validateInsert(insert);
```

### InsertHistory

`InsertHistoryRow` tracks each insert operation with a unique `timeId`, the
`route` that was modified, and optional `origin`, `previous` (causal
predecessors), and `clientTimestamp`.

```typescript
import { InsertHistoryRow, InsertHistoryTimeId } from '@rljson/rljson';

const row: InsertHistoryRow<'ingredients'> = {
  ingredientsRef: 'A5d...',
  timeId: '1700000000000:AbCd',
  route: '/ingredients',
  origin: 'client_ExAmPlE12345',
  previous: ['1699999999999:ZzZz'],
  clientTimestamp: 1700000000000,
};
```

### Edits, MultiEdits, EditHistory

- **Edit**: A named action with a type and data payload (`EditAction`)
- **MultiEdit**: Chains edits into a linked list via `previous` ref
- **EditHistory**: Tracks the full chain of multi-edits with `timeId` timestamps

## Routing

The `Route` class parses and builds hierarchical data paths used throughout
the RLJSON ecosystem.

```typescript
import { Route } from '@rljson/rljson';

// Parse a flat route string
const route = Route.fromFlat('/ingredients@A5d.../nutritionalValues');

// Navigate route segments
route.top;        // first segment: { tableKey: 'ingredients', ... }
route.root;       // last segment: { tableKey: 'nutritionalValues' }
route.segment(0); // segment by index
route.flat;       // serialized string
```

Routes support references (`@hash`), slice IDs (`(id1,id2)`), and
InsertHistory refs (`@timestamp:unique`).

## Sync Protocol

The `sync/` module defines wire-protocol types for the messaging hardening
system used by `@rljson/db` (Connector) and `@rljson/server`.

### ConnectorPayload

The payload transmitted between Connector and Server on the wire.

```typescript
import { ConnectorPayload } from '@rljson/rljson';

// Minimal (backward-compatible)
const legacy: ConnectorPayload = { o: 'origin', r: 'ref' };

// Fully enriched
const enriched: ConnectorPayload = {
  o: 'origin',             // ephemeral origin (self-echo filter)
  r: 'ref',                // the ref being announced
  c: 'client_abc123...',   // stable client identity
  t: Date.now(),           // client-side timestamp
  seq: 42,                 // monotonic sequence number
  p: ['prev-timeId'],      // causal predecessors
  cksum: 'sha256:...',     // content checksum
};
```

### AckPayload

Server → Client acknowledgment that all (or some) receivers got a ref.

```typescript
import { AckPayload } from '@rljson/rljson';

const ack: AckPayload = {
  r: 'ref',
  ok: true,
  receivedBy: 3,
  totalClients: 3,
};
```

### GapFill

Types for requesting and receiving missing refs when a sequence gap is
detected.

```typescript
import { GapFillRequest, GapFillResponse } from '@rljson/rljson';

const request: GapFillRequest = {
  route: '/sharedTree',
  afterSeq: 5,
};
```

### SyncConfig

Feature flags to opt into hardened sync behavior. All flags are optional and
default to off.

```typescript
import { SyncConfig } from '@rljson/rljson';

const config: SyncConfig = {
  causalOrdering: true,        // track predecessors + detect gaps
  requireAck: true,            // wait for server ACK after send
  ackTimeoutMs: 5_000,         // ACK timeout
  includeClientIdentity: true,    // attach clientId + timestamp
  maxDedupSetSize: 10_000,        // max refs per dedup generation (default: 10 000)
  bootstrapHeartbeatMs: 30_000,   // periodic bootstrap heartbeat interval (optional)
};
```

### SyncEventNames

Helper to generate typed, route-specific socket event names.

```typescript
import { syncEvents } from '@rljson/rljson';

const events = syncEvents('/sharedTree');
// events.ref        → '/sharedTree'
// events.ack        → '/sharedTree:ack'
// events.ackClient  → '/sharedTree:ack:client'
// events.gapFillReq → '/sharedTree:gapfill:req'
// events.gapFillRes → '/sharedTree:gapfill:res'
// events.bootstrap  → '/sharedTree:bootstrap'
```

### ClientId

A stable client identity that persists across reconnections (unlike the
ephemeral Connector origin).

```typescript
import { clientId, isClientId } from '@rljson/rljson';

const id = clientId();         // 'client_V1StGXR8_Z5j'
isClientId(id);                // true
isClientId('not-a-client-id'); // false
```

### Conflict Detection Types

Protocol-level types for DAG branch conflict detection. A conflict occurs when the InsertHistory for a table has diverged into multiple branches (multiple "tips" that are not ancestors of each other), indicating concurrent writes from different clients.

Detection only — no resolution: these types signal that a conflict exists. Resolution logic is left to upper layers (application code).

```typescript
import type { Conflict, ConflictCallback, ConflictType } from '@rljson/rljson';

// ConflictType — currently only 'dagBranch'
const type: ConflictType = 'dagBranch';

// Conflict — describes a detected fork in InsertHistory
const conflict: Conflict = {
  table: 'cars',                           // Table where the conflict was detected
  type: 'dagBranch',                       // Type of conflict
  detectedAt: Date.now(),                  // Detection timestamp (ms since epoch)
  branches: ['17000…:AbCd', '17000…:EfGh'] // InsertHistory tip timeIds forming the fork
};

// ConflictCallback — fires when a conflict is detected
const onConflict: ConflictCallback = (conflict: Conflict) => {
  console.log(`Conflict in ${conflict.table}:`, conflict.branches);
};
```

## Utilities

### TimeId

A unique, time-based identifier in the format `"timestamp:xxxx"`.

```typescript
import { timeId, isTimeId, getTimeIdTimestamp } from '@rljson/rljson';

const id = timeId();                    // '1700000000000:AbCd'
isTimeId(id);                           // true
getTimeIdTimestamp(id);                  // 1700000000000
```

### RemoveDuplicates

Deduplicates rows (by `_hash`) across all tables in an Rljson object.

```typescript
import { removeDuplicates } from '@rljson/rljson';

const deduped = removeDuplicates(myRljsonData);
```

## Ecosystem

`@rljson/rljson` is the foundational layer of the RLJSON ecosystem:

| Package            | Purpose                             |
| ------------------ | ----------------------------------- |
| `@rljson/rljson`   | Core types & validation (this)      |
| `@rljson/hash`     | Deep hashing for RLJSON data        |
| `@rljson/json`     | JSON type definitions               |
| `@rljson/io`       | Data transport (Io, Socket, IoPeer) |
| `@rljson/bs`       | Blob storage (Bs, BsPeer)           |
| `@rljson/db`       | Database pipeline (Db, Connector)   |
| `@rljson/server`   | Server relay & Client setup         |
| `@rljson/fs-agent` | Filesystem ↔ database sync          |
