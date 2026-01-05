// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DDVSAttestation {
    struct Attestation {
        bytes32 hash;
        uint256 timestamp;
    }

    // wallet => attestations
    mapping(address => Attestation[]) private attestations;

    event Attested(
        address indexed developer,
        bytes32 hash,
        uint256 timestamp
    );

    function attest(address developer, bytes32 hash) external {
        attestations[developer].push(
            Attestation(hash, block.timestamp)
        );

        emit Attested(developer, hash, block.timestamp);
    }

    function getAttestations(address developer)
        external
        view
        returns (Attestation[] memory)
    {
        return attestations[developer];
    }
}
