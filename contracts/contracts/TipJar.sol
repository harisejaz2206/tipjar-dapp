// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TipJar {
    address public owner;

    event TipReceived(address indexed from, uint amount, string message);

    constructor() {
        owner = msg.sender;
    }

    function tip(string calldata message) external payable {
        require(msg.value > 0, "Tip must be greater than 0");
        emit TipReceived(msg.sender, msg.value, message);
    }

    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }
}
