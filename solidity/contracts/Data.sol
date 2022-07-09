//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;

import "./Users.sol";

contract Data is Users {

    Users usersContractInstance;

    struct Dataset {
        string id;
        address ownerAddress;
        bytes32 name;
        bytes value;
        bytes32 category;
    }

    // events to detect data set added or updated
    event DatasetAdded(
        string id,
        bytes32 name,
        bytes32 category
    );

    // mapping for user related data item
    mapping(address => mapping(string => Dataset)) userSpecificData;

    // Mapping to creation relation between key and data item
    //mapping(address => mapping(string => bytes32)) userDataKey;

    // Mapping dataowner and data id
    mapping (string => address) dataOwnerMap;

    // Mapping to retrieve all data of an user
    mapping(address => Dataset[]) allUserData;

    constructor(address userContractAddress) {
        usersContractInstance = Users(userContractAddress);
    }

    modifier onlyDataOwner(address ownerAddress) {
        require(usersContractInstance.getDataOwner(ownerAddress).ownerAddress == ownerAddress, "Invalid action");
        _;
    }

    modifier isOwnerOfDataset(address ownerAddress, string memory id) {
        require(dataOwnerMap[id] == ownerAddress, "Invalid operation");
        _; 
    }

    function addData(string memory id, bytes32 name, bytes memory value, bytes32 category) external onlyDataOwner(msg.sender) {
        userSpecificData[msg.sender][id] = Dataset(id, msg.sender, name, value, category);
        //userDataKey[msg.sender][id] = key;
        dataOwnerMap[id] = msg.sender; 
        allUserData[msg.sender].push(Dataset(id, msg.sender, name, value, category));
        emit DatasetAdded(id, name, category);
    }

    function updateData(string memory id, bytes32 name, bytes memory value, bytes32 category) external isOwnerOfDataset(msg.sender, id) {
        userSpecificData[msg.sender][id] = Dataset(id, msg.sender, name, value, category);
        //userDataKey[msg.sender][id] = key;
        for(uint i = 0; i < allUserData[msg.sender].length; i++) {
            if(keccak256(bytes(allUserData[msg.sender][i].id)) == keccak256(bytes(id))) {
                allUserData[msg.sender][i] = Dataset(id, msg.sender, name, value, category);
            }
        }
        emit DatasetAdded(id, name, category);
    }

    function getUserData() external view returns(Dataset[] memory) {
        return allUserData[msg.sender];
    }

    function getSingleDataItem(string memory id) external view returns(Dataset memory) {
        return userSpecificData[msg.sender][id];
    }

    // function getKey(string memory id) external isOwnerOfDataset(msg.sender, id) view returns(bytes32) {
    //     return userDataKey[msg.sender][id];
    // }
}