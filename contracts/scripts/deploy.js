const hre = require("hardhat");

async function main() {
  const TipJar = await hre.ethers.getContractFactory("TipJar");
  const tipJar = await TipJar.deploy();

  await tipJar.waitForDeployment(); // ✅ use waitForDeployment

  console.log("✅ TipJar deployed to:", tipJar.target);         // ✅ use .target instead of .address
  console.log("👑 Contract owner is:", await tipJar.owner());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
