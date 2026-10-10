// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

// .............................................................................
/**
 * Where a ref stands in the order a hub relayed it — a fact about what the
 * fleet saw, not a timestamp.
 *
 * A hub that stamps assigns one to every ref it relays on a route. The tuple
 * orders lexicographically on `(domain, epoch, hub, n)`, see
 * {@link compareRefStamp}. No field is read from a clock, so two machines with
 * different wall clocks order the same two refs the same way.
 *
 * | Field    | Meaning                                                  |
 * |----------|----------------------------------------------------------|
 * | `domain` | The network domain whose hub stamped the ref             |
 * | `epoch`  | Advanced each time a hub takes office in that domain     |
 * | `hub`    | The node id of the stamping hub                          |
 * | `n`      | Monotonic within `(domain, epoch, hub)`                  |
 *
 * `hub` keeps two hubs that believe they hold the same epoch — a split brain —
 * distinct and still totally ordered.
 */
export type RefStamp = {
  /** The network domain whose hub stamped the ref. */
  domain: string;

  /** Advanced each time a hub takes office in the domain. */
  epoch: number;

  /** The node id of the stamping hub. */
  hub: string;

  /** Monotonic within `(domain, epoch, hub)`. */
  n: number;
};

// .............................................................................
/**
 * Server → Client: the stamp a hub gave a ref the client announced.
 *
 * A hub forwards an announcement to every client except its sender, so the
 * sender never sees its own stamp on the ref event. This payload, sent on the
 * `${route}:stamp` event to the sender only, is how it learns it.
 */
export type StampPayload = {
  /** The ref that was stamped. */
  r: string;

  /** The stamp the hub gave it. */
  stamp: RefStamp;
};

// .............................................................................
/**
 * Orders two stamps lexicographically on `(domain, epoch, hub, n)`.
 *
 * A total order: every pair compares the same way on every machine, and only
 * equal stamps compare as `0`.
 * @param a - The first stamp
 * @param b - The second stamp
 * @returns A negative number if `a` orders first, a positive number if `b`
 * does, `0` if they are equal
 */
export const compareRefStamp = (a: RefStamp, b: RefStamp): number => {
  if (a.domain !== b.domain) return a.domain < b.domain ? -1 : 1;
  if (a.epoch !== b.epoch) return a.epoch < b.epoch ? -1 : 1;
  if (a.hub !== b.hub) return a.hub < b.hub ? -1 : 1;
  if (a.n !== b.n) return a.n < b.n ? -1 : 1;
  return 0;
};

// .............................................................................
/**
 * Checks whether a value received from the wire is a well-formed RefStamp.
 *
 * A stamp arrives inside a JSON payload from another process, so it is
 * checked before anything orders by it.
 * @param value - The value to check
 * @returns `true` if `value` has a string `domain` and `hub` and a
 * non-negative integer `epoch` and `n`
 */
export const isRefStamp = (value: unknown): value is RefStamp => {
  if (typeof value !== 'object' || value === null) return false;
  const stamp = value as Record<string, unknown>;
  return (
    typeof stamp.domain === 'string' &&
    typeof stamp.hub === 'string' &&
    Number.isSafeInteger(stamp.epoch) &&
    (stamp.epoch as number) >= 0 &&
    Number.isSafeInteger(stamp.n) &&
    (stamp.n as number) >= 0
  );
};

// .............................................................................
/**
 * Returns an example RefStamp for documentation and testing.
 */
export const refStampExample = (): RefStamp => ({
  domain: 'example',
  epoch: 1,
  hub: 'hub_ExAmPlE',
  n: 1,
});

// .............................................................................
/**
 * Returns an example StampPayload for documentation and testing.
 */
export const stampPayloadExample = (): StampPayload => ({
  r: '1700000000001:EfGh',
  stamp: refStampExample(),
});
