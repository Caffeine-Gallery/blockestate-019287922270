import Hash "mo:base/Hash";

import Array "mo:base/Array";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

actor RealEstateShares {
    // Types
    type PropertyId = Nat;
    type ShareId = Nat;

    type Property = {
        id: PropertyId;
        name: Text;
        totalShares: Nat;
        pricePerShare: Float;
        availableShares: Nat;
    };

    type Share = {
        propertyId: PropertyId;
        owner: Principal;
        amount: Nat;
    };

    // State
    stable var nextPropertyId : Nat = 0;
    stable var nextShareId : Nat = 0;
    let properties = HashMap.HashMap<PropertyId, Property>(10, Nat.equal, Hash.hash);
    let shares = HashMap.HashMap<ShareId, Share>(100, Nat.equal, Hash.hash);
    let userShares = HashMap.HashMap<Principal, [ShareId]>(100, Principal.equal, Principal.hash);

    // Helper functions
    func addUserShare(user: Principal, shareId: ShareId) {
        switch (userShares.get(user)) {
            case (null) { userShares.put(user, [shareId]); };
            case (?userShareIds) {
                let newUserShares = Array.append(userShareIds, [shareId]);
                userShares.put(user, newUserShares);
            };
        };
    };

    // Property management
    public func addProperty(name: Text, totalShares: Nat, pricePerShare: Float) : async PropertyId {
        let propertyId = nextPropertyId;
        nextPropertyId += 1;

        let newProperty : Property = {
            id = propertyId;
            name = name;
            totalShares = totalShares;
            pricePerShare = pricePerShare;
            availableShares = totalShares;
        };

        properties.put(propertyId, newProperty);
        propertyId
    };

    public query func getProperty(propertyId: PropertyId) : async ?Property {
        properties.get(propertyId)
    };

    public query func getAllProperties() : async [Property] {
        Iter.toArray(properties.vals())
    };

    // Share management
    public shared(msg) func buyShares(propertyId: PropertyId, amount: Nat) : async ?ShareId {
        switch (properties.get(propertyId)) {
            case (null) { return null; };
            case (?property) {
                if (property.availableShares < amount) {
                    return null;
                };

                let shareId = nextShareId;
                nextShareId += 1;

                let newShare : Share = {
                    propertyId = propertyId;
                    owner = msg.caller;
                    amount = amount;
                };

                shares.put(shareId, newShare);
                addUserShare(msg.caller, shareId);

                let updatedProperty : Property = {
                    id = property.id;
                    name = property.name;
                    totalShares = property.totalShares;
                    pricePerShare = property.pricePerShare;
                    availableShares = property.availableShares - amount;
                };

                properties.put(propertyId, updatedProperty);

                ?shareId
            };
        }
    };

    public query func getUserShares(user: Principal) : async [Share] {
        switch (userShares.get(user)) {
            case (null) { []; };
            case (?userShareIds) {
                Array.mapFilter<ShareId, Share>(userShareIds, func (shareId) {
                    shares.get(shareId)
                })
            };
        }
    };

    // For simplicity, we're not implementing share selling or return distribution in this example
};
