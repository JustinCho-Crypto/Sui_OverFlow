interface SponsorshipBotConfig {
  rpcUrl: string;
  owner: string;
  packageId: string;
  moduleName: string;
  functionName: string;
  configObjectId: string;
  coinType: string;
  clockObjectId: string; // Clock object ID
}

export default SponsorshipBotConfig;
