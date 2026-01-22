// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DDVSSubmissions {
    struct Project {
        uint256 dbId;
        address author;
        string repoUrl;
        uint256 timestamp;
    }

    mapping(uint256 => Project) public projects;
    event ProjectRegistered(uint256 indexed dbId, address indexed author, string repoUrl);

    function registerProject(uint256 _dbId, string memory _repoUrl) public {
        projects[_dbId] = Project(_dbId, msg.sender, _repoUrl, block.timestamp);
        emit ProjectRegistered(_dbId, msg.sender, _repoUrl);
    }
}