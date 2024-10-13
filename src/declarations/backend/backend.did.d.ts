import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Property {
  'id' : PropertyId,
  'pricePerShare' : number,
  'name' : string,
  'availableShares' : bigint,
  'totalShares' : bigint,
}
export type PropertyId = bigint;
export interface Share {
  'owner' : Principal,
  'propertyId' : PropertyId,
  'amount' : bigint,
}
export type ShareId = bigint;
export interface _SERVICE {
  'addProperty' : ActorMethod<[string, bigint, number], PropertyId>,
  'buyShares' : ActorMethod<[PropertyId, bigint], [] | [ShareId]>,
  'getAllProperties' : ActorMethod<[], Array<Property>>,
  'getProperty' : ActorMethod<[PropertyId], [] | [Property]>,
  'getUserShares' : ActorMethod<[Principal], Array<Share>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
