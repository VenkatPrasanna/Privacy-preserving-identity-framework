//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;

contract Users {
    address public superadmin;
    //Organisations organisationInstance;

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

    constructor() {
        superadmin = msg.sender;
       // allUsers.push(User(superadmin, 3));
        userToRole[msg.sender] = 3;
        //organisationInstance = Organisations(orgcontractAddress);
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
        bool approved
    );

    //mapping owner address to owner struct
    mapping(address => Owner) owners;
    mapping(address => Requester) requesters;
    mapping(address => uint) userToRole;

    // Function to add data owners
    function addDataOwner(address ownerAddress, bytes32 profession, bytes32 location) public isUserExists(ownerAddress) {
        owners[ownerAddress] = Owner(ownerAddress, profession, location, false);
        userToRole[ownerAddress] = 1;
        emit UserUpdated(ownerAddress, false);
    }

    function addDataRequester(address requesterAddress, bytes32 organisation, bytes32 department, bytes32 designation) public isUserExists(requesterAddress) {
        requesters[requesterAddress] = Requester(requesterAddress, organisation, department, designation, false);
        userToRole[requesterAddress] = 2;
        emit UserUpdated(requesterAddress, false);
    }

    function updateDataOwner(address ownerAddress, bytes32 profession, bytes32 location) public {
        require(owners[ownerAddress].ownerAddress == msg.sender, "Invalid user operation");
        owners[ownerAddress] = Owner(ownerAddress, profession, location, false);
        emit UserUpdated(ownerAddress, false);
    }

    function updateDataRequester(address requesterAddress, bytes32 organisation, bytes32 department, bytes32 designation) public {
        require(requesters[requesterAddress].requesterAddress == msg.sender, "Invalid user operation");
        requesters[requesterAddress] = Requester(requesterAddress, organisation, department, designation, false);
        emit UserUpdated(requesterAddress, false);
    }

    function getDataOwner(address ownerAddress) public view returns(Owner memory) {
        return owners[ownerAddress];
    }

    function getDataRequester(address requesterAddress) public view returns(Requester memory) {
        return requesters[requesterAddress];
    }

    function getSuperAdmin() public view returns(address) {
        return superadmin;
    }

    function getUserRole(address userAddress) public view returns (uint) {
        return userToRole[userAddress];
    }

    function approveOwner(address ownerAddress) public onlySuperAdmin(msg.sender) {
        owners[ownerAddress].approved = true;
        emit UserUpdated(ownerAddress, true);
    }

    function approveRequester(address requesterAddress) public onlySuperAdmin(msg.sender) {
        requesters[requesterAddress].approved = true;
        emit UserUpdated(requesterAddress, true);
    }
}