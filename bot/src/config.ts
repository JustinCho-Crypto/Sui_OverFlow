const config = {
  rpcUrl: "https://fullnode.testnet.sui.io:443",
  packageId:
    "0xa913ee311283b5ab48241b0e31714f85187484dd085bb236233c3971c3e1324e", // Module deployment address
  moduleName: "vault",
  functionName: "update_vault",
  objectId:
    "0xb9aae45b0f8392b4eb77a5cabf2283a915eb95369407ad234cde455e9cce542f", // 후원 설정 객체 ID
  coinType: "0x2::sui::SUI", // Coin<SUI> object ID
  clockObjectId: "0x6", // Clock object ID
};

export default config;
