//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.7;

import "./Users.sol";

contract Policies is Users {
    Users usersContractInstance;
    struct Policy {
        string dataid;
        bytes policies;
    }

    // Mapping of policy and data item
    mapping (string=>bytes) dataItemPolicies;

    Policy[] allPolicies;

    modifier onlyDataOwner(address ownerAddress) {
        require(usersContractInstance.getDataOwner(ownerAddress).ownerAddress == ownerAddress, "Invalid action");
        _;
    }

    constructor(address userContractAddress) {
        usersContractInstance = Users(userContractAddress);
    }

    function createPolicy(string memory dataid, bytes memory policies) external onlyDataOwner(msg.sender) {
        dataItemPolicies[dataid] = policies;
        allPolicies.push(Policy(dataid, policies));
    }

    // function updatePolicy(string memory dataid, bytes memory policies) external {
    //     dataItemPolicies[dataid] = policies;
    //     for(uint i = 0; i < allPolicies.length; i++) {
    //         if(allPolicies[i].dataid == dataid) {
    //             allPolicies[i] = Policy(dataid, policies);
    //         }
    //     }
    // }

    function getPolicy(string memory dataid) external view returns(bytes memory) {
        return dataItemPolicies[dataid];
    }
}