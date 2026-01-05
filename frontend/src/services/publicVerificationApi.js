export async function fetchPublicVerification(id) {
  const res = await fetch(
    `http://127.0.0.1:8000/api/verify/${id}`
  );

  if (!res.ok) {
    throw new Error("Verification not found");
  }

  return res.json();
}
