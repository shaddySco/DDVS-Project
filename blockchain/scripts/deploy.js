const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Deployment...");

  // 1. Deploy DDVSSubmissions
  const Submissions = await hre.ethers.getContractFactory("DDVSSubmissions");
  const submissions = await Submissions.deploy();
  await submissions.waitForDeployment();
  const submissionsAddress = await submissions.getAddress();
  console.log("✅ DDVSSubmissions deployed to:", submissionsAddress);

  // 2. Deploy DDVSAttestation
  const Attestation = await hre.ethers.getContractFactory("DDVSAttestation");
  const attestation = await Attestation.deploy();
  await attestation.waitForDeployment();
  const attestationAddress = await attestation.getAddress();
  console.log("✅ DDVSAttestation deployed to:", attestationAddress);

  console.log("\n----------------------------------------------------");
  console.log("🎉 All contracts deployed successfully!");
  console.log("----------------------------------------------------\n");

  // 3. Save Artifacts for Frontend
  saveFrontendFiles({
    DDVSSubmissions: submissionsAddress,
    DDVSAttestation: attestationAddress,
  });
}

function saveFrontendFiles(addresses) {
  // This path assumes your project structure is:
  // /blockchain
  // /frontend
  const contractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Save the addresses
  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify(addresses, undefined, 2)
  );
  console.log("📂 Saved contract addresses to frontend.");

  // Save the ABIs
  Object.keys(addresses).forEach((contractName) => {
    try {
        const Artifact = hre.artifacts.readArtifactSync(contractName);
        fs.writeFileSync(
          path.join(contractsDir, `${contractName}.json`),
          JSON.stringify(Artifact, null, 2)
        );
        console.log(`📄 Saved ABI for ${contractName} to frontend.`);
    } catch (e) {
        console.warn(`⚠️ Could not find artifact for ${contractName}.`);
    }
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });