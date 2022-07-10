//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;

import "./Users.sol";

contract Policies is Users {
    Users usersContractInstance;
    struct Policy {
        bytes32 dataid;
        bytes32 policies;
    }

    // Mapping of policy and data item
    mapping (bytes32=>bytes32) dataItemPolicies;

    Policy[] allPolicies;

    modifier onlyDataOwner(address ownerAddress) {
        require(usersContractInstance.getDataOwner(ownerAddress).ownerAddress == ownerAddress, "Invalid action");
        _;
    }

    constructor(address userContractAddress) {
        usersContractInstance = Users(userContractAddress);
    }

    function createPolicy(bytes32 dataid, bytes32 policies) external {
        dataItemPolicies[dataid] = policies;
        allPolicies.push(Policy(dataid, policies));
    }

    function updatePolicy(bytes32 dataid, bytes32 policies) external {
        dataItemPolicies[dataid] = policies;
        for(uint i = 0; i < allPolicies.length; i++) {
            if(allPolicies[i].dataid == dataid) {
                allPolicies[i] = Policy(dataid, policies);
            }
        }
    }

    function getPolicy(bytes32 dataid) external view returns(bytes32) {
        return dataItemPolicies[dataid];
    }
}