//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;

import "./Users.sol";

contract Organisations is Users {

    Users usersContractInstance;

    struct Department {
        string depid;
        bytes32 depname;
        bytes32[] designations;
    }

    struct Organisation {
        string orgid;
        bytes32 orgname;
        uint totalDepartments;
        string[] departmentids;
    }

    struct OrganisationMinimal {
        string orgid;
        bytes32 orgname;
    }

    struct DepartmentMinimal {
        string depid;
        bytes32 depname;
    }

    constructor(address userContractAddress) {
        usersContractInstance = Users(userContractAddress);
    }

    // Mapping goes here
    mapping(string => Organisation) organisations;
    mapping(string => Department) departments;
    
    bytes32[] alldesignations;
    OrganisationMinimal[] allOrganisations;
    DepartmentMinimal[] allDepartments;

    uint organisationCounter = 0;

    modifier superAdmin(address senderAddress) {
        require(usersContractInstance.getSuperAdmin() == senderAddress, "Invalid user operation");
        _;
    }

    // Generic functions
    //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Strings.sol

    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function makeId(uint id, string memory val) public pure returns(string memory) {
        //bytes memory bid = new bytes(id);
        string memory sid = toString(id);
        //return string.concat("attr", sid);
        //https://stackoverflow.com/questions/32157648/string-concatenation-in-solidity
        return string(abi.encodePacked(val, sid));
    }

    function createOrganisation(bytes32 name, bytes32 departmentName, bytes32 designation, bool isAddDesignation) external {
        organisationCounter = organisationCounter + 1;
        string memory orgid = makeId(organisationCounter, "org");
        organisations[orgid].orgid = orgid;
        organisations[orgid].orgname = name;

        uint deptlength = organisations[orgid].totalDepartments + 1;
        string memory odid = string(abi.encodePacked(orgid, "dep"));
        string memory finaldid = makeId(deptlength, odid);
        organisations[orgid].totalDepartments++;
        organisations[orgid].departmentids.push(finaldid);
        departments[finaldid].depid = finaldid;
        departments[finaldid].depname = departmentName;
        departments[finaldid].designations.push(designation);
        if(isAddDesignation) {
            alldesignations.push(designation);
        }
        allOrganisations.push(OrganisationMinimal(orgid, name));
        allDepartments.push(DepartmentMinimal(finaldid, departmentName));
    }

    function addDepartmentToOrg(string memory orgid, bytes32 departmentName, bytes32 designation, bool isAddDesignation) external {
        require(keccak256(bytes(organisations[orgid].orgid)) == keccak256(bytes(orgid)), "Invalid organisation"); 
        uint deptlength = organisations[orgid].totalDepartments + 1;
        string memory odid = string(abi.encodePacked(orgid, "dep"));
        string memory finaldid = makeId(deptlength, odid);
        organisations[orgid].totalDepartments++;
        organisations[orgid].departmentids.push(finaldid);
        departments[finaldid].depid = finaldid;
        departments[finaldid].depname = departmentName;
        departments[finaldid].designations.push(designation);
        if(isAddDesignation) {
            alldesignations.push(designation);
        }
        allDepartments.push(DepartmentMinimal(finaldid, departmentName));
    }

    function addDesignationToDepartment(string memory depid, bytes32 designation, bool isAddDesignation) external {
        require(departments[depid].designations.length > 0, "Invalid department");
        if(isAddDesignation) {
            alldesignations.push(designation);
        }
        departments[depid].designations.push(designation); 
    }

    function getAllOrganisations() public view returns(OrganisationMinimal[] memory) {
        return allOrganisations;
    }

    function getAllDepartments() public view returns(DepartmentMinimal[] memory) {
        return allDepartments;
    }

    function getAllDesignations() public view returns(bytes32[] memory) {
        return alldesignations;
    }

    // function getAllDesignations() public view returns(bytes32[] memory) {
    //     return alldesignations;
    // }

    function getOrganisation(string memory orgid) public view returns(Organisation memory) {
        return organisations[orgid];
    }

    function getDepartment(string memory depid) public view returns(Department memory) {
        return departments[depid];
    }

}