//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.6;

contract Data {

    struct DataStruct {
        address ownerAddress;
    }
    // mappings goes here
    mapping(string => DataStruct) userSpecificData;
}