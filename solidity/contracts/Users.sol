//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;

contract Users {
    address public superadmin;
    //Organisations organisationInstance;

    struct Owner {
        address ownerAddress;
        //uint role;
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

    struct User {
        address userAddress;
        uint role;
        //bool approved;
    }

    constructor() {
        superadmin = msg.sender;
        allUsers.push(User(superadmin, 3));
        //organisationInstance = Organisations(orgcontractAddress);
    }

    User[] allUsers;

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

    // modifier onlyRequester(address senderAddress) {
    //     require(requesters);
    // }

    // Events goes here
    event NewOwnerCreated(
        address ownerAddress,
        bytes32 profession,
        bytes32 location,
        bool approved
    );

    event UpdateDataOwner(
        address ownerAddress,
        bytes32 profession,
        bytes32 location,
        bool approved
    );

    event NewRequesterCreated(
        address requesterAddress,
        bytes32 organisation,
        bytes32 department,
        bytes32 designation,
        bool approved
    );

    event UpdateDataRequester(
        address requesterAddress,
        bytes32 organisation,
        bytes32 department,
        bytes32 designation,
        bool approved
    );

    //mapping owner address to owner struct
    mapping(address => Owner) owners;
    mapping(address => Requester) requesters;

    // Function to add data owners
    function addDataOwner(address ownerAddress, bytes32 profession, bytes32 location) public isUserExists(ownerAddress) {
        owners[ownerAddress] = Owner(ownerAddress, profession, location, false);
        allUsers.push(User(ownerAddress, 1));
        emit NewOwnerCreated(ownerAddress, profession, location, false);
    }

    function addDataRequester(address requesterAddress, bytes32 organisation, bytes32 department, bytes32 designation) public isUserExists(requesterAddress) {
        requesters[requesterAddress] = Requester(requesterAddress, organisation, department, designation, false);
        allUsers.push(User(requesterAddress, 2));
        //organisationInstance.addOrganisation(organisation, department, designation);
        emit NewRequesterCreated(requesterAddress, organisation, department, designation, false);
    }

    function updateDataOwner(address ownerAddress, bytes32 profession, bytes32 location) public {
        require(owners[ownerAddress].ownerAddress == msg.sender, "Invalid user operation");
        owners[ownerAddress] = Owner(ownerAddress, profession, location, false);
        emit UpdateDataOwner(ownerAddress, profession, location, false);
    }

    function updateDataRequester(address requesterAddress, bytes32 organisation, bytes32 department, bytes32 designation) public {
        require(requesters[requesterAddress].requesterAddress == msg.sender, "Invalid user operation");
        requesters[requesterAddress].organisation = organisation;
        requesters[requesterAddress].department = department;
        requesters[requesterAddress].designation = designation;
        requesters[requesterAddress].approved = false;
        emit UpdateDataRequester(requesterAddress, organisation, department, designation, false);
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

    function approveOwner(address ownerAddress) public onlySuperAdmin(msg.sender) {
        owners[ownerAddress].approved = true;
    }

    function approveRequester(address requesterAddress) public onlySuperAdmin(msg.sender) {
        requesters[requesterAddress].approved = true;
    }

    function getAllUsers() public view returns(User[] memory) {
        return allUsers;
    }
}