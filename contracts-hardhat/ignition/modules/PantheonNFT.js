const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("PantheonNFT", (m) => {
  const pantheon = m.contract("PantheonNFT");
  return { pantheon };
});