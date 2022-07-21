//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.7;

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
        bytes value,
        bytes32 category,
        address ownerAddress
    );

    event KeyRequested(
        string dataid,
        address indexed ownerAddress,
        address indexed requesterAddress,
        bytes32 accessType
    );

    event ApproveKeyRequest(
        string dataid,
        address indexed ownerAddress,
        address indexed requesterAddress,
        bytes key
    );

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

    modifier onlyDataRequester(address ownerAddress) {
        require(usersContractInstance.getDataRequester(ownerAddress).requesterAddress == ownerAddress, "Invalid action");
        _;
    }

    modifier isOwnerOfDataset(address ownerAddress, string memory id) {
        require(dataOwnerMap[id] == ownerAddress, "Invalid operation");
        _; 
    }

    function addData(string memory id, bytes32 name, bytes memory value, bytes32 category) external onlyDataOwner(msg.sender) {        
        dataOwnerMap[id] = msg.sender; 
        allUserData[msg.sender].push(Dataset(id, msg.sender, name, value, category));
        emit DatasetAdded(id, name, value, category, msg.sender);
    }

    function updateData(string memory id, bytes32 name, bytes memory value, bytes32 category) external isOwnerOfDataset(msg.sender, id) {        
        for(uint i = 0; i < allUserData[msg.sender].length; i++) {
            if(keccak256(bytes(allUserData[msg.sender][i].id)) == keccak256(bytes(id))) {
                allUserData[msg.sender][i] = Dataset(id, msg.sender, name, value, category);
            }
        }
        emit DatasetAdded(id, name, value, category, msg.sender);
    }

    function getUserData() external view returns(Dataset[] memory) {
        return allUserData[msg.sender];
    }

    // function getSingleDataItem(string memory id) external view returns(Dataset memory) {
    //     return userSpecificData[msg.sender][id];
    // }

    function requestKey(string memory dataid, address ownerAddress, bytes32 accessType) external onlyDataRequester(msg.sender) {
        emit KeyRequested(dataid, ownerAddress, msg.sender, accessType);
    }

    function approveKeyRequest(string memory dataid, address requesterAddress, bytes memory key) external onlyDataOwner(msg.sender) {
        emit ApproveKeyRequest(dataid, msg.sender, requesterAddress, key);
    }

    function getDatasetOwner(string memory dataid) external view returns(address) {
        return dataOwnerMap[dataid];
    }



    // function getKey(string memory id) external isOwnerOfDataset(msg.sender, id) view returns(bytes32) {
    //     return userDataKey[msg.sender][id];
    // }
}