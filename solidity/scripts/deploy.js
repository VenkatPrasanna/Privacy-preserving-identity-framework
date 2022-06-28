const hre = require("hardhat");

const main = async () => {
  const OrganisationsContract = await hre.ethers.getContractFactory(
    "Organisations"
  );
  const organisationsContract = await OrganisationsContract.deploy();
  await organisationsContract.deployed();

  const UsersContract = await hre.ethers.getContractFactory("Users");
  const usersContract = await UsersContract.deploy(
    organisationsContract.address
  );

  await usersContract.deployed();
  //   await domainsContract.deployed();
  //   await attributesContract.deployed();
  //   await accessControlContract.deployed();

  console.log("Users contract address: ", usersContract.address);
  console.log(
    "Organisations contract address: ",
    organisationsContract.address
  );
  //   console.log("Attributes contract address: ", attributesContract.address);
  //   console.log(
  //     "AccessControl contract address: ",
  //     accessControlContract.address
  //   );
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
