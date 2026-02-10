// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DDVSSubmissions {
    struct Project {
        uint256 dbId;
        address author;
        string title;
        string category;
        string repoUrl;
        uint256 timestamp;
    }

    mapping(uint256 => Project) public projects;
    
    // Emitting description allows off-chain indexers to rebuild the UI without gas costs of storage
    event ProjectRegistered(
        uint256 indexed dbId, 
        address indexed author, 
        string title, 
        string category, 
        string repoUrl, 
        string description
    );

    function registerProject(
        uint256 _dbId, 
        string memory _title, 
        string memory _category, 
        string memory _repoUrl, 
        string memory _description
    ) public {
        projects[_dbId] = Project(_dbId, msg.sender, _title, _category, _repoUrl, block.timestamp);
        emit ProjectRegistered(_dbId, msg.sender, _title, _category, _repoUrl, _description);
    }
}