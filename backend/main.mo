import Array "mo:base/Array";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

actor RealEstateShares {
    // Types
    type PropertyId = Nat;
    type ShareId = Nat;
    type AreaId = Nat;

    type Area = {
        id: AreaId;
        name: Text;
        totalShares: Nat;
        pricePerShare: Float;
        availableShares: Nat;
    };

    type Property = {
        id: PropertyId;
        name: Text;
        totalValue: Float;
        areas: [Area];
    };

    type Share = {
        propertyId: PropertyId;
        areaId: AreaId;
        owner: Principal;
        amount: Nat;
    };

    // State
    stable var nextPropertyId : Nat = 0;
    stable var nextShareId : Nat = 0;
    stable var nextAreaId : Nat = 0;
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
    public func addProperty(name: Text, totalValue: Float, areas: [(Text, Nat, Float)]) : async PropertyId {
        let propertyId = nextPropertyId;
        nextPropertyId += 1;

        let propertyAreas = Array.map<(Text, Nat, Float), Area>(areas, func(area) {
            let areaId = nextAreaId;
            nextAreaId += 1;
            {
                id = areaId;
                name = area.0;
                totalShares = area.1;
                pricePerShare = area.2;
                availableShares = area.1;
            }
        });

        let newProperty : Property = {
            id = propertyId;
            name = name;
            totalValue = totalValue;
            areas = propertyAreas;
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
    public shared(msg) func buyShares(propertyId: PropertyId, areaId: AreaId, amount: Nat) : async ?ShareId {
        switch (properties.get(propertyId)) {
            case (null) { return null; };
            case (?property) {
                switch (Array.find<Area>(property.areas, func(area) { area.id == areaId })) {
                    case (null) { return null; };
                    case (?area) {
                        if (area.availableShares < amount) {
                            return null;
                        };

                        let shareId = nextShareId;
                        nextShareId += 1;

                        let newShare : Share = {
                            propertyId = propertyId;
                            areaId = areaId;
                            owner = msg.caller;
                            amount = amount;
                        };

                        shares.put(shareId, newShare);
                        addUserShare(msg.caller, shareId);

                        let updatedAreas = Array.map<Area, Area>(property.areas, func(a) {
                            if (a.id == areaId) {
                                {
                                    id = a.id;
                                    name = a.name;
                                    totalShares = a.totalShares;
                                    pricePerShare = a.pricePerShare;
                                    availableShares = a.availableShares - amount;
                                }
                            } else {
                                a
                            }
                        });

                        let updatedProperty : Property = {
                            id = property.id;
                            name = property.name;
                            totalValue = property.totalValue;
                            areas = updatedAreas;
                        };

                        properties.put(propertyId, updatedProperty);

                        ?shareId
                    };
                }
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
