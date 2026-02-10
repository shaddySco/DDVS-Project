// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DDVS is ERC721 {
    uint256 private _submissionIds;
    uint256 private _tokenIds;

    enum BadgeTier {
        NONE,
        BRONZE,
        SILVER,
        GOLD,
        PLATINUM
    }

    struct BadgeMetadata {
        BadgeTier tier;
        uint256 mintedAt;
        uint256 xpAtMint;
    }

    struct Submission {
        uint256 id;
        address author;
        string githubLink;
        string description;
        uint256 voteCount;
        string category;
        bool exists;
    }

    mapping(uint256 => Submission) public submissions;
    mapping(address => uint256) public reputationScore;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => BadgeMetadata) public badgeMetadata;
    mapping(address => BadgeTier) public userBadgeTier;
    mapping(address => uint256) public userBadgeCount;

    event WorkSubmitted(uint256 indexed id, address indexed author, string githubLink, string category);
    event Voted(uint256 indexed id, address indexed voter, uint256 newVoteCount);
    event BadgeAwarded(address indexed developer, uint256 tokenId, BadgeTier tier);
    event BadgeUpgraded(address indexed developer, BadgeTier oldTier, BadgeTier newTier);

    // Badge tier thresholds
    uint256 public constant BRONZE_THRESHOLD = 50;
    uint256 public constant SILVER_THRESHOLD = 150;
    uint256 public constant GOLD_THRESHOLD = 300;
    uint256 public constant PLATINUM_THRESHOLD = 500;

    constructor() ERC721("DDVS Verified Dev", "DDVS") {}

    function submitWork(
        string memory _githubLink,
        string memory _description,
        string memory _category
    ) public {
        _submissionIds++;
        uint256 newId = _submissionIds;

        submissions[newId] = Submission({
            id: newId,
            author: msg.sender,
            githubLink: _githubLink,
            description: _description,
            category: _category,
            voteCount: 0,
            exists: true
        });

        emit WorkSubmitted(newId, msg.sender, _githubLink, _category);
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
        require(reputationScore[msg.sender] >= BRONZE_THRESHOLD, "Not enough reputation");
        
        // Determine tier based on reputation
        BadgeTier tier = determineBadgeTier(reputationScore[msg.sender]);
        
        // Prevent claiming same tier twice
        if (userBadgeTier[msg.sender] != BadgeTier.NONE) {
            require(tier > userBadgeTier[msg.sender], "Must upgrade to a higher tier");
        }

        _tokenIds++;
        uint256 newItemId = _tokenIds;
        
        _mint(msg.sender, newItemId);
        
        badgeMetadata[newItemId] = BadgeMetadata({
            tier: tier,
            mintedAt: block.timestamp,
            xpAtMint: reputationScore[msg.sender]
        });

        BadgeTier oldTier = userBadgeTier[msg.sender];
        userBadgeTier[msg.sender] = tier;
        userBadgeCount[msg.sender]++;

        if (oldTier == BadgeTier.NONE) {
            emit BadgeAwarded(msg.sender, newItemId, tier);
        } else {
            emit BadgeUpgraded(msg.sender, oldTier, tier);
        }
    }

    function determineBadgeTier(uint256 _reputation) public pure returns (BadgeTier) {
        if (_reputation >= PLATINUM_THRESHOLD) {
            return BadgeTier.PLATINUM;
        } else if (_reputation >= GOLD_THRESHOLD) {
            return BadgeTier.GOLD;
        } else if (_reputation >= SILVER_THRESHOLD) {
            return BadgeTier.SILVER;
        } else if (_reputation >= BRONZE_THRESHOLD) {
            return BadgeTier.BRONZE;
        }
        return BadgeTier.NONE;
    }

    function getUserBadgeTier(address _user) public view returns (string memory) {
        BadgeTier tier = userBadgeTier[_user];
        
        if (tier == BadgeTier.PLATINUM) return "PLATINUM";
        if (tier == BadgeTier.GOLD) return "GOLD";
        if (tier == BadgeTier.SILVER) return "SILVER";
        if (tier == BadgeTier.BRONZE) return "BRONZE";
        return "NONE";
    }

    function getUserStats(address _user) public view returns (
        uint256 reputation,
        uint256 badgeCount,
        string memory currentTier,
        uint256 nextTierThreshold
    ) {
        uint256 currentReputation = reputationScore[_user];
        BadgeTier tier = userBadgeTier[_user];
        uint256 nextThreshold = BRONZE_THRESHOLD;

        if (tier == BadgeTier.BRONZE) {
            nextThreshold = SILVER_THRESHOLD;
        } else if (tier == BadgeTier.SILVER) {
            nextThreshold = GOLD_THRESHOLD;
        } else if (tier == BadgeTier.GOLD) {
            nextThreshold = PLATINUM_THRESHOLD;
        }

        string memory tierName = getUserBadgeTier(_user);

        return (currentReputation, userBadgeCount[_user], tierName, nextThreshold);
    }
}
