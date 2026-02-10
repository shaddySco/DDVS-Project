// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  // Using Infura as primary RPC endpoint
  RPC_URL: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  
  // Backup RPC endpoints
  BACKUP_RPC_URLS: [
    'https://eth-mainnet.g.alchemy.com/v2/demo',
    'https://rpc.ankr.com/eth',
    'https://ethereum.publicnode.com'
  ],
  
  // Network configuration
  NETWORK: {
    chainId: '0x1', // Ethereum Mainnet
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    blockExplorerUrls: ['https://etherscan.io']
  }
};
