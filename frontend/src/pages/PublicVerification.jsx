import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicVerification } from "../services/publicVerificationApi";

export default function PublicVerification() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicVerification(id)
      .then(setData)
      .catch(() =>
        setError("Verification record not found")
      );
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!data) {
    return <div>Loading verification…</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px" }}>
      <h2>Public Verification Record</h2>

      <p><strong>Status:</strong> Verified</p>

      <p>
        <strong>Submission ID:</strong> {data.submission_id}
      </p>

      <p>
        <strong>Wallet Address:</strong><br />
        <code>{data.wallet}</code>
      </p>

      <p>
        <strong>Attestation Hash:</strong><br />
        <code>{data.attestation_hash}</code>
      </p>

      <p>
        <strong>Verified At:</strong><br />
        {new Date(data.verified_at).toLocaleString()}
      </p>

      <hr />

      <p style={{ fontSize: "0.9rem" }}>
        This record is cryptographically derived and
        can be independently verified on-chain.
      </p>
    </div>
  );
}
