// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import { Json } from '@rljson/hash';

// ..............................................................................
/**
 * A ref is a hash that references to another element
 */
export type Ref = string;

/**
 * An `id` is a *user defined* name or identifier of an item.
 * It exists in parallel with the auto generated `_hash`.
 */
export type Id = string;

// .............................................................................

/**
 * A table id reference to a table. The table ids are used as keys in the top
 * level structure of an Rljson data object.
 */
export type TableId = Id;

/**
 * Types of tables that can be stored in an Rljson object
 *
 * - `buffets` Tables containing buffets
 * - `cakes` Tables containing cakes
 * - `collections` Tables containing collections
 * - `ids` Tables containing item ids
 * - `props` Tables containing item properties
 */
export type TableType = 'buffets' | 'cakes' | 'collections' | 'ids' | 'props';

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
 * A table containing item properties
 */
export type PropertiesTable = RljsonTable<Json, 'props'>;

// .............................................................................
/**
 * An IdSetRef is a hash pointing to an IdSet
 */
export type IdSetRef = Ref;

/**
 * An IdSet manages list of item ids
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
  add: Id[];

  /**
   * The item ids removed from base
   */
  remove: Id[];
}

/**
 * A table containing item ids
 */
export type IdSetsTable = RljsonTable<IdSet, 'ids'>;

// .............................................................................
/**
 * A CollectionId is an id identifying a collection
 */
export type CollectionId = Id;

/**
 * A CollectionRef is a hash pointing to a collection
 */
export type CollectionRef = Ref;

/**
 * A collection assigns properties to item ids
 */
export interface Collection extends Json {
  /**
   * The id of the collection
   */
  id: CollectionId;

  /**
   * A reference to the ids of the items the collection is based on
   */
  idSetRef: IdSetRef;

  /**
   * `base` an optional base collection that is extended by this collection
   */
  base: CollectionRef | null;

  /**
   * The table containing the properties assigned to the items of this collection
   */
  propertyTableId: TableId;

  /**
   * Assign properties to each item of the collection
   */
  assign: Record<Id, Ref>;
}

/**
 * A table containing collections
 */
export type CollectionsTable = RljsonTable<Collection, 'collections'>;

// .............................................................................

/**
 * A `CakeLayerId` assigns an id or name to a cake layer
 */
export type CakeLayerId = Id;

/**
 * A `CakeLayerIdSet` is a set of cake layer ids / cake layer names
 */
export type CakeLayerIdSet = IdSet;

/**
 * A cake is a collection of layers.
 *
 * A layer is a collection of items.
 * All layers of a cake refer to the same items.
 */
export interface Cake extends Json {
  /**
   * All layers of a cake share the same item ids.
   */
  itemIdsRef: IdSetRef;

  /**
   * A list of layer names (ids)
   */
  layerIdSet: CakeLayerIdSet;

  /**
   * Assigns a collection to each layer of the cake.
   * The layerIds must be items of the layerIdSet.
   * The collection must be a collection of the itemIds.
   */
  layers: {
    [layerId: CakeLayerId]: CollectionRef;
  };
}

/**
 * A table containing cakes
 */
export type CakesTable = RljsonTable<Cake, 'cakes'>;

// .............................................................................

/**
 * A buffet id is a name or id of a buffet
 */
export type BuffetId = Id;

/**
 * A buffet is a collection of arbitrary but related items, e.g. cakes,
 * collections, or items.
 */
export interface Buffet extends Json {
  /**
   * The id of the buffet
   */
  id: BuffetId;

  items: Array<{
    tableName: TableId;
    itemRef: Ref;
  }>;
}

/**
 * A table containing buffets
 */
export type BuffetsTable = RljsonTable<Buffet, 'buffets'>;

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
  [tableId: TableId]: RljsonTableType;
}

// ...........................................................................
// Todo: Next step: Check if this model meets the requirements of the use cases

// A catalog is a buffet
// The catalog articles are a cake
// Certain properties of the catalog articles are cake layers
// Catalog layer assigns properties to the catalog articles
