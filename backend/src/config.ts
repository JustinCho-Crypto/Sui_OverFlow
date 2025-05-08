const config = {
  rpcUrl: "https://fullnode.testnet.sui.io:443",
  packageId:
    "0xf720b97e49337f664715e94494ad6284dfa7ff68029cc3d3147f97d2e253e758", // Module deployment address
  moduleName: "vault",
  functionName: "update_vault",
  objectId:
    "0x1f7bccd41c8280ff2a960a40594d44290e8aad9897541f4d049708ab89ce65a0", // 후원 설정 객체 ID
  coinType: "0x2::sui::SUI", // Coin<SUI> object ID
  clockObjectId: "0x6", // Clock object ID
};

export default config;
