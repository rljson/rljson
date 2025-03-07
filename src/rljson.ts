// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json, JsonValue } from '@rljson/hash';

// ..............................................................................
/**
 * A ref is a hash that references to another element
 */
export type Ref = string;

/**
 * An `id` is a *user defined* name or identifier of an item.
 * It exists in parallel with the auto generated `_hash`.
 */
export type ItemId = string;

// .............................................................................

/**
 * A table id reference to a table. The table ids are used as keys in the top
 * level structure of an Rljson data object.
 */
export type TableName = ItemId;

/**
 * Types of tables that can be stored in an Rljson object
 *
 * - `buffets` Tables containing buffets
 * - `cakes` Tables containing cakes
 * - `collections` Tables containing collections
 * - `ids` Tables containing item ids
 * - `properties` Tables containing item properties
 */
export type TableType = 'buffet' | 'cake' | 'collection' | 'ids' | 'properties';

/** A table in the rljson format */
export interface RljsonTable<Data extends Json, Type extends TableType>
  extends Json {
  /** The data rows of the table */
  _data: Data[];

  /**  The type of the table */
  _type: Type;
}

// .............................................................................

/**
 * A reference to a properties row in a properties table
 */
export type PropertiesRef = Ref;

/**
 * A table containing item properties
 */
export type PropertiesTable = RljsonTable<Json, 'properties'>;

// .............................................................................
/**
 * An IdSetRef is a hash pointing to an Ids
 */
export type IdSetRef = Ref;

/**
 * An Ids manages list of item ids
 */
export interface IdSet extends Json {
  /**
   * The hash of another item id list which is extended by this one.
   * Must be empty or null, when the list is the root.
   */
  base: IdSetRef | null;

  /**
   * The item ids added to base
   */
  add: ItemId[];

  /**
   * The item ids removed from base
   */
  remove: ItemId[];
}

/**
 * A table containing item ids
 */
export type IdSetsTable = RljsonTable<IdSet, 'ids'>;

// .............................................................................
/**
 * A CollectionRef is a hash pointing to a collection
 */
export type CollectionRef = Ref;

/**
 * A collection assigns properties to item ids
 */
export interface Collection extends Json {
  /**
   * `base` an optional base collection that is extended by this collection
   */
  base: CollectionRef | null;

  /**
   * The table containing the item set of this collection
   */
  idSetsTable: TableName;

  /**
   * A reference to the ids of the items the collection is based on
   */
  idSet: IdSetRef;

  /**
   * The table containing the properties assigned to the items of this collection
   */
  properties: TableName;

  /**
   * Assign properties to each item of the collection.
   */
  assign: Record<ItemId, PropertiesRef>;
}

/**
 * A table containing collections
 */
export type CollectionsTable = RljsonTable<Collection, 'collection'>;

// .............................................................................

/**
 * A `CakeLayerId` assigns an id or name to a cake layer
 */
export type CakeLayerId = ItemId;

/**
 * A `CakeLayerIds` is a set of cake layer ids / cake layer names
 */
export type CakeLayerIds = IdSet;

/**
 * A cake is a collection of layers.
 *
 * A layer is a collection of items.
 * All layers of a cake refer to the same items.
 */
export interface Cake extends Json {
  /**
   * The table containing the item ids of the cake
   */
  itemIdsTable: TableName;

  /**
   * All layers of a cake share the same item ids.
   */
  itemIds: IdSetRef;

  /**
   * The table containing the layers of this cake
   */
  layersTable: TableName;

  /**
   * Assigns a collection to each layer of the cake.
   */
  layers: {
    [layerId: CakeLayerId]: CollectionRef;
  };
}

/**
 * A table containing cakes
 */
export type CakesTable = RljsonTable<Cake, 'cake'>;

// .............................................................................

/**
 * A buffet id is a name or id of a buffet
 */
export type BuffetId = ItemId;

/**
 * A buffet is a collection of arbitrary but related items, e.g. cakes,
 * collections, or items.
 */
export interface Buffet extends Json {
  /**
   * The items of the buffet
   */
  items: Array<{
    table: TableName;
    ref: Ref;
    [key: string]: JsonValue;
  }>;
}

/**
 * A table containing buffets
 */
export type BuffetsTable = RljsonTable<Buffet, 'buffet'>;

// .............................................................................
/**
 * One of the supported Rljson table types
 */
export type RljsonTableType =
  | BuffetsTable
  | PropertiesTable
  | CollectionsTable
  | IdSetsTable
  | CakesTable;

// .............................................................................
/** The rljson data format */
export interface Rljson extends Json {
  [tableId: TableName]: RljsonTableType | string;
}

export const exampleRljson = (): Rljson => ({});
