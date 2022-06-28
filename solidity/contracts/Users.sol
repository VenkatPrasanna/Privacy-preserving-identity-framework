//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;

import "./Organisations.sol";

contract Users is Organisations {
    address superadmin;
    Organisations organisationInstance;

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
        bool approved;
    }

    constructor(address orgcontractAddress) {
        superadmin = msg.sender;
        organisationInstance = Organisations(orgcontractAddress);
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

    //mapping owner address to owner struct
    mapping(address => Owner) owners;
    mapping(address => Requester) requesters;

    // Function to add data owners
    function addDataOwner(address ownerAddress, bytes32 profession, bytes32 location) public isUserExists(ownerAddress) {
        owners[ownerAddress] = Owner(ownerAddress, profession, location, false);
        allUsers.push(User(ownerAddress, 1, false));   
    }

    function addDataRequester(address requesterAddress, bytes32 organisation, bytes32 department, bytes32 designation) public isUserExists(requesterAddress) {
        requesters[requesterAddress] = Requester(requesterAddress, organisation, department, designation, false);
        allUsers.push(User(requesterAddress, 2, false));
        organisationInstance.addOrganisation(organisation, department, designation);
    }


    function updateRequester(bytes32 organisation, bytes32 department, bytes32 designation) public {
        requesters[msg.sender].organisation = organisation;
        requesters[msg.sender].department = department;
        requesters[msg.sender].designation = designation;
        requesters[msg.sender].approved = false;
    }

    function getDataOwner(address ownerAddress) public view returns(Owner memory) {
        return owners[ownerAddress];
    }

    function getDataRequester(address requesterAddress) public view returns(Requester memory) {
        return requesters[requesterAddress];
    }

    function approveUser() public onlySuperAdmin(msg.sender) {

    }

    function getAllUsers() public view returns(User[] memory) {
        return allUsers;
    }
}