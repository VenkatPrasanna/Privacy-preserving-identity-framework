//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;

contract Organisations {

    struct Department {
        bytes32 depid;
        bytes32 depname;
        bytes32[] designations;
    }

    struct Organisation {
        bytes32 orgid;
        bytes32 orgname;
        Department[] departments;
    }

    struct OrganisationMinimal {
        bytes32 orgid;
        bytes32 orgname;
    }

    struct DepartmentMinimal {
        bytes32 depid;
        bytes32 depname;
    }

    constructor() {
    }

    // Mapping goes here
    mapping(bytes32 => Organisation) organisations;
    mapping(bytes32 => Department) departments;
    
    bytes32[] alldesignations;
    OrganisationMinimal[] allOrganisations;
    DepartmentMinimal[] allDepartments;

    uint organisationCounter = 0;

    // this function is copied from https://ethereum.stackexchange.com/questions/9142/how-to-convert-a-string-to-bytes32
    // to make it possible to use ERC725 functions
    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
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

    function addOrganisation(bytes32 name, bytes32 department, bytes32 designation) public {
        organisationCounter = organisationCounter + 1;
        string memory oid = makeId(organisationCounter, "org");
        bytes32 orgid = stringToBytes32(oid);

        uint deptlength = organisations[orgid].departments.length;
        string memory odid = string(abi.encodePacked(oid, "dep"));
        string memory did = makeId(deptlength, odid);
        bytes32 finaldid = stringToBytes32(did);

        organisations[orgid].orgid = orgid;
        organisations[orgid].orgname = name;
        departments[finaldid].depid = finaldid;
        departments[finaldid].depname = department;
        departments[finaldid].designations.push(designation);

        organisations[orgid].departments.push(departments[finaldid]);
    }

    function getAllOrganisation() public view returns(OrganisationMinimal[] memory) {
        return allOrganisations;
    }

    function getAllDepartments() public view returns(DepartmentMinimal[] memory) {
        return allDepartments;
    }

    function getAllDesignations() public view returns(bytes32[] memory) {
        return alldesignations;
    }

    function getOrganisation(bytes32 orgid) public view returns(Organisation memory) {
        return organisations[orgid];
    }

    function getDepartment(bytes32 depid) public view returns(Department memory) {
        return departments[depid];
    }

    function isOrgAdmin() public pure returns(bool) {
        return false;
    }
}