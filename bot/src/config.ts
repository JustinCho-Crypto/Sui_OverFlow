const config = {
  rpcUrl: "https://fullnode.testnet.sui.io:443",
  packageId:
    "0x50ede43d1e9acfd7df19a011ff15f96f0c184358842161f5977b13630d3e02d2", // Module deployment address
  moduleName: "vault",
  functionName: "update_vault",
  objectId:
    "0x2534597c951276bbfdb486478bc1338315fa300db0d5701b738dd8d8c00118dd", // 후원 설정 객체 ID
  coinType: "0x2::sui::SUI", // Coin<SUI> object ID
  clockObjectId: "0x6", // Clock object ID
};

export default config;
