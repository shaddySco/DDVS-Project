const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying DDVS Contract...");

  // 1. Get the Contract Factory
  const DDVS = await hre.ethers.getContractFactory("DDVS");
  
  // 2. Deploy
  const ddvs = await DDVS.deploy();
  await ddvs.waitForDeployment(); 

  const address = await ddvs.getAddress();

  console.log("----------------------------------------------------");
  console.log("✅ DDVS Deployed Successfully!");
  console.log("📍 Contract Address:", address);
  console.log("----------------------------------------------------");

  // 3. Save Artifacts for Frontend
  saveFrontendFiles(address);
}

function saveFrontendFiles(contractAddress) {
  // We save to the frontend folder so the website can find it
  const contractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ DDVS: contractAddress }, undefined, 2)
  );

  const Artifact = hre.artifacts.readArtifactSync("DDVS");
  fs.writeFileSync(
    path.join(contractsDir, "DDVS.json"),
    JSON.stringify(Artifact, null, 2)
  );
  
  console.log("📂 Artifacts saved to /frontend/src/contracts/");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});