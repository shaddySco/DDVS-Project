export default function PublicVerificationInfo() {
  return (
    <div>
      <h4>Public Verification</h4>
      <p>
        This project uses blockchain attestations instead of NFTs.
      </p>
      <p>
        Anyone can independently verify this submission by:
      </p>
      <ol>
        <li>Obtaining the developer wallet address</li>
        <li>Using the submission ID and verification timestamp</li>
        <li>Recomputing the keccak256 hash</li>
        <li>Confirming the hash exists on-chain</li>
      </ol>
      <p>
        No DDVS account is required.
      </p>
    </div>
  );
}
