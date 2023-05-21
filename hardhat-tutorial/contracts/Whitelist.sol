// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

contract WhiteList{
    uint8 public maxWhitelistedAddresses;

    mapping (address => bool) public whitelistedAddresses;

    uint8 public numAddressWhitelisted;

    // The maximum now of addresses to be whitlisted will be decided by the admin
    constructor(uint8 _maxWhitelistedAddresses){
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    function addAddressToWhitelist() public{

        require(!whitelistedAddresses[msg.sender], "Sender has already been whitelisted");

        require(numAddressWhitelisted < maxWhitelistedAddresses, "More addresses cant be added, limit reached");

        whitelistedAddresses[msg.sender] = true;

        numAddressWhitelisted += 1;
    }
}