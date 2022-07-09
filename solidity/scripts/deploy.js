const hre = require("hardhat");

const main = async () => {
  const UsersContract = await hre.ethers.getContractFactory("Users");
  const usersContract = await UsersContract.deploy();

  await usersContract.deployed();

  const OrganisationsContract = await hre.ethers.getContractFactory(
    "Organisations"
  );
  const organisationsContract = await OrganisationsContract.deploy(
    usersContract.address
  );
  await organisationsContract.deployed();

  const DataManagementContract = await hre.ethers.getContractFactory("Data");
  const dataManagementContract = await DataManagementContract.deploy(
    usersContract.address
  );
  await dataManagementContract.deployed();

  //   await domainsContract.deployed();
  //   await attributesContract.deployed();
  //   await accessControlContract.deployed();

  console.log("Users contract address: ", usersContract.address);
  console.log(
    "Organisations contract address: ",
    organisationsContract.address
  );
  console.log(
    "Data Management contract address: ",
    dataManagementContract.address
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
