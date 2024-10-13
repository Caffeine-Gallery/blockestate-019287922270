import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Area {
  'id' : AreaId,
  'pricePerShare' : number,
  'name' : string,
  'availableShares' : bigint,
  'totalShares' : bigint,
}
export type AreaId = bigint;
export interface Property {
  'id' : PropertyId,
  'areas' : Array<Area>,
  'totalValue' : number,
  'name' : string,
}
export type PropertyId = bigint;
export interface Share {
  'owner' : Principal,
  'propertyId' : PropertyId,
  'areaId' : AreaId,
  'amount' : bigint,
}
export type ShareId = bigint;
export interface _SERVICE {
  'addProperty' : ActorMethod<
    [string, number, Array<[string, bigint, number]>],
    PropertyId
  >,
  'buyShares' : ActorMethod<[PropertyId, AreaId, bigint], [] | [ShareId]>,
  'getAllProperties' : ActorMethod<[], Array<Property>>,
  'getProperty' : ActorMethod<[PropertyId], [] | [Property]>,
  'getUserShares' : ActorMethod<[Principal], Array<Share>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
