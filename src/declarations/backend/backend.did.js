export const idlFactory = ({ IDL }) => {
  const PropertyId = IDL.Nat;
  const ShareId = IDL.Nat;
  const Property = IDL.Record({
    'id' : PropertyId,
    'pricePerShare' : IDL.Float64,
    'name' : IDL.Text,
    'availableShares' : IDL.Nat,
    'totalShares' : IDL.Nat,
  });
  const Share = IDL.Record({
    'owner' : IDL.Principal,
    'propertyId' : PropertyId,
    'amount' : IDL.Nat,
  });
  return IDL.Service({
    'addProperty' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Float64],
        [PropertyId],
        [],
      ),
    'buyShares' : IDL.Func([PropertyId, IDL.Nat], [IDL.Opt(ShareId)], []),
    'getAllProperties' : IDL.Func([], [IDL.Vec(Property)], ['query']),
    'getProperty' : IDL.Func([PropertyId], [IDL.Opt(Property)], ['query']),
    'getUserShares' : IDL.Func([IDL.Principal], [IDL.Vec(Share)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
