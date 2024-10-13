export const idlFactory = ({ IDL }) => {
  const PropertyId = IDL.Nat;
  const AreaId = IDL.Nat;
  const ShareId = IDL.Nat;
  const Area = IDL.Record({
    'id' : AreaId,
    'pricePerShare' : IDL.Float64,
    'name' : IDL.Text,
    'availableShares' : IDL.Nat,
    'totalShares' : IDL.Nat,
  });
  const Property = IDL.Record({
    'id' : PropertyId,
    'areas' : IDL.Vec(Area),
    'totalValue' : IDL.Float64,
    'name' : IDL.Text,
  });
  const Share = IDL.Record({
    'owner' : IDL.Principal,
    'propertyId' : PropertyId,
    'areaId' : AreaId,
    'amount' : IDL.Nat,
  });
  return IDL.Service({
    'addProperty' : IDL.Func(
        [
          IDL.Text,
          IDL.Float64,
          IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat, IDL.Float64)),
        ],
        [PropertyId],
        [],
      ),
    'buyShares' : IDL.Func(
        [PropertyId, AreaId, IDL.Nat],
        [IDL.Opt(ShareId)],
        [],
      ),
    'getAllProperties' : IDL.Func([], [IDL.Vec(Property)], ['query']),
    'getProperty' : IDL.Func([PropertyId], [IDL.Opt(Property)], ['query']),
    'getUserShares' : IDL.Func([IDL.Principal], [IDL.Vec(Share)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
