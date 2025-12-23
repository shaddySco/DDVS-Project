// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DDVS is ERC721 {
    uint256 private _submissionIds;
    uint256 private _tokenIds;

    struct Submission {
        uint256 id;
        address author;
        string githubLink;
        string description;
        uint256 voteCount;
        bool exists;
    }

    mapping(uint256 => Submission) public submissions;
    mapping(address => uint256) public reputationScore;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event WorkSubmitted(uint256 indexed id, address indexed author, string githubLink);
    event Voted(uint256 indexed id, address indexed voter, uint256 newVoteCount);
    event BadgeAwarded(address indexed developer, uint256 tokenId);

    constructor() ERC721("DDVS Verified Dev", "DDVS") {}

    function submitWork(string memory _githubLink, string memory _description) public {
        _submissionIds++;
        uint256 newId = _submissionIds;

        submissions[newId] = Submission({
            id: newId,
            author: msg.sender,
            githubLink: _githubLink,
            description: _description,
            voteCount: 0,
            exists: true
        });

        emit WorkSubmitted(newId, msg.sender, _githubLink);
    }

    function vote(uint256 _submissionId) public {
        require(submissions[_submissionId].exists, "Submission does not exist");
        require(submissions[_submissionId].author != msg.sender, "Cannot vote for yourself");
        require(!hasVoted[_submissionId][msg.sender], "Already voted on this");

        submissions[_submissionId].voteCount += 1;
        hasVoted[_submissionId][msg.sender] = true;
        
        address author = submissions[_submissionId].author;
        reputationScore[author] += 10; 

        emit Voted(_submissionId, msg.sender, submissions[_submissionId].voteCount);
    }

    function claimBadge() public {
        require(reputationScore[msg.sender] >= 50, "Not enough reputation (Need 50)");
        
        _tokenIds++;
        uint256 newItemId = _tokenIds;
        
        _mint(msg.sender, newItemId);
        emit BadgeAwarded(msg.sender, newItemId);
    }
}