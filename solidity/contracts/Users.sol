//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.7;

contract Users {
    address public superadmin;

    struct Owner {
        address ownerAddress;
        bytes32 profession;
        bytes32 location;
        bool approved;
    }

    struct Requester {
        address requesterAddress;
        bytes32 organisation;
        bytes32 department;
        bytes32 designation;
        bool approved;
    }

    struct UsersMinimal {
        address userAddress;
        uint userType;
        bool approved;
    }

    constructor() {
        superadmin = msg.sender;
        userToRole[msg.sender] = 3;
    }

    // modifiers
    modifier isUserExists(address userAddress) {
        require(owners[userAddress].ownerAddress ==  address(0x0), "User already exists");
        require(requesters[userAddress].requesterAddress ==  address(0x0), "User already exists");
        require(userAddress != superadmin, "Invalid user");
        _;
    }

    modifier onlySuperAdmin(address senderAddress) {
        require(senderAddress == superadmin, "Only super admin can approve users");
        _;
    }

    // Events goes here
    event UserUpdated(
        address userAddress,
        uint userType,
        bool approved
    );

    UsersMinimal[] allUsers;

    //mapping owner address to owner struct
    mapping(address => Owner) owners;
    mapping(address => Requester) requesters;
    mapping(address => uint) userToRole;
    mapping(address => bytes) requesterToPublicKey;
    mapping(address => uint) userIndexToUpdate;

    // Function to add data owners
    function addDataOwner(address ownerAddress, bytes32 profession, bytes32 location) external isUserExists(ownerAddress) {
        owners[ownerAddress] = Owner(ownerAddress, profession, location, false);        
        userToRole[ownerAddress] = 1;
        allUsers.push(UsersMinimal(ownerAddress, 1, false));
        //uint userIndex = allUsers.length-1;
        userIndexToUpdate[ownerAddress] = allUsers.length-1;
        emit UserUpdated(ownerAddress, 1, false);
    }

    function addDataRequester(address requesterAddress, bytes32 organisation, bytes32 department, bytes32 designation, bytes memory publicKey) external isUserExists(requesterAddress) {
        requesters[requesterAddress] = Requester(requesterAddress, organisation, department, designation, false);
        userToRole[requesterAddress] = 2;
        requesterToPublicKey[requesterAddress] = publicKey;
        allUsers.push(UsersMinimal(requesterAddress, 2, false));
        //uint userIndex = allUsers.length-1;
        userIndexToUpdate[requesterAddress] = allUsers.length-1;        
        emit UserUpdated(requesterAddress, 2, false);
    }

    function updateDataOwner(address ownerAddress, bytes32 profession, bytes32 location) external {
        require(owners[ownerAddress].ownerAddress == msg.sender, "Invalid user operation");
        owners[ownerAddress] = Owner(ownerAddress, profession, location, false);
        uint ownerIndex = userIndexToUpdate[ownerAddress];
        allUsers[ownerIndex] = UsersMinimal(ownerAddress, 1, false);
        emit UserUpdated(ownerAddress, 1, false);
    }

    function updateDataRequester(address requesterAddress, bytes32 organisation, bytes32 department, bytes32 designation) external {
        require(requesters[requesterAddress].requesterAddress == msg.sender, "Invalid user operation");
        requesters[requesterAddress] = Requester(requesterAddress, organisation, department, designation, false);
        uint requesterIndex = userIndexToUpdate[requesterAddress];
        allUsers[requesterIndex] = UsersMinimal(requesterAddress, 2, false);
        emit UserUpdated(requesterAddress, 2, false);
    }

    function getDataOwner(address ownerAddress) external view returns(Owner memory) {
        return owners[ownerAddress];
    }

    function getDataRequester(address requesterAddress) external view returns(Requester memory) {
        return requesters[requesterAddress];
    }

    function getSuperAdmin() external view returns(address) {
        return superadmin;
    }

    function getUserRole(address userAddress) external view returns (uint) {
        return userToRole[userAddress];
    }

    function getAllUsers() external view returns(UsersMinimal[] memory) {
        return allUsers;
    }

    function approveOwner(address ownerAddress) external onlySuperAdmin(msg.sender) {
        owners[ownerAddress].approved = true;
        uint ownerIndex = userIndexToUpdate[ownerAddress];
        allUsers[ownerIndex] = UsersMinimal(ownerAddress, 1, true);
        emit UserUpdated(ownerAddress, 1, true);
    }

    function approveRequester(address requesterAddress) external onlySuperAdmin(msg.sender) {
        requesters[requesterAddress].approved = true;
        uint requesterIndex = userIndexToUpdate[requesterAddress];
        allUsers[requesterIndex] = UsersMinimal(requesterAddress, 2, true);
        emit UserUpdated(requesterAddress, 2, true);
    }
}