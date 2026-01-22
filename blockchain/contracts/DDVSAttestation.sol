// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DDVSAttestation {
    struct Attestation {
        uint256 projectId;
        address verifier;
        bool approved;
        string comments;
    }

    mapping(uint256 => Attestation) public attestations;

    function submitAttestation(uint256 _projectId, bool _approved, string memory _comments) public {
        attestations[_projectId] = Attestation(_projectId, msg.sender, _approved, _comments);
    }
}